// End-to-end questionnaire transport in a disposable Chromium profile.
// Uses the real planner and packaged extension against Nova's local demo only.
import {chromium} from 'playwright';
import path from 'node:path';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {attachPanel} from './panel-test-driver';
const extension=path.resolve('web/dist-extension');
const context=await chromium.launchPersistentContext('',{channel:'chromium',headless:false,viewport:null,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--window-size=1400,1000']});
try{
 await mkdir('artifacts/core',{recursive:true});
 const dashboard=await context.newPage();await dashboard.goto('http://127.0.0.1:5173/');await dashboard.getByText('Nova is online',{exact:true}).waitFor();
 const [site]=await Promise.all([context.waitForEvent('page'),dashboard.getByRole('button',{name:'Try the demo',exact:true}).click()]);await site.waitForURL('**/demo/shop');await site.getByRole('button',{name:'Open Nova side panel',exact:true}).click();
 const cdp=await context.newCDPSession(site);let target='';for(let i=0;i<100&&!target;i++){target=(await cdp.send('Target.getTargets')).targetInfos.find(t=>t.url.includes('/panel.html?tabId='))?.targetId||'';if(!target)await site.waitForTimeout(70);}
 const panel=await attachPanel(cdp,target);await panel.waitFor("document.querySelector('[aria-label=\"Message Nova\"]')&&!document.querySelector('[aria-label=\"Message Nova\"]').disabled");
 const started=Date.now();await panel.fill('[aria-label="Message Nova"]','Help me choose an adapter. First ask which devices I use and my budget together, then recommend from this page. Do not add to cart.');await panel.click('[aria-label="Send message"]');await panel.waitFor("!!document.querySelector('.np-question-card')",60000);const cardMs=Date.now()-started;
 const fields=await panel.evaluate<{id:string;label:string;type:string}[]>("Array.from(document.querySelectorAll('.np-question-fields fieldset')).map(f=>({id:f.dataset.question,label:f.querySelector('legend').textContent,type:f.querySelector('textarea')?'textarea':f.querySelector('input')?'input':'choice'}))");assert.ok(fields.length>=2);
 for(const field of fields){const selector=`[data-question="${field.id}"]`;const answer=/budget|spend|price|cost/i.test(field.label)?'1500':'USB-C laptop to HDMI monitor';if(field.type==='choice'){await panel.click(`${selector} .np-custom-choice`);await panel.fill(`${selector} input`,answer);}else await panel.fill(`${selector} ${field.type}`,answer);}
 await writeFile('artifacts/core/question-panel-live-model.png',await panel.screenshot());await panel.click('.np-question-continue');await panel.waitFor("!!document.querySelector('.np-question-receipt')&&!document.querySelector('.np-question-card')",15000);await panel.waitFor("!document.querySelector('.np-thinking')",60000);
 const text=await panel.evaluate<string>("document.querySelector('.np-messages').innerText");assert.match(text,/1500/);assert.match(text,/USB-C laptop/);assert.ok(!/no longer active|do not match|Please answer:/i.test(text));
 const report={ok:true,scope:'Packaged side panel → extension relay → real backend/model → answer receipt; isolated local shop',cardMs,questions:fields.map(f=>f.label),conversation:text};await writeFile('artifacts/core/question-panel-transport.json',JSON.stringify(report,null,2));console.log(JSON.stringify({ok:true,cardMs,questions:fields.length}));await panel.disconnect();
}finally{await context.close();}
