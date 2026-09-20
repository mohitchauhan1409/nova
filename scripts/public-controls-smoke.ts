// Public-site regression in a fresh, signed-out test browser. This test copy has
// YouTube host access predeclared to simulate the user's site permission. All
// extension JS is unchanged; the distributed manifest remains domain-by-domain.
import {chromium} from 'playwright';
import {cp,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import type {Action,Snapshot} from '../shared/types';
import {attachPanel} from './panel-test-driver';
import {websitePermission} from '../shared/browser-launch';
const temporary=await mkdtemp(path.join(os.tmpdir(),'nova-public-control-'));
const extension=path.join(temporary,'extension');await cp('web/dist-extension',extension,{recursive:true});
const manifest=JSON.parse(await readFile(path.join(extension,'manifest.json'),'utf8'));manifest.host_permissions.push(websitePermission('https://www.youtube.com/'));await writeFile(path.join(extension,'manifest.json'),JSON.stringify(manifest));
const context=await chromium.launchPersistentContext('',{channel:'chromium',headless:false,viewport:null,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--window-size=1400,1000','--mute-audio']});
const checks:string[]=[];
let inspectPanel:(()=>Promise<unknown>)|undefined;
try{
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');await worker.evaluate('globalThis.__name=value=>value');
  await worker.evaluate(()=>{
    const test=self as any;const NativeSocket=WebSocket;const requests=new Map<string,(value:any)=>void>();
    (self as any).WebSocket=class extends NativeSocket{
      constructor(url:string,protocols?:string|string[]){super(url,protocols);test.__socket=this;}
      send(data:any){if(typeof data==='string'){const m=JSON.parse(data);if(m.type==='driver-result'&&requests.has(m.id)){requests.get(m.id)!(m);requests.delete(m.id);return;}}super.send(data);}
    };
    test.__driver=(method:string,data:unknown,tabId:number)=>new Promise((resolve,reject)=>{const id=`test-${crypto.randomUUID()}`;const timer=setTimeout(()=>{requests.delete(id);reject(new Error('Driver timeout'));},14000);requests.set(id,value=>{clearTimeout(timer);resolve(value);});test.__socket.onmessage(new MessageEvent('message',{data:JSON.stringify({type:'driver',id,method,payload:{tabId,data}})}));});
  });
  const dashboard=await context.newPage();await dashboard.goto('http://127.0.0.1:5173/');await dashboard.getByText('Nova is online',{exact:true}).waitFor();
  const [site]=await Promise.all([context.waitForEvent('page'),dashboard.locator('.site-card').filter({has:dashboard.getByRole('heading',{name:'YouTube',exact:true})}).getByRole('button',{name:'Open with Nova',exact:false}).click()]);
  await site.waitForURL('https://www.youtube.com/**',{timeout:30000,waitUntil:'domcontentloaded'});await site.getByRole('button',{name:'Open Nova side panel',exact:true}).waitFor({timeout:30000});
  const tabId=await worker.evaluate(async()=>(await chrome.tabs.query({})).find(t=>t.url?.startsWith('https://www.youtube.com/'))!.id!);
  const driver=async(method:string,data?:Action)=>{const r=await worker.evaluate(({method,data,tabId})=>(self as any).__driver(method,data,tabId),{method,data,tabId});if(r.error)throw new Error(r.error);return r.result;};
  const snapshot=async()=>driver('snapshot') as Promise<Snapshot>;
  const execute=(kind:Action['kind'],ref:string|null,value:string|null=null,url:string|null=null)=>driver('execute',{kind,ref,value,url,x:null,y:null,summary:'Public playback test',risk:'read'});
  let snap=await snapshot();if(snap.blocked)throw new Error(snap.blocked);
  const reject=snap.elements.find(e=>/reject all/i.test(e.name));if(reject){await execute('click',reject.ref);snap=await snapshot();}
  let search=snap.elements.find(e=>e.tag==='input'&&/search/i.test(e.name));
  for(let i=0;i<30&&!search;i++){await site.waitForTimeout(150);snap=await snapshot();search=snap.elements.find(e=>e.tag==='input'&&/search/i.test(e.name));}
  assert.ok(search,'YouTube did not expose a search input');await execute('search',search.ref,'Me at the zoo');
  await site.waitForURL('**/results?**',{timeout:20000,waitUntil:'domcontentloaded'});checks.push('Native search input and Enter navigate YouTube to real search results');
  let result:string|undefined;
  for(let i=0;i<50&&!result;i++){snap=await snapshot();if(snap.blocked)throw new Error(snap.blocked);result=snap.elements.find(e=>e.href?.includes('/watch?')&&/me at the zoo/i.test(e.name))?.href;if(!result)await site.waitForTimeout(150);}
  assert.ok(result,'No matching video was observed');await execute('navigate',null,null,result);
  await site.waitForURL('**/watch?**',{timeout:20000,waitUntil:'domcontentloaded'});await site.waitForFunction(()=>!!document.querySelector('video')&&Number.isFinite(document.querySelector('video')!.duration),undefined,{timeout:30000});
  snap=await snapshot();assert.ok(!snap.blocked);let video=snap.elements.find(e=>e.tag==='video');assert.ok(video,'YouTube did not expose the video player');
  await site.getByRole('button',{name:'Open Nova side panel',exact:true}).click();
  const cdp=await context.newCDPSession(site);let panelTarget='';
  for(let i=0;i<100&&!panelTarget;i++){panelTarget=(await cdp.send('Target.getTargets')).targetInfos.find(t=>t.url.includes('/panel.html?tabId='))?.targetId||'';if(!panelTarget)await site.waitForTimeout(70);}
  const panel=await attachPanel(cdp,panelTarget);await panel.waitFor("document.querySelector('textarea')&&!document.querySelector('textarea').disabled");
  inspectPanel=()=>panel.evaluate(`({text:document.body.innerText,draft:document.querySelector('textarea')?.value,focused:document.activeElement?.tagName,session:window.__testSession&&{status:window.__testSession.status,messages:window.__testSession.messages,traces:window.__testSession.traces}})`);
  await panel.evaluate(`(()=>{const port=chrome.runtime.connect({name:'nova-panel'});window.__testPort=port;port.onMessage.addListener(m=>{if(m.type==='session')window.__testSession=m.session;});port.postMessage({type:'nova-panel-connect'});})()`);
  const command=async(text:string,expected:string)=>{const count=await panel.evaluate<number>("document.querySelectorAll('.np-message.assistant').length");await panel.fill('textarea',text);await panel.waitFor(`document.querySelector('textarea').value===${JSON.stringify(text)}&&!document.querySelector('[aria-label="Send message"]').disabled`);await panel.click('[aria-label="Send message"]');await panel.waitFor(`document.querySelectorAll('.np-message.assistant').length>${count}&&[...document.querySelectorAll('.np-message.assistant')].at(-1).innerText.includes(${JSON.stringify(expected)})`);};
  await command('pause','Playback is paused.');assert.equal(await site.locator('video').first().evaluate((el:HTMLVideoElement)=>el.paused),true);checks.push('Typing bare pause in the Nova panel pauses the actual YouTube video and confirms its state');
  await command('play','Playback is active.');assert.equal(await site.locator('video').first().evaluate((el:HTMLVideoElement)=>el.paused),false);checks.push('Typing play in the Nova panel starts the actual YouTube video');
  await command('pause','Playback is paused.');const before=await site.locator('video').first().evaluate((el:HTMLVideoElement)=>el.currentTime);
  await command('skip forward 5 seconds','Playback position is');const after=await site.locator('video').first().evaluate((el:HTMLVideoElement)=>el.currentTime);assert.ok(after-before>4);checks.push('Typing skip forward 5 seconds moves actual YouTube playback by five seconds');
  await panel.waitFor("window.__testSession?.messages.filter(m=>m.role==='user').length===4");
  assert.equal(await panel.evaluate('window.__testSession.usage?.calls || 0'),0);checks.push('Unambiguous playback commands complete without an OpenAI request');
  const screenshot=await driver('screenshot');assert.ok(screenshot.length>1000);checks.push('Visual capture succeeds on YouTube without activeTab/all_urls errors');
  await site.screenshot({path:'BE/data/youtube-controls.png'});
  await panel.evaluate('window.__testPort.disconnect()');await panel.disconnect();
  const report={at:new Date().toISOString(),ok:true,checks,url:site.url(),permissionSetup:'Disposable extension copy with YouTube host permission predeclared; unchanged JS'};await writeFile('BE/data/public-controls-report.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify(report,null,2));
}catch(error){const report={at:new Date().toISOString(),ok:false,checks,error:String(error),panel:await inspectPanel?.().catch(()=>undefined),pages:context.pages().map(page=>page.url()),permissionSetup:'Disposable extension copy with YouTube host permission predeclared; unchanged JS'};await writeFile('BE/data/public-controls-report.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify(report,null,2));process.exitCode=1;}
finally{await context.close();await rm(temporary,{recursive:true,force:true});}
