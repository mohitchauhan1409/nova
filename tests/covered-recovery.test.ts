import {afterAll,afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {chromium,type Browser,type Page} from 'playwright';
import {buildSync} from 'esbuild';
import {AgentRunner} from '../BE/src/agent/runner';
import type {BrowserDriver} from '../BE/src/browser/driver';
import type {Planner} from '../BE/src/providers/openai';
import type {Action,Session,SiteProfile,Snapshot} from '../shared/types';
const script=buildSync({entryPoints:['shared/dom.ts'],bundle:true,write:false,format:'iife'}).outputFiles[0].text;
const url='https://fixture.example.test/editor';
const action=(patch:Partial<Action>):Action=>({kind:'fill',ref:'field',value:'escalate',url:null,x:null,y:null,risk:'change',summary:'Name the field',...patch});
const site:SiteProfile={id:'site',name:'Fixture',domain:'fixture.example.test',url,color:'#000000',description:'',instructions:'',flows:[],observations:0};
function runner(driver:BrowserDriver,planner:Planner){
  const session:Session={id:'s',siteId:'site',mode:'browser',status:'ready',url,title:'Editor',messages:[],traces:[],steps:0,model:'fixture',startedAt:0};
  return {session,agent:new AgentRunner(session,driver,planner,site,()=>{})};
}
let browser:Browser,page:Page;
beforeAll(async()=>{browser=await chromium.launch({headless:true});page=await browser.newPage();});
afterAll(async()=>{await browser?.close();});
afterEach(()=>vi.restoreAllMocks());
async function clippedFixture(overlay=false){
  await page.goto('about:blank');
  await page.setContent('<div id="pane" style="height:120px;width:320px;overflow:auto"><div style="height:500px;padding-top:240px;box-sizing:border-box"><input aria-label="Field name"></div></div>'+(overlay?'<div style="position:fixed;left:8px;top:8px;width:320px;height:120px;background:white">Overlay</div>':''));
  await page.evaluate(script);
  const snapshot=async()=>({...await page.evaluate(()=>window.__novaDOM!.snapshot()),url});
  const cdp=await page.context().newCDPSession(page);
  const execute=vi.fn(async(a:Action)=>{
    if(a.kind==='scroll_to')return page.evaluate(a=>window.__novaDOM!.execute(a),a);
    if(a.kind==='fill'){
      await page.evaluate(ref=>window.__novaDOM!.prepare(ref!),a.ref);
      await page.evaluate(ref=>window.__novaDOM!.startInput(ref!),a.ref);
      await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'a',code:'KeyA',commands:['selectAll']});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA'});
      await cdp.send('Input.insertText',{text:a.value!});
      return page.evaluate(a=>window.__novaDOM!.verify(a),a);
    }
    throw new Error('Unexpected fixture action');
  });
  const driver:BrowserDriver={snapshot,execute,screenshot:async()=>'',close:async()=>{await cdp.detach();}};
  const planner:Planner={decide:async(_session,_site,snapshot)=>{
    const field=snapshot.elements.find(e=>e.name==='Field name')!;
    return field.state?.includes('value:escalate')?action({kind:'done',ref:null,value:null,summary:'The field is escalate.',completion:{status:'completed',evidence:[{source:'state',ref:field.ref,value:'value:escalate'}]}}):action({ref:field.ref});
  }};
  return {...runner(driver,planner),execute,driver};
}
describe('bounded recovery for a stable covered editable field',()=>{
  it('scrolls a genuinely clipped nested field once, then enters text through normal hit testing',async()=>{
    const f=await clippedFixture();
    expect((await f.driver.snapshot()).elements.find(e=>e.name==='Field name')?.covered).toBe(true);
    await f.agent.command('Set the field name to escalate.');
    expect(f.execute.mock.calls.map(([a])=>a.kind)).toEqual(['scroll_to','fill']);
    expect(await page.getByLabel('Field name').inputValue()).toBe('escalate');expect(f.session.status).toBe('ready');
    expect(await page.locator('#pane').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
    await f.driver.close();
  });
  it('never types through a real overlay and does not repeat the scroll recovery',async()=>{
    const f=await clippedFixture(true);await f.agent.command('Set the field name to escalate.');
    expect(f.execute.mock.calls.map(([a])=>a.kind)).toEqual(['scroll_to']);
    expect(await page.getByLabel('Field name').inputValue()).toBe('');expect(f.session.status).toBe('stopped');
    expect(f.session.traces.filter(t=>t.text.includes('target is still covered'))).toHaveLength(3);
    await f.driver.close();
  });
  it('replans a changed edit revision instead of scrolling or using the old edit',async()=>{
    let now=0;vi.spyOn(performance,'now').mockImplementation(()=>now+=1000);
    const field={ref:'field',tag:'input',role:'',type:'text',name:'Field name',context:'',covered:true,disabled:false,sensitive:false,edit:{revision:'r1',empty:true}};
    let read=0;const snapshot:Snapshot={id:'s',url,title:'Editor',text:'Editor',elements:[field],viewport:{width:800,height:600},theme:{color:'#fff',font:'sans-serif'},frames:0,capturedAt:0};
    const execute=vi.fn();const driver:BrowserDriver={snapshot:async()=>({...snapshot,elements:[{...field,edit:{revision:++read===1?'r1':'r2',empty:true}}]}),execute,screenshot:async()=>'',close:async()=>{}};
    const planner:Planner={decide:vi.fn().mockResolvedValueOnce(action({})).mockResolvedValue(action({kind:'done',ref:null,value:null,summary:'The editor changed.',completion:{status:'blocked',evidence:[]}}))};
    const f=runner(driver,planner);await f.agent.command('Set the field name to escalate.');
    expect(execute).not.toHaveBeenCalled();expect(f.session.traces.some(t=>t.text.includes('page changed while planning'))).toBe(true);
  });
  it('bounds repeated changed-target rejection before the ordinary repeat guard',async()=>{
    let now=0;vi.spyOn(performance,'now').mockImplementation(()=>now+=1000);
    let revision=0;const execute=vi.fn();
    const driver:BrowserDriver={snapshot:async()=>({id:'s',url,title:'Editor',text:'Editor',elements:[{ref:'field',tag:'input',role:'',type:'text',name:'Field name',context:'',disabled:false,sensitive:false,edit:{revision:`r${++revision}`,empty:true}}],viewport:{width:800,height:600},theme:{color:'#fff',font:'sans-serif'},frames:0,capturedAt:0}),execute,screenshot:async()=>'',close:async()=>{}};
    const planner:Planner={decide:vi.fn().mockResolvedValue(action({}))};const f=runner(driver,planner);
    await f.agent.command('Set the field name to escalate.');
    expect(planner.decide).toHaveBeenCalledTimes(3);expect(execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');
  });
  it('does not recover an edit requiring approval or a sensitive field',async()=>{
    for(const patch of [{context:'Security settings'},{sensitive:true}]){
      const execute=vi.fn();const driver:BrowserDriver={snapshot:async()=>({id:'s',url,title:'Editor',text:'Editor',elements:[{ref:'field',tag:'input',role:'',type:'text',name:'Field name',context:'',covered:true,disabled:false,sensitive:false,edit:{revision:'r1',empty:true},...patch}],viewport:{width:800,height:600},theme:{color:'#fff',font:'sans-serif'},frames:0,capturedAt:0}),execute,screenshot:async()=>'',close:async()=>{}};
      const f=runner(driver,{decide:vi.fn().mockResolvedValue(action({}))});await f.agent.command('Set the field name to escalate.');
      expect(execute).not.toHaveBeenCalled();expect(f.session.status).toBe('stopped');
    }
  });
});
