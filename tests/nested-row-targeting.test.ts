import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {chromium,type Browser,type Page} from 'playwright';
import {buildSync} from 'esbuild';

const script=buildSync({entryPoints:['shared/dom.ts'],bundle:true,write:false,format:'iife'}).outputFiles[0].text;
let browser:Browser,page:Page;
beforeAll(async()=>{browser=await chromium.launch({headless:true});page=await browser.newPage({viewport:{width:900,height:600}});});
afterAll(async()=>{await browser?.close();});
async function fixture(html:string){
  await page.goto('about:blank');await page.setContent(html);await page.evaluate(script);
  return page.evaluate(()=>window.__novaDOM!.snapshot());
}
async function clickPrepared(ref:string){
  const point=await page.evaluate(ref=>window.__novaDOM!.prepare(ref),ref);
  await page.mouse.click(point.x,point.y);return point;
}
const rowHtml=(control:string)=>`<style>table{border-collapse:collapse;width:600px}tr{height:90px;position:relative;cursor:pointer}td{padding:16px}.nested{position:absolute;left:210px;top:15px;width:180px;height:60px;box-sizing:border-box}</style><table><tr data-action="open-prompt"><td>Support routing</td><td>${control}</td><td>Draft</td></tr></table>`;
async function trackRow(){
  await page.evaluate(()=>{
    const state=(window as any).__events={row:0,nested:0};
    document.querySelector('tr')!.addEventListener('click',()=>{state.row++;document.body.dataset.opened='prompt-details';});
    document.querySelector('.nested')!.addEventListener('click',event=>{event.stopPropagation();state.nested++;});
  });
}

describe('a parent click does not activate an independent nested control',()=>{
  it('opens the actual row instead of its centered copy-ID button, retaining the copy tooltip',async()=>{
    const snapshot=await fixture(rowHtml('<button class="nested" title="Click to copy"><span>pmt_104</span></button>'));
    await trackRow();
    const row=snapshot.elements.find(el=>el.tag==='tr')!;
    const copy=snapshot.elements.find(el=>el.tag==='button')!;
    expect(copy.name).toBe('pmt_104');expect(copy.context).toContain('Tooltip: Click to copy');
    const point=await clickPrepared(row.ref);
    expect(await page.evaluate(()=>(window as any).__events)).toEqual({row:1,nested:0});
    expect(await page.locator('body').getAttribute('data-opened')).toBe('prompt-details');
    expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')===null,point)).toBe(true);
    await clickPrepared(copy.ref);
    expect(await page.evaluate(()=>(window as any).__events)).toEqual({row:1,nested:1});
  });

  it.each([
    '<a class="nested" href="#copy">Copy link</a>',
    '<input class="nested" aria-label="Row selection" type="checkbox">',
    '<select class="nested" aria-label="Row mode"><option>Draft</option></select>',
    '<textarea class="nested" aria-label="Row note"></textarea>',
    '<div class="nested" role="button" tabindex="0"><span>Copy ID</span></div>',
    '<div class="nested" data-action="copy"><span>Copy ID</span></div>',
    '<label class="nested"><input type="checkbox">Select row</label>',
  ])('finds a safe row cell around %s',async control=>{
    const snapshot=await fixture(rowHtml(control));await trackRow();
    await clickPrepared(snapshot.elements.find(el=>el.tag==='tr')!.ref);
    expect(await page.evaluate(()=>(window as any).__events)).toEqual({row:1,nested:0});
  });

  it('fails closed when no exposed parent point exists',async()=>{
    const snapshot=await fixture('<div role="button" aria-label="Open record" style="position:relative;width:400px;height:90px"><button aria-label="Copy ID" style="position:absolute;inset:0;width:100%;height:100%">Copy</button></div>');
    await expect(page.evaluate(ref=>window.__novaDOM!.prepare(ref),snapshot.elements.find(el=>el.name==='Open record')!.ref)).rejects.toThrow('covering the target');
  });
});

describe('same-control descendants and native label activation',()=>{
  it('keeps a button icon and text span as part of the intended button',async()=>{
    const snapshot=await fixture('<button aria-label="Save draft" style="width:250px;height:90px"><span style="display:block"><svg width="50" height="40"><rect width="50" height="40" fill="green"/></svg><span>Save</span></span></button>');
    await page.evaluate(()=>document.querySelector('button')!.addEventListener('click',()=>document.body.dataset.saved='yes'));
    await clickPrepared(snapshot.elements.find(el=>el.name==='Save draft')!.ref);
    expect(await page.locator('body').getAttribute('data-saved')).toBe('yes');
  });

  it('allows a label to click its own nested checkbox',async()=>{
    const snapshot=await fixture('<label data-action="toggle-drafts" style="display:block;position:relative;width:260px;height:70px">Keep drafts<input type="checkbox" style="position:absolute;left:100px;top:10px;width:60px;height:50px"></label>');
    await clickPrepared(snapshot.elements.find(el=>el.tag==='label')!.ref);
    expect(await page.locator('input').isChecked()).toBe(true);
  });

  it('allows the exact associated label covering a checkbox, but avoids a separate button within it',async()=>{
    const snapshot=await fixture('<div style="position:relative;width:300px;height:80px"><input id="drafts" type="checkbox" style="position:absolute;width:300px;height:80px;margin:0"><label for="drafts" style="position:absolute;inset:0;background:white">Keep drafts<button style="position:absolute;left:100px;top:5px;width:100px;height:70px">Details</button></label></div>');
    await page.locator('button').evaluate(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();document.body.dataset.details='opened';}));
    await clickPrepared(snapshot.elements.find(el=>el.tag==='input')!.ref);
    expect(await page.locator('input').isChecked()).toBe(true);
    expect(await page.locator('body').getAttribute('data-details')).toBeNull();
  });

  it('does not promote editable or sensitive field tooltip values into context',async()=>{
    const secret='unrelated-private-value';
    const snapshot=await fixture(`<input aria-label="API key" type="password" value="${secret}" title="${secret}"><textarea aria-label="Private notes" title="${secret}"></textarea><button title="Copy ID" data-tooltip="Copy ID">Identifier</button>`);
    for(const field of snapshot.elements.filter(el=>['input','textarea'].includes(el.tag)))expect(field.context).not.toContain(secret);
    expect(snapshot.text).not.toContain(secret);
    const button=snapshot.elements.find(el=>el.tag==='button')!;
    expect(button.name).toBe('Identifier');expect(button.context).toBe('Tooltip: Copy ID.');
  });
});
