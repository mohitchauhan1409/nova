import {describe,it,expect} from 'vitest';
import {actionEffect,completionProblem,completionSnapshotChanged} from '../BE/src/agent/verification';
import {plannerContext} from '../BE/src/providers/openai';
import {quickAction,isStopCommand} from '../BE/src/agent/quick-actions';
import type {Action,Snapshot,Session,SiteProfile} from '../shared/types';
const before:Snapshot={id:'a',url:'https://example.com/',title:'Page',text:'Player',elements:[{ref:'v',tag:'video',role:'',name:'Player',type:'',context:'',disabled:false,sensitive:false,state:['paused:false']}],viewport:{width:1200,height:800,scrollY:0},theme:{color:'#000',font:'Arial'},frames:0,capturedAt:0};
const action:Action={kind:'click',ref:'v',url:null,value:null,x:null,y:null,summary:'Pause',risk:'read'};
describe('observed outcome verification',()=>{
  describe('completion evidence from the authorized privacy projection',()=>{
    const request='Change dispatch to October 5, 2026 and keep everything else.';
    const rawName='recipient@customer.example Delivery notice — Dispatch October 5, 2026. Tracking follows dispatch.';
    const projectedName='[email hidden] Delivery notice — Dispatch October 5, 2026. Tracking follows dispatch.';
    const page:Snapshot={...before,url:'https://workspace.example/drafts/recipient@customer.example',text:'Drafts',textRegions:[{ref:'draft',text:rawName,elementRefs:['draft']}],elements:[{...before.elements[0],ref:'draft',tag:'div',role:'row',name:rawName,state:[]}]};
    const effect={action:'click' as const,verified:true,detail:'The editor closed.'};
    const check=(source:'text'|'url',value:string,snapshot=page,currentRequest=request)=>completionProblem({...action,kind:'done',completion:{status:'completed',evidence:[{source,ref:'draft',value}]}},snapshot,effect,true,undefined,currentRequest);
    it('accepts exact projected row and URL evidence while retaining exact raw matches',()=>{
      expect(check('text',projectedName)).toBeUndefined();
      expect(check('url','https://workspace.example/drafts/[email hidden]')).toBeUndefined();
      expect(check('text',rawName)).toBeUndefined();expect(check('url',page.url)).toBeUndefined();
      expect(check('text',projectedName,{...page,text:rawName,elements:[]})).toBeUndefined();
    });
    it('uses the current task projection rather than treating placeholders as wildcards',()=>{
      expect(check('text',projectedName,page,'Show the recipient email.')).toContain('no matching evidence');
      expect(check('text',projectedName.replace('[email hidden]','invented@customer.example'))).toContain('no matching evidence');
      expect(check('url','https://workspace.example/drafts/[email hidden]/unobserved')).toContain('no matching evidence');
    });
    it('rejects wrong dates, absent outcomes and placeholder-only citations',()=>{
      for(const value of [projectedName.replace('October 5','October 6'),'[email hidden] Refund approved','[email hidden]','[phone hidden] [account name] [redacted]','Email: [email hidden]']){
        expect(check('text',value)).toBeDefined();
      }
      expect(check('text',projectedName,{...page,elements:[]})).toContain('no matching evidence');
      for(const name of ['recipient@customer.example','Email: recipient@customer.example']){
        const identityOnly={...page,text:name,elements:[{...page.elements[0],name}]};
        expect(check('text',name.replace('recipient@customer.example','[email hidden]'),identityOnly)).toContain('no matching evidence');
      }
    });
    it('keeps sensitive controls excluded and does not mutate or expose private observations',()=>{
      const saved=JSON.stringify(page);
      const problem=check('text',projectedName,{...page,elements:page.elements.map(e=>({...e,sensitive:true}))});
      expect(problem).toContain('no matching evidence');expect(problem).not.toContain('recipient@customer.example');
      expect(JSON.stringify(page)).toBe(saved);
      const session={messages:[{role:'user',text:request}],traces:[]} as unknown as Session;
      const site={name:'Workspace',instructions:'',flows:[]} as unknown as SiteProfile;
      expect(JSON.stringify(plannerContext(session,site,page))).not.toContain('recipient@customer.example');
    });
  });
  it('distinguishes newly attached draft proof from a real editable value change at completion',()=>{
    const field={...before.elements[0],tag:'input',name:'Description',type:'text',state:[],edit:{revision:'value-1',empty:false}};
    const page={...before,elements:[field]};
    const proof={...page,elements:[{...field,state:['draft:matches:known-ref']}]};
    expect(completionSnapshotChanged(page,proof,action)).toBe(false);
    expect(completionSnapshotChanged(page,{...proof,elements:[{...field,edit:{revision:'value-2',empty:false}}]},action)).toBe(true);
  });
  it('does not ignore an observed timer when the answer cites its value',()=>{
    const timer={...before.elements[0],ref:'timer',tag:'p',role:'timer',name:'00:00:01'};
    const page={...before,text:timer.name,elements:[timer]};
    const done={...action,kind:'done' as const,completion:{status:'answer' as const,evidence:[{source:'text' as const,ref:'timer',value:timer.name}]}};
    expect(completionSnapshotChanged(page,{...page,text:'00:00:02',elements:[{...timer,name:'00:00:02'}]},done)).toBe(true);
  });
  it('waits when a non-form import only dismisses auxiliary controls with its draft intact', () => {
    const submit={...action,risk:'sensitive' as const};
    const button={...before.elements[0],tag:'button',name:'Import',type:'button',state:[]};
    const draft={...button,ref:'draft',tag:'textarea',name:'Transcript',edit:{revision:'v1',empty:false}};
    const page={...before,text:'Import transcript',elements:[button,draft,{...button,ref:'suggestion',name:'Autocomplete'}]};
    const pending={...page,elements:[button,draft]};
    expect(actionEffect(submit,page,pending,{ok:true},true).verified).toBe(false);
    expect(actionEffect(submit,page,{...pending,text:'Importing',elements:[{...button,disabled:true},draft]},{ok:true},true).verified).toBe(false);
    expect(actionEffect(submit,page,{...pending,elements:[{...button,state:['pressed:true']},draft]},{ok:true},true).verified).toBe(true);
    expect(actionEffect(submit,page,{...pending,url:'https://example.com/records/1',text:'Saved transcript'},{ok:true},true).verified).toBe(true);
  });
  it('does not mistake a focused link for its delayed navigation', () => {
    const page = {...before,elements:[{...before.elements[0],tag:'a',name:'Settings',href:'https://example.com/settings',state:[]}]};
    const focused = {...page,elements:page.elements.map(e=>({...e,state:['focused:true']}))};
    expect(actionEffect(action,page,focused)).toMatchObject({verified:false,detail:expect.stringContaining('navigation is still pending')});
    expect(actionEffect(action,page,{...focused,url:'https://example.com/settings',text:'Settings'}).verified).toBe(true);
    const anchor = {...page,elements:page.elements.map(e=>({...e,href:'https://example.com/#details'}))};
    expect(actionEffect(action,anchor,{...anchor,url:'https://example.com/#details'}).verified).toBe(true);
  });
  it('ignores click focus and scrolling until a row produces a meaningful result',()=>{
    const row={...before.elements[0],tag:'div',role:'row',name:'Draft update',state:['selected:false','scrollY:0']};
    const page={...before,elements:[row,{...row,ref:'other',name:'Other draft'}]};
    const focused={...page,viewport:{...page.viewport,scrollY:100},elements:page.elements.map(e=>({...e,state:['selected:false','focused:true','scrollY:100']}))};
    expect(actionEffect(action,page,focused,{ok:true}).verified).toBe(false);
    expect(actionEffect(action,page,{...focused,elements:[{...focused.elements[0],state:['selected:true']}]},{ok:true}).verified).toBe(true);
    const field={...row,tag:'input',role:'textbox',type:'text',edit:{revision:'a',empty:true}};
    expect(actionEffect(action,{...page,elements:[field]},{...page,elements:[{...field,state:[...field.state,'focused:true']}]},{ok:true}).verified).toBe(true);
  });
  it('accepts an actually observed accessible panel label and equivalent ARIA state spelling',()=>{
    const snap={...before,elements:[{...before.elements[0],ref:'panel',name:'Close assistant panel',state:['expanded:true']}]};
    const effect={action:'click' as const,verified:true,detail:'Expanded'};
    for(const evidence of [[{source:'text' as const,ref:null,value:'Close assistant panel'}],[{source:'state' as const,ref:'panel',value:'aria-expanded=true'}]])expect(completionProblem({...action,kind:'done',completion:{status:'completed',evidence}},snap,effect,true)).toBeUndefined();
    expect(completionProblem({...action,kind:'done',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'Message sent successfully'}]}},snap,effect,true)).toBeDefined();
  });
  it('distinguishes a real media-state change from a dispatched click',()=>{expect(actionEffect(action,before,before,{ok:true}).verified).toBe(false);const after={...before,elements:before.elements.map(e=>({...e,state:['paused:true']}))};expect(actionEffect(action,before,after).verified).toBe(true);});
  it('does not treat scrolling a button into view as proof the click worked',()=>{expect(actionEffect(action,before,{...before,viewport:{...before.viewport,scrollY:300}}).verified).toBe(false);});
  it('requires state evidence that actually matches the current observed ref',()=>{const done:Action={...action,kind:'done',completion:{status:'completed',evidence:[{source:'state',ref:'v',value:'paused:true'}]}};expect(completionProblem(done,before,{action:'click',verified:true,detail:'change'},true)).toContain('no matching evidence');expect(completionProblem(done,{...before,elements:before.elements.map(e=>({...e,state:['paused:true']}))},{action:'click',verified:true,detail:'change'},true)).toBeUndefined();});
  it('cannot disguise a failed action as an answer',()=>{expect(completionProblem({...action,kind:'done',completion:{status:'answer',evidence:[]} },before,{action:'click',verified:false,detail:'ignored'},true)).toContain('no verified result');});
  it('does not accept a click receipt as proof of the final task',()=>{expect(completionProblem({...action,kind:'done',completion:{status:'completed',evidence:[{source:'action',ref:null,value:'click'}]}},before,{action:'click',verified:true,detail:'change'},true)).toContain('no matching evidence');});
  it('permits an honest blocked report and ordinary conversation',()=>{expect(completionProblem({...action,completion:{status:'blocked',evidence:[]}},before,undefined,true)).toBeUndefined();expect(completionProblem({...action,completion:{status:'answer',evidence:[]}},before)).toBeUndefined();});
  it('only shortcuts unambiguous media commands',()=>{expect(quickAction('pause the video')?.value).toBe('pause');expect(quickAction('skip forward 10 seconds')?.value).toBe('seek:10');expect(quickAction('skip')).toBeUndefined();expect(quickAction('play and subscribe')).toBeUndefined();expect(quickAction('do not pause')).toBeUndefined();});
  it('routes bare pause to media and preserves explicit agent interruption',()=>{expect(isStopCommand('pause')).toBe(false);expect(quickAction('pause')?.value).toBe('pause');expect(isStopCommand('pause Nova')).toBe(true);expect(isStopCommand('stop')).toBe(true);expect(isStopCommand('cancel')).toBe(true);expect(isStopCommand('pause the video')).toBe(false);});
  it('supplies current numeric settings as completion evidence',()=>{
    const session={messages:[],traces:[]} as unknown as Session;const site={name:'Page',instructions:'',flows:[]} as unknown as SiteProfile;
    const snap={...before,elements:[{...before.elements[0],ref:'delay',tag:'input',name:'Wait',type:'number',state:['value:30']}]};
    expect(plannerContext(session,site,snap).stateEvidence).toContainEqual({source:'state',ref:'delay',value:'value:30'});
  });
  it('does not present a prepared value as current proof after its row identity changes',()=>{
    const field={...before.elements[0],tag:'input',name:'Value',type:'text',context:'Field key: purpose. Edit properties',state:[],edit:{revision:'same-text',empty:false}};
    const draft={ref:field.ref,url:before.url,value:'Known purpose',kind:'fill' as const,revision:field.edit.revision,target:{name:field.name,tag:field.tag,type:field.type,context:field.context}};
    const session={messages:[],traces:[],preparedInputs:[draft]} as unknown as Session;const site={name:'Page',instructions:'',flows:[]} as unknown as SiteProfile;
    expect(plannerContext(session,site,{...before,elements:[field]}).preparedInputs).toHaveLength(1);
    expect(plannerContext(session,site,{...before,elements:[{...field,context:'Field key: owner. Edit properties'}]}).preparedInputs).toEqual([]);
    // A fresh equality observation remains sufficient if incidental form text changed.
    expect(plannerContext(session,site,{...before,elements:[{...field,context:'Changed counter',state:[`draft:matches:${draft.ref}`]}]}).preparedInputs).toHaveLength(1);
  });
  it('packs observations without dropping control information or duplicating contexts',()=>{const session={messages:[],traces:[]} as unknown as Session;const site={name:'Page',instructions:'',flows:[]} as unknown as SiteProfile;const snap={...before,elements:[...before.elements,{...before.elements[0],ref:'v2'}]};const packed=plannerContext(session,site,snap).observation;expect(packed.contexts).toEqual(['']);const e=Object.fromEntries(packed.elementColumns.map((key,i)=>[key,packed.elements[0][i]]));expect(e.ref).toBe('v');expect(e.state).toEqual(['paused:false']);expect(packed.elements).toHaveLength(2);});
});


