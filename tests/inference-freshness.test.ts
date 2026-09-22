import {afterEach,describe,expect,it,vi} from 'vitest';
import type {Action,Session,Snapshot,SiteProfile} from '../shared/types';
import type {BrowserDriver} from '../BE/src/browser/driver';
import type {Planner} from '../BE/src/providers/openai';
vi.mock('../BE/src/sites/action-semantics',()=>({inferencePlaygrounds:[{url:'https://inference.example.test/dashboard/playground',submitName:'Send',promptName:'Type your prompt...',requiredControls:[{tag:'button',name:'System Prompt'},{tag:'button',name:'Model parameters'}],resultLog:{url:'https://inference.example.test/dashboard/logs',dialogName:'Log detail',inputLabel:'Input',outputLabel:'Output',outputEndLabel:'Get help with this request',timestamp:{format:'day-first-24h',utcOffsetMinutes:0}}}]}));
afterEach(()=>vi.restoreAllMocks());
import {AgentRunner} from '../BE/src/agent/runner';
import {requestsFreshInference} from '../BE/src/agent/inference-submission';
const url='https://inference.example.test/dashboard/playground';
const base:Snapshot={id:'s',url,title:'Playground',text:'Previous identical prompt. Result: damage.',viewport:{width:1000,height:800},theme:{color:'#fff',font:'sans-serif'},frames:0,capturedAt:0,elements:[
  {ref:'send',tag:'button',role:'',type:'button',name:'Send',context:'',disabled:false,sensitive:false,submission:{scope:'composer',label:'',fields:[{ref:'prompt',revision:'r1'}]}},
  {ref:'prompt',tag:'textarea',role:'',type:'',name:'Type your prompt...',context:'',disabled:false,sensitive:false,edit:{revision:'r1',empty:false},state:['draft:matches:prompt']},
  {ref:'system',tag:'button',role:'',type:'button',name:'System Prompt',context:'',disabled:false,sensitive:false},
  {ref:'parameters',tag:'button',role:'',type:'button',name:'Model parameters',context:'',disabled:false,sensitive:false}
]};
const action=(patch:Partial<Action>):Action=>({kind:'done',ref:null,value:null,url:null,x:null,y:null,risk:'read',summary:'The prompt ran successfully: damage.',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'damage'}]},...patch});
const request='Run this prompt: Classify a cracked mug as damage, delivery or other. Reply with one word.';
function fixture(){
  let state=structuredClone(base);
  const execute=vi.fn(async(a:Action)=>{
    if(a.kind==='click')state={...state,text:state.text+' New run result: damage.',elements:state.elements.map(e=>e.ref==='prompt'?{...e,edit:{revision:'r2',empty:true},state:[]}:e)};
    return {ok:true,verification:{status:'verified' as const,detail:a.kind==='click'?'The new request was accepted.':'The target matches the requested value.'}};
  });
  const driver:BrowserDriver={snapshot:async()=>structuredClone(state),execute,screenshot:async()=>'',close:async()=>{}};
  const planner:Planner={decide:vi.fn().mockResolvedValue(action({}))};
  const session:Session={id:'s',siteId:'site',mode:'browser',status:'ready',url,title:'Playground',messages:[],traces:[],steps:0,model:'fixture',startedAt:0};
  const site:SiteProfile={id:'site',name:'Playground',domain:'inference.example.test',url,color:'#000000',description:'',instructions:'',flows:[],observations:0};
  const runner=new AgentRunner(session,driver,planner,site,()=>{});
  return {runner,session,execute,planner,setState:(snapshot:Snapshot)=>{state=snapshot;}};
}
describe('current-command inference completion receipts',()=>{
  it.each(['completed','answer'] as const)('rejects %s using an identical old output with zero current actions',async status=>{
    const f=fixture();f.planner.decide=vi.fn().mockResolvedValue(action({completion:{status,evidence:[{source:'text',ref:null,value:'damage'}]}}));
    await f.runner.command(request);
    expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');
    expect(f.session.messages.some(m=>m.role==='assistant'&&m.text==='The prompt ran successfully: damage.')).toBe(false);
    expect(f.session.traces.some(t=>t.kind==='error'&&t.text.includes('Submit the requested prompt once')&&t.text.includes('old identical prompt/output'))).toBe(true);
  });
  it('permits read-only inspection of previous inference results',async()=>{
    const f=fixture();await f.runner.command('Inspect the previous prompt result and tell me what it returned.');
    expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('ready');
  });
  it('rejects zero-action new-run completion when the command starts on Logs',async()=>{
    const f=fixture();f.setState({...base,url:'https://inference.example.test/dashboard/logs'});
    await f.runner.command('Test this prompt: Classify the sample.');
    expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');
    expect(f.session.traces.some(t=>t.text.includes('no verified submission occurred'))).toBe(true);
  });
  it('keeps legitimate read-only Logs inspection at zero actions',async()=>{
    const f=fixture();f.setState({...base,url:'https://inference.example.test/dashboard/logs'});
    await f.runner.command('Inspect the previous result in Logs and report its response.');
    expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('ready');
  });
  it('does not match another origin or a different attached scope',()=>{
    const rules=[{url,submitName:'Send',promptName:'Type your prompt...',requiredControls:[]}];
    expect(requestsFreshInference({...base,url:'https://inference.example.test/dashboard/logs'},url,request,rules)).toBe(true);
    expect(requestsFreshInference({...base,url:'https://other.example.test/dashboard/logs'},url,request,rules)).toBe(false);
    expect(requestsFreshInference(base,'https://other.example.test',request,rules)).toBe(false);
    expect(requestsFreshInference({...base,url:'https://inference.example.test.evil.test/dashboard/logs'},'https://inference.example.test.evil.test',request,rules)).toBe(false);
  });
  it('does not mistake a verified fill for an actual submission',async()=>{
    const f=fixture();f.planner.decide=vi.fn().mockResolvedValueOnce(action({kind:'fill',ref:'prompt',value:'Classify the sample',risk:'change',summary:'Enter prompt',completion:undefined})).mockResolvedValue(action({}));
    await f.runner.command(request);
    expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.status).toBe('stopped');
    expect(f.session.traces.some(t=>t.text.includes('no verified submission occurred'))).toBe(true);
  });
  it('accepts the current verified submission and never carries its receipt into a later run command',async()=>{
    const f=fixture();f.planner.decide=vi.fn().mockResolvedValueOnce(action({kind:'click',ref:'send',risk:'change',summary:'Run prompt',completion:undefined})).mockResolvedValue(action({}));
    await f.runner.command(request);expect(f.session.status).toBe('ready');expect(f.execute).toHaveBeenCalledTimes(1);
    await f.runner.command(request);expect(f.session.status).toBe('stopped');expect(f.execute).toHaveBeenCalledTimes(1);
    expect(f.session.traces.some(t=>t.text.includes('no verified submission occurred'))).toBe(true);
  });
  it.each([false,true])('binds real Send to the same final Input and actual Output (matching=%s)',async matching=>{
    const now=Date.UTC(2026,8,22,9,40);vi.spyOn(Date,'now').mockReturnValue(now);
    const f=fixture(),prompt='Order 104 arrived damaged.';
    f.session.preparedInputs=[{ref:'prompt',url,revision:'r1',value:prompt,kind:'fill'}];
    f.execute.mockImplementation(async()=>{
      f.setState({...base,url:'https://inference.example.test/dashboard/logs',capturedAt:now+5000,
        text:['Log detail','request-id','22/09/2026, 09:40:01','200','Input','4 messages','system','Classify','user',prompt,'assistant','damage','user',matching?prompt:'Order 106 is late.','Output','6 chars',matching?'damage':'delivery','Get help with this request'].join('\n'),
        elements:[{...base.elements[0],ref:'dialog',tag:'div',role:'dialog',name:'Log detail',submission:undefined},{...base.elements[0],ref:'output',tag:'p',name:'Output',submission:undefined},{...base.elements[0],ref:'result',tag:'p',name:matching?'damage':'delivery',submission:undefined}]});
      return {ok:true,verification:{status:'verified',detail:'New inference accepted.'}};
    });
    f.planner.decide=vi.fn().mockResolvedValueOnce(action({kind:'click',ref:'send',risk:'change',summary:'Run prompt',completion:undefined})).mockResolvedValue(action({}));
    await f.runner.command('Test this prompt: '+prompt+' Check Logs.');
    expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.status).toBe(matching?'ready':'stopped');
    if(!matching){
      expect(f.session.traces.some(t=>t.text.includes('final Input user message'))).toBe(true);
      expect(f.session.messages.some(m=>m.role==='assistant'&&m.text==='The prompt ran successfully: damage.')).toBe(false);
    }
  });
  it('rejects old-result completion while the newly submitted inference is still processing',async()=>{
    const f=fixture();f.execute.mockImplementation(async()=>{
      f.setState({...base,elements:[...base.elements,{ref:'busy',tag:'button',role:'',type:'button',name:'Please wait...',context:'',disabled:false,sensitive:false}]});
      return {ok:true,verification:{status:'verified',detail:'New inference accepted.'}};
    });
    f.planner.decide=vi.fn().mockResolvedValueOnce(action({kind:'click',ref:'send',risk:'change',summary:'Run prompt',completion:undefined})).mockResolvedValue(action({}));
    await f.runner.command(request);expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.status).toBe('stopped');
    expect(f.session.traces.some(t=>t.text.includes('do not submit it again'))).toBe(true);
  });
});
