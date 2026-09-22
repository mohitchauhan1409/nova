import { installNovaDOM } from '../../shared/dom';
import { mountLauncher } from '../companion/launcher';
import type { Action } from '../../shared/types';
import { observePageColorScheme, readPageColorScheme } from '../../shared/page-theme';
declare global { interface Window { __novaContentInstalled?: boolean; } }
installNovaDOM();
if (!window.__novaContentInstalled) {
  window.__novaContentInstalled = true;
  let port:chrome.runtime.Port|undefined;
  let active=false;
  let stopThemeObserver:(()=>void)|undefined;
  const mount=()=>{
    active=true;
    const companion=mountLauncher(async()=>{const result=await chrome.runtime.sendMessage({type:'nova-sidepanel'});if(result?.error)throw new Error(result.error);});
    if(!port){const connection=chrome.runtime.connect({name:'nova-page'});port=connection;connection.onMessage.addListener(event=>{if(active&&port===connection)companion.receive(event);});connection.onDisconnect.addListener(()=>{if(port!==connection)return;port=undefined;if(active)companion.receive({type:'error',message:'Nova disconnected. Click the extension icon to reconnect.'});});connection.postMessage({type:'nova-page-connect',scheme:readPageColorScheme()});}
    if(!stopThemeObserver)stopThemeObserver=observePageColorScheme(scheme=>{
      companion.receive({type:'page-theme',scheme});
      try{port?.postMessage({type:'nova-page-theme',scheme});}catch{}
    });
    return companion;
  };
  chrome.runtime.onMessage.addListener((message,sender,respond)=>{
    if(sender.id!==chrome.runtime.id)return;
    if(message.type==='nova-unmount'){active=false;stopThemeObserver?.();stopThemeObserver=undefined;window.__novaCompanion?.destroy();const old=port;port=undefined;old?.disconnect();respond({ok:true});return;}
    if(message.type==='nova-mount'){mount();respond({ok:true});return;}
    if(message.type==='nova-open'){mount().open();respond({ok:true});return;}
    if(message.type==='nova-dom'){
      if(!active){respond({error:'This Nova website session has ended.'});return;}
      if(message.method==='snapshot'){try{respond(window.__novaDOM!.snapshot(Array.isArray(message.action)?message.action:[]));}catch(error){respond({error:(error as Error).message});}return;}
      if(message.method==='verify'){try{respond(window.__novaDOM!.verify(message.action,message.expectedLength));}catch(error){respond({error:(error as Error).message});}return;}
      if(message.method==='native-input-focus'){try{respond({ok:window.__novaDOM!.inputFocused(message.action.ref)});}catch(error){respond({error:(error as Error).message});}return;}
      if(message.method==='native-append'){try{respond(window.__novaDOM!.prepare(message.action.ref,true));}catch(error){respond({error:(error as Error).message});}return;}
      if(message.method==='native-prepare'){
        void (async()=>{
          const action=message.action as Action;
          const point=action.ref?window.__novaDOM!.prepare(action.ref,false,action.kind==='media',action.kind==='press'):action.kind==='point'&&action.x!==null&&action.y!==null?{...window.__novaDOM!.point(action.x,action.y),editable:false,tag:'',type:''}:undefined;
          if(!point)throw new Error('A current observed target is required.');
          const destination=action.kind==='drag'?window.__novaDOM!.prepare(action.value||''):undefined;
          await window.__novaCompanion?.action(point.x,point.y,action.summary,action.kind);
          return {...point,...(destination?{destination}:{})};
        })().then(respond).catch(error=>respond({error:error.message}));return true;
      }
      if(message.method==='execute'){
        void (async()=>{
          const action=message.action as Action;
          let point={x:innerWidth*.55,y:innerHeight*.45};
          if(action.ref)point=window.__novaDOM!.prepare(action.ref,false,action.kind==='media',action.kind==='press');
          else if(action.x!==null&&action.y!==null)point={x:action.x,y:action.y};
          await window.__novaCompanion?.action(point.x,point.y,action.summary,action.kind);
          return window.__novaDOM!.execute(action);
        })().then(respond).catch(error=>respond({error:error.message}));return true;
      }
    }
  });
}
