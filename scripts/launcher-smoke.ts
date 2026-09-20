// Exercise real desktop windows and public pages without calling AI providers.
// Microphone input is Chromium's synthetic device; commands stop at the bridge.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import type { CDPSession, Page } from 'playwright';
import { ControlledBrowser } from '../BE/src/browser/controlled';
import { config } from '../BE/src/config';
import type { Session } from '../shared/types';
import path from 'node:path';

const reports: unknown[] = [];
let failed = false;
const only = process.argv.find(argument => argument.startsWith('--site='))?.slice(7);
const sites = [['google', 'https://www.google.com/'], ['youtube', 'https://www.youtube.com/'], ['amazon', 'https://www.amazon.in/']].filter(([siteId]) => !only || only === siteId);
assert.ok(sites.length, 'No website matches --site');

async function checkLauncher(page: Page) {
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, windowHeight: outerHeight }));
  assert.ok(viewport.height < viewport.windowHeight, 'Viewport must fit below browser chrome');
  const button = page.getByRole('button', { name: 'Open Nova assistant', exact: true });
  await button.waitFor();
  const box = await button.boundingBox();
  assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height, 'Entire launcher must be inside visible browser content');
  await button.click({ trial: true });
  return { viewport, button: box };
}

async function until(check: () => boolean, message: string) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (check()) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

for (const [siteId, url] of sites) {
  const driver = new ControlledBrowser({ headless: false, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  try {
    await driver.open(url);
    const snapshot = await driver.snapshot();
    const session: Session = { id: `launcher-${siteId}`, siteId, mode: 'browser', status: 'ready', url: snapshot.url, title: snapshot.title, messages: [], traces: [], steps: 0, model: 'launcher-test', startedAt: Date.now() };
    const received: { type: string; text?: string; sessionId?: string }[] = [];
    await driver.bindCompanion(session, message => received.push(message as typeof received[number]));
    const { page, cdp } = driver as unknown as { page: Page; cdp: CDPSession };
    const initial = await checkLauncher(page);
    await page.screenshot({ path: path.join(config.dataDir, `launcher-${siteId}.png`) });

    const { windowId } = await cdp.send('Browser.getWindowForTarget');
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { width: 920, height: 650 } });
    await page.waitForFunction(() => innerWidth <= 920 && innerHeight < 650);
    const resized = await checkLauncher(page);
    await page.getByRole('button', { name: 'Open Nova assistant', exact: true }).click();
    await page.getByRole('dialog', { name: 'Nova website companion' }).waitFor();
    await until(() => received.some(message => message.type === 'voice-start'), 'Launcher must start the synthetic microphone and reach the session bridge');
    await page.screenshot({ path: path.join(config.dataDir, `launcher-${siteId}-open.png`) });
    await page.getByRole('button', { name: 'Type instead', exact: true }).click();
    await page.getByRole('textbox', { name: 'Message Nova', exact: true }).fill('Scroll down');
    await page.getByRole('button', { name: 'Send ↗', exact: true }).click();
    await until(() => received.some(message => message.type === 'command' && message.text === 'Scroll down' && message.sessionId === session.id), 'Typed command must reach the same session bridge');
    await page.getByRole('button', { name: 'Minimize Nova', exact: true }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const reloaded = await checkLauncher(page);
    const report = { siteId, ok: true, url: page.url(), initial, resized, reloaded, checks: ['Visible and clickable launcher', 'Physical window resize', 'Voice introduction and synthetic capture', 'Typed command bridge', 'Full page reload'] };
    reports.push(report);
    console.log(`${siteId}: launcher, resize, voice/typing controls, and reload passed`);
  } catch (error) {
    failed = true;
    const message = error instanceof Error ? error.message : String(error);
    const { page } = driver as unknown as { page?: Page };
    const companionState = await page?.locator('[data-nova-root="companion"]').evaluate(host => ({ status: host.shadowRoot?.querySelector('.voice-status')?.textContent, error: host.shadowRoot?.querySelector('.error')?.textContent })).catch(() => undefined);
    await page?.screenshot({ path: path.join(config.dataDir, `launcher-${siteId}-failure.png`) }).catch(() => undefined);
    reports.push({ siteId, ok: false, error: message, companionState });
    console.error(`${siteId}: ${message}`, companionState);
  } finally {
    await driver.close();
  }
}

await writeFile(path.join(config.dataDir, `launcher-${only ? `${only}-` : ''}smoke-report.json`), JSON.stringify({ at: new Date().toISOString(), reports }, null, 2), { mode: 0o600 });
if (failed) process.exitCode = 1;
