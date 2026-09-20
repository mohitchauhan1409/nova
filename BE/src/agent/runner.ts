import { randomUUID } from 'node:crypto';
import type { BrowserDriver } from '../browser/driver';
import type { Planner } from '../providers/openai';
import type { Action, ActionResult, Session, Snapshot, SiteProfile, Trace, ClarificationAnswers, ClarificationRecord, ActionStep } from '../../../shared/types';
import { checkAction, fingerprint } from './policy';
import { safeError } from '../config';
import { sameSite } from '../browser/security';
import { quickAction } from './quick-actions';
import { actionEffect, completionProblem, type Effect } from './verification';
import { siteExperience } from '../../../shared/site-experience';
import { companionOutput, conversationReply, latestTask, pagePrivacy } from './conversation';
import {observeProgress,recordProgress,beforeProgressAction,repeatedTabInspection} from './progress';
import {makeClarification,questionText,validateAnswers} from './clarification';

export class AgentRunner {
  private controller?: AbortController;
  private task?: Promise<void>;
  private pending?: { action: Action; fingerprint: string; snapshot: Snapshot; resolve(value: boolean): void; timer: ReturnType<typeof setTimeout> };
  private scope: string;
  private generation = 0;
  private taskId = "";
  private lastNarratedAt = 0;
  private intent() { return this.session.messages.filter(m => m.role === 'user' && !m.conversationOnly).slice(-6).map(m => m.text).join('\n'); }
  constructor(readonly session: Session, readonly driver: BrowserDriver, private planner: Planner, private site: SiteProfile, private emit: (s: Session) => void, private onAnswer?: (text: string) => void, private onObservation?: (snapshot:Snapshot)=>void, private onProgress?: (text:string)=>void) { this.scope = site.url;this.session.experience=siteExperience(site); }
  update() { this.session.experience=siteExperience(this.site);this.emit(this.session); }
  trace(kind: Trace['kind'], text: string, ms?: number) { this.session.traces.push({ id: randomUUID(), at: Date.now(), kind, text: companionOutput(text, this.session, true), ms }); this.session.traces = this.session.traces.slice(-120); this.update(); }
  private say(text: string, conversationOnly = false, clarification?:ClarificationRecord) { text = companionOutput(text, this.session); this.session.messages.push({ id: randomUUID(), role: 'assistant', text, at: Date.now(), ...(conversationOnly ? {conversationOnly:true} : {}),...(clarification?{clarification}:{}) }); this.update(); this.onAnswer?.(text); }
  private beginStep(action:Action) {
    if(action.kind==='wait')return;
    const step:ActionStep={id:randomUUID(),taskId:this.taskId,at:Date.now(),kind:action.kind,title:companionOutput(action.summary,this.session),status:'running'};
    this.session.actionSteps=[...(this.session.actionSteps||[]),step].slice(-240);
    this.update();
    if(Date.now()-this.lastNarratedAt>14000){this.lastNarratedAt=Date.now();this.onProgress?.(step.title);}
    return step;
  }
  private stepResult(step:ActionStep|undefined,status:ActionStep['status'],detail?:string){
    if(!step)return;step.status=status;if(detail)step.detail=companionOutput(detail,this.session,true);this.update();
  }
  private finishClarification(status:ClarificationRecord['status'],answers?:ClarificationAnswers){
    const id=this.session.clarification?.id;
    for(const message of this.session.messages){const card=message.clarification;if(card&&id&&card.id===id){card.status=status;if(answers)card.answers=answers;}}
    delete this.session.clarification;delete this.session.awaitingAnswer;
  }
  async answer(id:string,answers:ClarificationAnswers){
    const card=this.session.clarification;
    if(!card||card.id!==id||this.session.status!=='ready')throw new Error('This question card is no longer active. Use Nova’s current questions or send a new message.');
    const validated=validateAnswers(card,answers);
    // Consume synchronously before starting the asynchronous run; duplicate clicks
    // and replayed socket messages must not execute the task twice.
    this.finishClarification('answered',validated.answers);
    return this.command(validated.text);
  }
  conversationalReply(text: string) { return conversationReply(text, this.session.experience?.name || this.site.name, this.session.awaitingAnswer); }
  async command(text: string) {
    const reply = this.conversationalReply(text);
    if (reply) {
      this.session.messages.push({ id: randomUUID(), role: 'user', text, at: Date.now(), conversationOnly:true });
      this.say(reply, true); return;
    }
    this.stop(false); const generation = this.generation; await this.task;
    if (generation !== this.generation) return;
    this.finishClarification('superseded');
    this.taskId=randomUUID();this.lastNarratedAt=0;
    this.session.messages.push({ id: this.taskId, role: 'user', text, at: Date.now() });
    delete this.session.awaitingAnswer;
    this.session.progress={url:this.session.url,reloads:0,actions:[],settings:[]};
    this.controller = new AbortController(); this.session.status = 'running'; this.update();
    const direct=quickAction(text);
    this.task = (direct?this.runDirect(direct,this.controller.signal):this.run(this.controller.signal)).catch(error => { this.session.status = 'error'; this.trace('error', safeError(error)); this.say(safeError(error)); });
    return this.task;
  }
  private async runDirect(action:Action,signal:AbortSignal){
    try{
      const snapshot=await this.observe();if(signal.aborted)return;
      if(action.kind==='media'){
        const players=snapshot.elements.filter(e=>['video','audio'].includes(e.tag));
        if(players.length!==1){await this.run(signal);return;}
        action={...action,ref:players[0].ref};
      }
      if(!sameSite(this.scope,snapshot.url)){this.say('The browser moved to another website. Attach that website to continue.');this.session.status='stopped';return;}
      const policy=checkAction(action,snapshot,this.scope,this.intent());if(policy.outcome!=='allow'){this.say(policy.reason);this.session.status='stopped';return;}
      const step=this.beginStep(action);const started=performance.now();const result=await this.driver.execute(action);this.stepResult(step,'checking');if(signal.aborted)return;
      this.session.steps++;this.trace('act',action.summary,Math.round(performance.now()-started));const after=await this.observe();
      if(signal.aborted)return;const effect=actionEffect(action,snapshot,after,result,policy.mayCommit);this.trace('verify',effect.detail);this.stepResult(step,effect.verified?'verified':'unverified',effect.detail);
      this.say(effect.verified?(action.kind==='zoom'?'Zoom adjusted.':action.kind==='media'?effect.detail:'Scrolled.'):action.kind==='media'?'The player did not confirm the requested change.':'The page position did not change. It may already be at the limit, or this page may use a separate scroll area.');this.session.status='ready';
    }finally{if(this.session.status==='running')this.session.status='ready';this.update();}
  }
  stop(announce = true) {
    this.generation++;
    this.controller?.abort();
    for(const step of this.session.actionSteps||[])if(['running','checking'].includes(step.status))step.status='stopped';
    if (this.pending) { clearTimeout(this.pending.timer); this.pending.resolve(false); this.pending = undefined; }
    delete this.session.approval;
    if(announce){this.finishClarification('cancelled');this.update();}
    if (this.session.status === 'running' || this.session.status === 'approval') { this.session.status = 'stopped'; if (announce) this.trace('info', 'Stopped. No further actions will be started.'); else this.update(); }
  }
  async approve(id: string, approved: boolean) {
    const approval = this.session.approval; const pending = this.pending;
    if (!approval || !pending || approval.id !== id) throw new Error('This approval is no longer active.');
    if (Date.now() > approval.expiresAt) { this.stop(false); throw new Error('The approval expired. Ask Nova to inspect the page again.'); }
    if (approved) {
      const current = await this.driver.snapshot();
      if(this.pending!==pending||this.session.approval?.id!==id)return;
      if (fingerprint(current, pending.action) !== pending.fingerprint) {
        this.stop(false); this.say('The draft, target, or relevant details changed since this approval was shown. Nothing was sent. Please review the current draft before confirming again.'); return;
      }
    }
    clearTimeout(pending.timer); this.pending = undefined; delete this.session.approval;
    this.trace('approval', approved ? `You approved: ${pending.action.summary}` : 'You declined this action.');
    pending.resolve(approved);
  }
  private async authorize(action: Action, snapshot: Snapshot, reason: string, target: string) {
    this.session.status = 'approval';
    this.session.approval = { id: randomUUID(), action, target, url: snapshot.url, reason, expiresAt: Date.now() + 120000, snapshotId: snapshot.id };
    this.say(action.summary); this.trace('approval', reason);
    const approved = await new Promise<boolean>(resolve => {
      const timer = setTimeout(() => { this.pending = undefined; delete this.session.approval; resolve(false); }, 120000);
      this.pending = { action, fingerprint: fingerprint(snapshot, action), snapshot, resolve, timer };
    });
    if (!approved) { this.session.status = 'stopped'; this.update(); return false; }
    this.session.status = 'running'; this.update(); return true;
  }
  private async observe() {
    const started = performance.now(); const snapshot = await this.driver.snapshot(this.session.preparedInputs);
    observeProgress(this.session,snapshot);
    this.session.lastSnapshot = snapshot; this.session.url = snapshot.url; this.session.title = snapshot.title;
    this.onObservation?.(snapshot);
    this.trace('observe', `Read ${snapshot.elements.length} controls on ${snapshot.title || new URL(snapshot.url).hostname}`, Math.round(performance.now() - started));
    return snapshot;
  }
  private async run(signal: AbortSignal) {
    const written=new Set<string>();let preventedWrites=0;
    const tabVisits=new Map<string,number>();let preventedTabCycles=0;
    let failures = 0; let lastAction = ''; let repeated = 0; let screenshot: string | undefined; let observed: Snapshot | undefined;
    let effect: Effect | undefined; let attempted = false; let completionFailures = 0;
    let pendingEffect: {action:Action;before:Snapshot;result:unknown;mayCommit:boolean}|undefined;
    const deadline = Date.now() + 8 * 60 * 1000;
    try {
      for (let step = 0; step < 48 && Date.now() < deadline; step++) {
        if (signal.aborted) return;
        const snapshot = observed || await this.observe(); observed = undefined;
        if(pendingEffect){effect=actionEffect(pendingEffect.action,pendingEffect.before,snapshot,pendingEffect.result,pendingEffect.mayCommit);if(effect.verified)pendingEffect=undefined;}
        if (signal.aborted) return;
        if (snapshot.blocked) { this.say(snapshot.blocked); this.session.status = 'stopped'; return; }
        if (!sameSite(this.scope, snapshot.url)) { this.say('The browser moved to another website. Attach that website or start a session there to continue.'); this.session.status = 'stopped'; return; }
        this.trace('think', 'Planning the next website action.');
        const started = performance.now();
        const action = await this.planner.decide(this.session, this.site, snapshot, signal, screenshot);
        action.summary = companionOutput(action.summary, this.session);
        if (['point','inspect'].includes(action.kind) && (!screenshot || action.x === null || action.y === null || action.x < 0 || action.y < 0 || action.x >= snapshot.viewport.width || action.y >= snapshot.viewport.height)) { this.trace('error', 'A visual target requires a current screenshot and in-bounds coordinates.'); screenshot = undefined; if (++failures >= 3) { this.session.status = 'stopped'; this.say('I could not locate this control reliably. Please handle this step in the browser.'); return; } continue; }
        screenshot = undefined;
        if (signal.aborted) return;
        this.trace('think', action.summary, Math.round(performance.now() - started));
        if (action.kind==='done') {
          const problem=completionProblem(action,snapshot,effect,attempted,this.session.progress);
          if(problem){this.trace('error',`Completion rejected: ${problem}`);if(++completionFailures<2)continue;this.say('I could not verify that the requested result happened. Please check the page before retrying; I have not marked this task complete.');this.session.status='stopped';return;}
          this.session.awaitingAnswer=false;this.say(action.summary);this.session.status=action.completion?.status==='blocked'?'stopped':'ready';return;
        }
        if (action.kind==='ask') {
          try{
            const card=makeClarification(action,text=>companionOutput(text,this.session));
            this.session.clarification=card;this.session.awaitingAnswer=true;this.session.status='ready';
            this.say(questionText(card),false,{...card,status:'pending'});return;
          }catch(error){this.trace('error',`Invalid question card: ${safeError(error)}`);if(++failures>=3){this.say('I could not prepare a suitable question form. Please describe the details in chat.');this.session.status='ready';return;}continue;}
        }
        const signature = JSON.stringify({ kind: action.kind, ref: action.ref, value: action.value, url: action.url });
        repeated = signature === lastAction ? repeated + 1 : 0; lastAction = signature;
        if (repeated >= 2) { this.say('This action is not making progress. Please adjust the page or tell me how you would like to continue.'); this.session.status = 'stopped'; return; }
        const policy = checkAction(action, snapshot, this.scope, this.intent());
        if (policy.outcome === 'block') { this.trace('error', policy.reason); if (++failures >= 3 || snapshot.elements.find(e => e.ref === action.ref)?.sensitive) { this.say(policy.reason); this.session.status = 'stopped'; return; } continue; }
        if(!policy.mayCommit&&repeatedTabInspection(action,snapshot,tabVisits)){
          this.trace('error','No click sent: these tab contents have already been inspected twice without new information. Stop alternating unchanged views. Use an available source, report processing as pending, or ask a focused question.');
          if(++preventedTabCycles>=2){this.say('These views have not produced new information. I preserved the saved result; tell me which available source you want to use next.');this.session.status='ready';return;}
          continue;
        }
        if(['fill','type','paste','clear'].includes(action.kind)&&action.ref){
          const key=`${snapshot.url}|${action.ref}`;const target=snapshot.elements.find(e=>e.ref===action.ref);
          const saved=this.session.preparedInputs?.find(d=>d.ref===action.ref&&d.url===snapshot.url);
          const lastRequest=latestTask(this.session);
          const sendingExisting=/\b(send|submit|post)\b/i.test(lastRequest)&&! /\b(write|draft|compose|rewrite|replace|edit|change|append)\b/i.test(lastRequest);
          if(written.has(key)||sendingExisting&&(target?.edit?!target.edit.empty:!!saved)){
            this.trace('info',`Draft already prepared in ${target?.name||'this field'}. Do not rewrite or append another version. Finish the drafting task or request approval to send the existing draft.`);
            if(++preventedWrites>=2){this.say(target?.edit?.empty===false?'I kept the existing draft and blocked an unnecessary rewrite.':'I stopped a duplicate text-entry step.');this.session.status='ready';return;}
            continue;
          }
        }
        if (policy.outcome === 'approve' && !await this.authorize(action, snapshot, policy.reason, policy.target)) return;
        if (signal.aborted) return;
        if (action.kind === 'screenshot') {
          const privateText = [snapshot.text, ...snapshot.elements.flatMap(e => [e.name,e.context])].join('\n');
          if(pagePrivacy(snapshot, latestTask(this.session))(privateText)!==privateText){
            this.trace('error','Visual capture blocked because incidental private text would bypass text redaction. Continue with semantic controls.');
            if(++failures>=3){this.say('I can’t inspect this control visually while private details are visible. Please handle this step in the browser.');this.session.status='stopped';return;}
            continue;
          }
          screenshot = await this.driver.screenshot(); this.trace('observe', 'Captured the visible page for visual reasoning.'); continue;
        }
        if(action.kind==='inspect'){
          try {await this.driver.execute(action);observed=await this.observe();this.trace('observe','Resolved the visual point to a current website element. No input sent.');}
          catch(error){this.trace('error',safeError(error));if(++failures>=3){this.say(`I could not inspect this control: ${safeError(error)}`);this.session.status='stopped';return;}}
          continue;
        }
        const actionStep=this.beginStep(action);
        const actionStart = performance.now();
        try {
          beforeProgressAction(this.session,action);
          const result=await this.driver.execute(action);
          const rejected=result as ActionResult|undefined;
          if(rejected?.ok===false&&rejected.dispatch==='not-sent'){
            // A rejected preflight cannot undo a prior verified result. Preserve
            // its effect/pending observation; completion still needs current proof.
            const detail=rejected.detail||'Pointer preparation failed.';this.stepResult(actionStep,'failed',detail);
            recordProgress(this.session,action,snapshot.elements.find(e=>e.ref===action.ref),`No input sent: ${detail}`);
            this.trace('error',`No input was sent. ${detail} Inspect the current page; if the task is already complete, use its current result as evidence. Otherwise resolve the obstruction before retrying.`);
            if(++failures>=3){this.say(`I could not reach this control. No click was sent. ${detail}`);this.session.status='stopped';return;}
            observed=await this.observe();continue;
          }
          if((result as {ok?:boolean})?.ok===false)throw new Error((result as {detail?:string}).detail||'The browser rejected this action.');
          if(action.kind!=='wait')attempted=true;
          if (signal.aborted) return;
          if (action.kind === 'navigate' && action.url && !sameSite(this.scope, action.url)) this.scope = action.url;
          else { const link = snapshot.elements.find(e => e.ref === action.ref)?.href; if (link && !sameSite(this.scope, link)) this.scope = link; }
          this.session.steps++; failures = 0;
          this.trace('act', action.summary, Math.round(performance.now() - actionStart));this.stepResult(actionStep,'checking');
          let after = await this.observe();
          if(action.kind!=='wait'){
            pendingEffect={action,before:snapshot,result,mayCommit:policy.mayCommit};effect=actionEffect(action,snapshot,after,result,policy.mayCommit);
            if(effect.verified&&/^(Visible (page content|controls) changed|Navigation observed:)/.test(effect.detail)){
              await new Promise(resolve=>setTimeout(resolve,200));if(signal.aborted)return;
              after=await this.observe();effect=actionEffect(action,snapshot,after,result,policy.mayCommit);
            }
            // Observe delayed UI updates without replaying a click or waiting for analytics/network-idle.
            for(const delay of policy.mayCommit?[150,300,600,1000,1500,2000,3000]:[120,240,480,700]){if(effect.verified||signal.aborted)break;await new Promise(resolve=>setTimeout(resolve,delay));if(signal.aborted)return;after=await this.observe();effect=actionEffect(action,snapshot,after,result,policy.mayCommit);}
            if(effect.verified)pendingEffect=undefined;
            this.stepResult(actionStep,effect.verified?'verified':'unverified',effect.detail);
            this.trace('verify',`${effect.verified?'Verified change':'Unverified action'} ${action.kind}: ${effect.detail}`);
            if((result as ActionResult)?.verification?.status==='verified'&&action.ref&&['fill','type','paste','clear'].includes(action.kind)){
              written.add(`${snapshot.url}|${action.ref}`);
              const target=after.elements.find(e=>e.ref===action.ref);
              const identity=snapshot.elements.find(e=>e.ref===action.ref);
              const prior=this.session.preparedInputs?.find(d=>d.ref===action.ref&&d.url===snapshot.url);
              const value=action.kind==='clear'?'':action.kind==='type'?(prior?.value||'')+(action.value||''):action.value||'';
              this.session.preparedInputs=[...(this.session.preparedInputs||[]).filter(d=>d.ref!==action.ref||d.url!==snapshot.url),{ref:action.ref,url:snapshot.url,revision:target?.edit?.revision,value,kind:action.kind,...(identity?{target:{name:identity.name,tag:identity.tag,type:identity.type,context:identity.context}}:{})}].slice(-8);
            }
            // Reusable creation forms clear their inputs after a verified Add.
            // Retire only those drafts, not unrelated editors or message composers.
            const committedTarget = snapshot.elements.find(e => e.ref === action.ref);
            if (effect.verified && action.risk === 'change' &&
                ['click', 'double_click'].includes(action.kind) && committedTarget?.type === 'submit' &&
                !committedTarget.submission && /^(add|create|save)(?:\s|$)/i.test(committedTarget.name)) {
              for (const before of snapshot.elements) {
                if (before.context !== committedTarget.context || before.edit?.empty !== false) continue;
                const current = after.elements.find(e => e.ref === before.ref);
                if (current?.edit?.empty !== true || current.edit.revision === before.edit.revision) continue;
                written.delete(`${snapshot.url}|${before.ref}`);
                this.session.preparedInputs = this.session.preparedInputs?.filter(d => d.ref !== before.ref || d.url !== snapshot.url);
              }
            }
            if(policy.mayCommit&&!effect.verified){this.say('I sent the action, but the website has not confirmed the result. Please check before retrying so it is not performed twice.');this.session.status='stopped';return;}
          }
          recordProgress(this.session,action,snapshot.elements.find(e=>e.ref===action.ref),effect?.detail||'Input sent; inspect outcome.');
          observed = after;
        } catch (error) {
          this.stepResult(actionStep,'failed',safeError(error));
          attempted=true;effect={action:action.kind,verified:false,detail:safeError(error)};pendingEffect=undefined;
          recordProgress(this.session,action,snapshot.elements.find(e=>e.ref===action.ref),safeError(error));
          this.trace('error', safeError(error));
          // Never repeat a potentially committed action after an ambiguous transport failure.
          if (policy.mayCommit) { this.say('The browser did not confirm this action. Check the page before retrying; it may already have taken effect.'); this.session.status = 'stopped'; return; }
          pendingEffect={action,before:snapshot,result:undefined,mayCommit:policy.mayCommit};
          if (++failures >= 3) { this.say(`I could not complete this step: ${safeError(error)}`); this.session.status = 'error'; return; }
        }
      }
      this.say('I reached the limit for this run. Your progress is preserved; tell me to continue if you want me to keep working.'); this.session.status = 'stopped';
    } catch (error) { if (!signal.aborted) { this.session.status = 'error'; this.trace('error', safeError(error)); this.say(safeError(error)); } }
    finally { if (this.session.status === 'running') this.session.status = 'ready'; this.update(); }
  }
  async close() { this.stop(false); await this.task; await this.driver.close(); }
}
