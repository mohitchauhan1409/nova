// Isolated Nova rendering check. These screenshots are not live workflow evidence.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir = 'artifacts/creem/theme';
await mkdir(dir, {recursive:true});
const browser = await chromium.launch({headless:true});
const session = {id:'creem-theme',url:'https://www.creem.io/dashboard/home',title:'Creem',status:'ready',messages:[],traces:[],experience:{name:'Creem',accent:'#cfc2fa',greeting:'',suggestions:[{title:'Set up a product',prompt:'Help me set up a subscription product in Test mode.'},{title:'Create a targeted offer',prompt:'Create a discount for one of my products in Test mode.'}]}};
try {
  const page = await browser.newPage({viewport:{width:400,height:850}});
  await page.addInitScript('window.__name = value => value;');
  await page.addInitScript(s=>{
    const listeners:((m:unknown)=>void)[]=[];
    (window as any).novaTestSend=(session:unknown)=>listeners.forEach(fn=>fn({type:'session',session}));
    (window as any).chrome={runtime:{sendMessage:async()=>({granted:true,suspended:false}),connect:()=>({onMessage:{addListener:(fn:any)=>listeners.push(fn)},onDisconnect:{addListener:()=>{}},postMessage:()=>queueMicrotask(()=>listeners.forEach(fn=>fn({type:'session',session:s}))),disconnect:()=>{}})}};
  },session);
  await page.goto('http://127.0.0.1:5173/panel.html');
  await page.getByText('How can I help today?').waitFor();
  assert.equal(await page.locator('.np-app').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(34, 35, 36)');
  assert.equal(await page.getByRole('tab',{name:'Chat',exact:true}).getAttribute('aria-selected'),'true');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.np-suggestions>button')!).backgroundColor === 'rgb(39, 40, 41)');
  await page.screenshot({path:`${dir}/welcome.png`,animations:'disabled'});
  const card={id:'product-details',title:'Let’s shape your team plan',description:'A few choices, then I’ll save the product in Test mode.',status:'pending',questions:[
    {id:'name',label:'What should the plan be called?',type:'text',required:true,description:'',placeholder:'Vector Business',options:[]},
    {id:'billing',label:'How would you like to bill?',type:'single_choice',required:true,description:'',placeholder:'',options:[{label:'Monthly',description:'A lower commitment for new customers.'},{label:'Yearly',description:'One payment for a full year.'}]}
  ]};
  const q={...session,clarification:card,awaitingAnswer:true,messages:[{id:'u',role:'user',text:'Help me set up a plan for teams.',at:1},{id:'a',role:'assistant',text:'',at:2,clarification:card}]};
  await page.evaluate(s=>(window as any).novaTestSend(s),q);
  await page.getByText('Let’s shape your team plan').waitFor();
  await page.getByRole('radio',{name:/Monthly/}).click();
  await page.screenshot({path:`${dir}/questions.png`,animations:'disabled'});
  for(const width of [320,400,480]) {
    await page.setViewportSize({width,height:850});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Panel must not overflow horizontally');
  }
  await page.evaluate(s=>(window as any).novaTestSend({...s,status:'running',messages:[{id:'u',role:'user',text:'Set up Vector Business at $129 per month.',at:1}],actionSteps:[{id:'one',taskId:'u',kind:'click',title:'Open the product form',status:'verified',detail:'New product form is visible.',at:2},{id:'two',taskId:'u',kind:'fill',title:'Configure the subscription',status:'running',at:3}]}),session);
  await page.getByLabel('Task steps').waitFor();
  await page.setViewportSize({width:400,height:850});
  await page.screenshot({path:`${dir}/working.png`,animations:'disabled'});
  await page.evaluate(s=>(window as any).novaTestSend({...s,url:'https://workspace.example',experience:{...s.experience,name:'Workspace'}}),session);
  await page.waitForFunction(()=>document.querySelector('.np-app')?.getAttribute('data-site')==='workspace.example');
  assert.equal(await page.locator('.np-app').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(251, 252, 250)','Other sites retain the shared theme');
  await writeFile(`${dir}/report.json`,JSON.stringify({passed:true,checks:['Creem charcoal background','Chat default','Grouped question card','Action timeline','320/400/480 px without overflow','Non-Creem theme unchanged'],evidence:'Isolated rendering only; not real dashboard execution'},null,2));
  console.log('Creem theme, question cards, action timeline, responsive layout and hostname isolation passed.');
} finally {await browser.close();}
