// Read-only Nova telemetry, to verify the UI-driven recording. Never sends commands.
import {config} from '../../BE/src/config';
import {writeFile,mkdir} from 'node:fs/promises';
const r=await fetch(`http://127.0.0.1:${config.port}/api/sessions`,{headers:{authorization:`Bearer ${config.token}`}});if(!r.ok)throw new Error(`Nova telemetry ${r.status}`);
const sessions=await r.json();const s=sessions.filter((s:any)=>s.url.includes('platform.bolna.ai')).at(-1);
if(!s){console.log('No Bolna session');process.exit(0);}
if(process.argv[2]){await mkdir('artifacts/bolna/chat-recording',{recursive:true});await writeFile(`artifacts/bolna/chat-recording/${process.argv[2]}.json`,JSON.stringify(s,null,2),{mode:0o600});}
console.log(JSON.stringify({id:s.id,status:s.status,steps:s.steps,url:s.url,messages:s.messages.slice(-3),actions:s.actionSteps?.slice(-3),traces:s.traces.slice(-2)},null,2));
