import {afterAll,afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {chromium,type Browser,type Page} from 'playwright';
import {buildSync} from 'esbuild';
import {BrowserControl} from '../web/extension/browser-control';
import type {Action} from '../shared/types';
const domScript=buildSync({entryPoints:['shared/dom.ts'],bundle:true,write:false,format:'iife'}).outputFiles[0].text;
const settleScript=buildSync({entryPoints:['shared/paced-input.ts'],bundle:true,write:false,format:'iife',globalName:'NovaPaced'}).outputFiles[0].text;
const codeMirrorScript=buildSync({stdin:{contents:`import {EditorView,basicSetup} from 'codemirror';import {json} from '@codemirror/lang-json';new EditorView({doc:'Old JSON',extensions:[basicSetup,json(),EditorView.contentAttributes.of({'aria-label':'JSON'})],parent:document.body});`,resolveDir:process.cwd()},bundle:true,write:false,format:'iife'}).outputFiles[0].text;
let browser:Browser;let page:Page;
beforeAll(async()=>{browser=await chromium.launch({headless:true});page=await browser.newPage();});
afterAll(async()=>{await browser?.close();});
afterEach(()=>vi.unstubAllGlobals());
const action:Action={kind:'fill',ref:null,value:null,url:null,x:null,y:null,risk:'change',summary:'Edit JSON'};
async function fixture(unexpected=false,asyncCaret=false,codeMirror=false){
  await page.goto('about:blank');
  if(codeMirror){await page.setContent('<style>.cm-editor{height:300px}</style>');await page.addScriptTag({content:codeMirrorScript});}
  else {
  await page.setContent('<div role="textbox" contenteditable="true" aria-label="JSON" style="white-space:pre;min-height:200px">Old JSON</div>');
  // A representative contenteditable code editor: auto-closes delimiters and
  // auto-indents new lines. Only its own input handling renders the document.
  await page.evaluate(({unexpected,asyncCaret})=>{
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
      if(!['insertText','insertParagraph'].includes(input.inputType))return;
      event.preventDefault();(window as any).trusted.push(input.isTrusted);
      const selection=getSelection()!,range=selection.getRangeAt(0);
      const data=input.inputType==='insertParagraph'?'\n':input.data||'',closer:Record<string,string>={'{':'}','[':']','"':'"'};
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
      if(asyncCaret&&extra&&data==='{'&&!(window as any).immediateFailure){
        range.setStart(node,node.length);range.collapse(true);selection.removeAllRanges();selection.addRange(range);
        try{window.__novaDOM!.prepareInputCorrection((window as any).inputRef,data,data);}catch(error){(window as any).immediateFailure=(error as Error).message;}
        requestAnimationFrame(()=>requestAnimationFrame(()=>{range.setStart(node,data.length);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}));
      }
    });
  },{unexpected,asyncCaret});
  }
  await page.evaluate(domScript);
  const ref=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='JSON')!.ref;
  await page.addScriptTag({content:settleScript});
  await page.evaluate(ref=>{(window as any).inputRef=ref;},ref);
  const cdp=await page.context().newCDPSession(page);const sent:string[]=[];const pressed:string[]=[];let deletes=0;
  vi.stubGlobal('navigator',{userAgent:codeMirror?await page.evaluate(()=>navigator.userAgent):'Linux'});
  vi.stubGlobal('chrome',{
    permissions:{contains:async()=>true},
    tabs:{get:async()=>({active:true,url:'https://fixture.test/'}),sendMessage:async(_id:number,message:any)=>page.evaluate(async message=>{
      const dom=window.__novaDOM!;
      try{
        if(message.method==='native-prepare')return dom.prepare(message.action.ref);
        if(message.method==='native-input-start'){dom.startInput(message.action.ref,message.action.kind==='type');return {ok:true};}
        if(message.method==='native-input-focus')return {ok:!!dom.inputPosition(message.action.ref)};
        if(message.method==='native-input-empty')return {ok:!!dom.inputPosition(message.action.ref)&&dom.verify({...message.action,kind:'clear'}).verification?.status==='verified'};
        if(message.method==='native-input-correction'){await (window as any).NovaPaced.settleEditorInput();return {remove:dom.prepareInputCorrection(message.action.ref,message.prefix,message.character)};}
        if(message.method==='verify')return dom.verify(message.action,message.expectedLength);
        return {ok:true};
      }catch(error){return {error:(error as Error).message};}
    },message)},
    debugger:{attach:async()=>{},onDetach:{addListener:()=>{}},sendCommand:async(_target:unknown,method:string,params:any)=>{
      if(method==='Input.insertText')sent.push(params.text);
      if(method==='Input.dispatchKeyEvent'&&['rawKeyDown','keyDown'].includes(params.type))pressed.push(params.key);
      if(method==='Input.dispatchKeyEvent'&&params.type==='rawKeyDown'&&params.key==='Delete')deletes++;
      return cdp.send(method as any,params);
    }},
  });
  return {control:new BrowserControl(()=>1,()=>{},undefined,true),ref,sent,pressed,cdp,deletes:()=>deletes};
}
describe('trusted rich-editor text entry',()=>{
  it('writes multiline JSON through real CodeMirror DOM with exact spaces and blank lines',async()=>{
    const f=await fixture(false,false,true);const value='{\n  \"a\": \" x \"\n\n}';
    const result=await f.control.execute(1,{...action,ref:f.ref,value});
    expect(result.verification?.status).toBe('verified');
    expect(await page.locator('.cm-line').allTextContents()).toEqual(value.split('\n'));
    expect(f.sent).toEqual([...value].filter(character=>character!=='\n'));
    expect(f.pressed.filter(key=>key==='Enter')).toHaveLength(value.split('\n').length-1);await f.cdp.detach();
  });
  it.each(['\n\n', '\n{\n\t"a": " x  y ",\n\t"b": ["", "😀"]\n}\n\n'])('preserves exact leading/trailing blank lines and authored tabs: %j',async value=>{
    const f=await fixture(false,false,true);
    const result=await f.control.execute(1,{...action,ref:f.ref,value});
    expect(result.verification?.status).toBe('verified');
    expect(await page.locator('.cm-line').allTextContents()).toEqual(value.split('\n'));
    expect(f.sent).not.toContain('\n');await f.cdp.detach();
  });
  it('rejects a moved caret even when rendered text matches the authored prefix',async()=>{
    const f=await fixture(false,false,true);
    await page.evaluate(ref=>{
      window.__novaDOM!.startInput(ref,true);
      const line=document.querySelector('.cm-line')!,range=document.createRange();range.selectNodeContents(line);range.collapse(true);
      const selection=getSelection()!;selection.removeAllRanges();selection.addRange(range);
    },f.ref);
    await expect(page.evaluate(ref=>window.__novaDOM!.prepareInputCorrection(ref,'',''),f.ref)).rejects.toThrow('caret-mismatch');
    await f.cdp.detach();
  });
  it('rejects partial or decorated line trees instead of proving text from a hidden editor model',async()=>{
    const f=await fixture(false,false,true);
    const failure=await page.evaluate(ref=>{
      window.__novaDOM!.startInput(ref,true);
      const gap=document.createElement('div');gap.className='cm-gap';document.querySelector('.cm-content')!.append(gap);
      try{window.__novaDOM!.prepareInputCorrection(ref,'','');return '';}catch(error){return (error as Error).message;}
    },f.ref);
    expect(failure).toContain('does not expose complete plain lines');await f.cdp.detach();
  });
  it('removes only proven generated pairs and newline indentation, preserving authored whitespace inside strings',async()=>{
    const f=await fixture();const value='{\n"a":[" x "]\n}';
    const result=await f.control.execute(1,{...action,ref:f.ref,value});
    expect(result.verification?.status).toBe('verified');
    expect(await page.getByRole('textbox').innerText()).toBe(value);
    expect(f.sent).toEqual([...value]);expect(f.pressed).not.toContain('Enter');expect(f.deletes()).toBeGreaterThan(3);
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
  it('waits for an asynchronously rendered caret without relaxing exact pair proof',async()=>{
    const f=await fixture(false,true);
    const result=await f.control.execute(1,{...action,ref:f.ref,value:'{}'});
    expect(await page.evaluate(()=>(window as any).immediateFailure)).toContain('editorInput=');
    const failure=await page.evaluate(()=>(window as any).immediateFailure as string);
    expect(JSON.parse(failure.split('editorInput=')[1])).toMatchObject({code:'text-mismatch',expectedLength:1,actualLength:2,textContentLength:2,exactPrefix:true,selectionCollapsed:true,caretInside:true,caretOffset:2,tailLength:0});
    expect(result.verification?.status).toBe('verified');expect(f.sent).toEqual(['{','}']);
    expect(await page.getByRole('textbox').innerText()).toBe('{}');await f.cdp.detach();
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
