import type {Action,Snapshot} from '../../../shared/types';
import type {InferencePlayground} from '../sites/action-semantics';

export type InferenceSubmissionReceipt={prompt:string;submittedAt:number;url:string};
const again='Inspect the new matching log or report that it could not be verified. Do not submit the prompt again.';
const normalized=(value:string)=>value.replace(/\s+/g,' ').trim();

// Completion-only proof for an explicitly registered conversation-log layout.
// A Send receipt proves dispatch, not that any old matching history is its result.
export function inferenceLogCompletionProblem(action:Action,snapshot:Snapshot,intent:string,receipt:InferenceSubmissionReceipt|undefined,rules:readonly InferencePlayground[]):string|undefined {
  const sameOrigin=(left:string,right:string)=>{try{return new URL(left).origin===new URL(right).origin;}catch{return false;}};
  const rule=rules.find(rule=>rule.resultLog&&(receipt?rule.url===receipt.url:sameOrigin(rule.url,snapshot.url)));
  const log=rule?.resultLog;if(!log)return;
  if(snapshot.url!==log.url&&!/\b(?:check|verify|inspect|open)\s+(?:the\s+)?logs?\b/i.test(intent))return;
  if(!receipt)return 'The exact submitted prompt has no current verified draft receipt. '+again;
  if(snapshot.url!==log.url)return 'The requested log has not been inspected for this submission. '+again;
  const dialogs=snapshot.elements.filter(e=>e.role==='dialog'&&e.name===log.dialogName&&!e.covered&&!e.sensitive);
  const lines=snapshot.text.trim().split('\n');
  const unique=(label:string)=>{const found=lines.flatMap((line,i)=>line===label?[i]:[]);return found.length===1?found[0]:-1;};
  const input=unique(log.inputLabel),output=unique(log.outputLabel),end=unique(log.outputEndLabel);
  if(dialogs.length!==1||lines[0]!==log.dialogName||input<1||output<=input+2||end<=output+2)return 'The current log Input and Output sections are missing or ambiguous. '+again;
  const count=/^(\d+) messages?$/.exec(lines[input+1]);
  if(!count||!/^\d+ chars?$/.test(lines[output+1]))return 'The current log message/output boundaries are not verified. '+again;
  const messages:{role:string;lines:string[]}[]=[];
  for(const line of lines.slice(input+2,output)){
    if(/^(system|user|assistant)$/.test(line))messages.push({role:line,lines:[]});
    else if(messages.length)messages[messages.length-1].lines.push(line);
    else return 'The current log Input message boundaries are not verified. '+again;
  }
  const latest=messages.at(-1);
  if(messages.length!==Number(count[1])||latest?.role!=='user')return 'The current log does not expose an unambiguous final user Input. '+again;
  if(latest.lines.join('\n')!==receipt.prompt)return 'This log belongs to a different prompt: its final Input user message does not equal the prompt submitted in this command. Older Input history is not the current result. '+again;
  const stamps=lines.slice(1,input).filter(line=>/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/.test(line));
  if(stamps.length!==1||!Number.isInteger(log.timestamp.utcOffsetMinutes)||Math.abs(log.timestamp.utcOffsetMinutes)>840)return 'The current log timestamp cannot be verified. '+again;
  if(!/^2\d\d$/.test(lines[lines.indexOf(stamps[0])+1]||''))return 'The current log does not show a successful response status. Inspect its actual error or report the blocked result; do not claim success or resubmit.';
  const [day,month,year,hour,minute,second]=stamps[0].match(/\d+/g)!.map(Number);
  const wall=Date.UTC(year,month-1,day,hour,minute,second),date=new Date(wall);
  if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day||hour>23||minute>59||second>59)return 'The current log timestamp is invalid. '+again;
  const loggedAt=wall-log.timestamp.utcOffsetMinutes*60_000;
  if(loggedAt<Math.floor(receipt.submittedAt/1000)*1000||loggedAt>snapshot.capturedAt+1000)return 'This log timestamp does not belong to the current submission. An older identical prompt/result is insufficient. '+again;
  const result=lines.slice(output+2,end).join('\n');
  if(!result.trim())return 'The current matching log has no Output result yet. '+again;
  const outputIndex=snapshot.elements.findIndex(e=>e.name===log.outputLabel);
  // Snapshot controls can precede text leaves, so the end button need not be
  // after the output text in this array. Input-history leaves precede Output.
  const outputRefs=new Set(outputIndex>=0?snapshot.elements.slice(outputIndex+1).filter(e=>!e.sensitive&&normalized(result).includes(normalized(e.name))).map(e=>e.ref):[]);
  if(!action.completion?.evidence.some(proof=>proof.source==='text'&&proof.value.trim()&&normalized(result).includes(normalized(proof.value))&&(!proof.ref||outputRefs.has(proof.ref))))return 'Cite the actual Output section of this matching log. Quoted assistant history inside Input and status 200 alone are not output proof. '+again;
}
