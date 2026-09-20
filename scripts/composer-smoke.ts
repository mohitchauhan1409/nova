// Live planner, isolated fictional composer. Never sends to Amazon or another user.
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ControlledBrowser} from '../BE/src/browser/controlled';
import {AgentRunner} from '../BE/src/agent/runner';
import {OpenAIPlanner} from '../BE/src/providers/openai';
import {config} from '../BE/src/config';
import type {Session,SiteProfile} from '../shared/types';
config.headless=true;config.allowLocalTests=true;
const html=await readFile('tests/fixtures/composer.html','utf8');const server=createServer((_,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${(server.address() as {port:number}).port}/composer`;
const driver=new ControlledBrowser();const session:Session={id:'composer',siteId:'fixture',mode:'browser',status:'ready',url,title:'Composer',messages:[],traces:[],steps:0,model:config.model,startedAt:Date.now()};
const site:SiteProfile={id:'fixture',name:'Shopping',url,domain:'127.0.0.1',color:'#7360db',description:'',instructions:'',flows:[],observations:0};
const approved=new Set<string>();let approveError='';
const runner=new AgentRunner(session,driver,new OpenAIPlanner(),site,s=>{if(s.approval&&!approved.has(s.approval.id)){const id=s.approval.id;approved.add(id);setTimeout(()=>void runner.approve(id,true).catch(e=>{approveError=e.message;runner.stop(false);}),450);}});
const checks:string[]=[];
try{
  await driver.open(url);
  await runner.command('Open the shopping assistant for me.');assert.equal(session.status,'ready',session.messages.at(-1)?.text);assert.ok((await driver.snapshot()).elements.some(e=>e.name==='Close shopping assistant'&&e.state?.includes('expanded:true')));checks.push('Opening a panel is confirmed from accessible control state');
  await runner.command('Write one prompt in the assistant asking it to find the best AI phones. Do not send it yet.');assert.equal(session.status,'ready',session.messages.at(-1)?.text);let snap=await driver.snapshot();assert.match(snap.text,/Draft writes: 1\. Messages sent: 0\./);checks.push('Exactly one draft is entered and left unsent');
  await runner.command('Send it.');assert.equal(approveError,'');assert.equal(session.status,'ready',session.messages.at(-1)?.text);snap=await driver.snapshot();assert.match(snap.text,/Draft writes: 1\. Messages sent: 1\./);assert.equal(approved.size,1);checks.push('One approval sends the existing draft once despite a continuously changing banner');
  const report={at:new Date().toISOString(),ok:true,checks,usage:session.usage,answer:session.messages.at(-1)?.text};await writeFile('BE/data/composer-smoke-report.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify(report,null,2));
}catch(error){console.log(JSON.stringify({ok:false,error:String(error),traces:session.traces.slice(-12),messages:session.messages},null,2));process.exitCode=1;}
finally{await runner.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
