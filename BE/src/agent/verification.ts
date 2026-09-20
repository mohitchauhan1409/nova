import type { Action, ActionResult, Snapshot, Session } from '../../../shared/types';

export type Effect = { verified: boolean; detail: string; action: Action['kind'] };
const normalize = (text: string) => text.replace(/\s+/g,' ').trim();
export function actionEffect(action: Action, before: Snapshot, after: Snapshot, result?: unknown): Effect {
  const receipt = result as ActionResult | undefined;
  if(receipt?.ok === false) return {action:action.kind,verified:false,detail:receipt.detail || 'The browser rejected this action.'};
  if(receipt?.verification?.status === 'verified') return {action:action.kind,verified:true,detail:receipt.verification.detail};
  const targetBefore = before.elements.find(e=>e.ref===action.ref);
  const targetAfter = after.elements.find(e=>e.ref===action.ref);
  if(before.url!==after.url) return {action:action.kind,verified:true,detail:`Navigation observed: ${after.url}`};
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
