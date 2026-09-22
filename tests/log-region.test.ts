import {expect,it} from 'vitest';
import {chromium} from 'playwright';
import {buildSync} from 'esbuild';
import {inferenceLogCompletionProblem} from '../BE/src/agent/inference-result';
import type {Action} from '../shared/types';
const script=buildSync({entryPoints:['shared/dom.ts'],bundle:true,write:false,format:'iife'}).outputFiles[0].text;
it('preserves the actual log dialog in document order while global text contains background table rows',async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1100,height:700}});
    // Sanitized reproduction of the captured log: underlying table stays in
    // global text, while the actual output/footer can lie below a scroll pane.
    await page.setContent(`<main><p>Logs table</p><p>Old background delivery row</p><div style="height:900px"></div><p>Another old table row</p></main><div role="dialog" aria-label="Log detail" style="position:fixed;top:50px;left:300px;height:250px;overflow:auto;background:white"><h2>Log detail</h2><p>request-current</p><p>22/09/2026, 10:43:45</p><span>200</span><p>Input</p><p>4 messages</p><p>system</p><p>Classify.</p><p>user</p><p>Order 104 arrived damaged.</p><p>assistant</p><p>damage</p><p>user</p><p>Order 204 arrived damaged.</p><p>Output</p><p>6 chars</p><p>damage</p><button>Get help with this request</button></div>`);
    await page.evaluate(script);const snapshot=await page.evaluate(()=>window.__novaDOM!.snapshot());
    expect(snapshot.text).toContain('Old background delivery row');expect(snapshot.textRegions).toHaveLength(1);
    const region=snapshot.textRegions![0];expect(region.text).not.toContain('background');expect(region.text).not.toContain('old table');
    expect(region.text).toContain('user\nOrder 204 arrived damaged.\nOutput\n6 chars\ndamage\nGet help with this request');
    const url='https://model.example.test/playground',logUrl='https://model.example.test/logs';
    const rules=[{url,submitName:'Send',promptName:'Prompt',requiredControls:[],resultLog:{url:logUrl,dialogName:'Log detail',inputLabel:'Input',outputLabel:'Output',outputEndLabel:'Get help with this request',timestamp:{format:'day-first-24h' as const,utcOffsetMinutes:330}}}];
    const receipt={url,prompt:'Order 204 arrived damaged.',submittedAt:Date.UTC(2026,8,22,5,13,44)};
    const action:Action={kind:'done',ref:null,url:null,value:null,x:null,y:null,risk:'read',summary:'Damage',completion:{status:'completed',evidence:[{source:'text',ref:null,value:'damage'}]}};
    expect(inferenceLogCompletionProblem(action,{...snapshot,url:logUrl,capturedAt:receipt.submittedAt+5000},'Check Logs.',receipt,rules)).toBeUndefined();
    expect(inferenceLogCompletionProblem(action,{...snapshot,url:logUrl,capturedAt:receipt.submittedAt+5000},'Check Logs.',{...receipt,prompt:'Order 104 arrived damaged.'},rules)).toContain('final Input user message');
  }finally{await browser.close();}
});
