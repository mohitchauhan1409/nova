// Isolated rendering check. Never attaches to personal Chrome or calls a provider.
import {build} from 'esbuild';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const url=process.argv.find(a=>a.startsWith('--url='))?.slice(6)||'https://workspace.example/';
const expectedColor=process.argv.find(a=>a.startsWith('--color='))?.slice(8);
const browser=await chromium.launch({headless:true});
const reports=[];
try {
  for(const [name,recording,show] of [['normal',false,false],['hidden',true,false],['visible',true,true]] as const){
    const bundle=await build({stdin:{contents:`import {mountLauncher} from './web/companion/launcher'; window.fixture=mountLauncher(async()=>{});`,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife',define:{__NOVA_RECORDING_MODE__:String(recording),__NOVA_RECORDING_SHOW_ACTION_CURSOR__:String(show)}});
    const page=await browser.newPage({viewport:{width:1200,height:760}});
    await page.addInitScript('window.__name = value => value;');
    await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="background:#222324;color:#f3f3f5;font:20px system-ui;padding:80px"><h1>Isolated cursor rendering check</h1><button style="padding:20px;background:#303132;color:#f3f3f5">Product details</button></body></html>'}));
    await page.goto(url);
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    await page.evaluate(async()=>{
      (window as any).fixture.receive({type:'session',session:{status:'ready',experience:{name:'Workspace',accent:'#000000'}}});
      await (window as any).fixture.action(260,230,'Nova','click');
    });
    const values=await page.locator('[data-nova-root=launcher]').evaluate(host=>{
      const root=host.shadowRoot!;const style=(s:string)=>getComputedStyle(root.querySelector(s)!);
      return {display:style('.cursor').display,opacity:style('.cursor').opacity,fill:style('.cursor svg').fill,label:style('.cursor b').backgroundColor,ring:style('.ring').borderTopColor,pointerEvents:style('.cursor').pointerEvents};
    });
    assert.equal(values.display==='none',recording&&!show);
    assert.equal(values.pointerEvents,'none');
    if(expectedColor && !(recording&&!show))for(const key of ['fill','label','ring'] as const)assert.equal(values[key],expectedColor);
    await mkdir('artifacts/core/recording-cursor',{recursive:true});
    await page.screenshot({path:`artifacts/core/recording-cursor/${name}.png`});
    reports.push({name,recording,show,...values});
    await page.close();
  }
  await writeFile('artifacts/core/recording-cursor/report.json',JSON.stringify({passed:true,url,reports},null,2));
  console.log(JSON.stringify(reports,null,2));
}finally{await browser.close();}
