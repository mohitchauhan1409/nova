// First-use permission regression: disposable Chromium, synthetic input device,
// no auto-grant flag and no paid voice/model requests. Browser permission overrides
// simulate the user's eventual grant/deny after we observe the real prompt.
import { chromium } from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { attachPanel } from './panel-test-driver';
const extension = path.resolve('web/dist-extension');
const context = await chromium.launchPersistentContext('', { channel: 'chromium', headless: false, viewport: null, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--window-size=1400,950', '--use-fake-device-for-media-stream'] });
const checks: string[] = [];
try {
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const extensionOrigin = `chrome-extension://${new URL(worker.url()).hostname}`;
  await worker.evaluate(() => {
    const state = self as unknown as { __testVoiceStarts: number }; state.__testVoiceStarts = 0;
    const send = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data) {
      const message = typeof data === 'string' ? JSON.parse(data) : {};
      if (message.type === 'voice-start') { state.__testVoiceStarts++; return; }
      if (['voice-stop', 'audio'].includes(message.type)) return;
      send.call(this, data);
    };
  });
  const dashboard = await context.newPage(); await dashboard.goto('http://127.0.0.1:5173/');
  await dashboard.getByText('Nova is online', { exact: true }).waitFor();
  const [site] = await Promise.all([context.waitForEvent('page'), dashboard.getByRole('button', {name:'Try the demo',exact:true}).click()]);
  await site.waitForURL('http://127.0.0.1:8787/demo/shop');
  await site.getByRole('button', {name:'Open Nova side panel',exact:true}).click();
  const cdp = await context.newCDPSession(site);
  let targetId = '';
  for (let i=0;i<100&&!targetId;i++) { targetId = (await cdp.send('Target.getTargets')).targetInfos.find(t=>t.url.includes('/panel.html?tabId='))?.targetId || ''; if (!targetId) await site.waitForTimeout(70); }
  const panel = await attachPanel(cdp, targetId);
  await panel.waitFor("document.querySelector('textarea') && !document.querySelector('textarea').disabled");
  assert.equal(await panel.evaluate("navigator.permissions.query({name:'microphone'}).then(p=>p.state)"), 'prompt');
  const before = (await cdp.send('Browser.getHistograms', {query:'Permissions.Prompt.Shown',delta:false})).histograms.reduce((n,h)=>n+h.count,0);
  const opened = context.waitForEvent('page'); await panel.click('#voice-tab');
  const setup = await opened; await setup.waitForURL(`${extensionOrigin}/microphone.html`);
  await setup.locator('body[data-state="requesting"]').waitFor();
  let prompts = before;
  for (let i=0;i<50&&prompts===before;i++) { prompts = (await cdp.send('Browser.getHistograms', {query:'Permissions.Prompt.Shown',delta:false})).histograms.reduce((n,h)=>n+h.count,0); if (prompts===before) await site.waitForTimeout(70); }
  assert.ok(prompts > before, 'Chrome must actually display the initial microphone permission prompt');
  assert.equal(await worker.evaluate(() => (self as unknown as {__testVoiceStarts:number}).__testVoiceStarts), 0);
  const windows = await worker.evaluate(async url => (await chrome.tabs.query({})).filter(t=>t.url === url || t.url?.endsWith('/demo/shop')).map(t=>t.windowId), setup.url());
  assert.equal(new Set(windows).size, 1);
  checks.push('An ungranted microphone opens Nova’s setup tab in the same browser window and displays Chrome’s real permission prompt');
  await setup.screenshot({path:'BE/data/microphone-permission-prompt.png'});
  await setup.addInitScript(() => {
    const state = window as Window & {__testMicTracks?: MediaStreamTrack[]}; state.__testMicTracks=[];
    const get = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => { const stream=await get(constraints); state.__testMicTracks!.push(...stream.getTracks()); return stream; };
  });
  // Chromium's test API rejects extension origins; the override is restricted
  // to this disposable browser context and never touches the user's profile.
  await context.grantPermissions(['microphone']);
  await setup.reload(); await setup.locator('body[data-state="granted"]').waitFor();
  assert.ok(await setup.evaluate(() => { const tracks=(window as unknown as {__testMicTracks:MediaStreamTrack[]}).__testMicTracks;return tracks.length>0&&tracks.every(t=>t.readyState==='ended'); }));
  checks.push('The setup page verifies a granted microphone and immediately releases all capture tracks');
  await setup.screenshot({path:'BE/data/microphone-permission-granted.png'});
  await setup.getByRole('button',{name:'Back to Nova',exact:false}).click();
  await panel.waitFor("document.visibilityState === 'visible'");
  await panel.evaluate(`(() => { window.__testTracks=[];const get=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async options=>{const stream=await get(options);window.__testTracks.push(...stream.getTracks());return stream;}; })()`);
  const promptCount = (await cdp.send('Browser.getHistograms',{query:'Permissions.Prompt.Shown',delta:false})).histograms.reduce((n,h)=>n+h.count,0);
  await panel.click('[aria-label="Start voice conversation"]');
  await panel.waitFor("window.__testTracks.some(t=>t.readyState==='live') && document.querySelector('.np-voice-heading').innerText.includes('listening')");
  assert.equal(context.pages().filter(p=>p.url().includes('/microphone.html')).length,0);
  assert.equal((await cdp.send('Browser.getHistograms',{query:'Permissions.Prompt.Shown',delta:false})).histograms.reduce((n,h)=>n+h.count,0),promptCount);
  assert.equal(await worker.evaluate(() => (self as unknown as {__testVoiceStarts:number}).__testVoiceStarts),1);
  await panel.click('#chat-tab'); await panel.waitFor("window.__testTracks.every(t=>t.readyState==='ended')");
  checks.push('The side panel reuses granted access without another setup tab or prompt, and Chat releases the microphone');
  await site.reload(); await site.getByRole('button',{name:'Open Nova side panel',exact:true}).waitFor();
  await panel.click('#voice-tab'); await panel.waitFor("window.__testTracks.some(t=>t.readyState==='live') && document.querySelector('.np-voice-heading').innerText.includes('listening')");
  assert.equal(context.pages().filter(p=>p.url().includes('/microphone.html')).length,0);
  await panel.click('#chat-tab'); await panel.waitFor("window.__testTracks.every(t=>t.readyState==='ended')");
  checks.push('A website reload preserves the permission and voice can restart directly');
  await cdp.send('Browser.setPermission',{permission:{name:'microphone'},setting:'denied'});
  assert.equal(await panel.evaluate("navigator.permissions.query({name:'microphone'}).then(p=>p.state)"),'denied');
  const deniedPage = context.waitForEvent('page'); await panel.click('#voice-tab');
  const denied = await deniedPage; await denied.waitForURL(`${extensionOrigin}/microphone.html`);
  await denied.getByText('Microphone access is blocked',{exact:true}).waitFor();
  assert.ok(await denied.getByRole('button',{name:'Open microphone settings',exact:false}).isVisible());
  assert.equal(await denied.locator('body').getAttribute('data-state'),'error');
  checks.push('A revoked/blocked permission is detected afresh and shows recovery instructions instead of using a stale saved flag');
  await denied.screenshot({path:'BE/data/microphone-permission-blocked.png'});
  await panel.disconnect();
  const report={at:new Date().toISOString(),ok:true,checks,permissionPromptObserved:true,grantAndDeny:'Simulated using Chromium permission overrides; no automatic-permission flag'};
  await writeFile('BE/data/microphone-smoke-report.json',JSON.stringify(report,null,2),{mode:0o600}); console.log(JSON.stringify(report,null,2));
} finally {await context.close();}
