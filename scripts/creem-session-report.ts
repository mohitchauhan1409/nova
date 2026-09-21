// Read-only local Nova trace export. Never uses a website API or exports credentials.
import { mkdir, writeFile } from 'node:fs/promises';
import type { Session } from '../shared/types';
const label=process.argv[2]||'latest';
if(!/^[a-z0-9-]+$/.test(label))throw new Error('Use a simple report label.');
const base='http://127.0.0.1:8787';
const {token}=await (await fetch(`${base}/api/bootstrap`)).json();
const sessions:Session[]=await (await fetch(`${base}/api/sessions`,{headers:{authorization:`Bearer ${token}`}})).json();
const session=sessions.filter(s=>s.siteId==='creem').sort((a,b)=>b.startedAt-a.startedAt)[0];
if(!session)throw new Error('No Creem Nova session exists.');
const report={id:session.id,status:session.status,url:session.url,model:session.model,usage:session.usage,messages:session.messages,traces:session.traces,actionSteps:session.actionSteps,startedAt:session.startedAt,recordingClicks:session.recordingClicks};
await mkdir('artifacts/creem/rehearsals',{recursive:true});
await writeFile(`artifacts/creem/rehearsals/${label}.json`,JSON.stringify(report,null,2),{mode:0o600});
console.log(JSON.stringify({status:report.status,messages:report.messages.map(m=>({role:m.role,at:m.at,text:m.text.slice(0,500),questionCard:m.clarification?.title})),steps:report.actionSteps?.map(s=>({at:s.at,title:s.title,status:s.status,detail:s.detail})),recent:report.traces.slice(-5),usage:report.usage},null,2));
