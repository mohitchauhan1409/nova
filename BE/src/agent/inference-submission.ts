import type {Action,Snapshot} from '../../../shared/types';
import type {InferencePlayground} from '../sites/action-semantics';

const consequentialContext=/\b(recipient|e-?mail|sms|phone|channel|publish|public|payment|billing|bank account|purchase|delete|security|permissions?|administrator|admin access|two.factor|2fa|password|agreement|contract|terms|top.up|recharge|funds|api key|access token|client secret|private key)\b/i;

export function requestedInferenceSubmission(action:Action,snapshot:Snapshot,scope:string,intent:string,rules:readonly InferencePlayground[]):boolean {
  if(action.kind!=='click'||action.risk!=='change'||snapshot.observation?.sensitiveFieldsPresent)return false;
  const target=snapshot.elements.find(element=>element.ref===action.ref);
  if(!target||target.tag!=='button'||target.type!=='button'||!/^(send|run(?: prompt)?|generate)$/i.test(target.name)||target.href||target.visual||target.covered||target.disabled||target.sensitive||!target.submission||target.submission.fields.length!==1)return false;
  const submitted=target.submission.fields[0];
  const prompt=snapshot.elements.find(element=>element.ref===submitted.ref);
  if(!prompt||prompt.tag!=='textarea'||prompt.covered||prompt.disabled||prompt.sensitive||prompt.visual||prompt.edit?.empty!==false||prompt.edit.revision!==submitted.revision||
    !prompt.state?.includes(`draft:matches:${prompt.ref}`)||consequentialContext.test(`${target.context} ${target.submission.label} ${prompt.name} ${prompt.context}`))return false;
  // A second recipient or attachment field must not be mistaken for the single
  // inference composer, even if the page also contains model settings.
  if(snapshot.elements.some(element=>!element.covered&&(['input','textarea','select'].includes(element.tag)||element.role==='textbox')&&
    (element.sensitive||consequentialContext.test(element.name)||element.type==='file')))return false;
  let current:URL,attached:URL;
  try{current=new URL(snapshot.url);attached=new URL(scope);}catch{return false;}
  if(current.protocol!=='https:'||current.username||current.password||current.search||current.hash||attached.origin!==current.origin)return false;
  const matched=rules.some(rule=>{
    let configured:URL;try{configured=new URL(rule.url);}catch{return false;}
    return configured.href===current.href&&target.name===rule.submitName&&prompt.name===rule.promptName&&rule.requiredControls.length>=2&&
      rule.requiredControls.every(marker=>snapshot.elements.some(element=>element.tag===marker.tag&&element.name===marker.name&&!element.covered&&!element.disabled&&!element.sensitive));
  });
  if(!matched)return false;
  // Later stop/review instructions win. Text following “Run this prompt:” is
  // model input, not an instruction to reinterpret as permission or revocation.
  const request=intent.split('\n').map(line=>line.split(':',1)[0]).reverse().find(line=>/\b(run|test|submit|send|stop|cancel|wait|never|hold|review|approve|approval|confirmation|don['’]?t|do not|ask|check with)\b/i.test(line))||'';
  return /\b(run|test|submit|send)\b.{0,100}\b(prompt|model|playground|inference|classification)\b/i.test(request)&&
    !/\b(don['’]?t|do not|never|without|stop|cancel|wait|hold|draft|prepare|only|how|what if|explain|after|until|review|approve|approval|confirmation)\b|\b(ask|check with) me\b/i.test(request);
}
