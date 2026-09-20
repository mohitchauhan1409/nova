import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';
import type { Page } from 'playwright';
import { ControlledBrowser } from '../BE/src/browser/controlled';
import { config } from '../BE/src/config';
import type { Action, Session } from '../shared/types';
import { quickAction } from '../BE/src/agent/quick-actions';
let server:Server;let driver:ControlledBrowser;let page:Page;const received:any[]=[];
const saved={headless:config.headless,allowLocalTests:config.allowLocalTests};
const session:Session={id:'test-companion',siteId:'fixture',mode:'browser',url:'',title:'Interaction lab',status:'ready',messages:[],traces:[],model:'test',steps:0,startedAt:Date.now()};
beforeAll(async()=>{
  config.headless=true;config.allowLocalTests=true;
  server=createServer((_,res)=>{res.writeHead(200,{'Content-Type':'text/html','Content-Security-Policy':"require-trusted-types-for 'script'"});res.end(readFileSync('tests/fixtures/interactions.html'));});await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  driver=new ControlledBrowser();session.url=`http://127.0.0.1:${(server.address() as any).port}/lab`;await driver.open(session.url);page=(driver as unknown as {page:Page}).page;
  await driver.bindCompanion(session,message=>received.push(message));
});
afterAll(async()=>{await driver?.close();await new Promise<void>(resolve=>server?.close(()=>resolve()));Object.assign(config,saved);});
async function action(kind:Action['kind'],name?:string,value:string|null=null){const snapshot=await driver.snapshot();const ref=name?snapshot.elements.find(e=>e.name===name)?.ref:null;if(name)expect(ref,`Missing ${name}`).toBeTruthy();return driver.execute({kind,ref:ref||null,value,url:null,x:null,y:null,risk:'read',summary:`${kind} ${name||value||''}`});}
describe('in-page companion and native actions',()=>{
  it('mounts on the website, accepts typed commands through the isolated bridge, and excludes its own UI from observations',async()=>{
    expect(await page.getByRole('button',{name:'Open Nova assistant'}).isVisible()).toBe(true);
    await driver.focus();await page.getByRole('button',{name:'Type instead',exact:true}).click();await page.getByRole('textbox',{name:'Message Nova',exact:true}).fill('Scroll down');await page.getByRole('button',{name:'Send ↗',exact:true}).click();
    await page.waitForTimeout(50);expect(received).toContainEqual({type:'command',sessionId:session.id,text:'Scroll down'});
    expect(await page.evaluate(()=>typeof window.__novaRelay)).toBe('undefined');
    const snapshot=await driver.snapshot();expect(snapshot.text).not.toContain('Important actions need your say');expect(snapshot.elements.some(e=>e.name==='Message Nova')).toBe(false);
    await page.getByRole('button',{name:'Minimize Nova',exact:true}).click();
  });
  it('types with real input events and submits search',async()=>{await action('search','Search products','Zebronics adapter');expect(await page.locator('#form-result').innerText()).toContain('Zebronics adapter');const events=await page.evaluate(()=>(window as any).inputEvents);expect(events.length).toBeGreaterThan(5);expect(events.every(Boolean)).toBe(true);});
  it('supports hover, double click and context menus',async()=>{await action('hover','Hover for details');expect(await page.locator('#pointer-result').innerText()).toContain('Hover details');await action('double_click','Double click preview');expect(await page.locator('#pointer-result').innerText()).toContain('Double click');await action('right_click','Context menu preview');expect(await page.locator('#pointer-result').innerText()).toContain('Context menu');});
  it('moves a card using native dragging',async()=>{const snap=await driver.snapshot();const source=snap.elements.find(e=>e.name==='Move this card')!,target=snap.elements.find(e=>e.name==='Drop zone')!;await driver.execute({kind:'drag',ref:source.ref,value:target.ref,url:null,x:null,y:null,risk:'change',summary:'Move the card into its drop zone'});expect(await page.locator('#drag-result').innerText()).toContain('Card moved');});
  it('checks a control and selects an option',async()=>{await action('check','Enable preview','true');expect(await page.locator('#check').isChecked()).toBe(true);await action('select','Preview color','Green');expect(await page.getByRole('combobox',{name:'Preview color'}).inputValue()).toBe('Green');});
  it('scrolls a nested container and adjusts page zoom',async()=>{await action('scroll','Scrollable preview','down');expect(await page.locator('.scroll-box').evaluate(el=>el.scrollTop)).toBeGreaterThan(20);await action('zoom',undefined,'125');expect(await page.evaluate(()=>document.documentElement.style.zoom)).toBe('1.25');await action('zoom',undefined,'reset');});
  it('selects visible text and supports editing without leaking form content into observations',async()=>{await action('select_text','One companion. Every little action.');expect(await page.evaluate(()=>getSelection()?.toString())).toBe('One companion. Every little action.');await action('fill','Draft note','Private draft');await action('type','Draft note',' appended');expect(await page.getByRole('textbox',{name:'Draft note'}).inputValue()).toBe('Private draft appended');expect((await driver.snapshot()).text).not.toContain('Private draft');await action('clear','Draft note');expect(await page.getByRole('textbox',{name:'Draft note'}).inputValue()).toBe('');});
  it('copies observed text and pastes that copied text without reading a system clipboard',async()=>{await action('copy','One companion. Every little action.');await action('paste','Draft note');expect(await page.getByRole('textbox',{name:'Draft note'}).inputValue()).toBe('One companion. Every little action.');});
  it('restores the companion after a full navigation and displays a follow-up question on the page',async()=>{await page.reload();await page.getByRole('button',{name:'Open Nova assistant'}).waitFor();driver.companion({type:'session',session:{...session,awaitingAnswer:true,messages:[{id:'question',at:Date.now(),role:'assistant',text:'Which color would you like: purple or green?'}]}});await page.getByText('Which color would you like: purple or green?',{exact:true}).waitFor();expect(await page.getByRole('dialog',{name:'Nova website companion'}).isVisible()).toBe(true);});
  it('keeps a concrete approval and its decision buttons visible on the website',async()=>{driver.companion({type:'session',session:{...session,status:'approval',approval:{id:'approval-1',action:{kind:'click',ref:'cart',value:null,url:null,x:null,y:null,risk:'change',summary:'Add one adapter for ₹799 to the fictional cart?'},target:'Add to cart',url:session.url,reason:'Review this cart change',expiresAt:Date.now()+120000,snapshotId:'snapshot'}}});await page.getByText('Add one adapter for ₹799 to the fictional cart?',{exact:true}).waitFor();await page.getByRole('button',{name:'Yes, proceed',exact:true}).click();await page.waitForTimeout(50);expect(received).toContainEqual({type:'approve',sessionId:session.id,approvalId:'approval-1',approved:true});});
  it('fits its approval buttons in a narrow website viewport',async()=>{await page.setViewportSize({width:390,height:844});const box=await page.getByRole('button',{name:'Yes, proceed',exact:true}).boundingBox();expect(box).toBeTruthy();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);expect(box!.y+box!.height).toBeLessThan(844);await page.setViewportSize({width:1360,height:900});});
});
describe('instant command grammar',()=>{
  it('recognizes only explicit viewport requests',()=>{expect(quickAction('Please scroll down.')).toMatchObject({kind:'scroll',value:'down'});expect(quickAction('zoom to 125 percent')).toMatchObject({kind:'zoom',value:'125'});expect(quickAction('reset zoom')).toMatchObject({kind:'zoom',value:'reset'});expect(quickAction('scroll down and buy it')).toBeUndefined();expect(quickAction('What happens if I zoom in?')).toBeUndefined();expect(quickAction('zoom to 900%')).toBeUndefined();});
});
