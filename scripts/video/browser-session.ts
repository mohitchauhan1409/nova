import { createInterface } from 'node:readline';
import path from 'node:path';
import { IsolatedBrowser } from './isolated-browser';

// Local JSON-lines interface. There is no HTTP server, open debugging port,
// desktop input, profile import, or access to the user's existing Chrome tabs.
const session = await IsolatedBrowser.launch({
  extensionPath: process.argv.includes('--nova') ? path.resolve('web/dist-extension') : undefined,
});
let recording: Awaited<ReturnType<IsolatedBrowser['record']>> | undefined;
let closed = false;
const lines = createInterface({ input: process.stdin, terminal: false });
const reply = (value: unknown) => process.stdout.write(`${JSON.stringify(value)}\n`);
const close = async () => {
  if (closed) return;
  closed = true;
  lines.close();
  await session.close();
};
for (const signal of ['SIGTERM', 'SIGINT'] as const) process.once(signal, () => {
  void close().then(() => process.exit(0), error => { console.error(error); process.exit(1); });
});
reply({ ready: true, browser: session.extension ? 'Chromium with Nova' : 'Google Chrome', headless: true, profile: 'disposable', recording: false });
try {
  for await (const line of lines) {
    if (!line.trim()) continue;
    let id: unknown;
    try {
      const command = JSON.parse(line); id = command.id;
      let result: unknown;
      switch (command.method) {
        case 'status': result = { url: session.page.url(), recording: !!recording, pages: session.context.pages().map((page, index) => ({ index, url: page.url() })) }; break;
        case 'select': {
          const page = session.context.pages()[command.index];
          if (!page) throw new Error('No isolated tab with that index.');
          await session.usePage(page); result = { url: page.url() }; break;
        }
        case 'goto': await session.page.goto(command.url, { waitUntil: 'domcontentloaded' }); result = { url: session.page.url() }; break;
        case 'snapshot': result = await session.page.locator('body').ariaSnapshot(); break;
        case 'click': await session.page.locator(command.selector).click(); break;
        case 'fill': await session.page.locator(command.selector).fill(command.text); break;
        case 'press': await (command.selector ? session.page.locator(command.selector).press(command.key) : session.page.keyboard.press(command.key)); break;
        case 'scroll': await session.page.mouse.wheel(command.x ?? 0, command.y ?? 600); break;
        case 'evaluate': result = await session.page.evaluate(command.expression); break;
        case 'screenshot': await session.page.screenshot({ path: path.resolve(command.path) }); result = { path: path.resolve(command.path) }; break;
        case 'panel-snapshot': result = await (await session.attachNovaPanel()).evaluate('document.body.innerText'); break;
        case 'panel-click': await (await session.attachNovaPanel()).click(command.selector); break;
        case 'panel-fill': await (await session.attachNovaPanel()).fill(command.selector, command.text); break;
        case 'panel-evaluate': result = await (await session.attachNovaPanel()).evaluate(command.expression); break;
        case 'record-start':
          if (recording) throw new Error('Recording is already running.');
          recording = await session.record({ output: command.output, includePanel: command.includePanel, fps: command.fps, keepFrames: command.keepFrames });
          result = { recording: true }; break;
        case 'record-stop':
          if (!recording) throw new Error('No recording is running.');
          try { result = await recording.stop(); } finally { recording = undefined; }
          break;
        case 'close': await close(); result = { closed: true }; break;
        default: throw new Error(`Unknown method: ${command.method}`);
      }
      reply({ id, ok: true, result: result ?? null });
    } catch (error) { reply({ id, ok: false, error: String(error) }); }
    if (closed) break;
  }
} finally { await close(); }
