import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {chromium,type Browser,type Page} from 'playwright';
import {buildSync} from 'esbuild';
const domScript=buildSync({entryPoints:['shared/dom.ts'],bundle:true,write:false,format:'iife'}).outputFiles[0].text;
const contentScript=buildSync({entryPoints:['web/extension/content.ts'],bundle:true,write:false,format:'iife',define:{__NOVA_RECORDING_MODE__:'true',__NOVA_RECORDING_SHOW_ACTION_CURSOR__:'true'}}).outputFiles[0].text;
let browser:Browser;let page:Page;
beforeAll(async()=>{browser=await chromium.launch({headless:true});page=await browser.newPage();});
afterAll(async()=>{await browser?.close();});
async function fixture(){
  await page.goto('about:blank');
  await page.setContent('<p>Page text must never be selected by field entry.</p><textarea aria-label="Target">Old value</textarea><input aria-label="Other">');
  await page.evaluate(domScript);
  return (await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='Target')!.ref;
}
describe('initial field focus in a disposable headless browser',()=>{
  it('handles a real click that leaves focus unchanged, then inserts trusted text into the original field',async()=>{
    const ref=await fixture();
    await page.getByLabel('Target').evaluate(el=>el.addEventListener('mousedown',event=>event.preventDefault()));
    const cdp=await page.context().newCDPSession(page);
    const point=await page.evaluate(ref=>window.__novaDOM!.prepare(ref),ref);
    await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
    expect(await page.evaluate(ref=>window.__novaDOM!.inputPosition(ref),ref)).toBeUndefined();
    await page.evaluate(ref=>window.__novaDOM!.startInput(ref),ref);
    await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'a',code:'KeyA',commands:['selectAll']});
    await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA'});
    await cdp.send('Input.insertText',{text:'N'});
    expect(await page.getByLabel('Target').inputValue()).toBe('N');
    expect(await page.getByLabel('Other').inputValue()).toBe('');
    expect(await page.evaluate(()=>getSelection()?.toString())).toBe('');
    await cdp.detach();
  });
  it('never follows a replacement field or refocuses after the initial acquisition',async()=>{
    const ref=await fixture();await page.evaluate(ref=>window.__novaDOM!.startInput(ref,true),ref);
    expect(await page.getByLabel('Target').evaluate(el=>(el as HTMLTextAreaElement).selectionStart)).toBe(9);
    await page.getByLabel('Other').focus();
    expect(await page.evaluate(ref=>window.__novaDOM!.inputPosition(ref),ref)).toBeUndefined();
    expect(await page.getByLabel('Other').evaluate(el=>document.activeElement===el)).toBe(true);
    await page.getByLabel('Target').evaluate(el=>el.replaceWith(el.cloneNode(true)));
    await expect(page.evaluate(ref=>window.__novaDOM!.startInput(ref),ref)).rejects.toThrow('unavailable');
  });
  it('rejects a focus handler that redirects to another field before selection or text',async()=>{
    const ref=await fixture();
    await page.getByLabel('Target').evaluate(el=>el.addEventListener('focus',()=>document.querySelector('input')!.focus()));
    await expect(page.evaluate(ref=>window.__novaDOM!.startInput(ref),ref)).rejects.toThrow('did not accept focus');
    expect(await page.getByLabel('Target').inputValue()).toBe('Old value');
  });
  it('remeasures the same original target after layout changes during cursor presentation',async()=>{
    await fixture();
    await page.evaluate(()=>{
      const test=window as any;
      test.chrome={runtime:{id:'fixture',onMessage:{addListener:(listener:unknown)=>{test.listener=listener;}},connect:()=>({onMessage:{addListener:()=>{}},onDisconnect:{addListener:()=>{}},postMessage:()=>{}})}};
      test.__novaCompanion={receive:()=>{},clearCursor:()=>{},positionCursor:(x:number,y:number)=>{test.position={x,y};},action:async()=>{document.querySelector('textarea')!.style.marginTop='140px';await new Promise(resolve=>setTimeout(resolve,10));}};
    });
    await page.evaluate(contentScript);
    await page.evaluate(()=>{(window as any).listener({type:'nova-mount'},{id:'fixture'},()=>{});});
    const ref=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='Target')!.ref;
    const original=await page.evaluate(ref=>window.__novaDOM!.prepare(ref),ref);
    const prepared=await page.evaluate(ref=>new Promise<{x:number;y:number}>(resolve=>{(window as any).listener({type:'nova-dom',method:'native-prepare',action:{kind:'fill',ref,summary:'Fill target'},cursorId:7},{id:'fixture'},resolve);}),ref);
    expect(prepared.y).toBeGreaterThan(original.y+100);
    const current=await page.evaluate(ref=>window.__novaDOM!.prepare(ref),ref);
    expect(prepared).toMatchObject({x:current.x,y:current.y});
    expect(await page.evaluate(()=>(window as any).position)).toEqual({x:current.x,y:current.y});
  });
});
