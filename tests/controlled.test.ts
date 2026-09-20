import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import type { Page } from 'playwright';
import { ControlledBrowser } from '../BE/src/browser/controlled';
import { config } from '../BE/src/config';

let server: Server;
let driver: ControlledBrowser;
const settings = { headless: config.headless, allowLocalTests: config.allowLocalTests };

beforeAll(async () => {
  config.headless = true;
  config.allowLocalTests = true;
  server = createServer((_, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`<title>Context recovery fixture</title><h1>Stable product details</h1><button>Read details</button><button role="tab" onfocus="history.replaceState(null,'','?tab=intelligence')" onclick="this.textContent='Intelligence selected'">Intelligence</button><label for="credential">API key</label><input id="credential" value="fictional-private-value"><input placeholder="Client secret" value="fictional-other-value"><script>window.__novaDOM={snapshot:()=>({text:"POISONED"})};</script>`);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  driver = new ControlledBrowser();
  await driver.open(`http://127.0.0.1:${address.port}/fixture`);
});

afterAll(async () => {
  await driver?.close();
  await new Promise<void>(resolve => server?.close(() => resolve()));
  Object.assign(config, settings);
});

describe('controlled browser execution contexts', () => {
  it('does not activate focus-driven tabs while only preparing pointer coordinates', async () => {
    const before = await driver.snapshot();
    const target = before.elements.find(e=>e.name==='Intelligence')!;
    const internals = driver as unknown as {evaluate<T>(expression:string):Promise<T>};
    await internals.evaluate(`window.__novaDOM.prepare(${JSON.stringify(target.ref)})`);
    expect((await driver.snapshot()).url).toBe(before.url);
    await driver.execute({kind:'click',ref:target.ref,value:null,url:null,x:null,y:null,risk:'read',summary:'Open Intelligence'});
    const after=await driver.snapshot();
    expect(after.url).toContain('?tab=intelligence');
    expect(after.text).toContain('Intelligence selected');
  });
  it('protects credentials identified by associated labels and placeholders', async () => {
    const snapshot = await driver.snapshot();
    expect(snapshot.elements.find(e => e.name === 'API key')).toMatchObject({sensitive:true});
    expect(snapshot.elements.find(e => e.name === 'Client secret')).toMatchObject({sensitive:true});
    expect(JSON.stringify(snapshot)).not.toContain('fictional-private-value');
    expect(JSON.stringify(snapshot)).not.toContain('fictional-other-value');
    await expect(driver.execute({kind:'fill',ref:snapshot.elements.find(e=>e.name==='API key')!.ref,value:'replacement',url:null,x:null,y:null,risk:'change',summary:'Replace key'})).rejects.toThrow(/sensitive/i);
  });
  it('reads the DOM in an isolated world the page cannot overwrite', async () => {
    const snapshot = await driver.snapshot();
    expect(snapshot.text).toContain('Stable product details');
    expect(snapshot.text).not.toContain('POISONED');
    expect(snapshot.elements.some(element => element.name === 'Read details')).toBe(true);
  });

  it('recovers an expired CDP context while reading a navigated page', async () => {
    // Reproduce the observed race: CDP still holds the old ID after navigation.
    const internals = driver as unknown as { page: Page; world?: number };
    const expired = internals.world;
    await internals.page.reload({ waitUntil: 'domcontentloaded' });
    internals.world = expired;
    const snapshot = await driver.snapshot();
    expect(snapshot.title).toBe('Context recovery fixture');
    expect(snapshot.text).toContain('Stable product details');
    expect(internals.world).not.toBe(expired);
  });
});
