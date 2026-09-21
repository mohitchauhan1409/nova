import { chromium, type BrowserContext, type Page } from 'playwright';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { attachPanel } from '../panel-test-driver';

const exec = promisify(execFile);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
type Panel = Awaited<ReturnType<typeof attachPanel>>;
type RecordingOptions = { output: string; includePanel?: boolean; fps?: number; keepFrames?: boolean };

/** Owns a headless process and a disposable profile. Never attaches to desktop Chrome. */
export class IsolatedBrowser {
  private panel?: Panel;
  private activeRecording?: { stop(): Promise<RecordingReport> };
  private closing = false;

  private constructor(readonly context: BrowserContext, private selectedPage: Page, readonly extension: boolean) {}

  get page() { return this.selectedPage; }

  async usePage(page: Page) {
    if (this.activeRecording) throw new Error('Stop recording before changing the recorded tab.');
    if (!this.context.pages().includes(page)) throw new Error('This page does not belong to the isolated browser.');
    await this.panel?.disconnect();
    this.panel = undefined;
    this.selectedPage = page;
  }

  static async launch(options: { extensionPath?: string; width?: number; height?: number } = {}) {
    const extension = options.extensionPath && path.resolve(options.extensionPath);
    const context = await chromium.launchPersistentContext('', {
      // Branded Chrome cannot load unpacked extensions; Chromium supports Nova.
      channel: extension ? 'chromium' : 'chrome', headless: true,
      viewport: { width: options.width ?? 1280, height: options.height ?? 720 },
      deviceScaleFactor: 1,
      args: extension ? [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] : [],
    });
    context.setDefaultTimeout(10000);
    return new IsolatedBrowser(context, context.pages()[0] ?? await context.newPage(), !!extension);
  }

  /** Open Nova normally through its launcher first. Searches only our own process. */
  async attachNovaPanel() {
    if (this.panel) return this.panel;
    const cdp = await this.context.newCDPSession(this.page);
    try {
      const worker = this.context.serviceWorkers()[0];
      if (!worker) throw new Error('Nova extension is not loaded in this isolated session.');
      const origin = new URL(worker.url()).origin;
      // URL.origin is "null" for extension URLs on some Node releases.
      const prefix = origin === 'null' ? worker.url().replace(/\/[^/]*$/, '/') : `${origin}/`;
      // This only changes focus inside our headless browser, never on the desktop.
      await this.page.bringToFront();
      const tabId = await worker.evaluate(async () => (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]?.id);
      if (tabId === undefined) throw new Error('The selected isolated tab is unavailable.');
      const panelUrl = `${prefix}panel.html?tabId=${tabId}`;
      let targetId: string | undefined;
      for (let attempt = 0; attempt < 50 && !targetId; attempt++) {
        targetId = (await cdp.send('Target.getTargets')).targetInfos.find(target => target.url === panelUrl)?.targetId;
        if (!targetId) await delay(100);
      }
      if (!targetId) throw new Error('Open Nova’s side panel in the isolated browser before recording it.');
      this.panel = await attachPanel(cdp, targetId);
      return this.panel;
    } catch (error) { await cdp.detach(); throw error; }
  }

  async record(options: RecordingOptions) {
    if (this.activeRecording || this.closing) throw new Error('A recording is already running or the browser is closing.');
    const panel = options.includePanel ? await this.attachNovaPanel() : undefined;
    const recorder = await startRecording(this.page, panel, options);
    let stopped: Promise<RecordingReport> | undefined;
    const stop = () => stopped ??= recorder.stop().finally(() => { this.activeRecording = undefined; });
    this.activeRecording = { stop };
    return this.activeRecording;
  }

  async close() {
    this.closing = true;
    try { await this.activeRecording?.stop(); }
    finally {
      await this.panel?.disconnect().catch(() => {});
      await this.context.close();
    }
  }
}

export type RecordingReport = {
  output: string; mode: 'website' | 'website-and-native-panel'; audio: false;
  durationSeconds: number; outputFps: number; samples: number;
  uniqueWebsiteFrames: number; uniquePanelFrames: number;
  maxSampleGapMs: number; framesDirectory?: string;
};

