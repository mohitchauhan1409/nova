import {describe,it,expect} from 'vitest';
import {siteExperience,sitePalette} from '../shared/site-experience';
import {checkAction} from '../BE/src/agent/policy';
import type {Action,Snapshot} from '../shared/types';
describe('site identity with shared control boundaries',()=>{
  it('uses owner-configured identity and suggestions without needing a known domain',()=>{
    const experience=siteExperience({name:'Acme workspace',color:'#009988',description:'Your project co-pilot.',flows:[{id:'one',name:'Review milestones',trigger:'Help me review milestones',steps:[],verified:false}]});
    expect(experience).toMatchObject({name:'Acme workspace',accent:'#009988',greeting:'Your project co-pilot.',suggestions:[{title:'Review milestones',prompt:'Help me review milestones'}]});
    expect(siteExperience({name:'New website',color:'red;url(secret)',description:'',flows:[]}).accent).toBe('#7360db');
    expect(sitePalette('#ffffff').ink).not.toBe('rgb(255,255,255)');
  });
  const snapshot:Snapshot={id:'s',url:'https://example.com',title:'Workspace',text:'',elements:[{ref:'target',name:'Delete record',tag:'button',role:'',type:'',context:'',sensitive:false,disabled:false}],viewport:{width:1000,height:800},theme:{color:'#000',font:'system-ui'},frames:0,capturedAt:0};
  const action:Action={kind:'click',ref:'target',summary:'Open details',risk:'read',url:null,x:null,y:null,value:null};
  it('classifies visually recovered labels using the actual control, not the model summary',()=>{
    expect(checkAction(action,snapshot,snapshot.url).outcome).toBe('approve');
    expect(checkAction({...action,kind:'inspect'},snapshot,snapshot.url).outcome).toBe('allow');
    expect(checkAction(action,{...snapshot,elements:[{...snapshot.elements[0],tag:'canvas',name:'Board',visual:true}]},snapshot.url).outcome).toBe('approve');
  });
  it('does not lose screenshot privacy checks when a sensitive control is outside the bounded list',()=>{
    expect(checkAction({...action,kind:'screenshot',ref:null},{...snapshot,observation:{totalControls:200,omittedControls:20,viewportFirst:true,sensitiveFieldsPresent:true}},snapshot.url).outcome).toBe('block');
  });
});
