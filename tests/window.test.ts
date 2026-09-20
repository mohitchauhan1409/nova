import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';
import type { Page, CDPSession } from 'playwright';
import { ControlledBrowser } from '../BE/src/browser/controlled';
import { config } from '../BE/src/config';
import type { Session } from '../shared/types';

// This regression requires an actual OS window; emulated headless viewports hid
// the bug. Linux CI can run it under Xvfb with DISPLAY set.
describe.runIf(process.platform !== 'linux' || !!process.env.DISPLAY)('companion in a real browser window', () => {
  let server: Server;
  let driver: ControlledBrowser;
  let page: Page;
  let cdp: CDPSession;
  const received: unknown[] = [];
  const allowLocalTests = config.allowLocalTests;
  const session: Session = { id: 'window-test', siteId: 'fixture', mode: 'browser', url: '', title: 'Interaction lab', status: 'ready', messages: [], traces: [], model: 'test', steps: 0, startedAt: Date.now() };

  beforeAll(async () => {
    config.allowLocalTests = true;
    server = createServer((_, response) => {
      response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Security-Policy': "require-trusted-types-for 'script'" });
      response.end(readFileSync('tests/fixtures/interactions.html'));
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    driver = new ControlledBrowser({ headless: false, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
    session.url = `http://127.0.0.1:${(server.address() as { port: number }).port}/lab`;
    await driver.open(session.url);
    ({ page, cdp } = driver as unknown as { page: Page; cdp: CDPSession });
    await driver.bindCompanion(session, message => received.push(message));
  });

  afterAll(async () => {
    await driver?.close();
    if (server?.listening) await new Promise<void>(resolve => server.close(() => resolve()));
    config.allowLocalTests = allowLocalTests;
  });

  async function expectVisibleLauncher() {
    const size = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, windowHeight: outerHeight }));
    // There must be room for browser chrome outside the page's viewport.
    expect(size.height).toBeLessThan(size.windowHeight);
    const button = page.getByRole('button', { name: 'Open Nova assistant', exact: true });
    const box = await button.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(size.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(size.height);
    await button.click({ trial: true });
  }

  it('keeps the launcher inside visible browser content on launch', async () => {
    await expectVisibleLauncher();
  });

  it('follows physical window resizing and opens the voice and typing controls', async () => {
    const { windowId } = await cdp.send('Browser.getWindowForTarget');
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { width: 920, height: 650 } });
    await page.waitForFunction(() => innerWidth <= 920 && innerHeight < 650);
    await expectVisibleLauncher();
    await page.getByRole('button', { name: 'Open Nova assistant', exact: true }).click();
    await page.getByRole('dialog', { name: 'Nova website companion' }).waitFor();
    await expect.poll(() => received.some(message => (message as { type: string }).type === 'voice-start'), { timeout: 5000 }).toBe(true);
    await page.getByRole('button', { name: 'Type instead', exact: true }).click();
    await page.getByRole('textbox', { name: 'Message Nova', exact: true }).fill('Scroll down');
    await page.getByRole('button', { name: 'Send ↗', exact: true }).click();
    await expect.poll(() => received).toContainEqual({ type: 'command', sessionId: session.id, text: 'Scroll down' });
    await page.getByRole('button', { name: 'Minimize Nova', exact: true }).click();
  });

  it('uses current window dimensions for agent actions and restores the launcher after reload', async () => {
    await driver.execute({ kind: 'scroll', ref: null, value: 'down', url: null, x: null, y: null, summary: 'Scroll down', risk: 'read' });
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    const viewport = (await driver.snapshot()).viewport;
    expect(viewport).toMatchObject(await page.evaluate(() => ({ width: innerWidth, height: innerHeight })));
    expect(viewport.scrollY).toBeGreaterThan(0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open Nova assistant', exact: true }).waitFor();
    await expectVisibleLauncher();
  });
});
