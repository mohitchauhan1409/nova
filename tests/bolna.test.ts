import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { launcherStylesFor } from '../web/companion/customization';
import { bolnaProfile } from '../BE/src/sites/bolna';
import { SiteStore } from '../BE/src/sites/store';
import { siteExperience } from '../shared/site-experience';
import { checkAction } from '../BE/src/agent/policy';
import type { Action, Snapshot } from '../shared/types';

describe('Bolna companion and voice-operations boundaries',()=>{
  it('applies the customer launcher theme only on the Bolna hostname',()=>{
    expect(launcherStylesFor('https://platform.bolna.ai/dashboard')).toContain('.launch');
    for(const url of ['https://www.google.com','https://platform.bolna.ai.evil.example','https://other.bolna.ai','not a url']) expect(launcherStylesFor(url)).toBe('');
  });
  it('adds Bolna to existing workspaces without overwriting other profiles or duplicating it',()=>{
    const dir=mkdtempSync(path.join(tmpdir(),'nova-bolna-'));const file=path.join(dir,'sites.json');
    try{
      const own={...structuredClone(bolnaProfile),id:'custom',name:'My shop',url:'https://shop.example/',domain:'shop.example',instructions:'Keep my edits'};
      writeFileSync(file,JSON.stringify([own]));const store=new SiteStore(file);
      expect(store.forUrl('https://platform.bolna.ai/analytics')?.id).toBe('bolna');expect(store.get('custom')).toEqual(own);
      expect(new SiteStore(file).list().filter(s=>s.domain==='platform.bolna.ai')).toHaveLength(1);
      expect(JSON.parse(readFileSync(file,'utf8'))).toHaveLength(2);
    }finally{rmSync(dir,{recursive:true,force:true});}
  });
  it('preserves an existing custom Bolna configuration',()=>{
    const dir=mkdtempSync(path.join(tmpdir(),'nova-bolna-'));const file=path.join(dir,'sites.json');
    try{const own={...structuredClone(bolnaProfile),id:'my-bolna',instructions:'Owner instructions',builtIn:false};writeFileSync(file,JSON.stringify([own]));const store=new SiteStore(file);expect(store.list()).toEqual([own]);}finally{rmSync(dir,{recursive:true,force:true});}
  });
  it('provides site-specific identity and mapped guides without claiming completed validation',()=>{
    const experience=siteExperience(bolnaProfile);expect(experience.name).toBe('Bolna');expect(experience.suggestions[0].prompt).toContain('without changing');
    expect(bolnaProfile.flows.length).toBeGreaterThanOrEqual(18);expect(new Set(bolnaProfile.flows.map(f=>f.id)).size).toBe(bolnaProfile.flows.length);
    expect(bolnaProfile.flows.filter(f=>f.verified).map(f=>f.id)).toEqual(['bolna-create-agent','bolna-test-extraction','bolna-knowledge','bolna-graph','bolna-workflow']);
    expect(bolnaProfile.flows.find(f=>f.id==='bolna-create-agent')?.steps.join(' ')).toContain('not making a call');
  });
  const snapshot:Snapshot={id:'s',url:bolnaProfile.url,title:'Bolna',text:'Trial: only verified numbers',elements:[],viewport:{width:1200,height:800},theme:{color:'#315fe9',font:'Arial'},frames:0,capturedAt:0};
  const action:Action={kind:'click',ref:'target',value:null,url:null,x:null,y:null,risk:'read',summary:'Open this control'};
  const page=(name:string,href?:string):Snapshot=>({...snapshot,elements:[{ref:'target',tag:href?'a':'button',role:'',type:'button',name,context:'',sensitive:false,disabled:false,href}]});
  it.each(['Get a call from agent','Stop Queued Calls','Start campaign','Schedule calls','Resume batch','Dial now','Send test','Add funds','Buy phone number','Release number','Generate API key','Copy access token'])('reviews %s even when the planner labels it read-only',name=>{
    expect(checkAction(action,page(name),bolnaProfile.url,'Prepare a founder demo')).toMatchObject({outcome:'approve',mayCommit:true});
  });
  it('protects live dispatch links too',()=>{expect(checkAction(action,page('Start campaign','https://platform.bolna.ai/campaigns/one'),bolnaProfile.url).outcome).toBe('approve');});
  it.each(['Calling','Call History','Campaigns','Review campaign','Preview welcome message','Search agents','Validate'])('allows ordinary inspection: %s',name=>{
    expect(checkAction(action,page(name),bolnaProfile.url,'Review my setup')).toMatchObject({outcome:'allow'});
  });
  it('does not request dispatch approval just to hover or scroll to a call button',()=>{
    expect(checkAction({...action,kind:'hover'},page('Get a call from agent'),bolnaProfile.url).outcome).toBe('allow');
  });
});
