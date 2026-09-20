// A disposable browser profile verifies the real dashboard → extension → tab
// path. Only a local demo and direct zoom commands run; no paid AI requests.
import { chromium, type Page } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { writeFile, mkdtemp, mkdir, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import { unzipSync } from 'fflate';
import { config } from '../BE/src/config';
import { attachPanel } from './panel-test-driver';

const dashboardUrl = 'http://127.0.0.1:5173/';
const checks: string[] = [];
const temporary = await mkdtemp(path.join(os.tmpdir(), 'nova-download-smoke-'));
let separateBrowserRequests = 0;
const requestLog: string[] = [];
const watch = (page: Page) => page.on('request', request => {
  if (new URL(request.url()).pathname.startsWith('/api/')) requestLog.push(`${request.method()} ${new URL(request.url()).pathname}`);
  if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/sessions') separateBrowserRequests++;
});
const plain = await chromium.launch({ headless: true });
try {
  const page = await plain.newPage(); page.setDefaultTimeout(10000); watch(page);
  await page.goto(dashboardUrl);
  await page.getByText('Nova is online', { exact: true }).waitFor();
  await page.getByRole('article').filter({ hasText: 'Amazon' }).getByRole('button', { name: 'Open with Nova' }).click();
  await page.getByText('Nova extension is not connected to this browser yet.', { exact: true }).waitFor();
  assert.equal(page.context().pages().length, 1);
  assert.equal(separateBrowserRequests, 0);
  checks.push('Missing extension shows setup without launching a separate browser');
  assert.equal(new URL(page.url()).hash, '#setup');
  await page.getByRole('button', { name: 'Microsoft Edge', exact: true }).click();
  assert.equal(await page.getByRole('link', { name: 'Official Microsoft Edge installation guide' }).getAttribute('href'), 'https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading');
  await page.getByRole('button', { name: 'Google Chrome', exact: true }).click();
  assert.equal(await page.getByRole('link', { name: 'Official Google Chrome installation guide' }).getAttribute('href'), 'https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: dashboardUrl });
  await page.getByRole('button', { name: 'Copy address', exact: true }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'chrome://extensions');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download Nova extension', exact: true }).click();
  const download = await downloaded;
  assert.equal(download.suggestedFilename(), 'nova-extension.zip');
  const zipPath = path.join(temporary, 'nova-extension.zip');
  await download.saveAs(zipPath);
  for (const [name, bytes] of Object.entries(unzipSync(await readFile(zipPath)))) {
    const target = path.resolve(temporary, name);
    assert.ok(target.startsWith(path.join(temporary, 'nova-extension') + path.sep));
    await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, bytes);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: path.join(config.dataDir, 'extension-setup-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(config.dataDir, 'extension-setup-desktop.png'), fullPage: true });
  checks.push('Dashboard offers a working ZIP download, browser-specific official guides, and a responsive setup page');
} finally { await plain.close(); }

const extensionPath = path.join(temporary, 'nova-extension');
const context = await chromium.launchPersistentContext('', { channel: 'chromium', headless: false, viewport: null, args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, '--window-size=1400,950'] });
context.setDefaultTimeout(10000);
try {
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const dashboard = await context.newPage(); watch(dashboard);
  await dashboard.goto(dashboardUrl);
  await dashboard.getByText('Nova is online', { exact: true }).waitFor();
  await dashboard.getByRole('button', { name: 'Settings & setup', exact: true }).click();
  await dashboard.getByText('Nova extension connected to this browser.', { exact: true }).waitFor();
  await dashboard.getByText('Installed version: 0.6.7', { exact: true }).waitFor();
  await dashboard.getByRole('button', { name: 'Overview', exact: true }).click();
  checks.push('The downloaded and extracted extension loads successfully and reports its version to the dashboard');
  const dashboardTab = await worker.evaluate(async url => (await chrome.tabs.query({ url }))[0], dashboardUrl);
  assert.ok(dashboardTab?.id);
  await worker.evaluate(() => chrome.windows.create({ url: 'about:blank', focused: true }));
  const initialWindows = await worker.evaluate(async () => (await chrome.windows.getAll()).length);
  assert.equal(initialWindows, 2);
  const opened = context.waitForEvent('page');
  await dashboard.getByRole('button', { name: 'Try the demo', exact: true }).click();
  console.log('Requested a demo tab from the dashboard');
  const site = await opened;
  await site.waitForURL(`http://127.0.0.1:${config.port}/demo/shop`);
  await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).waitFor();
  const siteTab = await worker.evaluate(async url => (await chrome.tabs.query({ url }))[0], site.url());
  assert.equal(siteTab.windowId, dashboardTab.windowId);
  assert.notEqual(siteTab.id, dashboardTab.id);
  assert.equal(await worker.evaluate(async () => (await chrome.windows.getAll()).length), initialWindows);
  assert.equal(dashboard.url(), dashboardUrl);
  assert.equal(separateBrowserRequests, 0);
  checks.push('With two browser windows open, the website tab still opens in the dashboard’s window');
  checks.push('Floating Nova button mounts automatically without a manual pairing-token step');

  await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).click();
  const cdp = await context.newCDPSession(site);
  let targetId = '';
  for (let i = 0; i < 100 && !targetId; i++) {
    targetId = (await cdp.send('Target.getTargets')).targetInfos.find(t => t.url.endsWith(`/panel.html?tabId=${siteTab.id}`))?.targetId || '';
    if (!targetId) await site.waitForTimeout(70);
  }
  assert.ok(targetId, 'Clicking the launcher must open a native side panel');
  const panel = await attachPanel(cdp, targetId);
  await panel.waitFor("document.querySelector('textarea') && !document.querySelector('textarea').disabled");
  assert.equal(await panel.evaluate("document.querySelector('#chat-tab').getAttribute('aria-selected')"), 'true');
  assert.equal(await site.getByRole('dialog', { name: 'Nova website companion' }).count(), 0);
  const metrics = await panel.evaluate("({height:document.querySelector('textarea').getBoundingClientRect().height,scroll:document.querySelector('.np-conversation').scrollTop,overflow:document.documentElement.scrollWidth>innerWidth})");
  assert.equal(metrics.height, 43); assert.equal(metrics.scroll, 0); assert.equal(metrics.overflow, false);
  await writeFile(path.join(config.dataDir, 'native-panel-welcome.png'), await panel.screenshot());
  checks.push('The launcher opens a real browser side panel, defaults to chat, and leaves the website free of chat overlays');
  await panel.fill('textarea', 'zoom in');
  await panel.click('[aria-label="Send message"]');
  await panel.waitFor("document.body.innerText.includes('Zoom adjusted.')");
  await writeFile(path.join(config.dataDir, 'native-panel-chat.png'), await panel.screenshot());
  assert.ok(await worker.evaluate(id => chrome.tabs.getZoom(id), siteTab.id!) > 1);
  assert.equal(await worker.evaluate(id => chrome.tabs.getZoom(id), dashboardTab.id!), 1);
  checks.push('Typed command reaches the backend and changes native tab zoom');
  await site.reload();
  await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).waitFor();
  assert.ok(await panel.evaluate("document.body.innerText.includes('Zoom adjusted.')"));
  const nativeContexts = await worker.evaluate(() => chrome.runtime.getContexts({ contextTypes: ['SIDE_PANEL' as chrome.runtime.ContextType] }));
  assert.ok(nativeContexts.some(c => c.documentUrl?.endsWith(`/panel.html?tabId=${siteTab.id}`)));
  checks.push('Page reload restores the launcher while the native panel keeps the conversation');
  await panel.disconnect();
  await site.screenshot({ path: path.join(config.dataDir, 'same-browser-tab.png') });

  const ordinary = await context.newPage();
  await ordinary.goto(site.url());
  const ordinaryId = (await worker.evaluate(async () => (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0])).id!;
  assert.equal(await worker.evaluate(id => chrome.tabs.getZoom(id), ordinaryId), 1);
  assert.equal(await ordinary.getByRole('button', { name: 'Open Nova side panel', exact: true }).count(), 0);
  await ordinary.reload();
  assert.equal(await ordinary.getByRole('button', { name: 'Open Nova side panel', exact: true }).count(), 0);
  checks.push('Ordinary visits to the same website have no Nova companion, including after reload');

  await dashboard.bringToFront();
  const [replacement] = await Promise.all([context.waitForEvent('page'), dashboard.getByRole('button', { name: 'Try the demo', exact: true }).click()]);
  await replacement.waitForURL(site.url());
  await replacement.getByRole('button', { name: 'Open Nova side panel', exact: true }).waitFor();
  await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).waitFor({ state: 'detached' });
  await site.reload();
  assert.equal(await site.getByRole('button', { name: 'Open Nova side panel', exact: true }).count(), 0);
  checks.push('Launching another Nova website removes the previous companion and does not restore it on reload');

  await replacement.getByRole('button', { name: 'Open Nova side panel', exact: true }).click();
  const replacementCdp = await context.newCDPSession(replacement);
  let replacementTarget = '';
  for (let i = 0; i < 100 && !replacementTarget; i++) {
    replacementTarget = (await replacementCdp.send('Target.getTargets')).targetInfos.find(t => t.url.includes('/panel.html?tabId=') && t.targetId !== targetId)?.targetId || '';
    if (!replacementTarget) await replacement.waitForTimeout(70);
  }
  const replacementPanel = await attachPanel(replacementCdp, replacementTarget);
  await replacementPanel.waitFor("document.querySelector('textarea') && !document.querySelector('textarea').disabled");
  // Read only the session bound to this test-owned native panel, without exposing credentials.
  const ownedSessionId = await replacementPanel.evaluate<string>(`new Promise((resolve, reject) => {
    const port = chrome.runtime.connect({ name: 'nova-panel' });
    const timer = setTimeout(() => { port.disconnect(); reject(new Error('No active test session')); }, 5000);
    port.onMessage.addListener(message => { if (message.type === 'session') { clearTimeout(timer); port.disconnect(); resolve(message.session.id); } });
    port.postMessage({ type: 'nova-panel-connect' });
  })`);
  await replacementPanel.disconnect();
  assert.ok(ownedSessionId);
  await dashboard.bringToFront();
  await dashboard.getByRole('button', { name: 'Activity', exact: true }).click();
  await dashboard.locator(`[data-session-id="${ownedSessionId}"]`).getByRole('button', { name: 'End session', exact: true }).click();
  await replacement.getByRole('button', { name: 'Open Nova side panel', exact: true }).waitFor({ state: 'detached' });
  assert.ok(!replacement.isClosed());
  await replacement.reload();
  assert.equal(await replacement.getByRole('button', { name: 'Open Nova side panel', exact: true }).count(), 0);
  checks.push('Ending the session removes Nova, keeps the website open, and does not reinject on reload');

  await dashboard.bringToFront();
  await dashboard.getByRole('button', { name: 'Overview', exact: true }).click();
  const permissionTabPromise = context.waitForEvent('page');
  await dashboard.getByRole('article').filter({ hasText: 'Amazon' }).getByRole('button', { name: 'Open with Nova', exact: true }).click();
  const permissionTab = await permissionTabPromise;
  await permissionTab.getByRole('button', { name: 'Enable Nova on this website', exact: true }).waitFor();
  assert.match(await permissionTab.locator('#status').innerText(), /amazon\.in/);
  const permissionBrowserTab = await permissionTab.evaluate(() => chrome.tabs.getCurrent());
  assert.equal(permissionBrowserTab!.windowId, dashboardTab.windowId);
  assert.equal(await worker.evaluate(async () => (await chrome.windows.getAll()).length), initialWindows);
  const id = new URL(permissionTab.url()).hash.slice(1);
  const denied = await permissionTab.evaluate(id => chrome.runtime.sendMessage({ type: 'nova-launch-continue', id }), id);
  assert.match(denied.error, /Enable Nova/);
  checks.push('A new website asks for access in the same tab; navigation is blocked until permission is granted');

  const invalid = await context.newPage();
  await invalid.goto(`${permissionTab.url().split('#')[0]}#00000000-0000-0000-0000-000000000000`);
  await invalid.getByRole('alert').waitFor();
  assert.match(await invalid.getByRole('alert').innerText(), /expired/);
  checks.push('Unknown launch identifiers cannot open a website');
  assert.equal(separateBrowserRequests, 0);
  const report = { at: new Date().toISOString(), ok: true, checks };
  await writeFile(path.join(config.dataDir, 'tab-launch-smoke-report.json'), JSON.stringify(report, null, 2), { mode: 0o600 });
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error('Dashboard API paths:', requestLog);
  const dashboard = context.pages().find(page => page.url().startsWith(dashboardUrl));
  if (dashboard) await dashboard.screenshot({ path: path.join(config.dataDir, 'tab-launch-error.png'), fullPage: true });
  for (const page of context.pages()) console.error('Test page:', page.url(), await page.locator('[role="alert"], #status, #allow').allTextContents().catch(() => []));
  throw error;
} finally { await context.close(); await rm(temporary, { recursive: true, force: true }); }