async function startRecording(page: Page, panel: Panel | undefined, options: RecordingOptions) {
  const fps = options.fps ?? 15;
  if (!Number.isInteger(fps) || fps < 1 || fps > 30) throw new Error('Recording fps must be an integer from 1 to 30.');
  const output = path.resolve(options.output);
  if (!output.endsWith('.mp4')) throw new Error('Choose an .mp4 output path.');
  await mkdir(path.dirname(output), { recursive: true });
  // Check the dependency before starting capture, rather than failing at the end.
  await exec(process.env.NOVA_FFMPEG ?? 'ffmpeg', ['-version']);
  const directory = await mkdtemp(path.join(path.dirname(output), '.capture-'));
  const files = [new Map<string, string>(), new Map<string, string>()];
  const samples: { time: number; files: string[] }[] = [];
  let stopped = false;
  let failure: unknown;
  const capture = () => Promise.all([
    page.screenshot({ type: 'jpeg', quality: 88, timeout: 5000 }),
    ...(panel ? [panel.send('Page.captureScreenshot', { format: 'jpeg', quality: 88 }).then(result => Buffer.from(result.data, 'base64'))] : []),
  ]);
  const persist = async (buffers: Buffer[], time: number) => {
    const names = await Promise.all(buffers.map(async (buffer, stream) => {
      const hash = createHash('sha256').update(buffer).digest('hex');
      let name = files[stream].get(hash);
      if (!name) {
        name = `${stream}-${files[stream].size}.jpg`;
        await writeFile(path.join(directory, name), buffer);
        files[stream].set(hash, name);
      }
      return name;
    }));
    samples.push({ time, files: names });
  };
  let initial: Buffer[];
  try { initial = await capture(); }
  catch (error) { await rm(directory, { recursive: true, force: true }); throw error; }
  const started = performance.now();
  await persist(initial, 0);
  // Record wall-clock timestamps. Slow captures must not speed up the video.
  const loop = (async () => {
    let next = started + 1000 / fps;
    while (!stopped) {
      await delay(Math.max(0, next - performance.now()));
      if (stopped) break;
      const buffers = await capture();
      if (stopped) break;
      await persist(buffers, (performance.now() - started) / 1000);
      next = Math.max(next + 1000 / fps, performance.now());
    }
  })().catch(error => { failure = error; stopped = true; });
  let stopPromise: Promise<RecordingReport> | undefined;
  return { stop: () => stopPromise ??= (async () => {
    const durationSeconds = (performance.now() - started) / 1000;
    stopped = true;
    await loop;
    if (failure) throw new Error(`Recording stopped because capture failed. Frames retained in ${directory}`, { cause: failure });
    for (let stream = 0; stream < (panel ? 2 : 1); stream++) {
      const manifest = samples.map((sample, i) => `file '${sample.files[stream]}'\nduration ${Math.max(0.001, (samples[i + 1]?.time ?? durationSeconds) - sample.time).toFixed(6)}`).join('\n');
      await writeFile(path.join(directory, `${stream}.ffconcat`), `ffconcat version 1.0\n${manifest}\nfile '${samples.at(-1)!.files[stream]}'\n`);
    }
    await writeFile(path.join(directory, 'samples.json'), JSON.stringify(samples, null, 2));
    const inputs = [0, ...(panel ? [1] : [])].flatMap(stream => ['-f', 'concat', '-safe', '0', '-i', path.join(directory, `${stream}.ffconcat`)]);
    const filter = panel
      ? `[0:v]fps=${fps},scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x111827[left];[1:v]fps=${fps},scale=400:720:force_original_aspect_ratio=decrease,pad=400:720:(ow-iw)/2:(oh-ih)/2:color=0x111827[right];[left][right]hstack=inputs=2[out]`
      : `[0:v]fps=${fps},pad=ceil(iw/2)*2:ceil(ih/2)*2[out]`;
    await exec(process.env.NOVA_FFMPEG ?? 'ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-n', ...inputs, '-filter_complex', filter,
      '-map', '[out]', '-t', durationSeconds.toFixed(6), '-an', '-c:v', 'libx264',
      '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
    ], { maxBuffer: 4 * 1024 * 1024 });
    const report: RecordingReport = {
      output, mode: panel ? 'website-and-native-panel' : 'website', audio: false,
      durationSeconds, outputFps: fps, samples: samples.length,
      uniqueWebsiteFrames: files[0].size, uniquePanelFrames: files[1].size,
      maxSampleGapMs: samples.reduce((max, sample, i) => Math.max(max, ((samples[i + 1]?.time ?? durationSeconds) - sample.time) * 1000), 0),
      ...(options.keepFrames ? { framesDirectory: directory } : {}),
    };
    await writeFile(`${output}.json`, JSON.stringify(report, null, 2), { flag: 'wx' });
    if (!options.keepFrames) await rm(directory, { recursive: true, force: true });
    return report;
  })() };
}