describe('editable evidence and non-submitting keys',()=>{
  const field={...before.elements[0],tag:'div',role:'textbox',type:'contenteditable',form:true,edit:{revision:'v1',empty:false}};
  const page={...before,text:'JSON editor',elements:[field]};
  it('cannot promote an unverified fill from generic page/control changes',()=>{
    const fill={...action,kind:'fill' as const,value:'{}'};
    const changed={...page,text:'Changed JSON',elements:[{...field,name:'{}}',edit:{revision:'v2',empty:false}}]};
    for(const receipt of [undefined,{ok:true},{ok:true,verification:{status:'unverified',detail:'not exact'}}])expect(actionEffect(fill,page,changed,receipt,true).verified).toBe(false);
    expect(actionEffect(fill,page,changed,{ok:true,verification:{status:'verified',detail:'Exact field value'}},true).verified).toBe(true);
  });
  it.each(['End','ControlOrMeta+End','Control+End','Backspace','Delete'])('does not describe %s as submitting a draft',value=>{
    expect(actionEffect({...action,kind:'press',value},page,page,{ok:true},true).detail).not.toContain('submitted draft');
  });
  it('requires changed editor revision to verify an editing key, retaining Enter submission checks',()=>{
    const backspace={...action,kind:'press' as const,value:'Backspace'};
    expect(actionEffect(backspace,page,page,{ok:true},true).verified).toBe(false);
    expect(actionEffect(backspace,page,{...page,elements:[{...field,edit:{revision:'v2',empty:false}}]},{ok:true},true).verified).toBe(true);
    expect(actionEffect({...backspace,value:'Enter'},page,page,{ok:true},true).detail).toContain('submitted draft');
  });
});
