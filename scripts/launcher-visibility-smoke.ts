// Packaged extension integration test in a disposable browser, never user Chrome.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { attachPanel } from './panel-test-driver';

const extensionPath=path.resolve('web/dist-extension');
const context=await chromium.launchPersistentContext('',{channel:'chromium',headless:true,args:[`--disable-extensions-except=${extensionPath}`,`--load-extension=${extensionPath}`]});
context.setDefaultTimeout(12000);
try {
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const dashboard=await context.newPage();
  await dashboard.goto('http://127.0.0.1:5173/');
  await dashboard.getByText('Nova is online',{exact:true}).waitFor();
  const opened=context.waitForEvent('page');
  await dashboard.getByRole('button',{name:'Try the demo',exact:true}).click();
  const site=await opened;
  await site.waitForURL('**/demo/shop');
  const launcher=site.getByRole('button',{name:'Open Nova side panel',exact:true});
  await launcher.waitFor();
  const gaze=launcher.locator('.nova-gaze');
  const eyes=launcher.locator('.nova-eyes');
  assert.equal(await gaze.evaluate(el=>el.getAnimations()[0]?.playState),'running','Eyes glance around while idle');
  assert.equal(await eyes.evaluate(el=>el.getAnimations()[0]?.playState),'running','Eyes blink automatically');
  assert.ok(await eyes.evaluate(el=>{
    const blink=el.getAnimations()[0];
    blink.pause(); blink.currentTime=2112;
    const closed=new DOMMatrix(getComputedStyle(el).transform).d<.1;
    blink.currentTime=0; blink.play();
    return closed;
  }),'Blink visibly closes the eyes');
  await site.mouse.move(10,10);
  await site.waitForFunction(()=>{
    const gaze=document.querySelector('[data-nova-root=launcher]')?.shadowRoot?.querySelector('.nova-gaze');
    return gaze&&new DOMMatrix(getComputedStyle(gaze).transform).e < -1;
  });
  const viewport=site.viewportSize()!;
  await site.mouse.move(viewport.width-2,viewport.height-2);
  await site.waitForFunction(()=>{
    const gaze=document.querySelector('[data-nova-root=launcher]')?.shadowRoot?.querySelector('.nova-gaze');
    return gaze&&new DOMMatrix(getComputedStyle(gaze).transform).e > 1;
  });
  await site.waitForFunction(()=>!document.querySelector('[data-nova-root=launcher]')?.shadowRoot?.querySelector('.launch')?.hasAttribute('data-gaze'));
  assert.equal(await gaze.evaluate(el=>el.getAnimations().find(a=>a instanceof CSSAnimation)?.playState),'running','Idle motion resumes after pointer stops');
  await site.emulateMedia({reducedMotion:'reduce'});
  await site.mouse.move(10,10);
  await site.waitForFunction(()=>{
    const root=document.querySelector('[data-nova-root=launcher]')?.shadowRoot;
    return root&&!root.querySelector('.launch')?.hasAttribute('data-gaze')&&['.nova-eyes','.nova-gaze'].every(selector=>{
      const el=root.querySelector(selector)!;
      return el.getAnimations().length===0&&getComputedStyle(el).transform==='none';
    });
  });
  await site.emulateMedia({reducedMotion:'no-preference'});
  const tab=await worker.evaluate(async url=>(await chrome.tabs.query({url}))[0],site.url());
  await launcher.click();
  const cdp=await context.newCDPSession(site);
  let targetId='';
  for(let i=0;i<100&&!targetId;i++){
    targetId=(await cdp.send('Target.getTargets')).targetInfos.find(t=>t.url.endsWith(`/panel.html?tabId=${tab.id}`))?.targetId||'';
    if(!targetId)await site.waitForTimeout(70);
  }
  assert.ok(targetId,'Launcher opens native panel');
  const panel=await attachPanel(cdp,targetId);
  await panel.waitFor("document.querySelector('#voice-tab')?.textContent.includes('Live talk')");
  assert.equal(await panel.evaluate("!!document.querySelector('.np-context')"),false);
  await launcher.waitFor({state:'hidden'});
  await site.reload();
  await site.locator('[data-nova-root=launcher]').waitFor({state:'attached'});
  await launcher.waitFor({state:'hidden'});
  // Native panel close is exercised using the actual extension close API.
  await panel.click('[aria-label="Close Nova panel"]');
  await launcher.waitFor({state:'visible'});
  await launcher.click();
  await launcher.waitFor({state:'hidden'});
  await mkdir('artifacts/core/experience-refresh',{recursive:true});
  const checks=['eyes glance while idle','eyes blink','eyes follow pointer left and right','idle motion resumes','reduced motion stays still','launcher visible while closed','hidden while panel open','hidden after website reload','returns after closing','hides on reopening','Live talk label','redundant site-title block removed'];
  await writeFile('artifacts/core/experience-refresh/launcher-checks.json',JSON.stringify({ok:true,checks},null,2));
  console.log(checks.join('\n'));
}finally{await context.close();}
