import {afterEach,describe,expect,it,vi} from 'vitest';
import {BrowserControl} from '../web/extension/browser-control';
import type {Action} from '../shared/types';
const click:Action={kind:'click',ref:'validate',value:null,url:null,x:null,y:null,risk:'read',summary:'Validate'};
function setup(onClick?:ConstructorParameters<typeof BrowserControl>[2], pacedInput=false){
  vi.stubGlobal('navigator',{platform:'MacIntel'});
  const sendMessage=vi.fn();const sendCommand=vi.fn().mockResolvedValue({});
  vi.stubGlobal('chrome',{permissions:{contains:vi.fn().mockResolvedValue(true)},tabs:{get:vi.fn().mockResolvedValue({active:true,url:'https://example.test/'}),sendMessage},debugger:{attach:vi.fn().mockResolvedValue(undefined),sendCommand,onDetach:{addListener:vi.fn()}}});
  return {control:new BrowserControl(()=>1,()=>{},onClick,pacedInput),sendMessage,sendCommand};
}
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
describe('pointer dispatch receipts',()=>{
  it('records only completed native clicks, including actual input-focus clicks',async()=>{
    const record=vi.fn();const f=setup(record);f.sendMessage.mockResolvedValue({x:20,y:30,editable:true,ok:true});
    await f.control.execute(1,click);
    expect(record).toHaveBeenCalledWith(expect.objectContaining({actor:'nova',button:'left',target:'validate',at:expect.any(Number)}));
    record.mockClear();await f.control.execute(1,{...click,kind:'fill',value:'New value'});
    expect(record).toHaveBeenCalledTimes(1);
    record.mockClear();await f.control.execute(1,{...click,kind:'hover'});
    expect(record).not.toHaveBeenCalled();
  });
  it('does not invent click evidence for rejected targets or failed release',async()=>{
    const record=vi.fn();const f=setup(record);f.sendMessage.mockResolvedValue({error:'Covered target'});
    await f.control.execute(1,click);expect(record).not.toHaveBeenCalled();
    f.sendMessage.mockResolvedValue({x:20,y:30});f.sendCommand.mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('release failed'));
    await expect(f.control.execute(1,click)).rejects.toThrow();expect(record).not.toHaveBeenCalled();
  });
  it('sends global Escape without trying to focus a missing element',async()=>{
    const f=setup();await f.control.execute(1,{...click,kind:'press',ref:null,value:'Escape'});
    expect(f.sendMessage).not.toHaveBeenCalled();expect(f.sendCommand.mock.calls.map(c=>c[2])).toEqual([expect.objectContaining({type:'rawKeyDown',key:'Escape'}),expect.objectContaining({type:'keyUp',key:'Escape'})]);
  });
  it.each(['click','fill','paste','search'] as const)('reports %s preflight obstruction without dispatching input',async(kind)=>{
    const f=setup();f.sendMessage.mockResolvedValue({error:'Another element is covering the target.'});
    expect(await f.control.execute(1,{...click,kind})).toEqual({ok:false,dispatch:'not-sent',detail:'Another element is covering the target.'});expect(f.sendCommand).not.toHaveBeenCalled();
  });
  it('keeps preparation transport failures ambiguous',async()=>{
    const f=setup();f.sendMessage.mockRejectedValue(new Error('Connection lost'));await expect(f.control.execute(1,click)).rejects.toThrow('Connection lost');
  });
  it('keeps failures after mouse input ambiguous',async()=>{
    const f=setup();f.sendMessage.mockResolvedValue({x:20,y:20});f.sendCommand.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Response lost'));
    await expect(f.control.execute(1,click)).rejects.toThrow('Response lost');expect(f.sendCommand.mock.calls[1][2].type).toBe('mousePressed');
  });
  it('does not give focus-bearing keyboard preparation a pointer receipt',async()=>{
    const f=setup();f.sendMessage.mockResolvedValue({error:'Focus changed the page'});await expect(f.control.execute(1,{...click,kind:'press',value:'Enter'})).rejects.toThrow('Focus changed');
  });
});

