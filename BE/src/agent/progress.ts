import type {Action,Session,Snapshot,ElementRef} from '../../../shared/types';
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
