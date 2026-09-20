import {describe,it,expect} from 'vitest';
import {observeProgress,beforeProgressAction,repeatedTabInspection} from '../BE/src/agent/progress';
import {relevantFlows} from '../BE/src/agent/flow-context';
import {completionProblem} from '../BE/src/agent/verification';
import {actionSchema,type Action,type Snapshot} from '../shared/types';
const snapshot:Snapshot={id:'s1',url:'https://example.com/workflows/demo',title:'Workflow',text:'Workflow',elements:[{ref:'field',tag:'input',role:'textbox',name:'Wait',type:'number',context:'',disabled:false,sensitive:false}],viewport:{width:1200,height:800},theme:{color:'#000',font:'Arial'},frames:0,capturedAt:0};
const action=(patch:Partial<Action>):Action=>({kind:'click',ref:null,url:null,value:null,x:null,y:null,summary:'Inspect workflow',risk:'read',...patch});
import {workflowProfile} from './fixtures/profiles';
import type {Session} from '../shared/types';
const session=()=>({messages:[{role:'user',text:'Verify my workflow delay and End outcome. Do not create campaigns.'}],traces:[],progress:{url:snapshot.url,reloads:0,actions:[],settings:[]}} as unknown as Session);
describe('persistent run observations',()=>{
 it('detects unchanged tab cycles despite new refs and allows new content or field state',()=>{
  const visits=new Map<string,number>();
  const tab=(ref:string):Snapshot=>({...snapshot,text:'Processing is pending',elements:[{...snapshot.elements[0],ref,tag:'button',role:'tab',name:'Summary',state:['selected:false']}]});
  expect(repeatedTabInspection(action({ref:'a'}),tab('a'),visits)).toBe(false);
  expect(repeatedTabInspection(action({ref:'b'}),tab('b'),visits)).toBe(false);
  expect(repeatedTabInspection(action({ref:'c'}),tab('c'),visits)).toBe(true);
  expect(repeatedTabInspection(action({ref:'d'}),{...tab('d'),text:'Processed decisions are available'},visits)).toBe(false);
  const changed=tab('e');changed.elements.push({...snapshot.elements[0],state:['value:2']});
  expect(repeatedTabInspection(action({ref:'e'}),changed,visits)).toBe(false);
  for(let i=0;i<4;i++)expect(repeatedTabInspection(action({ref:'field'}),snapshot,visits)).toBe(false);
 });
 it('retains inspected settings across panels and invalidates them on reload or field editing',()=>{
  const s=session();const snap={...snapshot,elements:[{...snapshot.elements[0],ref:'wait',name:'Wait',state:['value:1','scrollY:0']}]};observeProgress(s,snap);observeProgress(s,{...snapshot,elements:[]});expect(s.progress!.settings[0].state).toEqual(['value:1']);
  const done=action({kind:'done',completion:{status:'completed',evidence:[{source:'state',ref:'wait',value:'value:1'}]}});expect(completionProblem(done,{...snapshot,elements:[]},undefined,false,s.progress)).toBeUndefined();
  beforeProgressAction(s,action({kind:'fill',ref:'wait',value:'2'}));expect(s.progress!.settings).toHaveLength(0);observeProgress(s,snap);beforeProgressAction(s,action({kind:'reload'}));expect(s.progress!.reloads).toBe(1);expect(completionProblem(done,{...snapshot,elements:[]},undefined,false,s.progress)).toContain('no matching evidence');
 });
 it('does not retain sensitive control values',()=>{const s=session();observeProgress(s,{...snapshot,elements:[{...snapshot.elements[0],sensitive:true,state:['value:secret']}]});expect(s.progress!.settings).toHaveLength(0);});
 it('loads the relevant workflow guide instead of unrelated workspace guides',()=>{const flows=relevantFlows(session(),workflowProfile,{...snapshot,url:'https://workspace.example/workflows/example'});expect(flows.map(f=>f.id)).toContain('workspace-workflow');expect(flows.length).toBeLessThanOrEqual(3);expect(JSON.stringify(flows).length).toBeLessThan(JSON.stringify(workflowProfile.flows).length);});
});
