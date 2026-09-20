import { describe, expect, it, vi } from 'vitest';
import { AgentRunner } from '../BE/src/agent/runner';
import type { Planner } from '../BE/src/providers/openai';
import type { BrowserDriver } from '../BE/src/browser/driver';
import type { Action, Session, Snapshot, SiteProfile } from '../shared/types';
const base: Snapshot = {id:'s',url:'https://shop.example.com/product',title:'Product',text:'Adapter ₹799',elements:[{ref:'add',tag:'button',role:'',name:'Place order',type:'',context:'',disabled:false,sensitive:false}],viewport:{width:1200,height:800},theme:{color:'#000',font:'Arial'},frames:0,capturedAt:0};
const act = (kind: Action['kind']): Action => ({kind,ref:kind==='click'?'add':null,url:null,value:null,x:null,y:null,risk:'change',summary:kind==='done'?'The order is placed.':'Place this order for ₹799?'});
function fixture() {
  let state=structuredClone(base); let calls=0; const execute=vi.fn(async(action:Action)=>{if(action.kind!=='inspect')state.text='Cart: Adapter ₹799 Quantity 1';});
  const driver: BrowserDriver={snapshot:async()=>structuredClone(state),execute,screenshot:async()=>'',close:async()=>{}};
  const planner: Planner={decide:async()=> ++calls===1?act('click'):{...act('done'),summary:'The page confirms the requested change.',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'Cart: Adapter ₹799 Quantity 1'}]}}};
  const session:Session={id:'s',siteId:'site',mode:'browser',status:'ready',url:base.url,title:'Product',messages:[],traces:[],steps:0,model:'test',startedAt:0};
  const site: SiteProfile={id:'site',name:'Shop',domain:'shop.example.com',url:base.url,color:'#000000',description:'',instructions:'',flows:[],observations:0};
  const runner=new AgentRunner(session,driver,planner,site,()=>{});
  return {runner,session,execute,driver,planner,setState:(s:Snapshot)=>{state=s;}};
}
describe('browser agent execution boundaries',()=>{
  it('binds visible action receipts to the task and marks rejected input as failed, never verified',async()=>{
    const f=fixture();f.setState({...base,elements:[{...base.elements[0],name:'Open details'}]});
    let release:()=>void=()=>{};f.driver.execute=vi.fn(()=>new Promise(resolve=>{release=()=>resolve({ok:false,dispatch:'not-sent',detail:'Target covered'});}));
    f.planner.decide=vi.fn().mockResolvedValueOnce({...act('click'),risk:'read',summary:'I’m opening the details.'}).mockResolvedValueOnce({...act('done'),summary:'The control is covered.',completion:{status:'blocked',evidence:[]}});
    const run=f.runner.command('Open the details');await vi.waitFor(()=>expect(f.session.actionSteps?.[0].status).toBe('running'));
    expect(f.session.actionSteps?.[0].taskId).toBe(f.session.messages[0].id);release();await run;
    expect(f.session.actionSteps?.[0]).toMatchObject({status:'failed',detail:'Target covered'});
  });
  it('stops an in-flight receipt without reporting success',async()=>{
    const f=fixture();f.setState({...base,elements:[{...base.elements[0],name:'Open details'}]});
    let release:()=>void=()=>{};f.driver.execute=()=>new Promise(resolve=>{release=()=>resolve({ok:true});});
    f.planner.decide=async()=>({...act('click'),risk:'read',summary:'Opening details'});
    const run=f.runner.command('Open details');await vi.waitFor(()=>expect(f.session.actionSteps?.[0].status).toBe('running'));
    f.runner.stop();release();await run;expect(f.session.actionSteps?.[0].status).toBe('stopped');
  });
  it('answers social and internal questions without reading the page or invoking a model',async()=>{
    const f=fixture();const observe=vi.spyOn(f.driver,'snapshot');const decide=vi.spyOn(f.planner,'decide');
    for(const text of ['who are you?','which model do you use?','sahi hai','how much cost you get/'])await f.runner.command(text);
    expect(observe).not.toHaveBeenCalled();expect(decide).not.toHaveBeenCalled();expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('ready');
  });
  it('keeps a pending approval intact during side conversation',async()=>{
    const f=fixture();const task=f.runner.command('Place the order');await vi.waitFor(()=>expect(f.session.approval).toBeDefined());
    const id=f.session.approval!.id;await f.runner.command('which model do you use?');await f.runner.command('sahi hai');
    expect(f.session.approval?.id).toBe(id);expect(f.session.status).toBe('approval');expect(f.execute).not.toHaveBeenCalled();
    await f.runner.approve(id,true);await task;expect(f.execute).toHaveBeenCalledTimes(1);
  });
  it('does not use screenshots to bypass incidental contact redaction',async()=>{
    const f=fixture();f.setState({...base,text:'Contact: private@example.test'});f.planner.decide=async()=>({...act('screenshot'),risk:'read'});
    const capture=vi.spyOn(f.driver,'screenshot');await f.runner.command('Inspect the icon');expect(capture).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');
  });
  it('does not rewrite a verified draft even when the model proposes different text',async()=>{
    const f=fixture();const editor={...base.elements[0],ref:'editor',tag:'textarea',name:'Ask assistant',state:[],edit:{revision:'draft-v1',empty:false}};
    f.setState({...base,elements:[editor]});f.driver.execute=vi.fn(async()=>({ok:true,verification:{status:'verified',detail:'Draft matches'}}));
    f.planner.decide=vi.fn().mockResolvedValueOnce({...act('fill'),ref:'editor',value:'Best AI phones?'}).mockResolvedValueOnce({...act('fill'),ref:'editor',value:'Find the best AI smartphones.'}).mockResolvedValueOnce({...act('fill'),ref:'editor',value:'Compare AI phones for me.'});
    await f.runner.command('Write one prompt');expect(f.driver.execute).toHaveBeenCalledTimes(1);expect(f.session.preparedInputs?.[0].value).toBe('Best AI phones?');expect(f.session.status).toBe('ready');
  });
  it('reuses cleared fields after a verified ordinary record addition', async () => {
    const f = fixture();
    const context = 'Term (correct spelling) Heard as (mishearing) Add';
    let revision = 0;
    let values = ['', ''];
    const records: string[][] = [];
    const render = (): Snapshot => ({...base, text: `Saved terms: ${records.map(r=>r.join(' / ')).join('; ')}`, elements: [
      ...['Term (correct spelling)', 'Heard as (mishearing)'].map((name,i)=>({ref:`field-${i}`,tag:'input',role:'',name,type:'text',context,form:true,disabled:false,sensitive:false,edit:{revision:`v${revision}-${i}`,empty:!values[i]}})),
      {ref:'add',tag:'button',role:'',name:'Add',type:'submit',context,form:true,disabled:false,sensitive:false},
    ]});
    f.driver.snapshot = async () => render();
    f.driver.execute = vi.fn(async (action: Action) => {
      if (action.kind === 'fill') { values[Number(action.ref!.slice(-1))] = action.value!; revision++; return {ok:true,verification:{status:'verified',detail:'Draft matches'}}; }
      records.push([...values]); values=['','']; revision++; return {ok:true};
    });
    const actions: Action[] = [];
    for (const row of [['First','Furst'],['Second','Sekond']]) {
      row.forEach((value,i)=>actions.push({...act('fill'),ref:`field-${i}`,value}));
      actions.push({...act('click'),summary:'Add the requested spelling correction'});
    }
    actions.push({...act('done'),summary:'Both terms are saved.',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'Saved terms: First / Furst; Second / Sekond'}]}});
    f.planner.decide = async () => actions.shift()!;
    await f.runner.command('Add these two vocabulary corrections and save both terms.');
    expect(records).toEqual([['First','Furst'],['Second','Sekond']]);
    expect(f.driver.execute).toHaveBeenCalledTimes(6);
    expect(f.session.preparedInputs).toEqual([]);
    expect(f.session.status).toBe('ready');
    expect(f.session.approval).toBeUndefined();
  });
  it('preserves an existing user draft on send it even without a saved agent draft',async()=>{
    const f=fixture();f.setState({...base,elements:[{...base.elements[0],ref:'editor',tag:'textarea',name:'Ask assistant',edit:{revision:'user-draft',empty:false}}]});
    f.planner.decide=async()=>({...act('fill'),ref:'editor',value:'Unrequested replacement'});
    await f.runner.command('Send it');expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('ready');
  });
  it('accepts a send approval after unrelated text updates, but stops if the draft changed',async()=>{
    for(const changed of [false,true]){
      const f=fixture();const editor={...base.elements[0],ref:'editor',tag:'textarea',name:'Ask assistant',state:['scrollY:0'],edit:{revision:'v1',empty:false},submission:{scope:'composer',label:'Assistant',fields:[{ref:'editor',revision:'v1'}]}};
      f.setState({...base,elements:[editor]});f.planner.decide=vi.fn().mockResolvedValueOnce({...act('press'),ref:'editor',value:'Enter',summary:'Send this draft'}).mockResolvedValueOnce({...act('done'),summary:'Sent',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'Cart: Adapter ₹799 Quantity 1'}]}});
      const task=f.runner.command('Send it');await vi.waitFor(()=>expect(f.session.approval).toBeDefined());
      f.setState({...base,text:'Unrelated banner changed',elements:[{...editor,state:['scrollY:90'],edit:{revision:changed?'v2':'v1',empty:false}}]});
      await f.runner.approve(f.session.approval!.id,true);await task;expect(f.execute).toHaveBeenCalledTimes(changed?0:1);
    }
  });
  it('handles an explicit viewport command without invoking the model',async()=>{const f=fixture();const decide=vi.spyOn(f.planner,'decide');await f.runner.command('Please scroll down.');expect(decide).not.toHaveBeenCalled();expect(f.execute).toHaveBeenCalledTimes(1);expect(f.execute).toHaveBeenCalledWith(expect.objectContaining({kind:'scroll',value:'down'}));expect(f.session.status).toBe('ready');});
  it('preserves a clarification and the user answer across turns',async()=>{const f=fixture();f.planner.decide=vi.fn().mockResolvedValueOnce({...act('ask'),summary:'Which color: purple or green?'}).mockResolvedValueOnce({...act('done'),summary:'I will use purple.',completion:{status:'answer',evidence:[]}});await f.runner.command('Help me choose');expect(f.session.awaitingAnswer).toBe(true);await f.runner.command('Purple');expect(f.session.awaitingAnswer).toBeFalsy();expect(f.session.messages.map(m=>m.text)).toEqual(['Help me choose','A quick detail\nWhich color: purple or green?','Purple','I will use purple.']);});
  it('collects answers without side effects, consumes a card once and preserves task context',async()=>{
    const f=fixture();f.planner.decide=vi.fn().mockResolvedValueOnce({...act('ask'),summary:'Workflow name?'}).mockResolvedValueOnce({...act('done'),summary:'Draft details received.',completion:{status:'answer',evidence:[]}});
    await f.runner.command('Build a workflow');const id=f.session.clarification!.id;
    expect(f.execute).not.toHaveBeenCalled();await expect(f.runner.answer(id,[])).rejects.toThrow();expect(f.session.clarification?.id).toBe(id);
    const run=f.runner.answer(id,[{questionId:'detail',values:['Nova Demo']}]);await expect(f.runner.answer(id,[{questionId:'detail',values:['Duplicate']}])).rejects.toThrow(/no longer active/);await run;
    expect(f.session.messages[0].text).toBe('Build a workflow');expect(f.session.messages[1].clarification?.status).toBe('answered');expect(f.session.messages[2].text).toContain('Nova Demo');expect(f.session.clarification).toBeUndefined();expect(f.session.approval).toBeUndefined();expect(f.planner.decide).toHaveBeenCalledTimes(2);
  });
  it('keeps questions during social chat, rejects superseded and cancelled cards',async()=>{
    const f=fixture();f.planner.decide=async()=>({...act('ask'),summary:'Workflow name?'});await f.runner.command('Build a workflow');const old=f.session.clarification!.id;
    await f.runner.command('who are you?');expect(f.session.clarification?.id).toBe(old);
    await f.runner.command('Actually make an agent');expect(f.session.messages[1].clarification?.status).toBe('superseded');await expect(f.runner.answer(old,[{questionId:'detail',values:['Old']}])).rejects.toThrow();const current=f.session.clarification!.id;f.runner.stop();expect(f.session.messages.at(-1)?.clarification?.status).toBe('cancelled');await expect(f.runner.answer(current,[{questionId:'detail',values:['Old']}])).rejects.toThrow();
  });
  it('executes once only after explicit approval and verifies the result',async()=>{const f=fixture();const task=f.runner.command('Place the order');await vi.waitFor(()=>expect(f.session.approval).toBeDefined());expect(f.execute).not.toHaveBeenCalled();await f.runner.approve(f.session.approval!.id,true);await task;expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.status).toBe('ready');expect(f.session.traces.some(t=>t.kind==='verify')).toBe(true);await expect(f.runner.approve('old',true)).rejects.toThrow();});
  it('does not execute after denial',async()=>{const f=fixture();const task=f.runner.command('Place the order');await vi.waitFor(()=>expect(f.session.approval).toBeDefined());await f.runner.approve(f.session.approval!.id,false);await task;expect(f.execute).not.toHaveBeenCalled();});
  it('invalidates approval when the product price changes',async()=>{const f=fixture();const task=f.runner.command('Place the order');await vi.waitFor(()=>expect(f.session.approval).toBeDefined());f.setState({...base,text:'Adapter ₹1999'});await f.runner.approve(f.session.approval!.id,true);await task;expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');});
  it('stop cancels a pending confirmation',async()=>{const f=fixture();const task=f.runner.command('Place the order');await vi.waitFor(()=>expect(f.session.approval).toBeDefined());f.runner.stop();await task;expect(f.execute).not.toHaveBeenCalled();expect(f.session.approval).toBeUndefined();});
  it('never retries a potentially committed action after a transport error',async()=>{const f=fixture();f.execute.mockImplementation(async()=>{throw new Error('Transport lost after clicking');});const task=f.runner.command('Place the order');await vi.waitFor(()=>expect(f.session.approval).toBeDefined());await f.runner.approve(f.session.approval!.id,true);await task;expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.status).toBe('stopped');expect(f.session.messages.at(-1)?.text).toContain('may already have taken effect');});
  it('replans a blocked pointer only when the driver confirms no input was sent',async()=>{
    const f=fixture();f.setState({...base,elements:[{...base.elements[0],name:'Validate'},{...base.elements[0],ref:'close',name:'Close inspector'}]});
    const execute=vi.fn().mockResolvedValueOnce({ok:false,dispatch:'not-sent',detail:'Another element is covering the target.'}).mockImplementation(async(action:Action)=>{f.setState({...base,text:action.ref==='close'?'Inspector closed':'All checks passed',elements:[{...base.elements[0],name:'Validate'}]});return {ok:true};});f.driver.execute=execute;
    f.planner.decide=vi.fn().mockResolvedValueOnce({...act('click'),risk:'read',summary:'Validate'}).mockResolvedValueOnce({...act('click'),ref:'close',risk:'read',summary:'Close inspector'}).mockResolvedValueOnce({...act('click'),risk:'read',summary:'Validate'}).mockResolvedValueOnce({...act('done'),summary:'All checks passed',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'All checks passed'}]}});
    await f.runner.command('Validate the graph');expect(execute.mock.calls.map(([a])=>a.ref)).toEqual(['add','close','add']);expect(f.session.steps).toBe(2);expect(f.session.status).toBe('ready');expect(f.session.traces.some(t=>t.text.includes('No input was sent.'))).toBe(true);
  });
  it.each([true,false])('preserves prior verification after no-input preflight but requires current proof (%s)',async(currentProof)=>{
    const f=fixture();const controls=[{...base.elements[0],name:'Validate'},{...base.elements[0],ref:'issue',name:'Open old validation issue'}];
    f.setState({...base,text:'Validation pending',elements:controls});
    f.driver.execute=vi.fn().mockImplementationOnce(async()=>{f.setState({...base,text:'No issues found',elements:controls});return {ok:true};}).mockImplementationOnce(async()=>{f.setState({...base,text:currentProof?'No issues found':'Validation error remains',elements:controls});return {ok:false,dispatch:'not-sent',detail:'The target is unavailable. No input sent.'};});
    const done={...act('done'),summary:'Validation passed',completion:{status:'completed' as const,evidence:[{source:'text' as const,ref:null,value:'No issues found'}]}};
    f.planner.decide=vi.fn().mockResolvedValueOnce({...act('click'),risk:'read',summary:'Validate'}).mockResolvedValueOnce({...act('click'),ref:'issue',risk:'read',summary:'Inspect old validation issue'}).mockResolvedValue(done);
    await f.runner.command('Validate this workflow');expect(f.driver.execute).toHaveBeenCalledTimes(2);expect(f.session.steps).toBe(1);expect(f.session.status).toBe(currentProof?'ready':'stopped');
    expect(f.session.messages.at(-1)?.text).toContain(currentProof?'Validation passed':'could not verify');
  });
  it('does not infer a safe retry from an untyped obstruction error',async()=>{
    const f=fixture();f.setState({...base,elements:[{...base.elements[0],name:'Validate'}]});f.execute.mockRejectedValue(new Error('Another element is covering the target.'));await f.runner.command('Validate the graph');expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.status).toBe('stopped');
  });
  it('executes requested cart changes without an approval and never retries an ambiguous cart write',async()=>{const f=fixture();f.setState({...base,elements:base.elements.map(e=>({...e,name:'Add to cart'}))});await f.runner.command('Add this adapter to my cart');expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.approval).toBeUndefined();expect(f.session.traces.some(t=>t.kind==='approval')).toBe(false);const failed=fixture();failed.setState({...base,elements:base.elements.map(e=>({...e,name:'Add to cart'}))});failed.execute.mockRejectedValue(new Error('Transport lost after clicking'));await failed.runner.command('Add this adapter to my cart');expect(failed.execute).toHaveBeenCalledTimes(1);expect(failed.session.status).toBe('stopped');expect(failed.session.messages.at(-1)?.text).toContain('may already have taken effect');});
  it('does not execute a model response that arrives after stop',async()=>{const f=fixture();let finish!:(a:Action)=>void;f.planner.decide=async()=>new Promise(resolve=>{finish=resolve;});const task=f.runner.command('Place the order');await vi.waitFor(()=>expect(finish).toBeDefined());f.runner.stop();finish(act('click'));await task;expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');});
  it('does not claim success or repeat an ignored cart mutation',async()=>{const f=fixture();f.setState({...base,elements:base.elements.map(e=>({...e,name:'Add to cart'}))});f.execute.mockImplementation(async()=>{});await f.runner.command('Add this adapter to my cart');expect(f.execute).toHaveBeenCalledTimes(1);expect(f.session.status).toBe('stopped');expect(f.session.messages.at(-1)?.text).toContain('has not confirmed');});
  it('rejects a made-up completion with no executed action or page evidence',async()=>{const f=fixture();f.planner.decide=async()=>({...act('done'),completion:{status:'completed',evidence:[{source:'text',ref:null,value:'Order confirmed #123'}]}});await f.runner.command('Place the order');expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');expect(f.session.messages.at(-1)?.text).toContain('could not verify');});
  it('does not report scrolling when the viewport never moved',async()=>{const f=fixture();f.execute.mockImplementation(async()=>{});await f.runner.command('Scroll down');expect(f.session.messages.at(-1)?.text).toContain('did not change');});
  it('uses visual inspection without site flows or extra approval, then verifies the actual control',async()=>{
    const f=fixture();f.driver.screenshot=async()=>'fixture-image';f.setState({...base,elements:[{...base.elements[0],name:'Expand details'}]});
    f.planner.decide=vi.fn().mockResolvedValueOnce({...act('screenshot'),risk:'read'}).mockResolvedValueOnce({...act('inspect'),x:20,y:30,risk:'read'}).mockResolvedValueOnce({...act('click'),summary:'Expand details',risk:'read'}).mockResolvedValueOnce({...act('done'),summary:'The details are visible.',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'Cart: Adapter ₹799 Quantity 1'}]}});
    await f.runner.command('Open the details');expect(f.execute.mock.calls.map(([a])=>(a as Action).kind)).toEqual(['inspect','click']);expect(f.session.approval).toBeUndefined();expect(f.session.status).toBe('ready');expect(f.session.experience?.name).toBe('Shop');
  });
  it('rejects visual inspection without a screenshot and does not send input',async()=>{
    const f=fixture();f.planner.decide=async()=>({...act('inspect'),x:10,y:10});await f.runner.command('Find that custom control');expect(f.execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');
  });
});
