import {afterEach,describe,expect,it,vi} from 'vitest';
import {BrowserControl} from '../web/extension/browser-control';
import type {Action} from '../shared/types';
const click:Action={kind:'click',ref:'validate',value:null,url:null,x:null,y:null,risk:'read',summary:'Validate'};
function setup(){
  const sendMessage=vi.fn();const sendCommand=vi.fn().mockResolvedValue({});
  vi.stubGlobal('chrome',{permissions:{contains:vi.fn().mockResolvedValue(true)},tabs:{get:vi.fn().mockResolvedValue({active:true,url:'https://example.test/'}),sendMessage},debugger:{attach:vi.fn().mockResolvedValue(undefined),sendCommand,onDetach:{addListener:vi.fn()}}});
  return {control:new BrowserControl(()=>1,()=>{}),sendMessage,sendCommand};
}
afterEach(()=>vi.unstubAllGlobals());
describe('pointer dispatch receipts',()=>{
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
