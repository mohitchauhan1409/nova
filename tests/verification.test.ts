import {describe,it,expect} from 'vitest';
import {actionEffect,completionProblem} from '../BE/src/agent/verification';
import {plannerContext} from '../BE/src/providers/openai';
import {quickAction,isStopCommand} from '../BE/src/agent/quick-actions';
import type {Action,Snapshot,Session,SiteProfile} from '../shared/types';
const before:Snapshot={id:'a',url:'https://example.com/',title:'Page',text:'Player',elements:[{ref:'v',tag:'video',role:'',name:'Player',type:'',context:'',disabled:false,sensitive:false,state:['paused:false']}],viewport:{width:1200,height:800,scrollY:0},theme:{color:'#000',font:'Arial'},frames:0,capturedAt:0};
const action:Action={kind:'click',ref:'v',url:null,value:null,x:null,y:null,summary:'Pause',risk:'read'};
describe('observed outcome verification',()=>{
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
  it('packs observations without dropping control information or duplicating contexts',()=>{const session={messages:[],traces:[]} as unknown as Session;const site={name:'Page',instructions:'',flows:[]} as unknown as SiteProfile;const snap={...before,elements:[...before.elements,{...before.elements[0],ref:'v2'}]};const packed=plannerContext(session,site,snap).observation;expect(packed.contexts).toEqual(['']);const e=Object.fromEntries(packed.elementColumns.map((key,i)=>[key,packed.elements[0][i]]));expect(e.ref).toBe('v');expect(e.state).toEqual(['paused:false']);expect(packed.elements).toHaveLength(2);});
});
