// Uses the packaged extension in a disposable Chromium profile. No user browser,
// provider request, or real-world transaction is used by these action fixtures.
import {chromium} from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import type {Action,Snapshot} from '../shared/types';
import {attachPanel} from './panel-test-driver';
const extension=path.resolve('web/dist-extension');
const context=await chromium.launchPersistentContext('',{channel:'chromium',headless:process.env.NOVA_TEST_HEADLESS==='1',viewport:null,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--window-size=1400,1000']});
const checks:string[]=[];
try {
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  // tsx preserves function/class names with a helper when serializing test callbacks.
  await worker.evaluate('globalThis.__name = value => value');
  await worker.evaluate(()=>{
    const test=self as any;const NativeWebSocket=WebSocket;const requests=new Map<string,(value:any)=>void>();
    class TestSocket extends NativeWebSocket {
      constructor(url:string,protocols?:string|string[]){super(url,protocols);test.__socket=this;}
      send(data:string|ArrayBufferLike|Blob|ArrayBufferView){
        if(typeof data==='string'){const m=JSON.parse(data);if(m.type==='driver-result'&&requests.has(m.id)){requests.get(m.id)!(m);requests.delete(m.id);return;}}
        super.send(data);
      }
    }
    (self as any).WebSocket=TestSocket;
    test.__driver=(method:string,data:unknown,tabId:number)=>new Promise((resolve,reject)=>{
      const id=`fixture-${crypto.randomUUID()}`;const timeout=setTimeout(()=>{requests.delete(id);reject(new Error('Fixture driver timeout'));},14000);
      requests.set(id,result=>{clearTimeout(timeout);resolve(result);});
      test.__socket.onmessage(new MessageEvent('message',{data:JSON.stringify({type:'driver',id,method,payload:{tabId,data}})}));
    });
  });
  const dashboard=await context.newPage();await dashboard.goto('http://127.0.0.1:5173/');await dashboard.getByText('Nova is online',{exact:true}).waitFor();
  const [site]=await Promise.all([context.waitForEvent('page'),dashboard.getByRole('button',{name:'Try the demo',exact:true}).click()]);
  await site.waitForURL('http://127.0.0.1:8787/demo/shop');await site.getByRole('button',{name:'Open Nova side panel',exact:true}).click();
  const tabId=await worker.evaluate(async()=> (await chrome.tabs.query({})).find(t=>t.url?.endsWith('/demo/shop'))!.id!);
  const cdp=await context.newCDPSession(site);let target='';
  for(let i=0;i<100&&!target;i++){target=(await cdp.send('Target.getTargets')).targetInfos.find(t=>t.url.includes('/panel.html?tabId='))?.targetId||'';if(!target)await site.waitForTimeout(70);}
  const panel=await attachPanel(cdp,target);await panel.waitFor("document.querySelector('textarea')&&!document.querySelector('textarea').disabled");
  await panel.waitFor("document.querySelector('.np-context strong').textContent==='Nova Demo Shop'");
  assert.match(await panel.evaluate("document.querySelector('.np-welcome h1').textContent"),/Nova Demo Shop/);
  assert.match(await panel.evaluate("document.querySelector('.np-app').style.getPropertyValue('--site-accent')"),/^#[0-9a-f]{6}$/i);
  checks.push('The actual attached site profile supplies the panel identity and accent');
  const request=async(method:string,data?:unknown,targetTab=tabId)=>worker.evaluate(({method,data,tabId})=>(self as any).__driver(method,data,tabId),{method,data,tabId:targetTab});
  const driver=async(method:string,data?:unknown)=>{const reply=await request(method,data);if(reply.error)throw new Error(reply.error);return reply.result;};
  const snapshot=async()=>driver('snapshot') as Promise<Snapshot>;
  const act=async(kind:Action['kind'],name?:string,value:string|null=null)=>{
    const snap=await snapshot();const ref=name?snap.elements.find(e=>e.name===name)?.ref:null;
    if(name)assert.ok(ref,`Missing fixture target: ${name}`);
    return driver('execute',{kind,ref:ref||null,value,url:null,x:null,y:null,risk:'read',summary:`Fixture ${kind}`});
  };
  assert.equal(await worker.evaluate(()=>chrome.permissions.contains({origins:['<all_urls>']})),false);
  const originalError=await worker.evaluate(async()=>{try{await chrome.tabs.captureVisibleTab();return '';}catch(e){return String(e);}});
  assert.match(originalError,/activeTab|all_urls/);
  const screenshot=await driver('screenshot');assert.ok(typeof screenshot==='string'&&screenshot.length>1000);
  checks.push('Reproduced the exact activeTab/all_urls screenshot failure, then captured successfully through Nova browser control without all-site access');

  await site.evaluate(()=>{
    const root=document.createElement('main');root.id='control-fixture';root.style.cssText='position:relative;z-index:1;background:white;color:black;padding:20px;';
    root.innerHTML='<h1>Trusted action fixtures</h1><p id="fixture-status">Ready</p><button id="trusted">Trusted click</button><button id="double">Double click</button><button id="hover">Hover details</button><label>Query <input id="query" aria-label="Search fixture"></label><label><input id="check" type="checkbox">Enabled option</label><button id="ignored">Ignored control</button><div id="shadow-host"></div><audio id="media" aria-label="Fixture player" controls></audio><input aria-label="Password" type="password"><div id="nested" class="scroll-area" style="height:80px;overflow:auto"><div style="height:500px">Nested scroll area</div></div>';
    for(const el of [...document.body.children])if(!el.hasAttribute('data-nova-root'))(el as HTMLElement).style.display='none';document.body.prepend(root);
    const status=document.getElementById('fixture-status')!;const trusted=document.getElementById('trusted')!;
    trusted.addEventListener('click',e=>{if(e.isTrusted){document.body.dataset.trustedCount=String(Number(document.body.dataset.trustedCount||'0')+1);status.textContent='Trusted click completed';}});
    document.getElementById('double')!.addEventListener('dblclick',e=>{if(e.isTrusted)document.body.dataset.double='yes';});
    document.getElementById('hover')!.addEventListener('mouseover',e=>{if(e.isTrusted)document.body.dataset.hover='yes';});
    document.getElementById('query')!.addEventListener('input',e=>{if(e.isTrusted)document.body.dataset.input='yes';});
    document.getElementById('query')!.addEventListener('keydown',e=>{if(e.isTrusted&&(e as KeyboardEvent).key==='Enter')document.body.dataset.searched=(e.target as HTMLInputElement).value;});
    const shadow=document.getElementById('shadow-host')!.attachShadow({mode:'open'});shadow.innerHTML='<button>Shadow action</button>';shadow.querySelector('button')!.addEventListener('click',e=>{if(e.isTrusted)document.body.dataset.shadow='yes';});
  });
  await act('click','Trusted click');assert.equal(await site.evaluate(()=>document.body.dataset.trustedCount),'1');checks.push('A control that ignores synthetic clicks receives exactly one trusted click');
  await act('fill','Search fixture','adapter');assert.equal(await site.locator('#query').inputValue(),'adapter');assert.equal(await site.evaluate(()=>document.body.dataset.input),'yes');
  await act('type','Search fixture',' cable');assert.equal(await site.locator('#query').inputValue(),'adapter cable');
  await act('search','Search fixture','monitor');assert.equal(await site.evaluate(()=>document.body.dataset.searched),'monitor');
  await act('clear','Search fixture');assert.equal(await site.locator('#query').inputValue(),'');checks.push('Trusted fill, append, search with Enter, and clear update the real field and submit handler');
  await site.evaluate(()=>{const input=document.createElement('input');input.placeholder='Hey there!';document.getElementById('control-fixture')!.prepend(input);});
  await act('fill','Hey there!','Hello {first_name}, welcome to the demo.');
  const original=(await snapshot()).elements.find(e=>e.name==='Hey there!')!;
  const draft={ref:original.ref,url:site.url(),value:'Hello {first_name}, welcome to the demo.',kind:'fill',target:{name:original.name,tag:original.tag,type:original.type,context:original.context}};
  await site.locator('[placeholder="Hey there!"]').evaluate(el=>el.replaceWith(el.cloneNode(true)));
  const readback=await driver('snapshot',[draft]) as Snapshot;
  assert.ok(readback.elements.find(e=>e.name==='Hey there!')?.state?.includes(`draft:matches:${original.ref}`));
  assert.ok(!JSON.stringify(readback).includes(draft.value));
  checks.push('Packaged snapshot transport verifies Nova’s known text after an input remount without exposing contents or rewriting');
  await act('double_click','Double click');assert.equal(await site.evaluate(()=>document.body.dataset.double),'yes');
  await act('hover','Hover details');assert.equal(await site.evaluate(()=>document.body.dataset.hover),'yes');
  await act('click','Shadow action');assert.equal(await site.evaluate(()=>document.body.dataset.shadow),'yes');checks.push('Double-click, hover, and a control inside an open shadow root receive trusted input');
  await site.evaluate(()=>{
    const el=document.createElement('div');el.id='unmarked-control';el.textContent='Expand custom notes';el.style.cssText='width:340px;height:75px;background:#e6f1eb;margin:10px';
    el.addEventListener('click',e=>{if(e.isTrusted&&e.clientX<el.getBoundingClientRect().x+60)document.body.dataset.customPoint='yes';});
    document.getElementById('control-fixture')!.prepend(el);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width','100');svg.setAttribute('height','45');svg.setAttribute('role','button');svg.setAttribute('aria-label','Open diagram');svg.innerHTML='<rect width="100" height="45" fill="#28745b"/>';svg.addEventListener('click',e=>{if(e.isTrusted)document.body.dataset.svg='yes';});el.after(svg);
  });
  assert.equal((await snapshot()).elements.some(e=>e.name==='Expand custom notes'),false);
  const rect=await site.locator('#unmarked-control').boundingBox();assert.ok(rect);
  await driver('execute',{kind:'inspect',ref:null,x:rect.x+20,y:rect.y+25,value:null,url:null,risk:'read',summary:'Inspect custom notes'});
  assert.equal(await site.evaluate(()=>document.body.dataset.customPoint),undefined);
  await act('click','Expand custom notes');assert.equal(await site.evaluate(()=>document.body.dataset.customPoint),'yes');
  await act('click','Open diagram');assert.equal(await site.evaluate(()=>document.body.dataset.svg),'yes');
  checks.push('Visual inspection resolves an unmarked control without clicking; subsequent trusted input uses the inspected point, and SVG controls work');
  await act('check','Enabled option','true');assert.equal(await site.locator('#check').isChecked(),true);await act('check','Enabled option','true');assert.equal(await site.locator('#check').isChecked(),true);checks.push('Checkbox state is verified and an already-selected checkbox is not toggled off');
  const blocked=await request('execute',{kind:'fill',ref:(await snapshot()).elements.find(e=>e.type==='password')!.ref,value:'never-enter',url:null,x:null,y:null,risk:'read',summary:'test'});assert.match(blocked.error,/sensitive|unavailable/);assert.equal(await site.locator('#control-fixture input[type=password]').inputValue(),'');checks.push('Private input remains blocked even through the native input path');
  const wav=Buffer.alloc(44+16000*2*25);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
  await site.locator('#media').evaluate((el,src)=>{(el as HTMLAudioElement).src=src;(el as HTMLAudioElement).muted=true;},`data:audio/wav;base64,${wav.toString('base64')}`);
  await site.waitForFunction(()=>document.querySelector<HTMLAudioElement>('#media')!.readyState>=2);
  await act('media','Fixture player','play');assert.equal(await site.locator('#media').evaluate((el:HTMLAudioElement)=>el.paused),false);
  await act('media','Fixture player','pause');assert.equal(await site.locator('#media').evaluate((el:HTMLAudioElement)=>el.paused),true);
  const before=await site.locator('#media').evaluate((el:HTMLAudioElement)=>el.currentTime);await act('media','Fixture player','seek:10');assert.ok(Math.abs(await site.locator('#media').evaluate((el:HTMLAudioElement)=>el.currentTime)-before-10)<1);
  await act('media','Fixture player','unmute');assert.equal(await site.locator('#media').evaluate((el:HTMLAudioElement)=>el.muted),false);checks.push('Generic media play, pause, seek-forward, and unmute verify actual HTML media state');
  await site.evaluate(()=>{
    const tab=document.createElement('button');tab.textContent='Auto-activating settings tab';tab.setAttribute('role','tab');
    tab.addEventListener('focus',()=>history.replaceState(null,'','?tab=intelligence'));
    tab.addEventListener('click',()=>{document.body.dataset.tabClicks=String(Number(document.body.dataset.tabClicks||0)+1);tab.setAttribute('aria-selected','true');});
    document.getElementById('control-fixture')!.prepend(tab);
  });
  await act('click','Auto-activating settings tab');
  assert.match(site.url(),/\?tab=intelligence$/);assert.equal(await site.evaluate(()=>document.body.dataset.tabClicks),'1');
  checks.push('Focus-activated tabs change route during the trusted click without premature navigation errors or duplicate clicks');
  await worker.evaluate(tabId=>chrome.debugger.detach({tabId}),tabId);
  const stopped=await request('execute',{kind:'click',ref:(await snapshot()).elements.find(e=>e.name==='Trusted click')!.ref,value:null,url:null,x:null,y:null,risk:'read',summary:'test'});assert.match(stopped.error,/Resume|disconnected/);assert.equal(await site.evaluate(()=>document.body.dataset.trustedCount),'1');
  await panel.waitFor("document.body.innerText.includes('Resume browser control')");
  await panel.click('.np-browser-control button');await panel.waitFor("!document.querySelector('.np-browser-control')");await act('click','Trusted click');assert.equal(await site.evaluate(()=>document.body.dataset.trustedCount),'2');checks.push('Disconnecting browser control stops further input until the person explicitly resumes it');
  await writeFile('BE/data/browser-control-fixture.png',await panel.screenshot());
  await panel.disconnect();
  const report={at:new Date().toISOString(),ok:true,checks};await writeFile('BE/data/browser-control-smoke-report.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify(report,null,2));
}finally{await context.close();}
