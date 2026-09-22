import { recordingMode, type RecordingClick } from '../../shared/recording';
import { inputActionKinds, insertPacedText, pacedCharacters, pacedActionTimeout } from '../../shared/paced-input';
import type { Action, ActionResult } from '../../shared/types';
import type { PreparedTarget } from '../../shared/dom';

const nativeActions = new Set(['click','double_click','right_click','hover','drag','fill','type','clear','paste','search','press','check','point','media']);
const permissionMessage = 'Reload Nova 0.6.7 on your browser’s extensions page and accept its browser-control permission to enable reliable input and screenshots.';

// Fixed protocol commands only. Neither the model nor a webpage can submit CDP,
// JavaScript, network requests, or a different target to this controller.
export class BrowserControl {
  private attached?: number;
  private inputGeneration = 0;
  cancelInput() { this.inputGeneration++; }
  private attaching?: Promise<void>;
  private suspended = new Set<number>();
  constructor(private current: () => number | undefined, private onInterrupted: () => void, private onClick?: (event:RecordingClick)=>void, private pacedInput = recordingMode) {
    chrome.debugger?.onDetach.addListener(source => {
      if (source.tabId !== this.attached) return;
      this.attached = undefined;
      this.cancelInput();
      if (source.tabId !== undefined) this.suspended.add(source.tabId);
      this.onInterrupted();
    });
  }
  async status() { return { granted: await chrome.permissions.contains({permissions:['debugger']}), suspended: this.current() !== undefined && this.suspended.has(this.current()!) }; }
  private async command(target: chrome.debugger.Debuggee, method: string, params: Record<string,unknown>) {
    try {return await chrome.debugger.sendCommand(target,method,params);}
    catch(error){if(/not attached|detached|session closed|target closed|no target/i.test(String(error))&&target.tabId!==undefined){this.attached=undefined;this.suspended.add(target.tabId);this.onInterrupted();throw new Error('Browser control disconnected. Click Resume browser control in Nova to continue.');}throw error;}
  }
  async resume() { const id = this.current(); if (id === undefined) throw new Error('Open a Nova website first.'); this.suspended.delete(id); await this.ensure(id); }
  async detach(tabId?: number) {
    this.cancelInput();
    if (tabId === undefined) return;
    if (this.attached === tabId) { this.attached = undefined; await chrome.debugger.detach({tabId}).catch(()=>{}); }
    this.suspended.delete(tabId);
  }
  private async guard(tabId: number, expectedUrl?: string) {
    if (this.current() !== tabId) throw new Error('This Nova session ended. No further input was sent.');
    const tab = await chrome.tabs.get(tabId);
    if (!tab.active) throw new Error('Return to the attached website tab before Nova performs this action.');
    if (!tab.url || !/^https?:/.test(tab.url)) throw new Error('Nova cannot control this browser-protected page.');
    if (expectedUrl && tab.url !== expectedUrl) throw new Error('The page navigated during this action. Inspect it before continuing.');
    if (this.suspended.has(tabId)) throw new Error('Browser control was disconnected. Click Resume browser control in Nova to continue.');
    return tab;
  }
  private async ensure(tabId: number) {
    await this.guard(tabId);
    if (!await chrome.permissions.contains({permissions:['debugger']})) throw new Error(permissionMessage);
    if (this.attaching) await this.attaching;
    if (this.attached === tabId) return;
    this.attaching = (async () => {
      try { await chrome.debugger.attach({tabId}, '1.3'); }
      catch { throw new Error('Chrome could not enable browser control. Close DevTools or another debugger on this tab, then try again. Your browser policy may also restrict control.'); }
      this.attached = tabId;
      if (this.current() !== tabId) { await this.detach(tabId); throw new Error('This Nova session ended.'); }
    })();
    try { await this.attaching; } finally { this.attaching = undefined; }
  }
  async screenshot(tabId: number) {
    await this.ensure(tabId);
    await this.guard(tabId);
    const result = await this.command({tabId}, 'Page.captureScreenshot', {format:'jpeg',quality:65,captureBeyondViewport:false}) as {data:string};
    if (!result?.data) throw new Error('Chrome did not return a screenshot.');
    return result.data;
  }
  supports(action: Action) { return nativeActions.has(action.kind); }
  async execute(tabId: number, action: Action): Promise<ActionResult> {
    const generation = this.inputGeneration;
    const checkGeneration = () => { if (generation !== this.inputGeneration) throw new Error('Text entry stopped. Inspect the current field before continuing.'); };
    if (this.pacedInput && inputActionKinds.has(action.kind)) pacedCharacters(action.value || '');
    await this.ensure(tabId);
    checkGeneration();
    const tab = await this.guard(tabId);
    if(action.kind==='press'&&action.value==='Escape'&&!action.ref){
      const params={key:'Escape',code:'Escape',windowsVirtualKeyCode:27};
      await this.guard(tabId,tab.url);
      await this.command({tabId},'Input.dispatchKeyEvent',{type:'rawKeyDown',...params});
      await this.command({tabId},'Input.dispatchKeyEvent',{type:'keyUp',...params});
      return {ok:true,detail:'Escape sent to the attached page; inspect whether the menu closed.'};
    }
    const prepared = await chrome.tabs.sendMessage(tabId,{type:'nova-dom',method:'native-prepare',action}) as PreparedTarget & {error?:string;destination?:PreparedTarget};
    if (prepared?.error) {
      // These preparations do not focus or type. A rejected target has sent no
      // input, so the runner can re-observe safely. Keyboard focus remains ambiguous.
      if (['click','double_click','right_click','hover','drag','fill','type','clear','paste','search','check'].includes(action.kind)) return {ok:false,dispatch:'not-sent',detail:prepared.error};
      throw new Error(prepared.error);
    }
    if (!prepared || !Number.isFinite(prepared.x) || !Number.isFinite(prepared.y)) throw new Error('The target could not be located. Observe again.');
    const send = async (method: string, params: Record<string,unknown>) => { checkGeneration(); await this.guard(tabId, tab.url); checkGeneration(); return this.command({tabId},method,params); };
    const mouse = (type: string, point = prepared, extra: object = {}) => send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,...extra});
    const click = async (button='left', count=1) => {
      await mouse('mouseMoved');
      const at = Date.now();
      await mouse('mousePressed',prepared,{button,clickCount:count});
      // Always release a pressed input, including when clicking causes navigation.
      await this.command({tabId},'Input.dispatchMouseEvent',{type:'mouseReleased',x:prepared.x,y:prepared.y,button,clickCount:count});
      this.onClick?.({at,actor:'nova',button:button==='right'?'right':'left',target:action.ref || action.kind});
    };
    const press = async (value: string) => {
      const keys: Record<string,[string,string,number]> = {Enter:['Enter','Enter',13],Escape:['Escape','Escape',27],Tab:['Tab','Tab',9],ArrowDown:['ArrowDown','ArrowDown',40],ArrowUp:['ArrowUp','ArrowUp',38],ArrowLeft:['ArrowLeft','ArrowLeft',37],ArrowRight:['ArrowRight','ArrowRight',39],Home:['Home','Home',36],End:['End','End',35],PageUp:['PageUp','PageUp',33],PageDown:['PageDown','PageDown',34],Backspace:['Backspace','Backspace',8],Delete:['Delete','Delete',46],' ':[' ','Space',32]};
      const command = ({'ControlOrMeta+A':'selectAll','ControlOrMeta+Z':'undo','ControlOrMeta+Y':'redo'} as Record<string,string>)[value];
      const key = value === 'Shift+Tab' ? keys.Tab : command ? [value.slice(-1).toLowerCase(),`Key${value.slice(-1)}`,value.charCodeAt(value.length-1)] as [string,string,number] : keys[value];
      if (!key) throw new Error('This keyboard shortcut is not supported.');
      const params = {key:key[0],code:key[1],windowsVirtualKeyCode:key[2],modifiers:value==='Shift+Tab'?8:command?(/Mac/.test(navigator.userAgent)?4:2):0};
      const text=!command&&['Enter',' '].includes(value)?(value==='Enter'?'\r':' '):undefined;
      await send('Input.dispatchKeyEvent',{type:text?'keyDown':'rawKeyDown',...params,...(command?{commands:[command]}:{}),...(text?{text,unmodifiedText:text}:{})});
      await this.command({tabId},'Input.dispatchKeyEvent',{type:'keyUp',...params});
    };
    if(action.kind==='media'){
      if(prepared.paused===undefined)throw new Error('Choose an observed video or audio player.');
      const result=await chrome.tabs.sendMessage(tabId,{type:'nova-dom',method:'execute',action});
      if(result?.error)throw new Error(result.error);return result;
    } else if (['fill','type','clear','paste','search'].includes(action.kind)) {
      if (!prepared.editable) throw new Error('This target is not an editable, non-sensitive field.');
      if (action.kind === 'paste' && action.value === null) throw new Error('Provide the text to paste. Nova does not read your private clipboard.');
      await click();
      if(action.kind==='type'){const focus=await chrome.tabs.sendMessage(tabId,{type:'nova-dom',method:'native-append',action});if(focus?.error)throw new Error(focus.error);}
      if (action.kind !== 'type') await press('ControlOrMeta+A');
      const value = action.kind === 'clear' ? '' : action.value || '';
      if (value && this.pacedInput) {
        const deadline = Date.now() + pacedActionTimeout(value) - 5_000;
        await insertPacedText(value, character => send('Input.insertText', {text:character}), async () => {
          checkGeneration();
          const focus = await chrome.tabs.sendMessage(tabId, {type:'nova-dom', method:'native-input-focus', action});
          if (focus?.error || !focus?.ok) throw new Error(focus?.error || 'The text field lost focus. Inspect partial input before continuing.');
          checkGeneration();
        }, deadline);
      } else if (value) await send('Input.insertText',{text:value}); else await press('Backspace');
      if (action.kind === 'search') await press('Enter');
    } else if (action.kind === 'press') {
      // prepare focuses only the grounded target, never an arbitrary private field.
      if (prepared.editable) await click();
      else if(!prepared.focused)throw new Error('This control could not receive keyboard focus. Choose its observed clickable control instead.');
      await press(action.value || 'Enter');
    } else if (action.kind === 'check') {
      if (prepared.checked === undefined) throw new Error('Choose an observed checkbox, switch, or radio button.');
      if (prepared.checked !== (action.value !== 'false')) await click();
    } else if (action.kind === 'hover') await mouse('mouseMoved');
    else if (action.kind === 'drag') {
      if (!prepared.destination) throw new Error('The drop target could not be located.');
      await mouse('mouseMoved'); await mouse('mousePressed',prepared,{button:'left',clickCount:1});
      try { for(let i=1;i<=12;i++)await mouse('mouseMoved',{...prepared,x:prepared.x+(prepared.destination.x-prepared.x)*i/12,y:prepared.y+(prepared.destination.y-prepared.y)*i/12},{button:'left',buttons:1}); }
      finally { await this.command({tabId},'Input.dispatchMouseEvent',{type:'mouseReleased',x:prepared.destination.x,y:prepared.destination.y,button:'left',clickCount:1}); }
    } else { await click(action.kind==='right_click'?'right':'left'); if(action.kind==='double_click')await click('left',2); }
    if (['fill','clear','paste','type','check'].includes(action.kind)) {
      const verified = await chrome.tabs.sendMessage(tabId,{type:'nova-dom',method:'verify',action,expectedLength:action.kind==='type'?(prepared.valueLength||0)+(action.value||'').length:undefined});
      if (verified?.error) throw new Error(verified.error);
      return verified;
    }
    return {ok:true,detail:'Trusted browser input sent. The page outcome must still be checked.'};
  }
}
