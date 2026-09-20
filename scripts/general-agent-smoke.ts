// A previously unseen workspace, empty site instructions and no saved flows.
// Real model + trusted browser input; fictional data, no account or transaction.
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ControlledBrowser} from '../BE/src/browser/controlled';
import {AgentRunner} from '../BE/src/agent/runner';
import {OpenAIPlanner} from '../BE/src/providers/openai';
import {config} from '../BE/src/config';
import type {Session,SiteProfile} from '../shared/types';
config.headless=true;config.allowLocalTests=true;
const html=await readFile('tests/fixtures/workspace.html','utf8');
const server=createServer((_,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${(server.address() as {port:number}).port}/workspace`;
const driver=new ControlledBrowser();
const session:Session={id:'general-fixture',siteId:'unseen',mode:'browser',status:'ready',url,title:'Juniper workspace',messages:[],traces:[],steps:0,model:config.model,startedAt:Date.now()};
const site:SiteProfile={id:'unseen',name:'Juniper workspace',domain:'127.0.0.1',url,color:'#28745b',description:'Your project companion.',instructions:'',flows:[],observations:0};
const runner=new AgentRunner(session,driver,new OpenAIPlanner(),site,s=>{
  if(s.status==='approval'){console.log('Unexpected approval:',s.approval?.reason);queueMicrotask(()=>runner.stop(false));}
});
try{
  await driver.open(url);const start=performance.now();
  await runner.command('Filter the projects to Ready, open Atlas refresh, add it to my favorites, and tell me its deadline.');
  const snapshot=await driver.snapshot();
  assert.equal(session.status,'ready',session.messages.at(-1)?.text);
  assert.match(snapshot.text,/Showing Ready projects/);assert.match(snapshot.text,/Atlas refresh is in your favorites/);
  assert.match(snapshot.elements.find(e=>e.name==='Favorite Atlas refresh')?.state?.join(' ')||'',/pressed:true/);
  assert.match(session.messages.at(-1)?.text||'',/24.*October|October.*24/);
  assert.equal(session.traces.some(t=>t.kind==='approval'),false);assert.equal(site.flows.length,0);
  const report={at:new Date().toISOString(),ok:true,model:session.model,ms:Math.round(performance.now()-start),steps:session.steps,usage:session.usage,checks:['Unknown site with no instructions or saved flows','Custom ARIA dropdown discovered and Ready filter verified','Observed project opened with trusted input','Requested favorite persisted without an extra confirmation','Answer contains observed deadline'],finalAnswer:session.messages.at(-1)?.text};
  await writeFile('BE/data/general-agent-smoke-report.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify(report,null,2));
}catch(error){console.log(JSON.stringify({ok:false,error:String(error),messages:session.messages,traces:session.traces.slice(-12)},null,2));process.exitCode=1;}
finally{await runner.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
