import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Check,CheckCheck,HelpCircle,MessageCircle} from 'lucide-react';
import type {ClarificationAnswers,ClarificationRecord} from '../../../shared/types';

export function QuestionCard({card,active,disabled,error,onSubmit,onHelp}:{card:ClarificationRecord;active:boolean;disabled:boolean;error:string;onSubmit:(answers:ClarificationAnswers)=>boolean;onHelp:(answers:ClarificationAnswers)=>void}){
  const [values,setValues]=useState<Record<string,string[]>>({});
  const [custom,setCustom]=useState<Record<string,string>>({});
  const [customOpen,setCustomOpen]=useState<Record<string,boolean>>({});
  const [submitted,setSubmitted]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({});
  const root=useRef<HTMLFormElement>(null);
  useEffect(()=>{if(error)setSubmitted(false);},[error]);
  useEffect(()=>{if(!submitted)return;const timer=setTimeout(()=>setSubmitted(false),12000);return()=>clearTimeout(timer);},[submitted]);
  const answers=():ClarificationAnswers=>card.questions.map(q=>({questionId:q.id,values:[...(values[q.id]||[]),...(customOpen[q.id]&&custom[q.id]?.trim()?[custom[q.id].trim()]:[])]}));
  const completed=answers().filter(a=>a.values.some(v=>v.trim())).length;
  if(!active)return <details className="np-question-receipt"><summary><CheckCheck size={15}/><span>{card.title}</span><small>{card.status==='answered'?'Answered':card.status==='cancelled'?'Cancelled':'Continued in chat'}</small></summary><dl>{card.questions.map(q=><div key={q.id}><dt>{q.label}</dt><dd>{card.answers?.find(a=>a.questionId===q.id)?.values.join(' · ')||'See conversation'}</dd></div>)}</dl></details>;
  const locked=disabled||submitted;
  return <form ref={root} className="np-question-card" aria-label={card.title} noValidate onSubmit={event=>{
    event.preventDefault();if(locked)return;
    const answer=answers();const nextErrors:Record<string,string>={};
    for(const q of card.questions){const entered=answer.find(a=>a.questionId===q.id)!.values.filter(v=>v.trim());if(q.required&&!entered.length)nextErrors[q.id]='Add an answer to continue.';else if(q.type==='number'&&entered.length&&!Number.isFinite(Number(entered[0])))nextErrors[q.id]='Enter a valid number.';}
    setErrors(nextErrors);if(Object.keys(nextErrors).length){root.current?.querySelector<HTMLElement>(`[data-question="${Object.keys(nextErrors)[0]}"] input, [data-question="${Object.keys(nextErrors)[0]}"] textarea, [data-question="${Object.keys(nextErrors)[0]}"] button`)?.focus();return;}
    if(onSubmit(answer))setSubmitted(true);
  }}>
    <header><span className="np-question-kicker"><MessageCircle size={13}/> LET’S GET THE DETAILS RIGHT</span><h3>{card.title}</h3>{card.description&&<p>{card.description}</p>}<div className="np-question-progress"><span>{completed} of {card.questions.length} answered</span><div role="progressbar" aria-label="Questions answered" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={card.questions.length}><i style={{width:`${completed/card.questions.length*100}%`}}/></div></div></header>
    <div className="np-question-fields">{card.questions.map((q,index)=>{
      const id=`${card.id}-${q.id}`;const selection=values[q.id]||[];
      const change=(next:string[])=>{setValues(old=>({...old,[q.id]:next}));setErrors(old=>({...old,[q.id]:''}));};
      return <fieldset key={q.id} data-question={q.id} disabled={locked} aria-describedby={`${id}-hint${errors[q.id]?` ${id}-error`:''}`}><legend><span>{String(index+1).padStart(2,'0')}</span>{q.label}{!q.required&&<small>Optional</small>}</legend>{q.description&&<p id={`${id}-hint`}>{q.description}</p>}
        {q.type.includes('choice')?<><div className="np-question-options" role={q.type==='single_choice'?'radiogroup':'group'} aria-label={q.label}>{q.options.map(option=><button type="button" key={option.label} role={q.type==='single_choice'?'radio':'checkbox'} aria-checked={selection.includes(option.label)} className={selection.includes(option.label)?'selected':''} onClick={()=>{change(q.type==='multi_choice'?(selection.includes(option.label)?selection.filter(v=>v!==option.label):[...selection,option.label]):[option.label]);if(q.type==='single_choice')setCustomOpen(old=>({...old,[q.id]:false}));}}><span className="np-choice-dot">{selection.includes(option.label)&&<Check size={11}/>}</span><span><strong>{option.label}</strong>{option.description&&<small>{option.description}</small>}</span></button>)}</div><button type="button" className="np-custom-choice" aria-expanded={!!customOpen[q.id]} onClick={()=>{setCustomOpen(old=>({...old,[q.id]:!old[q.id]}));if(q.type==='single_choice')change([]);}}>Something else{customOpen[q.id]?' −':' +'}</button>{customOpen[q.id]&&<input aria-label={`${q.label} — your answer`} maxLength={2000} placeholder="Describe what you have in mind" value={custom[q.id]||''} onChange={e=>{setCustom(old=>({...old,[q.id]:e.target.value}));setErrors(old=>({...old,[q.id]:''}));}}/>}</>
        :q.type==='long_text'?<textarea aria-label={q.label} aria-invalid={!!errors[q.id]} placeholder={q.placeholder||'Add a few details…'} maxLength={2000} rows={3} value={selection[0]||''} onChange={e=>change([e.target.value])}/>
        :<input aria-label={q.label} aria-invalid={!!errors[q.id]} inputMode={q.type==='number'?'decimal':'text'} placeholder={q.placeholder||'Your answer'} maxLength={2000} value={selection[0]||''} onChange={e=>change([e.target.value])}/>}
        {errors[q.id]&&<small id={`${id}-error`} className="np-question-error" role="alert">{errors[q.id]}</small>}
      </fieldset>;
    })}</div>
    <footer><button type="button" className="np-question-help" disabled={locked} onClick={()=>onHelp(answers())}><HelpCircle size={14}/>Help me choose</button><button type="submit" className="np-question-continue" disabled={locked}>{submitted?'Continuing…':'Continue'}<ArrowUpRight size={15}/></button><p>You can also answer or change a detail in chat.</p></footer>
  </form>;
}
