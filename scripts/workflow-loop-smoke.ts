// Isolated fictional fixture, real planner and trusted input. Never attaches to user Chrome.
import {createServer} from 'node:http';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ControlledBrowser} from '../BE/src/browser/controlled';
import {AgentRunner} from '../BE/src/agent/runner';
import {OpenAIPlanner} from '../BE/src/providers/openai';
import {config,safeError} from '../BE/src/config';
import {workflowProfile} from '../tests/fixtures/profiles';
import type {Session} from '../shared/types';
config.headless=true;config.allowLocalTests=true;
const html=await readFile('tests/fixtures/workflow.html','utf8');
const server=createServer((_,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});
await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${(server.address() as {port:number}).port}/workflows/demo`;
const driver=new ControlledBrowser();
const session:Session={id:'workflow-loop',siteId:'workspace',mode:'browser',status:'ready',url,title:'Workflow regression',messages:[],traces:[],steps:0,model:config.model,startedAt:Date.now()};
let approvals=0;const runner=new AgentRunner(session,driver,new OpenAIPlanner(),{...structuredClone(workflowProfile),url,domain:'127.0.0.1'},s=>{if(s.approval){approvals++;runner.stop(false);}});
await mkdir('artifacts/core',{recursive:true});
const start=Date.now();
try{await driver.open(url);await runner.command('Finish this existing no-contact draft workflow. Close the open Unit menu, set Demo pause to 1 minute, inspect Start has required text field reference_id and Demo complete outcome success, and validate. Reload exactly once and verify those settings persisted. Keep it unpublished. Do not create another workflow or contact anyone.');
assert.equal(session.status,'ready',session.messages.at(-1)?.text);assert.equal(approvals,0);assert.equal(session.progress?.reloads,1);assert.ok(session.progress?.settings.some(s=>s.name==='Wait'&&s.state.includes('value:1')));assert.ok(session.progress?.settings.some(s=>s.name==='Outcome'&&s.state.includes('selected:success')));assert.equal(session.progress?.actions.filter(a=>a.kind==='fill').length,1,'Only the incorrect Wait value should be filled');assert.ok(session.steps<=22,`Too many actions: ${session.steps}`);const snap=await driver.snapshot();assert.match(snap.text,/Setting writes: 1/);assert.match(snap.text,/Page loads: 2/);const report={ok:true,scope:'Local fixture with real model, not a live customer website',elapsedMs:Date.now()-start,steps:session.steps,usage:session.usage,messages:session.messages,progress:session.progress};await writeFile('artifacts/core/workflow-loop-regression.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
catch(e){await writeFile('artifacts/core/workflow-loop-regression.json',JSON.stringify({ok:false,error:safeError(e),session},null,2));console.log(JSON.stringify({ok:false,error:safeError(e),messages:session.messages,traces:session.traces.slice(-12),progress:session.progress},null,2));process.exitCode=1;}
finally{await runner.close();await new Promise<void>(r=>server.close(()=>r()));}
