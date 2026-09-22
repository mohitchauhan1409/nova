import {afterEach, describe, expect, it, vi} from 'vitest';
import type {WebSocket} from 'ws';
import {ExtensionBrowser} from '../BE/src/browser/extension';
import type {Action} from '../shared/types';

afterEach(()=>vi.useRealTimers());
describe('extension recording action deadline',()=>{
  it('learns recording capability from snapshot and keeps long input alive beyond the ordinary timeout',async()=>{
    vi.useFakeTimers();const sent:{id:string;method:string}[]=[];
    const driver=new ExtensionBrowser({readyState:1,send:(text:string)=>sent.push(JSON.parse(text))} as unknown as WebSocket,1);
    const snapshot=driver.snapshot();driver.receive(sent[0].id,{capabilities:['paced-recording-input']});await snapshot;
    const action:Action={kind:'fill',ref:'field',value:'x'.repeat(100),url:null,x:null,y:null,risk:'change',summary:'Fill field'};
    let settled=false;const running=driver.execute(action).then(()=>{settled=true;});
    await vi.advanceTimersByTimeAsync(20000);expect(settled).toBe(false);
    driver.receive(sent[1].id,{ok:true});await running;expect(settled).toBe(true);await driver.close();
  });
  it('preserves the ordinary timeout for normal extension builds',async()=>{
    vi.useFakeTimers();const driver=new ExtensionBrowser({readyState:1,send:()=>{}} as unknown as WebSocket,1);
    const failure=expect(driver.screenshot()).rejects.toThrow('did not respond');
    await vi.advanceTimersByTimeAsync(15000);await failure;await driver.close();
  });
});
