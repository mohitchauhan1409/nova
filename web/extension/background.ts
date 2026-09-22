import { recordingMode, type RecordingClick } from '../../shared/recording';
import { pacedInputCapability, inputActionKinds } from '../../shared/paced-input';
import type { Action, Session, ServerEvent } from '../../shared/types';
import { BrowserControl } from './browser-control';
import { isNovaDashboard, websitePermission, type TabLaunch } from '../../shared/browser-launch';
import { isPageColorScheme, type PageColorScheme } from '../../shared/page-theme';
const pendingMounts = new Set<number>();
const tabSpeeds = new Map<number, 'intelligent' | 'fast'>();
const mountGeneration = new Map<number, number>();
const attachMessage = (tab: chrome.tabs.Tab) => ({ type: 'attach', tabId: tab.id, url: tab.url, title: tab.title || '', speed: tabSpeeds.get(tab.id!) || 'intelligent' });
const ports = new Set<chrome.runtime.Port>();
const portTabs = new Map<chrome.runtime.Port, number>();
const visiblePanels = new Set<chrome.runtime.Port>();
function panelVisible(tabId: number) {
  return [...visiblePanels].some(port => portTabs.get(port) === tabId);
}
function announcePanelVisibility(tabId: number) {
  for (const port of ports) {
    if (port.name === 'nova-page' && portTabs.get(port) === tabId) {
      try { port.postMessage({type:'panel-visibility',visible:panelVisible(tabId)}); } catch {}
    }
  }
}
let voiceOwner: chrome.runtime.Port | undefined;
let microphoneSetupTab: number | undefined;
let microphoneWebsiteTab: number | undefined;
void chrome.sidePanel.setOptions({ enabled: false });
async function preparePanel(tabId: number) {
  const panelPath = `panel.html?tabId=${tabId}`;
  const current = await chrome.sidePanel.getOptions({ tabId });
  if (!current.enabled || current.path !== panelPath) await chrome.sidePanel.setOptions({ tabId, path: panelPath, enabled: true });
}
function panelTab(sender?: chrome.runtime.MessageSender) {
  try { const url = new URL(sender?.url || ''); if (url.protocol !== 'chrome-extension:' || url.hostname !== chrome.runtime.id || url.pathname !== '/panel.html') return; const id = Number(url.searchParams.get('tabId')); if (Number.isInteger(id) && id > 0) return id; } catch {}
}
let socket: WebSocket | undefined; let authenticated = false; let currentSession: Session | undefined; let currentTab: number | undefined; let heartbeat: ReturnType<typeof setInterval> | undefined;
let currentPagePort: chrome.runtime.Port | undefined;
let currentPageScheme: PageColorScheme | undefined;
const broadcast = (event: unknown) => { for (const port of ports) { if (portTabs.get(port)!==currentTab) continue; try { port.postMessage(event); } catch { ports.delete(port); portTabs.delete(port); } } };
function updatePageScheme(scheme: unknown) {
  if (!isPageColorScheme(scheme) || scheme === currentPageScheme) return;
  currentPageScheme = scheme;
  if (currentSession) currentSession = { ...currentSession, pageColorScheme: scheme };
  broadcast({ type: 'page-theme', scheme });
}
function stopPanelVoice() {
  const hadOwner = !!voiceOwner;
  try { voiceOwner?.postMessage({ type: 'voice', event: 'off' }); } catch {}
  voiceOwner=undefined;
  if (authenticated && hadOwner) relay({ type: 'voice-stop' });
}
const relay = (message: unknown) => { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message)); else broadcast({type:'error',message:'Nova backend is disconnected. Reconnect using your pairing token.'}); };
const recordClick = (event:RecordingClick) => { if(recordingMode && currentSession && authenticated) relay({type:'recording-click',sessionId:currentSession.id,event}); };
const control = new BrowserControl(() => currentTab, () => { if(currentSession)relay({type:'stop',sessionId:currentSession.id});broadcast({type:'control-changed'});broadcast({type:'error',message:'Browser control disconnected. Resume it in Nova before continuing.'}); }, recordClick);
chrome.permissions.onRemoved.addListener(permissions => { if(permissions.origins?.length&&currentTab!==undefined){detachCurrent();return;}void control.status().then(status => { if(!status.granted){if(currentSession)relay({type:'stop',sessionId:currentSession.id});void control.detach(currentTab);}broadcast({type:'control-changed'}); }); });
function detachCurrent(stop = true) {
  const tabId = currentTab;
  if (stop && currentSession && authenticated) relay({type:'stop',sessionId:currentSession.id});
  stopPanelVoice();
  broadcast({ type: 'sessions', sessions: [] });
  currentTab=undefined;currentSession=undefined;
  currentPagePort=undefined;currentPageScheme=undefined;
  if (tabId !== undefined) {
    void control.detach(tabId);
    pendingMounts.delete(tabId);tabSpeeds.delete(tabId);
    mountGeneration.set(tabId,(mountGeneration.get(tabId)||0)+1);
    void chrome.tabs.sendMessage(tabId,{type:'nova-unmount'}).catch(()=>{});
    void chrome.sidePanel.setOptions({tabId,enabled:false}).catch(()=>{});
  }
}
async function inject(tabId: number) {
  const generation = mountGeneration.get(tabId) || 0;
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url || !/^https?:/.test(tab.url)) throw new Error('Nova can attach to HTTP and HTTPS website tabs.');
  await preparePanel(tabId);
  await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  if ((mountGeneration.get(tabId)||0)!==generation) return;
  await chrome.tabs.sendMessage(tabId, { type: 'nova-mount', tabId });
}
async function driver(method: string, payload: { tabId: number; data?: Action }) {
  const token = control.captureInputToken();
  const checkInput = () => { if(method==='execute')control.assertInputToken(token); };
  const {tabId, data} = payload; const tab = await chrome.tabs.get(tabId);
  checkInput();
  if (tabId !== currentTab) throw new Error('This is not the attached website tab.');
  if (!tab.url || !/^https?:/.test(tab.url)) throw new Error('This tab is no longer a supported website.');
  if(method==='focus'){await chrome.tabs.update(tabId,{active:true});await chrome.windows.update(tab.windowId,{focused:true});return {ok:true};}
  if (method === 'screenshot') return control.screenshot(tabId);
  if (method === 'execute' && data?.kind === 'navigate') { const url=new URL(data.url||''); if (!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('Invalid URL'); await chrome.tabs.update(tabId,{url:url.href}); return {ok:true}; }
  if (method === 'execute' && data?.kind === 'back') { await chrome.tabs.goBack(tabId); return {ok:true}; }
  if (method === 'execute' && data?.kind === 'forward') {await chrome.tabs.goForward(tabId);return {ok:true};}
  if (method === 'execute' && data?.kind === 'reload') {await chrome.tabs.reload(tabId);return {ok:true};}
  if(method==='execute'&&data?.kind==='zoom'){
    const current=await chrome.tabs.getZoom(tabId);checkInput();const factor=data.value==='in'?current+.2:data.value==='out'?current-.2:data.value==='reset'?1:Number(data.value)/100;
    if(!Number.isFinite(factor)||factor<.5||factor>2)throw new Error('Choose a zoom from 50% to 200%.');
    // Chrome defaults to shared host zoom. Keep Nova's adjustment in its tab,
    // so an ordinary visit or the local dashboard does not change with it.
    await chrome.tabs.setZoomSettings(tabId,{mode:'automatic',scope:'per-tab'});checkInput();
    await chrome.tabs.setZoom(tabId,factor);const actual=await chrome.tabs.getZoom(tabId);return {ok:true,verification:{status:Math.abs(actual-factor)<.01?'verified':'unverified',detail:`Browser zoom is ${Math.round(actual*100)}%.`}};
  }
  if (method === 'execute' && data?.kind === 'wait') {await new Promise(resolve=>setTimeout(resolve,600));return {ok:true};}
  if (tab.status === 'loading') await new Promise<void>(resolve=>{const listener=(id:number,info:chrome.tabs.OnUpdatedInfo)=>{if(id===tabId&&info.status==='complete'){clearTimeout(timer);chrome.tabs.onUpdated.removeListener(listener);resolve();}};const timer=setTimeout(()=>{chrome.tabs.onUpdated.removeListener(listener);resolve();},5000);chrome.tabs.onUpdated.addListener(listener);});
  checkInput();
  if (method === 'execute' && data && control.supports(data)) { const status=await control.status();checkInput();if(status.granted)return control.execute(tabId,data,token); }
  if (recordingMode && method === 'execute' && data && inputActionKinds.has(data.kind)) throw new Error('Recording text entry requires browser-control permission. No text was inserted.');
  let result;
  try { result=await chrome.tabs.sendMessage(tabId,{type:'nova-dom',method,action:data}); }
  catch(error) { if(method==='execute')throw new Error('The website connection changed during this action. Inspect the page before retrying.');if(tabId!==currentTab)throw new Error('This website session has ended.');await inject(tabId); result=await chrome.tabs.sendMessage(tabId,{type:'nova-dom',method,action:data}); }
  if(result?.error)throw new Error(result.error);
  if(method==='snapshot'&&result){result.viewport.zoom=await chrome.tabs.getZoom(tabId);result.capabilities=[...(result.capabilities||[]),(await control.status()).granted?'trusted-browser-input':'basic-dom-input',...(recordingMode?[pacedInputCapability]:[])];}
  return result;
}
function connect(token: string, port: chrome.runtime.Port) {
  if(socket?.readyState===WebSocket.CONNECTING)return;
  if (socket?.readyState===WebSocket.OPEN && authenticated) { port.postMessage({type:'ready',role:'extension',attached:!!currentSession}); if(currentSession&&portTabs.get(port)===currentTab)port.postMessage({type:'session',session:currentSession}); return; }
  socket?.close(); clearInterval(heartbeat); authenticated=false; currentSession=undefined;
  const ws=new WebSocket('ws://127.0.0.1:8787/socket'); socket=ws;
  ws.onopen=()=>ws.send(JSON.stringify({type:'auth',token,role:'extension'}));
  ws.onmessage=event=>{const message=JSON.parse(event.data) as ServerEvent;
    if(message.type==='ready'){authenticated=true; heartbeat=setInterval(()=>relay({type:'ping'}),20000);if(currentTab)void chrome.tabs.get(currentTab).then(tab=>relay(attachMessage(tab)));broadcast({...message,attached:!!currentTab});return;}
    if(message.type==='session'){if(message.session.tabId!==currentTab)return;if(message.session.status!=='running')control.cancelInput();currentSession={...message.session,pageColorScheme:currentPageScheme};message.session=currentSession;}
    if(message.type==='sessions'&&currentSession&&!message.sessions.some(s=>s.id===currentSession?.id))detachCurrent(false);
    // Stop is reflected locally before sending it. A late server acknowledgement
    // must not shut down a new voice conversation that has since started.
    if(message.type==='voice'){if(message.event==='off')return;try{voiceOwner?.postMessage(message);}catch{}return;}
    if(message.type==='driver'){void driver(message.method,message.payload as {tabId:number;data?:Action}).then(result=>relay({type:'driver-result',id:message.id,result})).catch(error=>relay({type:'driver-result',id:message.id,error:error.message}));return;}
    broadcast(message);
  };
  ws.onerror=()=>broadcast({type:'error',message:'Cannot reach Nova. Start the local backend on port 8787.'});
  ws.onclose=()=>{if(socket!==ws)return;authenticated=false;control.cancelInput();currentSession=undefined;clearInterval(heartbeat);broadcast({type:'panel-state',state:'offline',message:'Nova backend disconnected. Reconnect to continue.'});};
}
chrome.runtime.onConnect.addListener(port => {
  if (!['nova-panel','nova-page'].includes(port.name) || port.sender?.id !== chrome.runtime.id) return;
  if (port.name === 'nova-page' && port.sender.frameId !== 0) return;
  const tabId = port.name === 'nova-page' ? port.sender.tab?.id : panelTab(port.sender);
  if (!tabId) return;
  ports.add(port); portTabs.set(port, tabId);
  port.onMessage.addListener(message => {
    if (message.type === 'nova-panel-visibility' && port.name === 'nova-panel' && typeof message.visible === 'boolean') {
      if (message.visible) visiblePanels.add(port); else visiblePanels.delete(port);
      announcePanelVisibility(tabId);
      return;
    }
    if (message.type === 'nova-panel-connect' && port.name === 'nova-panel') {
      if (tabId !== currentTab) { port.postMessage({type:'panel-state',state:'inactive'}); return; }
      // Available before backend pairing or any agent task/snapshot.
      if (currentPageScheme) port.postMessage({type:'page-theme',scheme:currentPageScheme});
      void (async () => {
        if (typeof message.token === 'string' && message.token.length >= 32 && message.token.length <= 512) await chrome.storage.local.set({novaToken:message.token});
        const data = await chrome.storage.local.get('novaToken');
        if (typeof data.novaToken !== 'string') { port.postMessage({type:'panel-state',state:'unpaired'}); return; }
        connect(data.novaToken,port);
      })().catch(error => port.postMessage({type:'error',message:error.message}));
      return;
    }
    if (message.type === 'nova-page-connect' && port.name === 'nova-page' && port.sender?.tab) {
      port.postMessage({type:'panel-visibility',visible:panelVisible(tabId)});
      const tab = port.sender.tab;
      const changedTab = currentTab !== tabId;
      if (changedTab) { detachCurrent(); currentTab=tabId; }
      currentPagePort=port;
      updatePageScheme(message.scheme);
      if (changedTab && authenticated) { relay(attachMessage(tab)); return; }
      void chrome.storage.local.get('novaToken').then(data => {
        if (typeof data.novaToken !== 'string') { broadcast({type:'panel-state',state:'unpaired'}); return; }
        if (authenticated && currentSession) { port.postMessage({type:'session',session:currentSession}); return; }
        if (!authenticated) connect(data.novaToken,port);
      });
      return;
    }
    if (portTabs.get(port) !== currentTab) return;
    if (message.type === 'nova-page-theme' && port === currentPagePort) { updatePageScheme(message.scheme); return; }
    if (message.type === 'nova-new-chat' && port.name === 'nova-panel') {
      control.cancelInput();
      if(currentSession)relay({type:'stop',sessionId:currentSession.id});
      stopPanelVoice(); currentSession=undefined;
      void chrome.tabs.get(tabId).then(tab => relay(attachMessage(tab)));
      return;
    }
    if (message.type !== 'nova-relay' || port.name !== 'nova-panel') return;
    const data=message.data;
    if (!data || !['command','answer','stop','interrupt','approve','voice-start','voice-stop','audio'].includes(data.type)) return;
    if ('sessionId' in data && data.sessionId !== currentSession?.id) return;
    if(data.type==='stop'||data.type==='interrupt')control.cancelInput();
    if(data.type==='voice-start'){stopPanelVoice();voiceOwner=port;}
    if(['audio','voice-stop'].includes(data.type) && voiceOwner!==port)return;
    if(data.type==='voice-stop')voiceOwner=undefined;
    relay(data);
  });
  port.onDisconnect.addListener(() => { ports.delete(port);portTabs.delete(port);visiblePanels.delete(port);if(port.name==='nova-panel')announcePanelVisibility(tabId);if(voiceOwner===port)stopPanelVoice(); });
});
chrome.action.onClicked.addListener(tab => {
  if (!tab.id || !tab.url || !/^https?:/.test(tab.url)) return;
  void preparePanel(tab.id).then(() => chrome.sidePanel.open({tabId:tab.id!})).catch(()=>{});
  void inject(tab.id).catch(()=>{});
});
chrome.tabs.onActivated.addListener(({tabId}) => { if (tabId!==currentTab && voiceOwner) stopPanelVoice(); });
const panelEvents = chrome.sidePanel as typeof chrome.sidePanel & { onClosed?: { addListener(listener: (info: {tabId?:number}) => void): void } };
panelEvents.onClosed?.addListener(info => {
  const tabId=info.tabId ?? currentTab;
  if(tabId!==undefined){for(const port of visiblePanels)if(portTabs.get(port)===tabId)visiblePanels.delete(port);announcePanelVisibility(tabId);}
  if (voiceOwner && (info.tabId===undefined || info.tabId===currentTab)) stopPanelVoice();
});
chrome.tabs.onUpdated.addListener((id,info)=>{if((id===currentTab||pendingMounts.has(id))&&info.status==='complete')void inject(id).then(()=>pendingMounts.delete(id)).catch(error=>broadcast({type:'error',message:`Could not add Nova to the website: ${error.message}. Click the Nova extension icon on the destination website.`}));});
chrome.tabs.onRemoved.addListener(id=>{pendingMounts.delete(id);tabSpeeds.delete(id);if(id===currentTab){detachCurrent();broadcast({type:'sessions',sessions:[]});}mountGeneration.delete(id);});
async function launchDetails(id: unknown, sender: chrome.runtime.MessageSender): Promise<TabLaunch> {
  if (typeof id !== 'string' || !/^[\da-f-]{36}$/.test(id) || sender.frameId !== 0 || sender.url !== chrome.runtime.getURL(`launch.html#${id}`) || !sender.tab?.id) throw new Error('This launch request is not valid. Open the website from your Nova dashboard.');
  const key = `novaLaunch:${id}`;
  const launch = (await chrome.storage.session.get(key))[key] as TabLaunch | undefined;
  if (!launch || launch.windowId !== sender.tab.windowId || Date.now() - launch.createdAt > 600000) throw new Error('This launch expired. Open the website again from your Nova dashboard.');
  return launch;
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(sender.id!==chrome.runtime.id)return;
  if (message.type === 'nova-control-status' || message.type === 'nova-control-resume') {
    if(panelTab(sender)===undefined||panelTab(sender)!==currentTab){respond({error:'Open Nova on its attached website.'});return;}
    void (async()=>{if(message.type==='nova-control-resume')await control.resume();return control.status();})().then(respond).catch(error=>respond({error:error.message}));return true;
  }
  if (message.type === 'nova-microphone-open' && panelTab(sender) !== undefined && panelTab(sender) === currentTab) {
    void (async () => {
      const website = await chrome.tabs.get(currentTab!);
      microphoneWebsiteTab = website.id;
      if (microphoneSetupTab !== undefined) {
        try {
          const existing = await chrome.tabs.get(microphoneSetupTab);
          if (existing.url === chrome.runtime.getURL('microphone.html')) { await chrome.tabs.update(existing.id!, { active: true }); await chrome.windows.update(existing.windowId, { focused: true }); return {ok:true}; }
        } catch { /* A closed setup tab can be recreated. */ }
      }
      const tab = await chrome.tabs.create({ windowId: website.windowId, index: website.index + 1, active: true, url: chrome.runtime.getURL('microphone.html') });
      microphoneSetupTab = tab.id;
      return {ok:true};
    })().then(respond).catch(error => respond({error:error.message})); return true;
  }
  if (['nova-microphone-return','nova-microphone-settings'].includes(message.type)) {
    if (sender.tab?.id !== microphoneSetupTab || sender.url !== chrome.runtime.getURL('microphone.html') || sender.frameId !== 0) { respond({error:'Open microphone setup from Nova’s side panel.'}); return; }
    void (async () => {
      if (message.type === 'nova-microphone-settings') { await chrome.tabs.create({windowId:sender.tab!.windowId,url:'chrome://settings/content/microphone'}); return {ok:true}; }
      if (microphoneWebsiteTab === undefined || microphoneWebsiteTab !== currentTab) throw new Error('The original Nova session ended. Open Nova in your current website tab.');
      const tab = await chrome.tabs.update(microphoneWebsiteTab, {active:true});
      if (!tab) throw new Error('Return to your website tab and open Nova.');
      await chrome.windows.update(tab.windowId, {focused:true});
      return {ok:true};
    })().then(result => { respond(result); if (message.type === 'nova-microphone-return') { const tabId = microphoneSetupTab; microphoneSetupTab=undefined;microphoneWebsiteTab=undefined;if(tabId!==undefined)void chrome.tabs.remove(tabId).catch(()=>{}); } }).catch(error => respond({error:error.message})); return true;
  }
  if (message.type === 'nova-dashboard-ping' || message.type === 'nova-dashboard-launch') {
    if (sender.frameId !== 0 || !sender.tab?.id || !isNovaDashboard(sender.url || '') || !isNovaDashboard(sender.tab.url || '')) { respond({error:'Only the local Nova dashboard can open a website tab.'}); return; }
    if (message.type === 'nova-dashboard-ping') { respond({ok:true,version:chrome.runtime.getManifest().version}); return; }
    void (async () => {
      if (typeof message.url !== 'string' || message.url.length > 4096 || typeof message.token !== 'string' || message.token.length < 32 || message.token.length > 512 || !['intelligent','fast'].includes(message.speed)) throw new Error('Invalid website launch request.');
      websitePermission(message.url);
      await chrome.storage.local.set({novaToken:message.token});
      const id = crypto.randomUUID();
      const launch: TabLaunch = {url:message.url,speed:message.speed,windowId:sender.tab!.windowId,createdAt:Date.now()};
      const key = `novaLaunch:${id}`;
      const stored = await chrome.storage.session.get(null);
      const expired = Object.keys(stored).filter(key=>key.startsWith('novaLaunch:')&&Date.now()-((stored[key] as Partial<TabLaunch>)?.createdAt || 0)>600000);
      if (expired.length) await chrome.storage.session.remove(expired);
      await chrome.storage.session.set({[key]:launch});
      try {
        const tab = await chrome.tabs.create({windowId:sender.tab!.windowId,index:sender.tab!.index+1,active:true,url:chrome.runtime.getURL(`launch.html#${id}`)});
        return {ok:true,tabId:tab.id};
      } catch (error) { await chrome.storage.session.remove(key); throw error; }
    })().then(respond).catch(error=>respond({error:error.message}));return true;
  }
  if (message.type === 'nova-launch-details' || message.type === 'nova-launch-continue') {
    void (async () => {
      const launch = await launchDetails(message.id,sender);
      if (message.type === 'nova-launch-details') return {launch};
      if (!await chrome.permissions.contains({origins:[websitePermission(launch.url)]})) throw new Error('Enable Nova on this website before continuing.');
      const tabId = sender.tab!.id!;
      tabSpeeds.set(tabId,launch.speed);pendingMounts.add(tabId);
      await chrome.tabs.update(tabId,{url:launch.url,active:true});
      await chrome.storage.session.remove(`novaLaunch:${message.id}`);
      return {ok:true};
    })().then(respond).catch(error=>respond({error:error.message}));return true;
  }
  if (message.type === 'nova-recording-click' && recordingMode && currentTab !== undefined &&
      (panelTab(sender) === currentTab || (sender.tab?.id === currentTab && sender.frameId === 0))) {
    if (Number.isFinite(message.at) && Math.abs(Date.now()-message.at)<10000 && typeof message.target==='string')
      recordClick({at:message.at,actor:'operator',button:'left',target:message.target.slice(0,120)});
    respond({ok:true});return;
  }
  if (message.type==='nova-sidepanel' && sender.tab?.id===currentTab && sender.frameId===0) {
    // Call directly in the content-script click's message handler. Awaiting
    // unrelated work here would lose Chrome's required user gesture.
    void chrome.sidePanel.open({tabId:currentTab!}).then(()=>respond({ok:true})).catch(error=>respond({error:error.message}));return true;
  }
  if (message.type==='nova-panel-close' && panelTab(sender)===currentTab) {
    stopPanelVoice();
    const api=chrome.sidePanel as typeof chrome.sidePanel & { close?: (options:{tabId:number})=>Promise<void> };
    const tabId=currentTab!;
    const close=api.close ? api.close({tabId}) : chrome.sidePanel.setOptions({tabId,enabled:false}).then(()=>{if(currentTab===tabId)return preparePanel(tabId);});
    void close.then(()=>respond({ok:true})).catch(error=>respond({error:error.message}));return true;
  }
});
