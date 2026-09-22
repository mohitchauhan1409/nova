import {afterAll,afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {chromium,type Browser,type Page} from 'playwright';
import {buildSync} from 'esbuild';
import {BrowserControl} from '../web/extension/browser-control';
import type {Action} from '../shared/types';
const domScript=buildSync({entryPoints:['shared/dom.ts'],bundle:true,write:false,format:'iife'}).outputFiles[0].text;
let browser:Browser;let page:Page;
beforeAll(async()=>{browser=await chromium.launch({headless:true});page=await browser.newPage();});
afterAll(async()=>{await browser?.close();});
afterEach(()=>vi.unstubAllGlobals());
const action:Action={kind:'fill',ref:null,value:null,url:null,x:null,y:null,risk:'change',summary:'Edit JSON'};
async function fixture(unexpected=false){
  await page.goto('about:blank');
  await page.setContent('<div role="textbox" contenteditable="true" aria-label="JSON" style="white-space:pre;min-height:200px">Old JSON</div>');
  // A representative contenteditable code editor: auto-closes delimiters and
  // auto-indents new lines. Only its own input handling renders the document.
  await page.evaluate(unexpected=>{
    const editor=document.querySelector<HTMLElement>('[contenteditable]')!;
    (window as any).generated=0;(window as any).trusted=[];
    editor.addEventListener('beforeinput',event=>{
      const input=event as InputEvent;
      if(['deleteContentForward','deleteContentBackward'].includes(input.inputType)){
        event.preventDefault();const range=getSelection()!.getRangeAt(0);range.deleteContents();
        if(!editor.textContent){editor.innerHTML='<div><br></div>';range.setStart(editor.firstChild!,0);}
        else {const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT);let last:Node|null=null;while(walker.nextNode())last=walker.currentNode;if(last)range.setStart(last,last.textContent!.length);}
        range.collapse(true);getSelection()!.removeAllRanges();getSelection()!.addRange(range);return;
      }
      if(input.inputType!=='insertText')return;
      event.preventDefault();(window as any).trusted.push(input.isTrusted);
      const selection=getSelection()!,range=selection.getRangeAt(0);
      const data=input.data||'',closer:Record<string,string>={'{':'}','[':']','"':'"'};
      if(!selection.isCollapsed&&closer[data]){
        const selected=selection.toString();range.deleteContents();const node=document.createTextNode(data+selected+closer[data]);range.insertNode(node);
        range.setStart(node,data.length);range.setEnd(node,data.length+selected.length);selection.removeAllRanges();selection.addRange(range);return;
      }
      range.deleteContents();
      editor.querySelectorAll('br').forEach(br=>br.remove());
      const extra=unexpected?'!':data==='\n'?'  ':closer[data]||'';
      if(extra)(window as any).generated++;
      const node=document.createTextNode(data+extra);range.insertNode(node);
      range.setStart(node,data.length+(data==='\n'?extra.length:0));range.collapse(true);
      selection.removeAllRanges();selection.addRange(range);
    });
  },unexpected);
  await page.evaluate(domScript);
  const ref=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='JSON')!.ref;
  const cdp=await page.context().newCDPSession(page);const sent:string[]=[];let deletes=0;
  vi.stubGlobal('navigator',{userAgent:'Linux'});
  vi.stubGlobal('chrome',{
    permissions:{contains:async()=>true},
    tabs:{get:async()=>({active:true,url:'https://fixture.test/'}),sendMessage:async(_id:number,message:any)=>page.evaluate(message=>{
      const dom=window.__novaDOM!;
      try{
        if(message.method==='native-prepare')return dom.prepare(message.action.ref);
        if(message.method==='native-input-start'){dom.startInput(message.action.ref,message.action.kind==='type');return {ok:true};}
        if(message.method==='native-input-focus')return {ok:!!dom.inputPosition(message.action.ref)};
        if(message.method==='native-input-empty')return {ok:!!dom.inputPosition(message.action.ref)&&dom.verify({...message.action,kind:'clear'}).verification?.status==='verified'};
        if(message.method==='native-input-correction')return {remove:dom.prepareInputCorrection(message.action.ref,message.prefix,message.character)};
        if(message.method==='verify')return dom.verify(message.action,message.expectedLength);
        return {ok:true};
      }catch(error){return {error:(error as Error).message};}
    },message)},
    debugger:{attach:async()=>{},onDetach:{addListener:()=>{}},sendCommand:async(_target:unknown,method:string,params:any)=>{
      if(method==='Input.insertText')sent.push(params.text);
      if(method==='Input.dispatchKeyEvent'&&params.type==='rawKeyDown'&&params.key==='Delete')deletes++;
      return cdp.send(method as any,params);
    }},
  });
  return {control:new BrowserControl(()=>1,()=>{},undefined,true),ref,sent,cdp,deletes:()=>deletes};
}
describe('trusted rich-editor text entry',()=>{
  it('removes only proven generated pairs and newline indentation, preserving authored whitespace inside strings',async()=>{
    const f=await fixture();const value='{\n"a":[" x "]\n}';
    const result=await f.control.execute(1,{...action,ref:f.ref,value});
    expect(result.verification?.status).toBe('verified');
    expect(await page.getByRole('textbox').innerText()).toBe(value);
    expect(f.sent).toEqual([...value]);expect(f.deletes()).toBeGreaterThan(3);
    expect(await page.evaluate(()=>(window as any).trusted.every(Boolean))).toBe(true);
    await f.cdp.detach();
  });
  it('clears a selected existing document before the first brace can wrap it',async()=>{
    const f=await fixture();
    await page.evaluate(ref=>window.__novaDOM!.startInput(ref),f.ref);
    await f.cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'a',code:'KeyA',commands:['selectAll']});
    await f.cdp.send('Input.insertText',{text:'{'});
    expect(await page.getByRole('textbox').innerText()).toBe('{Old JSON}');
    expect(await page.evaluate(()=>getSelection()?.toString())).toBe('Old JSON');
    // The real controller must explicitly delete this selected document before
    // sending another opening brace; replacement-by-insertion would wrap again.
    const result=await f.control.execute(1,{...action,ref:f.ref,value:'{}'});
    expect(result.verification?.status).toBe('verified');
    expect(await page.getByRole('textbox').innerText()).toBe('{}');
    expect(f.sent).toEqual(['{','}']);await f.cdp.detach();
  });
  it('verifies the complete append baseline, not only the inserted suffix and length',async()=>{
    const f=await fixture();
    await page.evaluate(ref=>window.__novaDOM!.startInput(ref,true),f.ref);
    await page.getByRole('textbox').evaluate(el=>{el.textContent='Bad JSON!';});
    const result=await page.evaluate(({ref,action})=>window.__novaDOM!.verify({...action,kind:'type',ref,value:'!'},9),{ref:f.ref,action});
    expect(result.verification?.status).toBe('unverified');await f.cdp.detach();
  });
  it('stops on unrecognized editor rewriting rather than deleting it or claiming success',async()=>{
    const f=await fixture(true);
    await expect(f.control.execute(1,{...action,ref:f.ref,value:'ab'})).rejects.toThrow('changed the requested text');
    expect(f.sent).toEqual(['a']);expect(f.deletes()).toBe(0);
    expect(await page.getByRole('textbox').innerText()).toBe('a!');await f.cdp.detach();
  });
});
