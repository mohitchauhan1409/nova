import { chromium, type Browser, type BrowserContext, type Page, type CDPSession, type LaunchOptions } from 'playwright';
import { buildSync } from 'esbuild';
import path from 'node:path';
import { config, root } from '../config';
import { assertPublicUrl } from './security';
import type { BrowserDriver } from './driver';
import type { Action, Snapshot, ServerEvent, Session, PreparedInput } from '../../../shared/types';
import {waitDurationMs,boundedWaitCapability} from '../../../shared/wait';

const domScript = buildSync({ entryPoints: [path.join(root, 'shared/dom.ts')], bundle: true, write: false, format: 'iife', target: 'es2022' }).outputFiles[0].text;
export class ControlledBrowser implements BrowserDriver {
  private browser?: Browser; private context?: BrowserContext; private page?: Page; private cdp?: CDPSession; private world?: number;
  private receiver?: (message: unknown) => void; private latest?: Session; private voiceOrigin?: string; private installing?: Promise<void>;
  private copiedText = '';
  private companionScript = buildSync({ entryPoints: [path.join(root, 'web/companion/controlled-entry.ts')], bundle: true, write: false, format: 'iife', target: 'es2022' }).outputFiles[0].text;
  constructor(private launchOptions:LaunchOptions={}){}
  async open(url: string) {
    await assertPublicUrl(url);
    const headless = this.launchOptions.headless ?? config.headless;
    this.browser = await chromium.launch({ ...this.launchOptions, headless, args: ['--window-size=1360,900','--autoplay-policy=no-user-gesture-required',...(this.launchOptions.args||[])] });
    try {
      // A headed window can be smaller than its requested size. Emulating a fixed
      // viewport puts bottom-anchored UI below the visible browser content.
      this.context = await this.browser.newContext({ viewport: headless ? { width: 1360, height: 900 } : null, locale: 'en-IN', serviceWorkers: 'block', acceptDownloads: false });
      await this.context.route('**/*', async route => {
        try { const url = route.request().url(); if (/^https?:/.test(url)) await assertPublicUrl(url); else if (!/^(data:|blob:|about:)/.test(url)) throw new Error('Blocked protocol'); await route.continue(); }
        catch { await route.abort('blockedbyclient').catch(() => {}); }
      });
      this.page = await this.context.newPage();
      this.cdp = await this.context.newCDPSession(this.page);
      await this.cdp.send('Runtime.enable');
      await this.cdp.send('Runtime.addBinding', { name: '__novaRelay', executionContextName: 'nova-agent' });
      this.cdp.on('Runtime.bindingCalled', event => {
        if(event.name!=='__novaRelay'||event.executionContextId!==this.world)return;
        try { const message=JSON.parse(event.payload); if(message.type==='voice-start')this.voiceOrigin=new URL(this.current().url()).origin; if(message.type==='voice-stop')this.voiceOrigin=undefined;
          if(message.type==='companion-ready'){if(this.latest)this.companion({type:'session',session:this.latest});if(this.voiceOrigin===new URL(this.current().url()).origin)this.companion({type:'voice',event:'resume'});return;}
          this.receiver?.(message);
        }catch{}
      });
      this.page.on('framenavigated', frame => { if (frame === this.page?.mainFrame()) {this.world = undefined;if(this.voiceOrigin&&new URL(frame.url()).origin!==this.voiceOrigin){this.voiceOrigin=undefined;this.receiver?.({type:'voice-stop'});}} });
      this.page.on('domcontentloaded',()=>{if(this.receiver)void this.ensureCompanion().catch(()=>{});});
      this.page.setDefaultTimeout(8000);
      this.page.on('dialog', dialog => void dialog.dismiss());
      this.context.on('page', page => { if (page !== this.page) void page.close(); });
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (error) { await this.close(); throw error; }
  }
  private current() { if (!this.page || this.page.isClosed()) throw new Error('The controlled browser was closed. Start a new session.'); return this.page; }
  async bindCompanion(session: Session, receive: (message: unknown) => void) { this.latest=session;this.receiver=receive;await this.ensureCompanion();this.companion({type:'session',session}); }
  private async ensureCompanion() {
    if(this.installing)return this.installing;
    this.installing=(async()=>{await this.evaluate('true');await this.evaluate(this.companionScript);})();
    try{await this.installing;}finally{this.installing=undefined;}
  }
  companion(event: ServerEvent) {
    if(event.type==='session')this.latest=event.session;
    if(!this.world)return;
    void this.evaluate(`window.__novaCompanion?.receive(${JSON.stringify(event)})`).catch(()=>{});
  }
  async focus() { await this.current().bringToFront(); await this.ensureCompanion(); await this.evaluate('window.__novaCompanion?.open()'); }
  private async evaluate<T>(expression: string): Promise<T> {
    this.current();
    let contextId = this.world;
    if (!contextId) {
      const tree = await this.cdp!.send('Page.getFrameTree');
      const world = await this.cdp!.send('Page.createIsolatedWorld', { frameId: tree.frameTree.frame.id, worldName: 'nova-agent', grantUniveralAccess: false });
      contextId = world.executionContextId;
      // Capture the ID locally: navigation may clear this.world while CDP awaits.
      const installed = await this.cdp!.send('Runtime.evaluate', { expression: domScript, contextId });
      if (installed.exceptionDetails) throw new Error(installed.exceptionDetails.text);
      this.world = contextId;
    }
    const result = await this.cdp!.send('Runtime.evaluate', { expression, contextId, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value as T;
  }
  async snapshot(preparedInputs:PreparedInput[]=[]): Promise<Snapshot> {
    const page = this.current();
    // The page cannot overwrite Nova's globals in this separate JavaScript world.
    for (let recovery = 0; ; recovery++) {
      try {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForFunction(() => !!document.body, undefined, { timeout: 8000 });
        let snapshot=await this.evaluate<Snapshot>(`window.__novaDOM.snapshot(${JSON.stringify(preparedInputs)})`);
        for(let attempt=0;attempt<6&&snapshot.text.length<80&&snapshot.elements.length<2;attempt++){await page.waitForTimeout(150);snapshot=await this.evaluate<Snapshot>(`window.__novaDOM.snapshot(${JSON.stringify(preparedInputs)})`);}
        snapshot.capabilities=[...(snapshot.capabilities||[]),boundedWaitCapability];
        return snapshot;
      } catch (error) {
        const changedContext = /cannot find context|execution context was destroyed|cannot find.*context|frame with the given id was not found|no frame for given id/i.test(String(error));
        if (!changedContext || page.isClosed() || recovery >= 3) throw error;
        this.world = undefined;
        await page.waitForTimeout(150);
        // Retry observation only. Mutations are never replayed after a CDP error.
      }
    }
  }
  async execute(action: Action) {
    const page = this.current();
    if(action.kind==='press'&&action.value==='Escape'&&!action.ref){await page.keyboard.press('Escape');return {ok:true,detail:'Escape sent to the page.'};}
    let receipt: unknown;
    let expectedLength: number | undefined;
    const show = (x:number,y:number) => this.evaluate(`window.__novaCompanion?.action(${x},${y},${JSON.stringify(action.summary)},${JSON.stringify(action.kind)})`);
    if(!['done','ask','screenshot'].includes(action.kind)){
      let point:{x:number;y:number};
      if(action.ref){
        try{point=await this.evaluate<{x:number;y:number}>(`window.__novaDOM.prepare(${JSON.stringify(action.ref)},false,${action.kind==='media'})`);}
        catch(error){
          // This first pointer preparation precedes all mouse input. Only
          // recognized DOM guards qualify; context/transport failures do not.
          if(['click','double_click','right_click','hover','drag'].includes(action.kind)&&String(error).includes('Another element is covering the target. Close the overlay and observe again.'))return {ok:false,dispatch:'not-sent' as const,detail:'Another element is covering the target. Close the overlay and observe again.'};
          throw error;
        }
      }
      else if(action.x!==null&&action.y!==null)point={x:action.x,y:action.y};
      else point=await this.evaluate<{x:number;y:number}>('({x:Math.round(innerWidth*.55),y:Math.round(innerHeight*.5)})');
      await show(point.x,point.y);
    }
    if (action.kind === 'navigate') { const url = await assertPublicUrl(action.url || ''); await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30000 }); }
    else if (action.kind === 'back') await page.goBack({ waitUntil: 'domcontentloaded', timeout: 15000 });
    else if (action.kind === 'forward') await page.goForward({ waitUntil:'domcontentloaded',timeout:15000 });
    else if (action.kind === 'reload') await page.reload({waitUntil:'domcontentloaded',timeout:15000});
    else if (action.kind === 'wait') { await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(waitDurationMs(action.value)); }
    else if (action.kind === 'point') { if (action.x === null || action.y === null) throw new Error('Coordinates are required');await this.evaluate(`window.__novaDOM.point(${action.x},${action.y})`);await page.mouse.click(action.x, action.y); }
    else if (['search','fill','type','clear','paste'].includes(action.kind)) {
      const value=action.kind==='clear'?'':action.kind==='paste'?(action.value??this.copiedText):(action.value||'');
      const prepared=await this.evaluate<{valueLength?:number}>(`window.__novaDOM.prepare(${JSON.stringify(action.ref)},${action.kind==='type'},false,true)`);
      if(action.kind==='type')expectedLength=(prepared.valueLength||0)+value.length;
      if(action.kind!=='type')await page.keyboard.press('ControlOrMeta+A');
      if(!value)await page.keyboard.press('Backspace');
      else if(value.length<500)await page.keyboard.type(value,{delay:Math.min(10,Math.max(1,160/value.length))});
      else await page.keyboard.insertText(value);
      if(action.kind==='search')await page.keyboard.press('Enter');
    } else if (['click','double_click','right_click','hover','press','drag'].includes(action.kind)) {
      const point = await this.evaluate<{x: number; y: number}>(`window.__novaDOM.prepare(${JSON.stringify(action.ref)},false,false,${action.kind==='press'})`);
      await page.mouse.move(point.x,point.y,{steps:4});
      if (action.kind === 'click') await page.mouse.click(point.x, point.y);
      else if(action.kind==='double_click')await page.mouse.dblclick(point.x,point.y);
      else if(action.kind==='right_click')await page.mouse.click(point.x,point.y,{button:'right'});
      else if(action.kind==='drag'){
        const target=await this.evaluate<{x:number;y:number}>(`window.__novaDOM.prepare(${JSON.stringify(action.value)})`);
        await page.mouse.move(point.x,point.y);await page.mouse.down();try{await show(target.x,target.y);await page.mouse.move(target.x,target.y,{steps:12});}finally{await page.mouse.up();}
      }
      else if(action.kind==='press') { const key = action.value || 'Enter'; if (!['Enter','Escape','Tab','Shift+Tab','ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown','Backspace','Delete','ControlOrMeta+A','ControlOrMeta+Z','ControlOrMeta+Y',' '].includes(key)) throw new Error('Unsupported key'); await page.keyboard.press(key === ' ' ? 'Space' : key); }
    } else if(action.kind==='copy'){
      const result=await this.evaluate<{text:string}>(`window.__novaDOM.execute(${JSON.stringify({...action,kind:'select_text'})})`);
      this.copiedText=result.text;await page.keyboard.press('ControlOrMeta+C');
      return {ok:true,detail:`Copied ${this.copiedText.length} characters to the clipboard.`};
    } else receipt=await this.evaluate(`window.__novaDOM.execute(${JSON.stringify(action)})`);
    // Bounded settling interval avoids network-idle stalls on ads, analytics, and media.
    await page.waitForTimeout(['scroll','zoom','hover','select_text','check'].includes(action.kind)?70:120);
    if(['fill','type','clear','paste','check','select'].includes(action.kind))receipt=await this.evaluate(`window.__novaDOM.verify(${JSON.stringify(action)},${expectedLength??'undefined'})`);
    return receipt || { ok: true };
  }
  async screenshot() { return (await this.current().screenshot({ type: 'jpeg', quality: 65, animations: 'disabled' })).toString('base64'); }
  async close() { await this.browser?.close(); this.browser = undefined; }
}
