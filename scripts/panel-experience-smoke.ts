// Isolated presentation/state test; never connects to the user's browser or any live website.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const session={id:'visual',url:'https://workspace.example/workflows',title:'Workflows · Workspace',status:'ready',messages:[],traces:[],experience:{name:'Workspace',accent:'#7360db',greeting:'',suggestions:[{title:'Build a workflow',prompt:'Help me build a workflow'},{title:'Prepare a campaign',prompt:'Help me prepare a campaign'}]}};
try{
 const page=await browser.newPage({viewport:{width:400,height:900}});page.on('pageerror',e=>console.error(e.message));page.on('console',m=>{if(m.type()==='error')console.error(m.text())});
 await page.addInitScript("window.__name = (value) => value;");
 await page.addInitScript((s)=>{
  const listeners:((m:unknown)=>void)[]=[];
  (window as any).novaTestSend=(session:unknown)=>listeners.forEach(fn=>fn({type:'session',session}));
  (window as any).chrome={runtime:{sendMessage:async()=>({granted:true,suspended:false}),connect:()=>({onMessage:{addListener:(fn:any)=>listeners.push(fn)},onDisconnect:{addListener:()=>{}},postMessage:()=>queueMicrotask(()=>listeners.forEach(fn=>fn({type:'session',session:s}))),disconnect:()=>{}})}}},session);
 await page.goto('http://127.0.0.1:5173/panel.html');
 await page.locator('.np-brand').getByText('Nova',{exact:true}).waitFor();
 assert.equal(await page.getByRole('tab',{name:'Chat',exact:true}).getAttribute('aria-selected'),'true');
 assert.equal(await page.getByRole('tab',{name:'Live talk',exact:true}).count(),1);
 assert.equal(await page.locator('.np-context').count(),0);
 await mkdir('artifacts/core/experience-refresh',{recursive:true});
 await page.screenshot({path:'artifacts/core/experience-refresh/panel-welcome.png'});
 const working={...session,status:'running',messages:[{id:'u',role:'user',text:'Build a consultation follow-up workflow. Keep it as a draft.',at:1}],actionSteps:[{id:'1',taskId:'u',title:'I’m opening Workflows.',status:'verified',detail:'Workflow list is visible',kind:'click',at:2},{id:'2',taskId:'u',title:'I’m connecting the consultation step.',status:'running',kind:'click',at:3}]};
 await page.evaluate(s=>(window as any).novaTestSend(s),working);
 await page.getByLabel('Task steps').waitFor();assert.equal(await page.getByText('1/2 verified').count(),1);
 assert.equal(await page.locator('[data-status=running]').count(),1);await page.screenshot({path:'artifacts/core/experience-refresh/panel-working.png'});
 for(const width of [320,380,480]){await page.setViewportSize({width,height:800});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.evaluate(s=>(window as any).novaTestSend({...s,status:'stopped',actionSteps:s.actionSteps.map(a=>a.id==='2'?{...a,status:'failed',detail:'Control covered'}:a)}),working);
 await page.getByText('Could not complete',{exact:true}).waitFor();assert.equal(await page.getByText('1/2 verified').count(),1);
 // A long-running task shows its complete history and follows newly added rows.
 const longTask={...working,actionSteps:Array.from({length:12},(_,i)=>({id:String(i),taskId:'u',title:`Completing workflow step ${i+1}`,status:i===11?'running':'verified',kind:'click',at:i}))};
 await page.evaluate(s=>(window as any).novaTestSend(s),longTask);
 await page.waitForFunction(()=>document.querySelectorAll('.np-action-timeline li').length===12);
 assert.equal(await page.getByRole('button',{name:/Show .* earlier steps/}).count(),0);
 await page.waitForFunction(()=>{const e=document.querySelector('.np-conversation')!;return e.scrollHeight-e.scrollTop-e.clientHeight<5;});
 await page.locator('.np-conversation').hover();await page.mouse.wheel(0,-600);
 await page.waitForFunction(()=>{const e=document.querySelector('.np-conversation')!;return e.scrollHeight-e.scrollTop-e.clientHeight>150;});
 const readingAt=await page.locator('.np-conversation').evaluate(e=>e.scrollTop);
 await page.evaluate(s=>(window as any).novaTestSend({...s,actionSteps:[...s.actionSteps,{id:'13',taskId:'u',title:'A newer action while reading',status:'running',kind:'click',at:14}]}),longTask);
 await page.waitForFunction(()=>document.querySelectorAll('.np-action-timeline li').length===13);
 assert.ok(Math.abs(await page.locator('.np-conversation').evaluate(e=>e.scrollTop)-readingAt)<5,'Reading older steps should not be interrupted');
 await page.getByLabel('Jump to latest message').click();
 await page.waitForFunction(()=>{const e=document.querySelector('.np-conversation')!;return e.scrollHeight-e.scrollTop-e.clientHeight<5;});
 await page.evaluate(s=>(window as any).novaTestSend({...s,status:'ready',messages:[...s.messages,{id:'a',role:'assistant',text:'The complete workflow is saved and validated. '.repeat(10),at:99}]}),longTask);
 await page.waitForFunction(()=>document.querySelectorAll('.np-action-timeline li').length===3);
 await page.waitForFunction(()=>{const e=document.querySelector('.np-conversation')!;return e.scrollHeight-e.scrollTop-e.clientHeight<5;});
 await page.getByRole('button',{name:'Show 9 earlier steps'}).click();
 assert.equal(await page.locator('.np-action-timeline li').count(),12);
 await writeFile('artifacts/core/experience-refresh/ui-checks.json',JSON.stringify({ok:true,checks:['chat default','website identity','live step updates','no false verification for failure','320–480px no horizontal overflow','all active steps visible','new steps follow automatically','reading older steps preserved','completed answer remains visible']},null,2));console.log('Panel identity, action states and responsive layout passed.');
}finally{await browser.close();}
