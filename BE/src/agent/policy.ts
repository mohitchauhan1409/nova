import { createHash } from 'node:crypto';
import type { Action, Snapshot } from '../../../shared/types';
import { parseWebUrl } from '../browser/security';
import { inferencePlaygrounds } from '../sites/action-semantics';
import { requestedInferenceSubmission } from './inference-submission';

export type PolicyDecision = { outcome: 'allow' | 'approve' | 'block'; reason: string; target: string; mayCommit: boolean; semantic?:'inference-submission' };
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
// A small, observed terminology form is a reversible metadata edit, not an
// arbitrary submission. This rule has no domain, route, or site-guide override.
function requestedTerminologyEdit(action: Action, snapshot: Snapshot, intent: string): boolean {
  const target = snapshot.elements.find(e => e.ref === action.ref);
  if (!target || action.risk !== 'change' || !['click', 'double_click'].includes(action.kind) ||
      !/^(add|save)(?: term| correction)?$/i.test(target.name.trim()) || target.submission) return false;
  if (serious.test(target.context) || sensitiveSettings.test(target.context)) return false;
  const fields = snapshot.elements.filter(e => e.context === target.context &&
    (['input', 'textarea'].includes(e.tag) || e.role === 'textbox'));
  if (fields.length !== 2 || fields.some(e => e.sensitive || e.disabled || e.edit?.empty !== false)) return false;
  if (!fields.some(e => /^(term(?: \(correct spelling\))?|correct spelling)$/i.test(e.name)) ||
      !fields.some(e => /^(heard as(?: \(mishearing\))?|mishearing)$/i.test(e.name))) return false;
  const topic = /\b(vocabulary|terminology|terms?|mishearings?|corrections?|product names?)\b/i;
  // Clarification labels and values do not revoke the original request. A later
  // actual instruction, including a negation or request to wait, still wins.
  const relevant = intent.split('\n').reverse().find(line => topic.test(line) && /\b(add|save|create|update|change|edit|stop|cancel|never|wait)\b/i.test(line));
  if (!relevant || /\b(how|what if|explain|after|until|confirmation|approve|approval)\b|\b(ask|check with) me\b/i.test(relevant)) return false;
  const affirmative = relevant.replace(/\b(don['’]?t|do not|never|without|stop|cancel)\b[^,;.!?]*/gi, '');
  return /\b(add|save|create|update)\b/i.test(affirmative) && topic.test(affirmative);
}
function requestedRecordEdit(action: Action, snapshot: Snapshot, intent: string): boolean {
  const target = snapshot.elements.find(e => e.ref === action.ref);
  if (!target || action.risk !== 'change' || target.submission) return false;
  const save = ['click','double_click'].includes(action.kind) && /^(save(?: changes)?|update|create|add|apply)(?:\s+.+)?$/i.test(target.name.trim());
  const prepare = ['fill','type','clear','paste'].includes(action.kind) && target.form;
  if (!save && !prepare) return false;
  const fields = snapshot.elements.filter(e => e.form && !e.covered &&
    (['input','textarea','select'].includes(e.tag) || ['textbox','checkbox','switch','combobox'].includes(e.role)));
  if (!fields.length || fields.some(e => e.sensitive || sensitiveSettings.test(e.name))) return false;
  // Key/value row identities come from the DOM observer. Require the visible
  // pair and its own form context; arbitrary nearby text cannot ground a save.
  const structuralKeys=fields.flatMap(e=>{
    if(!target.form||!/^value(?: \((?:optional|required)\))?$/i.test(e.name))return [];
    const match=e.context.match(/^Field key: ([a-z][a-z0-9_]{0,79})\. (.+)$/i);
    if(!match||!target.context.startsWith(match[2])||!fields.some(k=>k.context===e.context&&/^key(?: \((?:optional|required)\))?$/i.test(k.name)))return [];
    return [match[1]];
  });
  if(structuralKeys.some(key=>{
    const name=key.replace(/_/g,' ');
    return sensitiveSettings.test(name)||serious.test(name)||/\b(secrets?|tokens?|credentials?|api key|private key|access|authentication|security)\b/i.test(name);
  }))return false;
  // A named record editor supplies context for a plain Save/Update button.
  // Generic Continue/Add forms and transaction/account editors retain review.
  const heading = snapshot.elements.find(e => !e.covered && /^(h[1-4])$/.test(e.tag) &&
    /^(edit|update|create|new)\s+\S/i.test(e.name));
  if (!heading || /\b(account|billing|subscription|payment|order|purchase|booking|transfer|permission|credential|key|contract|agreement)\b/i.test(heading.name)) return false;
  const buttonSubject = save ? target.name.trim().replace(/^(save(?: changes)?|update|create|add|apply)\s*/i, '').toLowerCase() : '';
  const editorSubject = heading.name.trim().replace(/^(edit|update|create|new)\s+/i, '').toLowerCase();
  if (buttonSubject && buttonSubject !== editorSubject) return false;
  // Passive record help can mention billing without being an account setting.
  // Only this explicitly requested, named editor may discount that broad word;
  // actual billing fields/headings and every other sensitive term stay protected.
  if (sensitiveSettings.test(target.context.replace(/\bbilling\b/gi, ''))) return false;
  if (/\b(delete|erase|destroy|publish|send|recipient|accept terms|agree to|confirm payment|place order)\b/i.test(target.context)) return false;
  if (snapshot.elements.some(e => !e.covered && /\b(public|everyone|anyone with the link)\b/i.test(e.name) && e.state?.some(s => /^(checked|selected):true$/.test(s)))) return false;
  const request = intent.split('\n').reverse().find(line => /\b(save|update|create|add|apply|make|prepare|set|give|enable|disable|turn|change|edit|rename|stop|cancel|wait)\b/i.test(line));
  if (!request || /\b(how|what if|explain|after|until|confirmation|approve|approval|wait|stop|cancel)\b|\b(ask|check with) me\b/i.test(request)) return false;
  const affirmative = request.replace(/\b(don['’]?t|do not|never|without)\b[^,;.!?]*/gi, '');
  // A concrete rename can name the record instead of repeating the generic
  // editor heading. Require an observed name field and a direct new-name request;
  // conventional optional/required suffixes do not change that field's meaning.
  const rename = /^(?:actually[, ]+)?(?:(?:can|could|would) you(?: please)?\s+|please\s+)?rename\s+.+?\s+to\s+\S/i.test(affirmative.trim()) &&
    fields.some(e => /^(?:display )?(?:name|title)(?:\s+\((?:optional|required)\))?$/i.test(e.name.trim()));
  if (!rename && !/\b(save|update|create|add|apply|make|prepare|set|give|enable|disable|turn|change|edit)\b/i.test(affirmative)) return false;
  const words = (text:string) => text.toLowerCase().replace(/roll over/g,'rollover').match(/[a-z]{4,}/g) || [];
  const requestWords = new Set(words(affirmative));
  const editorWords = words(heading.name.replace(/^(edit|update|create|new)\s+/i,''));
  const fieldWords = words(fields.map(e => e.name).join(' ')).filter(w => !['name','description','title','text','value','select','number'].includes(w));
  // Some custom controls have no accessible name; their visible explanatory
  // text remains useful grounding within this same, ordinary record form.
  const formWords = words(snapshot.elements.filter(e => e.form && !e.covered &&
    e.context === target.context && ['p','label','legend'].includes(e.tag)).map(e => e.name).join(' '));
  const structuralAssignment=!/\b(would it|should (?:i|we)|could (?:i|we)|might|whether)\b/i.test(affirmative)&&
    structuralKeys.some(key=>new RegExp(`\\b(?:set|change|edit)\\s+(?:the\\s+)?${key}\\s*(?:=|\\bto\\b)\\s*\\S`,'i').test(affirmative));
  // An explicit save in this already identified ordinary editor need not repeat
  // its noun (for example, 'Keep everything else, save and reopen').
  return rename || structuralAssignment || /\b(save|update|apply)\b/i.test(affirmative) || [...editorWords,...fieldWords,...formWords].some(w => requestWords.has(w));
}
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
  // An editable surface's accessible name may be its current document text.
  // Focusing it does not execute purchases, messages or deletions it discusses.
  if(action.kind==='click'&&action.risk!=='sensitive'&&target?.edit&&!target.href&&!target.visual&&!target.covered&&
      !['button','a'].includes(target.tag)&&['','textbox','searchbox'].includes(target.role)&&
      (target.tag==='textarea'||target.type==='contenteditable'||target.tag==='input'&&['','text','search'].includes(target.type))&&
      (!target.submission||target.submission.fields.some(field=>field.ref===target.ref&&field.revision===target.edit!.revision))&&
      !sensitiveSettings.test(`${target.name} ${target.context}`)&&
      !/\b(api key|access token|client secret|private key|credentials?|credit card|card number|cvv|cvc|security code|one.time code|otp)\b/i.test(`${target.name} ${target.context}`))
    return result('allow','Focus the observed text editor without submitting it');
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
  if (['click','double_click'].includes(action.kind) && target.type === 'button' &&
      !target.submission && /^(cancel|close|dismiss|back)$/i.test(target.name.trim())) return result('allow', 'Dismiss the current form without submitting it');
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
    if (sensitiveSettings.test(`${target.name} ${target.context}`) && !requestedRecordEdit(action, snapshot, intent)) return result('approve', 'Review this change to sensitive account settings.', true);
    return result('allow', 'Prepare the requested text without submitting it', true);
  }
  if (action.kind === 'press' && (['Escape', 'Tab', 'Shift+Tab', 'Home', 'End', 'PageUp', 'PageDown', 'Backspace', 'Delete', 'ControlOrMeta+A', 'ControlOrMeta+Z', 'ControlOrMeta+Y'].includes(action.value || '') || /^Arrow/.test(action.value || ''))) {
    if (['Delete', 'Backspace'].includes(action.value || '') && !['input', 'textarea'].includes(target.tag) && target.role !== 'textbox' && target.type !== 'contenteditable') return result('approve', 'This key may delete a selected item.', true);
    return result('allow', 'Edit or navigate the current control', true);
  }
  if (action.kind === 'press' && action.value === 'Enter' && /search|query|find/i.test(`${target.name} ${target.type}`)) return result('allow', 'Submit a search query');
  const context = `${target.name} ${target.context}`;
  // An ellipsis in an ordinary import menu opens a preparation dialog. It is
  // separate from the later form/file submission, which retains its own gate.
  if (action.risk === 'read' && ['click','double_click'].includes(action.kind) &&
      target.role === 'menuitem' && target.type !== 'submit' && !target.form && !target.submission && !target.href &&
      /^(upload|import)(?: (?:an? )?(?:files?|recordings?|transcripts?|data))?(?:…|\.{3})$/i.test(target.name.trim()) &&
      !serious.test(target.context) && !sensitiveSettings.test(context)) {
    return result('allow', 'Open the import preparation dialog');
  }
  if (requestedInferenceSubmission(action,snapshot,_scope,intent,inferencePlaygrounds)) return {...result('allow','Run the explicitly requested prompt in the observed inference playground',true),semantic:'inference-submission'};
  if (serious.test(target.name) || action.risk === 'sensitive' || sensitiveSettings.test(context) && !requestedRecordEdit(action, snapshot, intent) || /\b(subscribe|subscription|upgrade)\b/i.test(target.name) && /\b(pay|paid|billing|charge|per month|monthly|annual|trial)\b|[$₹€£]/i.test(target.context)) return result('approve', 'Review this purchase, communication, deletion, agreement, or sensitive account change.', true);
  // Explicit tag-entry instructions describe a local chip commit, separate
  // from submitting a form. Require the value Nova prepared and requested tags.
  const tagRequest=intent.split('\n').reverse().find(line=>/\b(tag(?:s|ged|ging)?|wait|stop|cancel)\b/i.test(line))||'';
  const requestedTag=/\b(add|apply|assign|set|update|edit|change|use|fix)\b.{0,100}\btags?\b|(?:^|[.!?;,]|\band\b)\s*(?:please\s+)?tag\b/i.test(tagRequest.replace(/\b(don['’]?t|do not|never|without|stop|cancel)\b[^,;.!?]*/gi,''))&&
    !/\b(how|what if|wait|stop|cancel|after|until|approval|approve|confirmation)\b|\b(ask|check with) me\b/i.test(tagRequest);
  if(action.kind==='press'&&action.value==='Enter'&&action.risk==='change'&&
      target.tag==='input'&&target.type==='text'&&target.form===false&&!target.submission&&
      target.edit?.empty===false&&target.state?.some(state=>/^draft:matches:\S+$/.test(state))&&
      /^(?:type|enter|add) (?:a |new )?tags?(?: and|,)? press enter(?:\.{3}|…|[.!])?$/i.test(target.name.trim())&&
      requestedTag&&!serious.test(target.context)&&!sensitiveSettings.test(context)&&!/\b(api key|access token|client secret|private key|credentials?)\b/i.test(context))
    return result('allow','Commit the requested tag in its observed tag-entry control',true);
  // Inline title editors commit on Enter; they are not message composers.
  // Keep this after the consequential-action and sensitive-settings gates.
  if(action.kind==='press'&&action.value==='Enter'&&/^(rename|edit (?:name|title))\b/i.test(target.name.trim())&&(['input','textarea'].includes(target.tag)||target.role==='textbox')&&!target.submission)return result('allow','Save the requested inline name or title',true);
  if (action.kind === 'press' && action.value === 'Enter' && action.risk === 'change' &&
      target.tag === 'input' && target.type === 'text' && target.form === false && !target.submission &&
      target.edit?.empty === false && /^(?:(?:document|discussion|project|workflow|folder|page|file|note|record|item) )?(?:name|title)$/i.test(target.name.trim())) {
    const request = intent.split('\n').reverse().find(line => /\b(rename|(?:change|edit|update).{0,20}(?:name|title))\b/i.test(line));
    if (request && !/\b(how|what if|explain|after|until|confirmation|approve|approval)\b|\b(ask|check with) me\b/i.test(request)) {
      const affirmative = request.replace(/\b(don['’]?t|do not|never|without|stop|cancel)\b[^,;.!?]*/gi, '');
      if (/\b(rename|(?:change|edit|update).{0,20}(?:name|title))\b/i.test(affirmative)) return result('allow','Save the explicitly requested inline metadata title',true);
    }
  }
  if (cartControl.test(target.name)) return intentAllows(intent, 'cart') ? result('allow', 'Make the cart change you requested', true) : result('approve', 'Changing this cart was not clear from your request.', true);
  if (['select', 'check'].includes(action.kind)) return result('allow', 'Choose the requested filter, option, or variant', true);
  if (requestedTerminologyEdit(action, snapshot, intent)) return result('allow', 'Save the terminology correction explicitly requested in this observed form', true);
  if (requestedRecordEdit(action, snapshot, intent)) return result('allow', 'Save the ordinary configuration explicitly requested in this named editor', true);
  // Saving an explicitly requested ordinary record edit is not a new social
  // preference. Consequential controls, sensitive context and message composers
  // have already been gated above; a later negation or review request still wins.
  if (action.risk === 'change' && ['click', 'double_click'].includes(action.kind) &&
      /^(save changes|save (?:product|project|workflow|document|record|item))$/i.test(target.name.trim()) && !target.submission && !serious.test(target.context)) {
    const trialRevision = /\b(give|set|extend|shorten)\b.{0,60}\b\d{1,3}\s*days?\b.{0,30}\b(try|trial)\b|\b(set|extend|shorten|change)\b.{0,50}\btrial\b.{0,30}\b\d{1,3}\s*days?\b/i;
    const hasTrialField = snapshot.elements.some(e => !e.sensitive && /\btrial\b/i.test(e.name) && ['input', 'textarea'].includes(e.tag));
    const request = intent.split('\n').reverse().find(line => /\b(save|update|change|edit|stop|cancel|wait)\b/i.test(line) || hasTrialField && trialRevision.test(line));
    if (request && !/\b(how|what if|explain|after|until|confirmation|approve|approval|wait|stop|cancel)\b|\b(ask|check with) me\b/i.test(request)) {
      const affirmative = request.replace(/\b(don['’]?t|do not|never|without)\b[^,;.!?]*/gi, '');
      if (hasTrialField && /^(?:actually[, ]+)?(?:give|set|extend|shorten|change)\b/i.test(affirmative.trim()) && trialRevision.test(affirmative))
        return result('allow', 'Save the explicitly requested trial duration in the observed record editor', true);
      if (/\b(save|update|change|edit)\b/i.test(affirmative) && /\b(product|project|workflow|document|record|item|details|title|name|description|trial)\b/i.test(affirmative))
        return result('allow', 'Save the ordinary record edit explicitly requested', true);
    }
  }
  if (preferenceControl.test(target.name.replace(/\b(?:I['’]d|(?:I|we|you)\s+would)\s+like\s+to\b/gi, ''))) return intentAllows(intent, 'preference') ? result('allow', 'Make the preference change you requested', true) : result('approve', 'This saved preference was not clear from your request.', true);
  // Form membership alone does not make an editor control a submission.
  // Keep explicit submit controls, message composers and consequential actions
  // gated; ordinary option selection and draft structure need no extra review.
  if (['click', 'double_click'].includes(action.kind) && target.form &&
      target.type !== 'submit' && !target.submission &&
      (['combobox', 'listbox', 'option', 'radio', 'checkbox', 'switch', 'tab'].includes(target.role) ||
       target.type === 'button' && /^(add|remove)(?: another)? (?:condition|filter|rule|group|row|field|clause)(?: group)?$/i.test(target.name.trim()))) {
    return result('allow', 'Configure the current form without submitting it', true);
  }
  if (browsingControl.test(target.name) && !(serious.test(target.context) && (target.form || target.type === 'submit'))) return result('allow', 'Operate the website’s browsing controls');
  if (target.type === 'submit' || target.form && ['click', 'double_click', 'press'].includes(action.kind) || action.kind === 'press' && action.value === 'Enter') return result('approve', 'Review this form submission before information is sent.', true);
  if (['click', 'double_click'].includes(action.kind)) return result('allow', 'Continue the requested website interaction', true);
  return result('approve', 'The consequence of this action is not clear yet.', true);
}
