import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { build } from 'esbuild';
import { chromium, type Browser } from 'playwright';

let browser: Browser;
let contentScript: string;
let panelScript: string;
beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
  const options = { bundle: true, write: false, format: 'iife' as const, target: 'chrome120' };
  contentScript = (await build({ ...options, entryPoints: ['web/extension/content.ts'] })).outputFiles![0].text;
  panelScript = (await build({ ...options, stdin: { contents: "import React from 'react'; import {createRoot} from 'react-dom/client'; import {PanelApp} from './web/src/panel/PanelApp'; createRoot(document.getElementById('app')).render(React.createElement(PanelApp));", resolveDir: process.cwd(), loader: 'tsx' } })).outputFiles![0].text;
});
afterAll(async () => { await browser?.close(); });

describe('initial website theme', () => {
  it('mounts a dark launcher before any snapshot, follows CSS changes, and cleans up on unmount', async () => {
    const page = await browser.newPage({ colorScheme: 'light' });
    try {
      await page.setContent('<style>body { background: #141414; }</style><button>Fixture content</button>');
      await page.evaluate(() => {
        const state = { messages: [] as unknown[], snapshots: 0, runtimeListener: undefined as any, portListener: undefined as any };
        (window as any).fixture = state;
        (window as any).chrome = { runtime: { id: 'fixture', onMessage: { addListener: (fn: any) => state.runtimeListener = fn }, connect: () => ({ postMessage: (message: unknown) => state.messages.push(message), onMessage: { addListener: (fn: any) => state.portListener = fn }, onDisconnect: { addListener: () => {} }, disconnect: () => {} }) } };
      });
      await page.addScriptTag({ content: contentScript });
      await page.evaluate(() => {
        window.__novaDOM!.snapshot = () => { (window as any).fixture.snapshots++; throw new Error('Theme initialization must not snapshot the page'); };
        (window as any).fixture.runtimeListener({ type: 'nova-mount' }, { id: 'fixture' }, () => {});
      });
      const launcher = page.locator('[data-nova-root="launcher"]');
      expect(await launcher.getAttribute('data-color-scheme')).toBe('dark');
      expect(await page.evaluate(() => (window as any).fixture.messages[0])).toEqual({ type: 'nova-page-connect', scheme: 'dark' });
      await page.evaluate(() => (window as any).fixture.portListener({ type: 'session', session: { status: 'ready', lastSnapshot: { theme: { scheme: 'light' } } } }));
      expect(await launcher.getAttribute('data-color-scheme')).toBe('dark');
      await page.evaluate(() => { document.body.style.backgroundColor = '#fafafa'; });
      await page.waitForFunction(() => document.querySelector<HTMLElement>('[data-nova-root]')?.dataset.colorScheme === 'light');
      expect(await page.evaluate(() => (window as any).fixture.messages.at(-1))).toEqual({ type: 'nova-page-theme', scheme: 'light' });
      expect(await page.evaluate(() => (window as any).fixture.snapshots)).toBe(0);
      const count = await page.evaluate(() => {
        const fixture = (window as any).fixture;
        fixture.runtimeListener({ type: 'nova-unmount' }, { id: 'fixture' }, () => {});
        document.body.style.backgroundColor = '#141414';
        return fixture.messages.length;
      });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      expect(await launcher.count()).toBe(0);
      expect(await page.evaluate(() => (window as any).fixture.messages.length)).toBe(count);
    } finally { await page.close(); }
  });

  it('renders the native panel using the passive scheme before a session and keeps it over an older snapshot', async () => {
    const page = await browser.newPage();
    try {
      await page.setContent('<div id="app"></div>');
      await page.evaluate(() => {
        (window as any).chrome = { runtime: {
          sendMessage: async () => ({ granted: true, suspended: false }),
          connect: () => ({ onMessage: { addListener: (fn: any) => (window as any).receive = fn }, onDisconnect: { addListener: () => {} }, disconnect: () => {}, postMessage: (message: any) => { if (message.type === 'nova-panel-connect') (window as any).receive({ type: 'page-theme', scheme: 'dark' }); } }),
        } };
      });
      await page.addScriptTag({ content: panelScript });
      await page.waitForFunction(() => document.querySelector<HTMLElement>('.np-app')?.dataset.colorScheme === 'dark');
      await page.evaluate(() => (window as any).receive({ type: 'session', session: { id: 'fixture', url: 'https://fixture.test/', status: 'ready', messages: [], traces: [], lastSnapshot: { theme: { scheme: 'light' } } } }));
      expect(await page.locator('.np-app').getAttribute('data-color-scheme')).toBe('dark');
      await page.evaluate(() => (window as any).receive({ type: 'page-theme', scheme: 'light' }));
      await page.waitForFunction(() => document.querySelector<HTMLElement>('.np-app')?.dataset.colorScheme === 'light');
    } finally { await page.close(); }
  });
});
