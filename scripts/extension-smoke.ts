// Live providers, synthetic microphone, and a disposable Chromium profile.
// Never opens the user's normal browser profile or performs a real transaction.
import { chromium } from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import { config } from '../BE/src/config';
import { writeFile, unlink } from 'node:fs/promises';
import { attachPanel } from './panel-test-driver';

const response = await fetch('https://api.sarvam.ai/text-to-speech', { method: 'POST', headers: { 'api-subscription-key': config.sarvamKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: config.ttsModel, text: 'What is the price of this adapter?', language_code: 'en-IN', speaker: config.speaker, speech_sample_rate: 16000, output_audio_codec: 'wav' }) });
assert.equal(response.status, 200);
const data = await response.json() as { audios: string[] };
const wav = Buffer.from(data.audios[0], 'base64'); let offset = 12; let pcm = Buffer.alloc(0);
while (offset + 8 <= wav.length) { const size = wav.readUInt32LE(offset + 4); if (wav.toString('ascii', offset, offset + 4) === 'data') { pcm = wav.subarray(offset + 8, offset + 8 + size); break; } offset += 8 + size + (size % 2); }
assert.ok(pcm.length);
const audio = Buffer.concat([Buffer.alloc(32000), pcm, Buffer.alloc(16000 * 2 * 45)]);
const header = Buffer.alloc(44); header.write('RIFF'); header.writeUInt32LE(36 + audio.length, 4); header.write('WAVEfmt ', 8); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22); header.writeUInt32LE(16000, 24); header.writeUInt32LE(32000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(audio.length, 40);
const micFile = path.resolve(config.dataDir, 'native-panel-test-mic.wav'); await writeFile(micFile, Buffer.concat([header, audio]), { mode: 0o600 });
const extensionPath = path.resolve('web/dist-extension');
const context = await chromium.launchPersistentContext('', { channel: 'chromium', headless: false, viewport: null, args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, '--window-size=1400,950', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${micFile}`] });
const checks: string[] = [];
try {
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  // First-use prompts are covered separately by test:microphone.
  await context.grantPermissions(['microphone']);
  const dashboard = await context.newPage(); await dashboard.goto('http://127.0.0.1:5173/');
  await dashboard.getByText('Nova is online', { exact: true }).waitFor();
  const [site] = await Promise.all([context.waitForEvent('page'), dashboard.getByRole('button', { name: 'Try the demo', exact: true }).click()]);
  await site.waitForURL(`http://127.0.0.1:${config.port}/demo/shop`);
  await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).click();
  const cdp = await context.newCDPSession(site);
  let target = '';
  for (let i = 0; i < 100 && !target; i++) { target = (await cdp.send('Target.getTargets')).targetInfos.find(t => t.url.includes('/panel.html?tabId='))?.targetId || ''; if (!target) await site.waitForTimeout(70); }
  const panel = await attachPanel(cdp, target);
  await panel.waitFor("document.querySelector('textarea') && !document.querySelector('textarea').disabled");
  assert.equal(await panel.evaluate("document.querySelector('#chat-tab').getAttribute('aria-selected')"), 'true');
  await panel.evaluate(`(() => {
    window.__testMicCalls = 0; window.__testTracks = []; window.__testPlayback = 0;
    const getMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    window.__testGetMedia = getMedia;
    navigator.mediaDevices.getUserMedia = async constraints => { window.__testMicCalls++; const stream = await getMedia(constraints); window.__testTracks.push(...stream.getTracks()); return stream; };
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function(...args) { start.apply(this, args); window.__testPlayback++; };
  })()`);
  await panel.fill('textarea', 'What is the adapter price displayed on this page? Do not navigate or change anything.');
  await panel.click('[aria-label="Send message"]');
  await panel.waitFor("[...document.querySelectorAll('.np-message.assistant')].some(el => el.innerText.includes('799'))", 45000);
  assert.equal(await panel.evaluate('window.__testMicCalls'), 0);
  checks.push('Native panel defaults to chat with no microphone request and receives a grounded OpenAI answer');
  await writeFile(path.join(config.dataDir, 'native-panel-chat.png'), await panel.screenshot());
  const started = Date.now(); await panel.fill('textarea', 'zoom in'); await panel.click('[aria-label="Send message"]');
  await panel.waitFor("document.body.innerText.includes('Zoom adjusted.')"); const zoomMs = Date.now() - started;
  checks.push(`Native tab zoom responds without an LLM decision (${zoomMs} ms including UI input)`);
  await site.reload(); await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).waitFor();
  assert.ok(await panel.evaluate("document.body.innerText.includes('799') && document.body.innerText.includes('Zoom adjusted.')"));
  checks.push('The native panel and conversation survive website reload');

  const beforeVoice = await panel.evaluate<number>("document.querySelectorAll('.np-message.assistant').length");
  const beforeVoiceUsers = await panel.evaluate<number>("document.querySelectorAll('.np-message.user').length");
  await panel.click('#voice-tab');
  await panel.waitFor("window.__testTracks.some(t => t.readyState === 'live')");
  await writeFile(path.join(config.dataDir, 'native-panel-voice.png'), await panel.screenshot());
  await panel.waitFor('window.__testPlayback > 0', 45000);
  // Read live session state from a separate test-owned panel port; no tokens are logged.
  await panel.evaluate(`(() => {
    window.__testLatestSession = undefined;
    const port = chrome.runtime.connect({ name: 'nova-panel' }); window.__testSessionPort = port;
    port.onMessage.addListener(m => { if (m.type === 'session') window.__testLatestSession = m.session; });
    port.postMessage({ type: 'nova-panel-connect' });
  })()`);
  await panel.waitFor(`window.__testLatestSession?.messages.filter(m => m.role === 'assistant').length > ${beforeVoice} && window.__testLatestSession.messages.filter(m => m.role === 'assistant').at(-1).text.includes('799')`, 45000);
  await panel.waitFor("document.querySelector('.np-live-caption').innerText.includes('799')", 20000);
  const transcript = await panel.evaluate<string>(`window.__testLatestSession.messages.filter(m => m.role === 'user').slice(${beforeVoiceUsers}).map(m => m.text).join(' ')`);
  console.log('Synthetic voice transcript:', transcript);
  assert.match(transcript, /price/i);
  checks.push('Opt-in voice captures synthetic speech, receives Sarvam transcription and a grounded OpenAI response, and schedules streamed speech playback');
  await panel.click('#chat-tab');
  await panel.waitFor("window.__testTracks.every(t => t.readyState === 'ended')");
  assert.ok(await panel.evaluate("document.querySelector('#chat-tab').getAttribute('aria-selected') === 'true'"));
  checks.push('Returning to chat immediately ends microphone capture');

  // Late microphone permission must not start a session after the person leaves voice mode.
  await panel.evaluate("navigator.mediaDevices.getUserMedia = () => new Promise(resolve => window.__testGrant = resolve)");
  await panel.click('#voice-tab'); await panel.waitFor("typeof window.__testGrant === 'function'");
  await panel.click('#chat-tab');
  await panel.evaluate("(async () => { const stream = await window.__testGetMedia({audio:true}); window.__testLateTracks = stream.getTracks(); window.__testGrant(stream); })()");
  await panel.waitFor("window.__testLateTracks.every(t => t.readyState === 'ended')");
  assert.equal(await panel.evaluate("document.querySelector('#chat-tab').getAttribute('aria-selected')"), 'true');
  checks.push('A delayed microphone permission grant after leaving voice is cancelled and releases every track');
  await panel.fill('textarea', 'Add one Zebronics USB-C to HDMI Adapter — Demo to my cart. Stop after verifying it is in the cart.');
  await panel.click('[aria-label="Send message"]');
  await panel.waitFor("window.__testLatestSession?.status === 'ready' && window.__testLatestSession.lastSnapshot?.text.includes('Cart: 1 items')", 60000);
  assert.equal(await site.locator('#cart-count').innerText(), 'Cart: 1 items');
  assert.equal(await panel.evaluate("window.__testLatestSession.traces.filter(t => t.kind === 'approval').length"), 0);
  checks.push('An explicitly requested demo cart addition executes once without a basic confirmation');

  // A fixture-only consequential control verifies the real approval card, not a mock panel.
  await site.evaluate(() => {
    const button = document.createElement('button'); button.id = 'fixture-order'; button.textContent = 'Place order';
    button.addEventListener('click', () => { document.body.dataset.fixtureOrdered = 'yes'; });
    document.querySelector('#cart article')!.append(button);
  });
  await panel.fill('textarea', 'Place the order for the one demo adapter in my cart at ₹799 using the Place order button.');
  await panel.click('[aria-label="Send message"]');
  await panel.waitFor("!!document.querySelector('[aria-label=\"Action confirmation\"]')", 45000);
  assert.equal(await site.evaluate(() => document.body.dataset.fixtureOrdered), undefined);
  const confirmationFits = await panel.evaluate("(() => { const r=document.querySelector('.np-approval-buttons').getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; })()");
  assert.equal(confirmationFits, true);
  await writeFile(path.join(config.dataDir, 'native-panel-confirmation.png'), await panel.screenshot());
  await panel.click('.np-approval-buttons button:first-child');
  await panel.waitFor("!document.querySelector('[aria-label=\"Action confirmation\"]')");
  assert.equal(await site.evaluate(() => document.body.dataset.fixtureOrdered), undefined);
  checks.push('A final order needs a visible confirmation; cancelling it leaves the fixture untouched');
  await panel.evaluate("window.__testSessionPort.disconnect()");
  await panel.click('[aria-label="New conversation"]');
  await panel.waitFor("document.querySelector('.np-welcome') && !document.querySelector('textarea').disabled");
  assert.equal(await panel.evaluate("document.querySelectorAll('.np-message').length"), 0);
  checks.push('New conversation clears the thread and returns to chat');
  await panel.click('[aria-label="Close Nova panel"]');
  await panel.disconnect();
  for (let i = 0; i < 100; i++) { const contexts = await worker.evaluate(() => chrome.runtime.getContexts({ contextTypes: ['SIDE_PANEL' as chrome.runtime.ContextType] })); if (!contexts.length) break; if (i === 99) throw new Error('Native panel did not close'); await site.waitForTimeout(70); }
  assert.equal(await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).count(), 1);
  await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).click();
  checks.push('Close dismisses the native panel and leaves the launcher available to reopen');
  const report = { at: new Date().toISOString(), ok: true, source: 'Native Chromium side panel with synthetic microphone', checks, zoomMs, transcript };
  await writeFile(path.join(config.dataDir, 'extension-smoke-report.json'), JSON.stringify(report, null, 2), { mode: 0o600 }); console.log(JSON.stringify(report, null, 2));
} finally { await context.close(); await unlink(micFile).catch(() => {}); }
