// Read Nova's own run telemetry. This does not issue any browser command.
import {config} from '../BE/src/config';
import {mkdir,writeFile} from 'node:fs/promises';
const [label='rehearsal',sessionId]=process.argv.slice(2);
if(!/^[a-z0-9-]+$/.test(label))throw new Error('Use a simple rehearsal label');
const response=await fetch(`http://127.0.0.1:${config.port}/api/sessions`,{headers:{authorization:`Bearer ${config.token}`}});if(!response.ok)throw new Error(`Session read failed: ${response.status}`);
const sessions=await response.json();const s=sessionId?sessions.find((s:any)=>s.id===sessionId):sessions.filter((s:any)=>new URL(s.url).hostname==='platform.bolna.ai'&&s.status!=='disconnected').at(-1);if(!s)throw new Error('No matching live Bolna session');
const runs=s.messages.filter((m:any)=>m.role==='user').map((m:any,i:number,a:any[])=>{const end=a[i+1]?.at??Infinity;const traces=s.traces.filter((t:any)=>t.at>=m.at&&t.at<end);const final=s.messages.filter((x:any)=>x.role==='assistant'&&x.at>=m.at&&x.at<end).at(-1);return {prompt:m.text,traceMayBeTruncated:s.traces.length>=120&&s.traces[0].at>m.at,elapsedMs:final?final.at-m.at:null,modelMs:traces.filter((t:any)=>t.kind==='think'&&t.ms).reduce((n:number,t:any)=>n+t.ms,0),actionsInRetainedTrace:traces.filter((t:any)=>t.kind==='act').length,approvalsInRetainedTrace:traces.filter((t:any)=>t.kind==='approval').length,errors:traces.filter((t:any)=>t.kind==='error').map((t:any)=>t.text),reply:final?.text};});
const report={at:new Date().toISOString(),scope:'Live signed-in Bolna through Nova native Chrome panel; own telemetry only',sessionId:s.id,status:s.status,steps:s.steps,usage:s.usage,runs,messages:s.messages,traces:s.traces,progress:s.progress};
if(s.status!=='running'){await mkdir('artifacts/bolna/founder-demo',{recursive:true});await writeFile(`artifacts/bolna/founder-demo/${label}.json`,JSON.stringify(report,null,2),{mode:0o600});}
console.log(JSON.stringify({status:s.status,id:s.id,steps:s.steps,usage:s.usage,runs,lastActions:s.progress?.actions.slice(-3)},null,2));process.exit(0);
