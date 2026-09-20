import { useState } from 'react';
import { Check, ChevronDown, Circle, LoaderCircle, Pause, TriangleAlert } from 'lucide-react';
import type { ActionStep } from '../../../shared/types';

/** Execution receipts, never inferred from an attempted click or a changing page. */
export function ActionTimeline({ steps, active }: { steps: ActionStep[]; active: boolean }) {
  const [expanded, setExpanded] = useState(false);
  if (!steps.length) return null;
  const verified = steps.filter(step => step.status === 'verified').length;
  const showAll = active || expanded;
  const visible = showAll ? steps : steps.slice(-3);
  return <section className="np-action-timeline" aria-label="Task steps">
    <button className="np-action-heading" aria-expanded={showAll} onClick={() => { if (!active) setExpanded(!expanded); }}>
      <span className={`np-action-status ${active ? 'active' : ''}`}/>
      <strong>{active ? 'Taking care of it' : 'What happened'}</strong>
      <span>{verified}/{steps.length} verified</span><ChevronDown size={13}/>
    </button>
    {!showAll && steps.length > 3 && <button className="np-earlier-steps" onClick={() => setExpanded(true)}>Show {steps.length - 3} earlier steps</button>}
    <ol>{visible.map(step => <li key={step.id} data-status={step.status}>
      <span className="np-step-icon">{step.status === 'verified' ? <Check size={12}/> : ['running','checking'].includes(step.status) ? <LoaderCircle size={12}/> : step.status === 'stopped' ? <Pause size={11}/> : step.status === 'failed' ? <TriangleAlert size={12}/> : <Circle size={10}/>}</span>
      <div><p>{step.title}</p><small>{step.status === 'running' ? 'In progress' : step.status === 'checking' ? 'Checking the result' : step.status === 'verified' ? 'Verified on page' : step.status === 'stopped' ? 'Stopped' : step.status === 'failed' ? 'Could not complete' : 'Result not yet confirmed'}</small>
        {expanded && step.detail && <p className="np-step-detail">{step.detail}</p>}
      </div>
    </li>)}</ol>
  </section>;
}
