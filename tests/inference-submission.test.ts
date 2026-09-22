import {describe,expect,it,vi} from 'vitest';
import type {Action,Snapshot} from '../shared/types';
vi.mock('../BE/src/sites/action-semantics',()=>({inferencePlaygrounds:[{url:'https://inference.example.test/dashboard/playground',submitName:'Send',promptName:'Type your prompt...',requiredControls:[{tag:'button',name:'System Prompt'},{tag:'button',name:'Model parameters'}]}]}));
import {checkAction} from '../BE/src/agent/policy';
import {requestedInferenceSubmission} from '../BE/src/agent/inference-submission';
const action:Action={kind:'click',ref:'send',value:null,url:null,x:null,y:null,risk:'change',summary:'Run prompt'};
const snapshot:Snapshot={id:'s',url:'https://inference.example.test/dashboard/playground',title:'Playground',text:'',viewport:{width:1000,height:800},theme:{color:'#fff',font:'sans-serif'},frames:0,capturedAt:0,elements:[
  {ref:'send',tag:'button',role:'',type:'button',name:'Send',context:'',disabled:false,sensitive:false,submission:{scope:'composer',label:'',fields:[{ref:'prompt',revision:'r1'}]}},
  {ref:'prompt',tag:'textarea',role:'',type:'',name:'Type your prompt...',context:'',disabled:false,sensitive:false,edit:{revision:'r1',empty:false},state:['draft:matches:prompt']},
  {ref:'system',tag:'button',role:'',type:'button',name:'System Prompt',context:'',disabled:false,sensitive:false},
  {ref:'parameters',tag:'button',role:'',type:'button',name:'Model parameters',context:'',disabled:false,sensitive:false}
]};
const intent='Run this prompt: Classify a damaged sample. Reply with one word.';
const check=(page:Snapshot=snapshot,request=intent,act=action)=>checkAction(act,page,snapshot.url,request);
describe('reviewed inference-only submission semantics',()=>{
  it('allows one explicitly requested inference using the exact prepared prompt revision',()=>{
    expect(check()).toMatchObject({outcome:'allow',mayCommit:true,reason:expect.stringContaining('inference playground')});
    expect(requestedInferenceSubmission(action,snapshot,snapshot.url,intent,[])).toBe(false);
  });
  it.each(['https://inference.example.test/messages','https://inference.example.test/dashboard/playground/other','https://inference.example.test/dashboard/playground?send=email','https://inference.example.test/dashboard/playground#email','https://inference.example.test.evil.test/dashboard/playground','http://inference.example.test/dashboard/playground'])('keeps Send gated outside the exact reviewed endpoint: %s',url=>{
    expect(check({...snapshot,url}).outcome).not.toBe('allow');
  });
  it.each(['Do not run this prompt','Draft this prompt','How do I run this prompt?','Run this prompt after my confirmation','Run this prompt\nWait','Run this prompt\nDo not send','Run this prompt\nAsk me before sending','Run this prompt\nStop'])('retains explicit user limits: %s',request=>expect(check(snapshot,request).outcome).toBe('approve'));
  it('recognizes a current prompt run after an unrelated configuration colon',()=>{
    expect(check(snapshot,'Add required boolean escalate: damage or delays over seven days. Test this prompt: CD-105 is nine days late, no damage. Check Logs.').outcome).toBe('allow');
  });
  it.each(['Configure X: change the format, do not run','Revision: wait for my approval','Configuration: never send','Notes: stop the test'])('keeps revocation after an ordinary colon instead of falling back to older permission: %s',revision=>{
    expect(check(snapshot,`${intent}\n${revision}`).outcome).toBe('approve');
  });
  it.each(['Run this prompt: "Do not run the machine. Classify this sentence."','Test the prompt: "Stop and wait."','Submit this prompt: "Never send."','Send the prompt: "Ask me before sending."'])('distinguishes supplied model input from a later user stop: %s',request=>{
    expect(check(snapshot,request).outcome).toBe('allow');
    expect(check(snapshot,`${request}\nReview: do not run`).outcome).toBe('approve');
  });
  it.each([
    {state:[]},{edit:{revision:'r2',empty:false}},{edit:{revision:'r1',empty:true}},{covered:true},{sensitive:true},{name:'Recipient'},{context:'Send to customer email'}
  ])('does not authorize an unverified or consequential prompt field: %j',patch=>{
    expect(check({...snapshot,elements:snapshot.elements.map(e=>e.ref==='prompt'?{...e,...patch}:e)}).outcome).not.toBe('allow');
  });
  it('retains sensitive account, message-recipient, missing-marker, and separate-composer safeguards',()=>{
    for(const patch of [{context:'Change security settings'},{context:'Accept terms'},{context:'Confirm payment'},{submission:{scope:'other',label:'',fields:[{ref:'other',revision:'r1'}]}},{submission:{scope:'composer',label:'',fields:[{ref:'prompt',revision:'r1'},{ref:'recipient',revision:'r1'}]}}]){
      expect(check({...snapshot,elements:snapshot.elements.map(e=>e.ref==='send'?{...e,...patch}:e)}).outcome).not.toBe('allow');
    }
    expect(check({...snapshot,elements:snapshot.elements.slice(0,3)}).outcome).toBe('approve');
    expect(check({...snapshot,elements:[...snapshot.elements,{...snapshot.elements[1],ref:'recipient',name:'Recipient email',tag:'input'}]}).outcome).toBe('approve');
    expect(check({...snapshot,observation:{totalControls:10,omittedControls:6,viewportFirst:true,sensitiveFieldsPresent:true}}).outcome).toBe('approve');
    expect(check(snapshot,intent,{...action,risk:'sensitive'}).outcome).toBe('approve');
    expect(check(snapshot,intent,{...action,kind:'double_click'}).outcome).toBe('approve');
  });
  it('never exempts purchase, deletion, access, or human messaging controls by action summary',()=>{
    for(const name of ['Delete','Pay','Publish','Send email','Change permissions'])expect(check({...snapshot,elements:snapshot.elements.map(e=>e.ref==='send'?{...e,name}:e)}).outcome).not.toBe('allow');
  });
});
