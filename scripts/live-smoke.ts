import { WebSocket } from 'ws';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { config } from '../BE/src/config';
import type { ServerEvent, Session } from '../shared/types';
const base=`http://127.0.0.1:${config.port}`;
async function api<T>(route:string,body?:unknown,method?:string):Promise<T>{const r=await fetch(base+'/api'+route,{method:method||(body?'POST':'GET'),headers:{Authorization:`Bearer ${config.token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const data=await r.json() as any;if(!r.ok)throw new Error(data.error);return data;}
for(let attempt=0;attempt<20;attempt++){try{await api('/health');break;}catch(error){if(attempt===19)throw error;await new Promise(resolve=>setTimeout(resolve,500));}}
const tests=process.argv.includes('--public')?[{siteId:'google',command:'Search for James Webb telescope. Tell me two result titles you can actually see. Stay on Google.'},{siteId:'youtube',command:'Search for James Webb telescope and tell me the first relevant video title and channel. Do not subscribe, comment, like, or purchase.'},{siteId:'amazon',command:'Search for a Zebronics USB-C to HDMI adapter. Open a relevant product and tell me the title, price, and compatibility details you can see. Do not add it to a cart or buy anything.'}]:[{siteId:'demo',command:'Find the Zebronics USB-C to HDMI adapter, read its product details, and add one to my cart after my confirmation. Stop after verifying it is in the cart.'}];
const reports:unknown[]=[]; let failed=false; const only=process.argv.find(x=>x.startsWith('--site='))?.split('=')[1]; if(only)tests.splice(0,tests.length,...tests.filter(t=>t.siteId===only));
assert.ok(tests.length,'No smoke test matches the selected site');
for(const test of tests){
 let id='';const started=Date.now();const approvals:unknown[]=[];
 try{
  if(test.siteId==='demo'){const site=await api<{id:string}>('/sites',{url:base+'/demo/shop',name:'Nova Demo Shop'});test.siteId=site.id;}
  const session=await api<Session>('/sessions',{siteId:test.siteId,speed:'intelligent'});id=session.id;
  const result=await new Promise<Session>((resolve,reject)=>{
   const ws=new WebSocket(`ws://127.0.0.1:${config.port}/socket`);let commanded=false;let approved='';let lastTrace='';
   const timer=setTimeout(()=>{ws.send(JSON.stringify({type:'stop',sessionId:id}));ws.close();reject(new Error('Live flow exceeded 180 seconds'));},180000);
   ws.on('open',()=>ws.send(JSON.stringify({type:'auth',token:config.token,role:'ui'})));
   ws.on('message',raw=>{const event=JSON.parse(raw.toString()) as ServerEvent;if(event.type==='ready'){commanded=true;ws.send(JSON.stringify({type:'command',sessionId:id,text:test.command}));}
    if(event.type==='error'){clearTimeout(timer);ws.close();reject(new Error(event.message));}
    if(event.type==='session'&&event.session.id===id&&commanded){const s=event.session;const t=s.traces.at(-1);if(t&&lastTrace!==t.id){lastTrace=t.id;console.log(test.siteId,t.kind,t.text,t.ms??'');}
     if(s.approval&&approved!==s.approval.id){approved=s.approval.id;approvals.push(s.approval);console.log('Approval target',JSON.stringify(s.approval.action),s.approval.target);const demo=s.url.startsWith(base+'/demo/');const cart=s.approval.target==='Add to cart';if(demo&&cart){console.log('Approving the fictional demo cart action only');ws.send(JSON.stringify({type:'approve',sessionId:id,approvalId:s.approval.id,approved:true}));}else{console.log('Declining unexpected/public approval');ws.send(JSON.stringify({type:'approve',sessionId:id,approvalId:s.approval.id,approved:false}));}}
     if(['ready','stopped','error'].includes(s.status)&&s.messages.length>1){clearTimeout(timer);ws.close();resolve(s);}
    }
   });ws.on('error',reject);
  });
  const observed=result.lastSnapshot?.text||'';
  assert.equal(result.status,'ready','The task must finish without an agent error or stop');
  if(result.url.startsWith(base+'/demo/')){
   assert.equal(approvals.length,1,'The fictional cart action requires exactly one approval');
   assert.match(observed,/Cart: 1 items/);
   assert.match(observed,/1 × Zebronics USB-C to HDMI Adapter — Demo\. Total ₹799/);
  }else if(test.siteId==='youtube'){
   assert.equal(new URL(result.url).searchParams.get('search_query'),'James Webb telescope');
   assert.match(observed,/James Webb/i);
  }else if(test.siteId==='amazon'){
   assert.match(new URL(result.url).pathname,/\/dp\//);
   assert.match(observed,/ZEBRONICS/i);
  }else if(test.siteId==='google'){
   assert.equal(new URL(result.url).pathname,'/search','Human verification is a blocked result, not a successful search');
  }
  reports.push({siteId:test.siteId,status:result.status,postconditionsPassed:true,approvals,ms:Date.now()-started,steps:result.steps,url:result.url,answer:result.messages.at(-1)?.text,traces:result.traces.map(t=>({kind:t.kind,text:t.text,ms:t.ms})),pageText:observed.slice(0,3000)});
 }catch(error){failed=true;reports.push({siteId:test.siteId,error:(error as Error).message,ms:Date.now()-started});console.log('Flow error',(error as Error).message);}
 finally{if(id)await api(`/sessions/${id}`,undefined,'DELETE').catch(()=>{});}
}
const file=process.argv.includes('--public')?`BE/data/${only||'public'}-smoke-report.json`:'BE/data/demo-smoke-report.json';await writeFile(file,JSON.stringify({at:new Date().toISOString(),reports},null,2),{mode:0o600});console.log('Saved',file);
if(failed)process.exitCode=1;
