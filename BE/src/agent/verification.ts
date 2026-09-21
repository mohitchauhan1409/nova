import type { Action, ActionResult, Snapshot, Session } from '../../../shared/types';

export type Effect = { verified: boolean; detail: string; action: Action['kind'] };
const normalize = (text: string) => text.replace(/\s+/g,' ').trim();
export function completionSnapshotChanged(before:Snapshot,after:Snapshot,action:Action):boolean {
  const semantic=(snapshot:Snapshot)=>{
    // Explicit timers are incidental unless the answer actually cites one.
    // Ignore capture IDs, focus, scrolling, ref churn and newly attached draft
    // proof; actual editable-value revisions and loaded record data still count.
    const timers=snapshot.elements.filter(e=>e.role==='timer'&&e.name&&!action.completion?.evidence.some(p=>p.ref===e.ref||p.source==='text'&&p.value.includes(e.name)));
    const text=(value:string)=>normalize(timers.reduce((value,e)=>value.replaceAll(e.name,''),value));
    const elements=snapshot.elements.filter(e=>!timers.includes(e)).map(e=>JSON.stringify([
      e.tag,e.role,text(e.name),e.type,e.href,text(e.context),e.disabled,e.sensitive,
      e.state?.filter(s=>!/^(scroll(?:Max)?[XY]|focused|draft):/.test(s)).sort()||[],e.edit,
    ])).sort();
    return JSON.stringify([snapshot.url,text(snapshot.title),snapshot.blocked,text(snapshot.text),elements,snapshot.observation?.omittedControls]);
  };
  return semantic(before)!==semantic(after);
}
export function actionEffect(action: Action, before: Snapshot, after: Snapshot, result?: unknown, mayCommit = false): Effect {
  const receipt = result as ActionResult | undefined;
  if(receipt?.ok === false) return {action:action.kind,verified:false,detail:receipt.detail || 'The browser rejected this action.'};
  if(receipt?.verification?.status === 'verified') return {action:action.kind,verified:true,detail:receipt.verification.detail};
  const targetBefore = before.elements.find(e=>e.ref===action.ref);
  const targetAfter = after.elements.find(e=>e.ref===action.ref);
  if(before.url!==after.url) return {action:action.kind,verified:true,detail:`Navigation observed: ${after.url}`};
  const destination = action.kind === 'navigate' ? action.url :
    ['click','double_click'].includes(action.kind) ? targetBefore?.href : undefined;
  if (destination) {
    try {
      const intended = new URL(destination, before.url);
      const current = new URL(before.url);
      if (intended.origin !== current.origin || intended.pathname !== current.pathname || intended.search !== current.search) {
        return {action:action.kind,verified:false,detail:'The requested navigation is still pending. Wait for the destination before planning another click.'};
      }
    } catch { /* Invalid destinations are rejected by policy before dispatch. */ }
  }
  // A commit can dismiss autofill or move focus while its unchanged draft is
  // still waiting for the server. Those control changes are not a saved result.
  const retainedDraft = targetBefore && before.elements.some(e =>
    e.context === targetBefore.context && e.edit?.empty === false &&
    after.elements.some(next => next.ref === e.ref && next.edit?.empty === false && next.edit.revision === e.edit?.revision));
  const semanticState = (states?: string[]) => states?.filter(s => /^(checked|selected|pressed|expanded|value):/.test(s));
  const controlChanged = JSON.stringify(semanticState(targetBefore?.state)) !== JSON.stringify(semanticState(targetAfter?.state));
  if (mayCommit && !controlChanged && ['click','double_click','press'].includes(action.kind) && targetAfter && retainedDraft &&
      (targetAfter.disabled || normalize(before.text) === normalize(after.text))) {
    return {action:action.kind,verified:false,detail:'The submitted draft is still present without a saved result. Wait for the website before planning another submission.'};
  }
  // A submit button often disappears behind a spinner before persistence. Its
  // label/disabled-state change alone must not release the next planned action.
  if (['click','double_click'].includes(action.kind) && targetBefore?.type === 'submit' &&
      !targetBefore.disabled && targetAfter?.disabled &&
      (!targetAfter.name.trim() || /\b(saving|adding|creating|submitting|loading)\b/i.test(targetAfter.name)) &&
      before.elements.some(e => e.context === targetBefore.context && e.edit?.empty === false &&
        after.elements.some(next => next.ref === e.ref && next.edit?.empty === false && next.edit.revision === e.edit?.revision))) {
    return {action:action.kind,verified:false,detail:'The form is still submitting. Wait for the saved result without submitting again.'};
  }
  if(['scroll','scroll_to','zoom'].includes(action.kind)&&JSON.stringify(before.viewport)!==JSON.stringify(after.viewport)) return {action:action.kind,verified:true,detail:'The browser viewport changed.'};
  if(targetBefore && targetAfter && JSON.stringify(targetBefore.state)!==JSON.stringify(targetAfter.state)) return {action:action.kind,verified:true,detail:`Control state changed: ${targetAfter.name} ${targetAfter.state?.join(', ') || ''}`};
  if(normalize(before.text)!==normalize(after.text)) return {action:action.kind,verified:true,detail:'Visible page content changed. Completion still requires evidence of the requested outcome.'};
  if(JSON.stringify(before.elements.map(e=>[e.ref,e.name,e.disabled,e.state]))!==JSON.stringify(after.elements.map(e=>[e.ref,e.name,e.disabled,e.state]))) return {action:action.kind,verified:true,detail:'Visible controls changed. Check that they match the requested outcome.'};
  return {action:action.kind,verified:false,detail:'Input was sent, but no resulting page or control change was observed.'};
}

export function completionProblem(action: Action, snapshot: Snapshot, effect?: Effect, attempted = false, progress?:Session['progress']): string | undefined {
  const completion = action.completion;
  if(completion?.status==='blocked')return;
  if(attempted && !effect?.verified)return 'The last action has no verified result. Inspect, wait for a real outcome, or report the blocked step; do not claim completion.';
  if(!completion) return 'Provide a completion status and observed evidence. A dispatched action is not proof of success.';
  if(completion.status==='answer' && !attempted)return;
  const matched = completion.evidence.some(proof=>{
    if(!proof.value.trim())return false;
    if(proof.source==='text')return normalize(snapshot.text).includes(normalize(proof.value))||snapshot.elements.some(e=>!e.sensitive&&normalize(e.name)===normalize(proof.value));
    if(proof.source==='url')return snapshot.url===proof.value;
    if(proof.source==='state'){const value=proof.value.replace(/^aria-/,'').replace('=',':');return !!snapshot.elements.find(e=>e.ref===proof.ref&&!e.sensitive)?.state?.includes(value)||!!(progress?.url===snapshot.url&&progress.settings.some(s=>s.ref===proof.ref&&s.afterReload===progress.reloads&&s.state.includes(value)));}
    if(proof.source==='action')return effect?.verified && effect.action===proof.value && ['fill','type','clear','paste','check','select','scroll','scroll_to','zoom','media','copy','select_text'].includes(effect.action);
    return false;
  });
  if(!matched)return 'The claimed outcome has no matching evidence in the current page. Supply an exact observed result, URL, control state, or verified action result.';
}
