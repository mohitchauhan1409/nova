import type {Action,Session,Snapshot,ElementRef} from '../../../shared/types';
import {createHash} from 'node:crypto';

// A successful tab switch can still be part of an unproductive A/B cycle.
// Compare observed content and semantic controls, not ephemeral element refs.
export function repeatedTabInspection(action:Action,snapshot:Snapshot,visits:Map<string,number>){
  const target=snapshot.elements.find(e=>e.ref===action.ref);
  if(action.kind!=='click'||target?.role!=='tab')return false;
  const controls=snapshot.elements.filter(e=>!e.sensitive).map(e=>({
    role:e.role,name:e.name,disabled:e.disabled,
    state:(e.state||[]).filter(s=>/^(value|selected|checked|pressed|valuenow):/.test(s)),
    revision:e.edit?.revision,
  }));
  const key=createHash('sha256').update(JSON.stringify([snapshot.url,snapshot.text,target.name,controls])).digest('hex');
  const count=visits.get(key)||0;visits.set(key,count+1);
  if(visits.size>48)visits.delete(visits.keys().next().value!);
  return count>=2;
}
export function observeProgress(session:Session,snapshot:Snapshot){
  const progress=session.progress;if(!progress)return;
  if(progress.url!==snapshot.url){progress.url=snapshot.url;progress.settings=[];}
  for(const el of snapshot.elements){
    if(el.sensitive)continue;
    const state=(el.state||[]).filter(s=>/^(value|selected|checked|pressed|valuenow):/.test(s));
    if(!state.length)continue;
    const index=progress.settings.findIndex(s=>s.ref===el.ref);
    const fact={ref:el.ref,name:el.name,state,afterReload:progress.reloads};
    if(index>=0)progress.settings[index]=fact;else progress.settings.push(fact);
  }
  progress.settings=progress.settings.slice(-60);
}
export function recordProgress(session:Session,action:Action,target:ElementRef|undefined,result:string){
  const progress=session.progress;if(!progress)return;
  progress.actions.push({kind:action.kind,target:target?.name||action.kind,summary:action.summary,result});
  progress.actions=progress.actions.slice(-48);
}
export function beforeProgressAction(session:Session,action:Action){
  const progress=session.progress;if(!progress)return;
  if(['reload','navigate','back','forward'].includes(action.kind)){progress.settings=[];progress.reloads++;}
  else if(['fill','type','clear','paste','select','check'].includes(action.kind))progress.settings=progress.settings.filter(s=>s.ref!==action.ref);
}
