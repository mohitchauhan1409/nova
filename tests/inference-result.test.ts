import {describe,expect,it} from 'vitest';
import {inferenceLogCompletionProblem,type InferenceSubmissionReceipt} from '../BE/src/agent/inference-result';
import type {InferencePlayground} from '../BE/src/sites/action-semantics';
import type {Action,Snapshot} from '../shared/types';
const url='https://model.example.test/playground',logUrl='https://model.example.test/logs';
const rules:InferencePlayground[]=[{url,submitName:'Send',promptName:'Prompt',requiredControls:[],resultLog:{url:logUrl,dialogName:'Log detail',inputLabel:'Input',outputLabel:'Output',outputEndLabel:'Get help with this request',timestamp:{format:'day-first-24h',utcOffsetMinutes:330}}}];
const receipt:InferenceSubmissionReceipt={url,prompt:'Order 104 arrived damaged.',submittedAt:Date.UTC(2026,8,22,4,43,11,526)};
const done:Action={kind:'done',ref:null,value:null,url:null,x:null,y:null,risk:'read',summary:'Verified damage result',completion:{status:'completed',evidence:[{source:'text',ref:'result',value:'{"category":"damage"}'}]}};
function snapshot(prompt=receipt.prompt,output='{"category":"damage"}',stamp='22/09/2026, 10:13:12'):Snapshot {
  const element=(ref:string,name:string,role='',tag='p')=>({ref,name,role,tag,type:'',context:'',disabled:false,sensitive:false});
  return {id:'snapshot',url:logUrl,title:'Logs',text:['Log detail','request-old-or-new',stamp,'200','Input','4 messages','system','Classify the order.','user',receipt.prompt,'assistant','{"category":"damage"}','user',prompt,'Output',`${output.length} chars`,output,'Get help with this request','Logs'].join('\n'),elements:[element('dialog','Log detail','dialog','div'),element('help','Get help with this request','','button'),element('history','{"category":"damage"}'),element('output-label','Output'),element('result',output)],viewport:{width:1000,height:800},theme:{color:'#fff',font:'sans'},frames:0,capturedAt:receipt.submittedAt+10_000};
}
const check=(page=snapshot(),action=done,submitted:InferenceSubmissionReceipt|undefined=receipt,intent='Test this prompt. Check Logs.')=>inferenceLogCompletionProblem(action,page,intent,submitted,rules);
describe('same-request Input and Output completion proof',()=>{
  it('rejects the reported historical-input trap even when the requested prompt and damage response occur in history',()=>{
    expect(check(snapshot('Order 106 is exactly seven days late.','{"category":"delivery","escalate":false}','22/09/2026, 09:38:24'))).toContain('final Input user message');
  });
  it('accepts exact final user Input, current timestamp and actual Output evidence',()=>{expect(check()).toBeUndefined();});
  it('rejects an older identical prompt/output after a genuine new submission',()=>{expect(check(snapshot(receipt.prompt,undefined,'22/09/2026, 09:38:24'))).toContain('timestamp');});
  it('rejects a failed response status despite matching input and output text',()=>{expect(check({...snapshot(),text:snapshot().text.replace('\n200\n','\n500\n')})).toContain('successful response status');});
  it('does not normalize quoted input whitespace or accept a substring as the prompt',()=>{
    for(const prompt of ['Order  104 arrived damaged.','Quoted: '+receipt.prompt,receipt.prompt+'\nAnother instruction.'])expect(check(snapshot(prompt))).toContain('final Input user message');
  });
  it('requires actual Output evidence instead of an earlier assistant ref or a status',()=>{
    for(const evidence of [[{source:'text' as const,ref:'history',value:'{"category":"damage"}'}],[{source:'text' as const,ref:null,value:'200'}]])expect(check(snapshot(),{...done,completion:{status:'completed',evidence}})).toContain('actual Output section');
    expect(check(snapshot(receipt.prompt,'{"category":"delivery"}'))).toContain('actual Output section');
  });
  it('rejects missing/ambiguous sections, role boundaries and timestamp',()=>{
    for(const text of [snapshot().text.replace('4 messages','5 messages'),snapshot().text.replace('\nOutput\n','\nOutput\nOutput\n'),snapshot().text.replace('22/09/2026, 10:13:12','Unknown time'),snapshot().text.replace('22/09/2026, 10:13:12','31/02/2026, 10:13:12')])expect(check({...snapshot(),text})).toBeDefined();
    expect(check({...snapshot(),elements:[]})).toContain('missing or ambiguous');
  });
  it('requires opening the log if requested, while an ordinary playground answer is outside this contract',()=>{
    expect(check({...snapshot(),url},done,receipt)).toContain('not been inspected');
    expect(check({...snapshot(),url},done,receipt,'Run this prompt.')).toBeUndefined();
    expect(inferenceLogCompletionProblem(done,snapshot(),'Check Logs.',undefined,rules)).toContain('verified draft receipt');
    expect(inferenceLogCompletionProblem(done,{...snapshot(),url:'https://other.example.test/logs'},'Check Logs.',undefined,rules)).toBeUndefined();
  });
});
