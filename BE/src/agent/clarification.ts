import {randomUUID} from 'node:crypto';
import {clarificationSchema,clarificationAnswersSchema,type Action,type Clarification,type ClarificationAnswers} from '../../../shared/types';
import {redactSecrets} from '../config';

const secretQuestion=/\b(password|passcode|otp|one[- ]time (?:code|password)|api[- ]?key|secret key|access token|auth(?:entication)? token|cvv|cvc|card number|bank account|routing number|recovery (?:code|phrase)|seed phrase)\b/i;
export function makeClarification(action:Action,clean:(text:string)=>string):Clarification{
  const draft=action.clarification||{title:'A quick detail',description:'',questions:[{id:'detail',label:action.summary.slice(0,160),description:action.summary.length>160?action.summary.slice(0,300):'',type:'long_text',required:true,placeholder:'Tell Nova what you have in mind…',options:[]}]};
  const parsed=clarificationSchema.parse(draft);
  if(new Set(parsed.questions.map(q=>q.id)).size!==parsed.questions.length)throw new Error('Question IDs must be distinct.');
  if(secretQuestion.test(JSON.stringify(parsed)))throw new Error('Do not collect credentials or payment secrets in question cards. Ask the user to handle that step on the website.');
  for(const q of parsed.questions){
    if(secretQuestion.test(`${q.label} ${q.description} ${q.placeholder}`))throw new Error('Do not collect credentials or payment secrets in question cards. Ask the user to handle that step on the website.');
    if(q.type.includes('choice')&&!q.options.length)throw new Error('Choice questions need concrete options.');
    if(new Set(q.options.map(o=>o.label.toLowerCase())).size!==q.options.length)throw new Error('Question choices must be distinct.');
  }
  return {id:randomUUID(),title:clean(parsed.title),description:clean(parsed.description),questions:parsed.questions.map(q=>({...q,label:clean(q.label),description:clean(q.description),placeholder:clean(q.placeholder),options:q.options.map(o=>({label:clean(o.label),description:clean(o.description)}))}))};
}
export function validateAnswers(card:Clarification,raw:ClarificationAnswers){
  const answers=clarificationAnswersSchema.parse(raw);
  const known=new Set(card.questions.map(q=>q.id));
  if(new Set(answers.map(a=>a.questionId)).size!==answers.length||answers.some(a=>!known.has(a.questionId)))throw new Error('These answers do not match the current questions.');
  const normalized=card.questions.map(q=>{
    const values=[...new Set((answers.find(a=>a.questionId===q.id)?.values||[]).map(v=>v.trim()).filter(Boolean))];
    if(q.required&&!values.length)throw new Error(`Please answer: ${q.label}`);
    if(q.type!=='multi_choice'&&values.length>1)throw new Error(`Choose one answer for: ${q.label}`);
    if(q.type==='number'&&values.length&&!Number.isFinite(Number(values[0])))throw new Error(`Enter a number for: ${q.label}`);
    if(values.some(v=>redactSecrets(v)!==v))throw new Error('Keep API keys and credentials out of this form. Enter them directly on the website.');
    return {questionId:q.id,values};
  });
  const text=`Details for ${card.title}:\n${card.questions.map(q=>`${q.label}: ${normalized.find(a=>a.questionId===q.id)!.values.join('; ')||'Not specified'}`).join('\n')}`;
  if(text.length>8000)throw new Error('Please shorten these answers to continue.');
  return {answers:normalized,text};
}
export function questionText(card:Clarification){return [card.title,card.description,...card.questions.map(q=>`${q.label}${q.options.length?` Choices: ${q.options.map(o=>o.label).join('; ')}.`:''}`)].filter(Boolean).join('\n');}
