// Live OpenAI calls against an isolated fictional shop; no user account or order.
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ControlledBrowser} from '../BE/src/browser/controlled';
import {AgentRunner} from '../BE/src/agent/runner';
import {OpenAIPlanner,plannerContext} from '../BE/src/providers/openai';
import {config} from '../BE/src/config';
import type {Session,SiteProfile} from '../shared/types';
config.headless=true;config.allowLocalTests=true;
const html=await readFile('tests/fixtures/shop.html','utf8');
const server=createServer((_,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${(server.address() as {port:number}).port}/shop`;
const results:unknown[]=[];
try{
  for(const model of [config.model,config.fastModel]){
    const driver=new ControlledBrowser();await driver.open(url);
    const session:Session={id:model,siteId:'fixture',mode:'browser',status:'ready',url,title:'Fixture',messages:[],traces:[],steps:0,model,startedAt:Date.now()};
    const site:SiteProfile={id:'fixture',name:'Demo shop',domain:'127.0.0.1',url,color:'#000',description:'',instructions:'',flows:[],observations:0};
    const runner=new AgentRunner(session,driver,new OpenAIPlanner(),site,()=>{});
    try{
      const snapshot=await driver.snapshot();const packedChars=JSON.stringify(plannerContext(session,site,snapshot)).length;
      const unpackedChars=JSON.stringify({site,conversation:session.messages,recentActions:[],observation:snapshot}).length;
      const start=performance.now();await runner.command('Search this shop for Zebronics adapter, open its product details, and report its price and HDMI resolution. Do not add anything to the cart.');
      assert.equal(session.status,'ready',session.messages.at(-1)?.text);assert.match(session.messages.at(-1)!.text,/799/);assert.match(session.messages.at(-1)!.text,/4K/i);assert.match(session.url,/#product/);
      assert.ok(!(await driver.snapshot()).text.includes('Cart: 1 items'));
      const searchMs=Math.round(performance.now()-start);
      const cartStart=performance.now();await runner.command('Add exactly one of this demo adapter to my cart, verify the quantity and total, then stop. Do not check out.');
      const after=await driver.snapshot();assert.match(after.text,/Cart: 1 items/);assert.match(after.text,/Total ₹799/);assert.equal(session.status,'ready',session.messages.at(-1)?.text);assert.equal(session.approval,undefined);
      const prices=model==='gpt-5.6-sol'?{input:4,cached:.4,output:20}:{input:2,cached:.2,output:12};const usage=session.usage!;
      const estimatedUsd=((usage.inputTokens-usage.cachedInputTokens)*prices.input+usage.cachedInputTokens*prices.cached+usage.outputTokens*prices.output)/1e6;
      const row={model,ok:true,searchMs,cartMs:Math.round(performance.now()-cartStart),usage,estimatedUsd:Number(estimatedUsd.toFixed(5)),pricingDate:'2026-09-16',packedChars,unpackedChars,finalAnswer:session.messages.at(-1)?.text};results.push(row);console.log(JSON.stringify(row,null,2));
    }finally{await runner.close();}
  }
  await writeFile('BE/data/model-smoke-report.json',JSON.stringify({at:new Date().toISOString(),ok:true,scope:'Two tasks per model on one fictional shop; not a universal quality comparison',results},null,2),{mode:0o600});
}finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
