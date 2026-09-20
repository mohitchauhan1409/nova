import { createHash } from 'node:crypto';
import type { Action, Snapshot } from '../../../shared/types';
import { parseWebUrl } from '../browser/security';

export type PolicyDecision = { outcome: 'allow' | 'approve' | 'block'; reason: string; target: string; mayCommit: boolean };
export function fingerprint(snapshot: Snapshot, action: Action): string {
  const target = snapshot.elements.find(e => e.ref === action.ref);
  const destination = action.kind === 'drag' ? snapshot.elements.find(e => e.ref === action.value) : undefined;
  const stable=(el:typeof target)=>el&&({...el,state:el.state?.filter(s=>!/^scroll[XY]:/.test(s)).sort(),...(el.submission?{context:undefined,submission:{...el.submission,fields:[...el.submission.fields].sort((a,b)=>a.ref.localeCompare(b.ref))}}:{})});
  // Message approval belongs to this composer and its draft revisions. Carousels,
  // transcript streaming, viewport order and textarea scrolling are unrelated.
  // Other commitments retain page details, including product price and quantity.
  const text=target?.submission?undefined:snapshot.text.split('\n').map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean).sort().join('\n');
  return createHash('sha256').update(JSON.stringify({ url: snapshot.url, text, target:stable(target), destination:stable(destination), action })).digest('hex');
}
const serious = /\b(place|confirm|complete|submit).{0,18}(order|payment|booking|purchase)|\b(buy|pay|purchase|transfer|donate|delete|erase|destroy|publish|send|post|upload)\b|\b(empty|clear).{0,10}trash|\b(cancel).{0,15}(order|booking|subscription)|\b(accept|agree).{0,20}(terms|contract)|\b(grant|change|manage).{0,16}(access|permission)|\b(make|share).{0,12}public|\b(disable|turn off).{0,15}(security|2fa|authentication)|\b(confirm|reserve|book)\b/i;
const sensitiveSettings = /\b(password|payment method|billing|bank account|permissions?|administrator|admin access|public access|two.factor|2fa|security settings)\b/i;
// Calling dashboards can spend money and contact real people with buttons that
// never say "send". Apply these boundaries across websites, not via a site-specific executor.
const dispatchControl = /\b(get|make|place|start|initiate|launch|schedule|retry|resume)\b.{0,35}\b(call|calls|campaign|batch)\b|\b(run|launch|start|resume|schedule)\b.{0,25}\b(campaign|batch)\b|^(call now|dial|dial now|redial)\b|\bsend test\b|\b(stop|cancel|pause)\b.{0,25}\b(queued calls|campaign|batch)\b/i;
const accountCommit = /\b(add funds|top.?up|recharge|buy (?:a )?(?:phone )?number|release (?:a )?(?:phone )?number)\b|\b(generate|create|rotate|revoke|reveal|show|copy)\b.{0,20}\b(api key|access token|client secret|private key)\b/i;
const browsingControl = /\b(search|play|pause|next|previous|close|dismiss|filter|sort|menu|expand|collapse|details|description|preview|cancel|back|view|show|hide|read|open|more|choose|select)\b/i;
const cartControl = /\badd.{0,16}(cart|basket)|\bremove.{0,24}(cart|basket)|\b(save for later|move to (cart|basket))\b/i;
const preferenceControl = /\b(like|dislike|subscribe|unsubscribe|follow|unfollow|wishlist|watch later|favorites?|favourites?|bookmarks?|save)\b/i;
const intentAllows = (intent: string, category: 'cart' | 'preference' | 'drag') => {
  // Keep clarification answers attached to their user request. Ignore purely
  // hypothetical questions and never turn a negated action into permission.
  const requested = category === 'cart' ? /\b(add|put|place|move|remove|take|save)\b.{0,100}\b(cart|basket|later)\b|\badd (it|this|that|them)\b/i : category === 'drag' ? /\b(drag|move|reorder|rearrange|organize|organise|sort)\b/i : /\b(like|dislike|subscribe|unsubscribe|follow|unfollow|wishlist|watch later|favorites?|favourites?|bookmarks?|save)\b/i;
  for (const line of intent.split('\n').reverse()) {
    if (!requested.test(line)) continue;
    if (/\b(how (do|would|can)|what (if|happens)|explain|tell me how)\b/i.test(line)) return false;
    if (/\b(after|only (after|when)|until).{0,20}\b(confirm|confirmation|approve|approval)|\b(ask|check with) me.{0,15}\b(first|before)|\bwait for.{0,15}\b(confirmation|approval)/i.test(line)) return false;
    const affirmative = line.replace(/\b(don['’]?t|do not|never|without|stop|cancel)\b[^,;.!?]*/gi, '');
    return requested.test(affirmative);
  }
  return false;
};
export function checkAction(action: Action, snapshot: Snapshot, _scope: string, intent = ''): PolicyDecision {
  const target = snapshot.elements.find(e => e.ref === action.ref);
  const name = target?.name || action.url || action.kind;
  const result = (outcome: PolicyDecision['outcome'], reason: string, mayCommit = false) => ({ outcome, reason, target: name, mayCommit });
  if (snapshot.blocked && !['done', 'ask'].includes(action.kind)) return result('block', snapshot.blocked);
  if(action.kind==='press'&&action.value==='Escape'&&!action.ref)return result('allow','Dismiss the current menu or dialog');
  if (['done', 'ask', 'wait', 'zoom', 'back', 'forward', 'reload'].includes(action.kind)) return result('allow', 'Continue the requested browsing task');
  if (action.kind === 'scroll' && !action.ref) return result('allow', 'Scroll the page');
  if (action.kind === 'screenshot') return snapshot.observation?.sensitiveFieldsPresent || snapshot.elements.some(e => e.sensitive) ? result('block', 'Visual capture is unavailable on a page containing sensitive input fields.') : result('allow', 'Inspect the visible page');
  if (action.kind === 'inspect') return result('allow', 'Inspect a screenshot point without sending input');
  if (target?.disabled) return result('block', 'The target is disabled. Observe the page again.');
  if (target?.sensitive) return result('block', 'Enter passwords, payment details, and verification codes directly in the browser.');
  if (target && ['click','double_click','press','check','select'].includes(action.kind) && (action.kind!=='press'||action.value==='Enter') && (dispatchControl.test(target.name)||accountCommit.test(target.name))) return result('approve','Review the exact recipients, live operation, timing and any charges or access changes before committing.',true);
  if (action.kind === 'navigate' || target?.href && ['click', 'double_click'].includes(action.kind)) {
    const url = action.kind === 'navigate' ? action.url || '' : target!.href!;
    let endpoint: string;
    try {
      const parsed = parseWebUrl(url);
      endpoint = decodeURIComponent(parsed.pathname).replace(/[-_/]/g, ' ');
      for (const key of ['action', 'do', 'cmd', 'command', 'operation']) endpoint += ` ${parsed.searchParams.get(key) || ''}`;
    } catch { return result('block', 'Only valid HTTP or HTTPS navigation is allowed.'); }
    if (/\b(delete|logout|signout|purchase|buy now|place order|unsubscribe|cart add|add to cart)\b/i.test(endpoint)) return result('approve', 'This link performs an account, cart, or purchase action.', true);
    if (target && (/^(delete|erase|destroy|pay|send|publish|upload|place order|confirm order|buy now)\b/i.test(target.name.trim()) || action.risk === 'sensitive')) return result('approve', 'Review this consequential action before following the link.', true);
    // Product/article titles can mention buying or payment without committing it.
    return result('allow', 'Open the relevant website page');
  }
  if (action.kind === 'point') return result('approve', 'The effect of this visual control could not be verified. Review the target before activating it.', true);
  if (!target || target.disabled) return result('block', 'The target is missing or disabled. Observe the page again.');
  if (target.sensitive) return result('block', 'Enter passwords, payment details, and verification codes directly in the browser.');
  if(target.visual&&!['scroll','scroll_to','hover','copy','select_text'].includes(action.kind))return result('approve','This unlabeled or canvas control has an unclear effect. Review it before input is sent.',true);
  if(action.kind==='media')return ['video','audio'].includes(target.tag)&&(['play','pause','mute','unmute'].includes(action.value||'')||/^seek:[+-]?\d{1,5}(?:\.\d+)?$/.test(action.value||''))?result('allow','Control the observed media player'):result('block','Choose an observed media player and a supported playback action.');
  if (['scroll', 'scroll_to', 'hover', 'right_click'].includes(action.kind)) return result('allow', 'Inspect an observed page control');
  if (['copy', 'select_text'].includes(action.kind)) return ['input', 'textarea'].includes(target.tag) || target.role === 'textbox' ? result('block', 'Copy visible page text, not private input values.') : result('allow', 'Select or copy visible page text');
  if (action.kind === 'drag') {
    const destination = snapshot.elements.find(e => e.ref === action.value);
    if (!destination || destination.sensitive || destination.disabled) return result('block', 'Choose an observed non-sensitive drop target.');
    if (serious.test(`${destination.name} ${destination.context}`) || /\b(trash|bin)\b/i.test(destination.name)) return result('approve', 'This move may delete or publish saved data.', true);
    return intentAllows(intent, 'drag') ? result('allow', 'Perform the requested move', true) : result('approve', 'This move was not clear from your request.', true);
  }
  if (['fill', 'type', 'clear', 'paste', 'search'].includes(action.kind)) {
    if (!['input', 'textarea'].includes(target.tag) && !['textbox', 'searchbox'].includes(target.role) && target.type !== 'contenteditable') return result('block', 'Text entry needs an observed editable field.');
    if (action.kind === 'search') return /search|query|find|\bq\b/i.test(`${target.name} ${target.type}`) && ['input', 'textarea'].includes(target.tag) ? result('allow', 'Enter and submit a search query') : result('block', 'Search combines typing with Enter and requires an input labelled search, query or find. For an ordinary filter field, use fill instead; it replaces the value without submitting. Do not repeat search on this target.');
    if (sensitiveSettings.test(`${target.name} ${target.context}`)) return result('approve', 'Review this change to sensitive account settings.', true);
    return result('allow', 'Prepare the requested text without submitting it', true);
  }
  if (action.kind === 'press' && (['Escape', 'Tab', 'Shift+Tab', 'Home', 'End', 'PageUp', 'PageDown', 'Backspace', 'Delete', 'ControlOrMeta+A', 'ControlOrMeta+Z', 'ControlOrMeta+Y'].includes(action.value || '') || /^Arrow/.test(action.value || ''))) {
    if (['Delete', 'Backspace'].includes(action.value || '') && !['input', 'textarea'].includes(target.tag) && target.role !== 'textbox' && target.type !== 'contenteditable') return result('approve', 'This key may delete a selected item.', true);
    return result('allow', 'Edit or navigate the current control', true);
  }
  if (action.kind === 'press' && action.value === 'Enter' && /search|query|find/i.test(`${target.name} ${target.type}`)) return result('allow', 'Submit a search query');
  const context = `${target.name} ${target.context}`;
  if (serious.test(target.name) || action.risk === 'sensitive' || sensitiveSettings.test(context) || /\b(subscribe|subscription|upgrade)\b/i.test(target.name) && /\b(pay|paid|billing|charge|per month|monthly|annual|trial)\b|[$₹€£]/i.test(target.context)) return result('approve', 'Review this purchase, communication, deletion, agreement, or sensitive account change.', true);
  // Inline title editors commit on Enter; they are not message composers.
  // Keep this after the consequential-action and sensitive-settings gates.
  if(action.kind==='press'&&action.value==='Enter'&&/^(rename|edit (?:name|title))\b/i.test(target.name.trim())&&(['input','textarea'].includes(target.tag)||target.role==='textbox')&&!target.submission)return result('allow','Save the requested inline name or title',true);
  if (cartControl.test(target.name)) return intentAllows(intent, 'cart') ? result('allow', 'Make the cart change you requested', true) : result('approve', 'Changing this cart was not clear from your request.', true);
  if (['select', 'check'].includes(action.kind)) return result('allow', 'Choose the requested filter, option, or variant', true);
  if (preferenceControl.test(target.name.replace(/\b(?:I['’]d|(?:I|we|you)\s+would)\s+like\s+to\b/gi, ''))) return intentAllows(intent, 'preference') ? result('allow', 'Make the preference change you requested', true) : result('approve', 'This saved preference was not clear from your request.', true);
  if (browsingControl.test(target.name) && !(serious.test(target.context) && (target.form || target.type === 'submit'))) return result('allow', 'Operate the website’s browsing controls');
  if (target.type === 'submit' || target.form && ['click', 'double_click', 'press'].includes(action.kind) || action.kind === 'press' && action.value === 'Enter') return result('approve', 'Review this form submission before information is sent.', true);
  if (['click', 'double_click'].includes(action.kind)) return result('allow', 'Continue the requested website interaction', true);
  return result('approve', 'The consequence of this action is not clear yet.', true);
}
