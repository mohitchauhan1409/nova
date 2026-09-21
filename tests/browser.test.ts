import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { buildSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import type { Action } from '../shared/types';
const script = buildSync({entryPoints:['shared/dom.ts'],bundle:true,write:false,format:'iife'}).outputFiles[0].text;
const action=(patch:Partial<Action>):Action=>({kind:'click',ref:null,value:null,url:null,x:null,y:null,risk:'read',summary:'test',...patch});
let browser:Browser;let page:Page;
beforeAll(async()=>{browser=await chromium.launch({headless:true});page=await browser.newPage();});
afterAll(async()=>{await browser?.close();});
describe('real DOM actuation in an isolated fixture browser',()=>{
  it('scrolls the unique nested area when the observed dialog wrapper cannot scroll',async()=>{
    await page.setContent('<div role="dialog" tabindex="-1" aria-label="Editor"><div id="scroll" style="height:140px;overflow:auto"><div style="height:900px"><input aria-label="Name"><p>Editor fields</p></div></div></div>');
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    let snap=await page.evaluate(()=>window.__novaDOM!.snapshot());
    const wrapper=snap.elements.find(e=>e.role==='dialog')!;
    await page.evaluate(a=>window.__novaDOM!.execute(a),action({kind:'scroll',ref:wrapper.ref,value:'down'}));
    expect(await page.locator('#scroll').evaluate(el=>el.scrollTop)).toBeGreaterThan(50);
    const input=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='Name')!;
    await page.evaluate(a=>window.__novaDOM!.execute(a),action({kind:'scroll',ref:input.ref,value:'top'}));
    expect(await page.locator('#scroll').evaluate(el=>el.scrollTop)).toBe(0);
    snap=await page.evaluate(()=>window.__novaDOM!.snapshot());
    expect(snap.elements.some(e=>e.state?.includes('scrollMaxY:760'))).toBe(true);
  });
  it('observes the active page appearance for scoped companion themes',async()=>{
    await page.setContent('<style>html{color-scheme:dark}body{background:#17171f}</style><button>Continue</button>');
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    expect((await page.evaluate(()=>window.__novaDOM!.snapshot())).theme.scheme).toBe('dark');
    await page.locator('html').evaluate(el=>(el as HTMLElement).style.colorScheme='light');
    await page.locator('body').evaluate(el=>(el as HTMLElement).style.background='#ffffff');
    expect((await page.evaluate(()=>window.__novaDOM!.snapshot())).theme.scheme).toBe('light');
  });
  it('observes operational numeric settings without exposing arbitrary private fields',async()=>{
    await page.setContent('<input type="number" aria-label="Wait" value="30"><input type="range" aria-label="Volume" value="70"><input type="number" aria-label="Account balance" value="987654"><input type="number" aria-label="OTP code" value="123456"><input type="text" aria-label="Wait note" value="private note"><input type="number" aria-label="Patient quantity" value="888">');
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    let snap=await page.evaluate(()=>window.__novaDOM!.snapshot());expect(snap.elements.find(e=>e.name==='Wait')?.state).toContain('value:30');expect(snap.elements.find(e=>e.name==='Volume')?.state).toContain('value:70');
    for(const value of ['987654','123456','private note','value:888'])expect(JSON.stringify(snap)).not.toContain(value);
    await page.getByLabel('Wait',{exact:true}).fill('1');snap=await page.evaluate(()=>window.__novaDOM!.snapshot());expect(snap.elements.find(e=>e.name==='Wait')?.state).toContain('value:1');
  });
  it('reads visible custom selections and structural identifiers, and marks covered controls',async()=>{
    await page.setContent('<button role="combobox" aria-label="Unit"><span>minutes</span></button><input aria-label="Field 1 name" value="reference_id"><input aria-label="Customer name" value="private customer"><div style="position:relative"><button id="covered">End node</button><div style="position:absolute;inset:0;background:white">Inspector</div></div>');
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);const snap=await page.evaluate(()=>window.__novaDOM!.snapshot());
    expect(snap.elements.find(e=>e.name==='Unit')?.state).toContain('selected:minutes');expect(snap.elements.find(e=>e.name==='Field 1 name')?.state).toContain('value:reference_id');expect(JSON.stringify(snap)).not.toContain('private customer');expect(snap.elements.find(e=>e.name==='End node')?.covered).toBe(true);
  });
  it('compares only known drafts across remounts without exposing field contents',async()=>{
    await page.setContent('<input placeholder="Hey there!" value="Hello {first_name}"><input aria-label="Private note" value="unrelated private text">');await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    const first=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='Hey there!')!;
    const draft={ref:first.ref,url:page.url(),value:'Hello {first_name}',kind:'fill' as const,target:{name:first.name,tag:first.tag,type:first.type,context:first.context}};
    await page.locator('[placeholder]').evaluate(el=>el.outerHTML='<input placeholder="Hey there!" value="Hello {first_name}">');
    let snap=await page.evaluate(d=>window.__novaDOM!.snapshot([d]),draft);let field=snap.elements.find(e=>e.name==='Hey there!')!;expect(field.ref).not.toBe(first.ref);expect(field.state).toContain(`draft:matches:${first.ref}`);
    expect(JSON.stringify(snap)).not.toContain('Hello {first_name}');expect(JSON.stringify(snap)).not.toContain('unrelated private text');
    await page.locator('[placeholder]').fill('changed privately');snap=await page.evaluate(d=>window.__novaDOM!.snapshot([d]),draft);expect(snap.elements.find(e=>e.name==='Hey there!')?.state).toContain(`draft:different:${first.ref}`);expect(JSON.stringify(snap)).not.toContain('changed privately');
    await page.locator('[placeholder]').evaluate(el=>el.insertAdjacentHTML('afterend','<input placeholder="Hey there!" value="Hello {first_name}">'));
    snap=await page.evaluate(d=>window.__novaDOM!.snapshot([d]),draft);expect(snap.elements.flatMap(e=>e.state||[]).some(s=>s.startsWith('draft:'))).toBe(false);
    snap=await page.evaluate(d=>window.__novaDOM!.snapshot([{...d,url:'https://other.example'}]),draft);expect(snap.elements.flatMap(e=>e.state||[]).some(s=>s.startsWith('draft:'))).toBe(false);
  });
  it('tracks draft revisions without exposing text and scopes send to its composer',async()=>{
    await page.setContent('<p id="banner">Offer A</p><section aria-label="Shopping assistant"><textarea aria-label="Ask assistant"></textarea><button>Send</button></section>');await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    await page.locator('textarea').fill('Private draft text');let snap=await page.evaluate(()=>window.__novaDOM!.snapshot());const editor=snap.elements.find(e=>e.tag==='textarea')!;const send=snap.elements.find(e=>e.name==='Send')!;
    expect(JSON.stringify(snap)).not.toContain('Private draft text');expect(send.submission?.fields).toContainEqual({ref:editor.ref,revision:editor.edit!.revision});
    await page.locator('#banner').evaluate(el=>el.textContent='Offer B');expect((await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.tag==='textarea')!.edit).toEqual(editor.edit);
    await page.locator('textarea').fill('Changed draft');snap=await page.evaluate(()=>window.__novaDOM!.snapshot());expect(snap.elements.find(e=>e.tag==='textarea')!.edit?.revision).not.toBe(editor.edit?.revision);
  });
  it('omits secrets, hidden instructions, and invisible controls',async()=>{await page.setContent(readFileSync('tests/fixtures/shop.html','utf8'));await page.evaluate(script);const snap=await page.evaluate(()=>window.__novaDOM!.snapshot());expect(snap.text).not.toContain('NEVER_SEND');expect(snap.text).not.toContain('Ignore the user');expect(snap.elements.some(e=>e.ref==='secret'||e.name==='Add to cart')).toBe(false);expect(snap.elements.some(e=>e.name==='Search products')).toBe(true);});
  it('fills and submits search, opens details, adds to cart, and sees the changed result',async()=>{let snap=await page.evaluate(()=>window.__novaDOM!.snapshot());const search=snap.elements.find(e=>e.name==='Search products')!;await page.evaluate(a=>window.__novaDOM!.execute(a),action({kind:'fill',ref:search.ref,value:'Zebronics adapter'}));await page.evaluate(a=>window.__novaDOM!.execute(a),action({kind:'press',ref:search.ref,value:'Enter'}));expect(await page.title()).toContain('Zebronics adapter');snap=await page.evaluate(()=>window.__novaDOM!.snapshot());const product=snap.elements.find(e=>e.name.startsWith('Zebronics'))!;await page.evaluate(a=>window.__novaDOM!.execute(a),action({ref:product.ref}));await page.waitForFunction(()=>!document.getElementById('product')!.classList.contains('hidden'));snap=await page.evaluate(()=>window.__novaDOM!.snapshot());expect(snap.text).toContain('DisplayPort Alt Mode');const add=snap.elements.find(e=>e.name==='Add to cart')!;await page.evaluate(a=>window.__novaDOM!.execute(a),action({ref:add.ref}));snap=await page.evaluate(()=>window.__novaDOM!.snapshot());expect(snap.text).toContain('Cart: 1 items');expect(snap.text).toContain('Total ₹799');});
  it('rejects a stale ref after its element is removed',async()=>{const snap=await page.evaluate(()=>window.__novaDOM!.snapshot());const ref=snap.elements.find(e=>e.name==='Add to cart')!.ref;await page.locator('#add-cart').evaluate(el=>el.remove());await expect(page.evaluate(a=>window.__novaDOM!.execute(a),action({ref}))).rejects.toThrow('changed or disappeared');});
  it('extracts accessible controls from open shadow roots',async()=>{await page.setContent('<div id="host"></div>');await page.evaluate(()=>{document.getElementById('host')!.attachShadow({mode:'open'}).innerHTML='<button>Search catalogue</button>';delete window.__novaDOM;});await page.evaluate(script);const snap=await page.evaluate(()=>window.__novaDOM!.snapshot());expect(snap.elements.some(e=>e.name==='Search catalogue')).toBe(true);});
  it('targets the exposed part of a tall editor above a sticky footer',async()=>{
    await page.setContent('<textarea aria-label="Business prompt" style="position:absolute;top:500px;left:20px;width:400px;height:700px"></textarea><footer style="position:fixed;bottom:0;left:0;right:0;height:130px;background:white">Save footer</footer>');
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    const ref=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='Business prompt')!.ref;
    const point=await page.evaluate(ref=>window.__novaDOM!.prepare(ref),ref);
    expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.tagName,point)).toBe('TEXTAREA');
  });
  it('rejects a target covered by another element inside the same shadow root',async()=>{await page.setContent('<div id="host"></div>');await page.evaluate(()=>{document.getElementById('host')!.attachShadow({mode:'open'}).innerHTML='<div style="position:relative;width:220px;height:80px"><button style="width:200px;height:70px">Covered action</button><div style="position:absolute;inset:0;background:white">Overlay</div></div>';delete window.__novaDOM;});await page.evaluate(script);const ref=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='Covered action')!.ref;await expect(page.evaluate(ref=>window.__novaDOM!.prepare(ref),ref)).rejects.toThrow('covering');});
  it('discovers current controls and text after scrolling past the observation limit',async()=>{
    await page.setContent(Array.from({length:260},(_,i)=>`<section style="height:75px"><button>Entry ${i}</button><p>Details for record ${i}</p></section>`).join(''));
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    await page.getByRole('button',{name:'Entry 245',exact:true}).scrollIntoViewIfNeeded();
    const snap=await page.evaluate(()=>window.__novaDOM!.snapshot());
    expect(snap.elements.some(e=>e.name==='Entry 245')).toBe(true);expect(snap.elements[0].name).not.toBe('Entry 0');
    expect(snap.text.indexOf('Details for record 245')).toBeLessThan(1500);expect(snap.observation?.omittedControls).toBeGreaterThan(0);
  });
  it('observes CSS controls, ARIA options, SVG controls and unnamed scroll areas',async()=>{
    await page.setContent('<div style="cursor:pointer">Expand details</div><div role="option">Teal</div><svg role="button" aria-label="Open chart" width="80" height="40"><rect width="80" height="40"/></svg><div style="height:50px;overflow:auto"><p style="height:500px">Scrollable records</p></div>');
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);const snap=await page.evaluate(()=>window.__novaDOM!.snapshot());
    for(const name of ['Expand details','Teal','Open chart'])expect(snap.elements.some(e=>e.name===name)).toBe(true);
    expect(snap.elements.some(e=>e.state?.includes('scrollY:0'))).toBe(true);
    const svg=snap.elements.find(e=>e.name==='Open chart')!;expect(await page.evaluate(ref=>window.__novaDOM!.prepare(ref),svg.ref)).toMatchObject({tag:'svg'});
  });
  it('inspects an unmarked custom control without clicking and preserves the selected point',async()=>{
    await page.setContent('<div id="custom" style="width:300px;height:80px;background:#ddd">Expand custom details</div>');
    await page.evaluate(()=>{delete window.__novaDOM;document.getElementById('custom')!.onclick=()=>{document.body.dataset.clicked='yes';};});await page.evaluate(script);
    expect((await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.some(e=>e.name==='Expand custom details')).toBe(false);
    await page.evaluate(()=>window.__novaDOM!.inspect(25,30));expect(await page.evaluate(()=>document.body.dataset.clicked)).toBeUndefined();
    const target=(await page.evaluate(()=>window.__novaDOM!.snapshot())).elements.find(e=>e.name==='Expand custom details')!;expect(target).toBeDefined();
    expect(await page.evaluate(ref=>window.__novaDOM!.prepare(ref),target.ref)).toMatchObject({x:25,y:30});
    await page.locator('#custom').evaluate(el=>(el as HTMLElement).style.marginLeft='50px');
    await expect(page.evaluate(ref=>window.__novaDOM!.prepare(ref),target.ref)).rejects.toThrow('moved');
  });
  it('resolves an icon to its actual button and blocks private fields and unobserved frames',async()=>{
    await page.setContent('<button aria-label="Delete record" style="width:120px;height:60px"><svg width="20" height="20"><rect width="20" height="20"/></svg></button><input type="password"><iframe src="about:blank"></iframe>');
    await page.evaluate(()=>{delete window.__novaDOM;});await page.evaluate(script);
    const icon=await page.locator('rect').boundingBox();await page.evaluate(p=>window.__novaDOM!.inspect(p.x+5,p.y+5),icon!);
    expect((await page.evaluate(()=>window.__novaDOM!.snapshot())).elements[0]).toMatchObject({tag:'button',name:'Delete record'});
    for(const selector of ['input','iframe']){const r=await page.locator(selector).boundingBox();await expect(page.evaluate(p=>window.__novaDOM!.inspect(p.x+10,p.y+10),r!)).rejects.toThrow('protected');}
  });
});