describe('recording-mode trusted field entry',()=>{
  it.each(['fill','type','clear','paste','search'] as const)('initializes %s focus once before any keyboard dispatch',async(kind)=>{
    vi.useFakeTimers();const f=setup(undefined,true);const order:string[]=[];
    f.sendMessage.mockImplementation(async(_tab,message)=>{order.push(message.method);return {x:20,y:30,editable:true,ok:true};});
    f.sendCommand.mockImplementation(async(_target,method,params)=>{order.push(method==='Input.dispatchMouseEvent'?params.type:method);return {};});
    const task=f.control.execute(1,{...click,kind,value:kind==='clear'?null:'abc'});await vi.runAllTimersAsync();await task;
    expect(order.filter(item=>item==='native-input-start')).toHaveLength(1);
    expect(order.indexOf('native-input-start')).toBeGreaterThan(order.indexOf('mouseReleased'));
    expect(order.indexOf('native-input-start')).toBeLessThan(order.findIndex(item=>item==='Input.dispatchKeyEvent'||item==='Input.insertText'));
  });
  it('does not select page text or send characters when the original field rejects initial focus',async()=>{
    const f=setup(undefined,true);
    f.sendMessage.mockImplementation(async(_tab,message)=>message.method==='native-input-start'?{ok:false}:{x:20,y:30,editable:true,ok:true});
    await expect(f.control.execute(1,{...click,kind:'fill',value:'abc'})).rejects.toThrow('did not accept focus');
    expect(f.sendCommand.mock.calls.every(call=>call[1]==='Input.dispatchMouseEvent')).toBe(true);
  });
  it('does not acquire focus after Stop arrives during the input click',async()=>{
    const f=setup(undefined,true);f.sendMessage.mockResolvedValue({x:20,y:30,editable:true,ok:true});
    f.sendCommand.mockImplementation(async(_target,_method,params)=>{if(params.type==='mouseReleased')f.control.cancelInput();return {};});
    await expect(f.control.execute(1,{...click,kind:'fill',value:'abc'})).rejects.toThrow('stopped');
    expect(f.sendMessage.mock.calls.some(call=>call[1].method==='native-input-start')).toBe(false);
    expect(f.sendCommand.mock.calls.every(call=>call[1]==='Input.dispatchMouseEvent')).toBe(true);
  });
  it('keeps normal input unchanged and paces every actual recording character',async()=>{
    const normal=setup();normal.sendMessage.mockResolvedValue({x:20,y:30,editable:true,ok:true});
    await normal.control.execute(1,{...click,kind:'fill',value:'Two words'});
    expect(normal.sendCommand.mock.calls.filter(c=>c[1]==='Input.insertText').map(c=>c[2].text)).toEqual(['Two words']);
    vi.useFakeTimers();vi.setSystemTime(0);
    const paced=setup(undefined,true);paced.sendMessage.mockResolvedValue({x:20,y:30,editable:true,ok:true});
    const task=paced.control.execute(1,{...click,kind:'fill',value:'Two words'});
    await vi.runAllTimersAsync();await task;
    expect(paced.sendCommand.mock.calls.filter(c=>c[1]==='Input.insertText').map(c=>c[2].text)).toEqual([... 'Two words']);
    expect(paced.sendMessage.mock.calls.filter(c=>c[1].method==='native-input-focus')).toHaveLength(9);
  });
  it('cancels during a typing pause without emitting the next character',async()=>{
    vi.useFakeTimers();const f=setup(undefined,true);f.sendMessage.mockResolvedValue({x:20,y:30,editable:true,ok:true});
    f.sendCommand.mockImplementation(async(_target,method)=>{if(method==='Input.insertText')f.control.cancelInput();return {};});
    const failure=expect(f.control.execute(1,{...click,kind:'type',value:'abc'})).rejects.toThrow('stopped');
    await vi.runAllTimersAsync();await failure;
    expect(f.sendCommand.mock.calls.filter(c=>c[1]==='Input.insertText').map(c=>c[2].text)).toEqual(['a']);
  });
  it('stops when focus changes, without refocusing a different field or sending remaining text',async()=>{
    vi.useFakeTimers();const f=setup(undefined,true);let focusChecks=0;
    f.sendMessage.mockImplementation(async(_tab,message)=>message.method==='native-input-focus'?{ok:++focusChecks===1}:{x:20,y:30,editable:true,ok:true});
    const failure=expect(f.control.execute(1,{...click,kind:'fill',value:'ab'})).rejects.toThrow('lost focus');
    await vi.runAllTimersAsync();await failure;
    expect(f.sendCommand.mock.calls.filter(c=>c[1]==='Input.insertText').map(c=>c[2].text)).toEqual(['a']);
  });
  it('rejects oversized recording input before clicking or selecting existing text',async()=>{
    const f=setup(undefined,true);
    await expect(f.control.execute(1,{...click,kind:'fill',value:'x'.repeat(1001)})).rejects.toThrow('limited');
    expect(f.sendMessage).not.toHaveBeenCalled();expect(f.sendCommand).not.toHaveBeenCalled();
  });
});

describe('paced action cursor ownership',()=>{
  it('holds and refreshes the same actual target cursor until text entry completes',async()=>{
    vi.useFakeTimers();const f=setup(undefined,true);f.sendMessage.mockResolvedValue({x:20,y:30,editable:true,ok:true});
    const task=f.control.execute(1,{...click,kind:'fill',value:'Visible cursor'});await vi.runAllTimersAsync();await task;
    const messages=f.sendMessage.mock.calls.map(call=>call[1]);const start=messages.find(message=>message.method==='native-prepare');
    const refresh=messages.filter(message=>message.method==='native-input-focus');const end=messages.at(-1);
    expect(start.cursorId).toEqual(expect.any(Number));expect(refresh.length).toBe(14);
    expect(refresh.every(message=>message.cursorId===start.cursorId)).toBe(true);
    expect(end).toMatchObject({method:'native-input-end',cursorId:start.cursorId});
  });
  it('clears the matching cursor when an insertion fails',async()=>{
    vi.useFakeTimers();const f=setup(undefined,true);f.sendMessage.mockResolvedValue({x:20,y:30,editable:true,ok:true});
    f.sendCommand.mockImplementation(async(_target,method)=>{if(method==='Input.insertText')throw new Error('Input failed');return {};});
    const failure=expect(f.control.execute(1,{...click,kind:'fill',value:'abc'})).rejects.toThrow('Input failed');await vi.runAllTimersAsync();await failure;
    expect(f.sendMessage.mock.calls.at(-1)?.[1]).toMatchObject({method:'native-input-end',cursorId:expect.any(Number)});
  });
});
