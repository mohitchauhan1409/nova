import { recordingMode } from '../../shared/recording';
import { inputActionKinds, settleEditorInput } from '../../shared/paced-input';
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
  let inputCursor:number|undefined;
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
      if(message.method==='native-input-end'){if(inputCursor===message.cursorId){inputCursor=undefined;window.__novaCompanion?.clearCursor();}respond({ok:true});return;}
      if(message.method==='native-input-focus'){
        try{
          const point=inputCursor===message.cursorId?window.__novaDOM!.inputPosition(message.action.ref):undefined;
          if(point)window.__novaCompanion?.positionCursor?.(point.x,point.y);
          respond({ok:!!point});
        }catch(error){respond({error:(error as Error).message});}return;
      }
      if(message.method==='native-input-empty'){
        try{respond({ok:!!window.__novaDOM!.inputPosition(message.action.ref)&&window.__novaDOM!.verify({...message.action,kind:'clear'}).verification?.status==='verified'});}
        catch(error){respond({error:(error as Error).message});}return;
      }
      if(message.method==='native-input-correction'){
        void (async()=>{
          await settleEditorInput();
          if(!active||!Number.isInteger(message.cursorId)||inputCursor!==message.cursorId)throw new Error('Text entry stopped before editor inspection.');
          return {remove:window.__novaDOM!.prepareInputCorrection(message.action.ref,message.prefix,message.character)};
        })().then(respond).catch(error=>respond({error:error.message}));return true;
      }
      if(message.method==='native-input-start'){
        try{
          const point=window.__novaDOM!.startInput(message.action.ref,message.action.kind==='type');
          if(Number.isInteger(message.cursorId)&&inputCursor===message.cursorId)window.__novaCompanion?.positionCursor?.(point.x,point.y);
          respond({ok:true});
        }catch(error){respond({error:(error as Error).message});}return;
      }
      if(message.method==='native-prepare'){
        void (async()=>{
          const action=message.action as Action;
          let point=action.ref?window.__novaDOM!.prepare(action.ref,false,action.kind==='media',action.kind==='press',action.kind==='hover'):action.kind==='point'&&action.x!==null&&action.y!==null?{...window.__novaDOM!.point(action.x,action.y),editable:false,tag:'',type:''}:undefined;
          if(!point)throw new Error('A current observed target is required.');
          const destination=action.kind==='drag'?window.__novaDOM!.prepare(action.value||''):undefined;
          const hold=recordingMode&&inputActionKinds.has(action.kind)&&Number.isInteger(message.cursorId);
          inputCursor=hold?message.cursorId:undefined;
          await window.__novaCompanion?.action(point.x,point.y,action.summary,action.kind,hold);
          // Attaching Chrome's debugger or opening a panel can resize the page
          // during cursor presentation. Click the same ref's current bounds.
          if(action.ref && (inputActionKinds.has(action.kind)||action.kind==='clear')){
            point=window.__novaDOM!.prepare(action.ref);
            if(hold && inputCursor===message.cursorId)window.__novaCompanion?.positionCursor?.(point.x,point.y);
          }
          const uploadToken=action.kind==='upload'&&action.ref?window.__novaDOM!.prepareUpload(action.ref):undefined;
          return {...point,...(destination?{destination}:{}),...(uploadToken?{uploadToken}:{})};
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
