import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowDown, ArrowUp, ArrowUpRight, AudioLines, Check, ChevronDown, Copy, Globe2, ListChecks, LoaderCircle, MessageCircle, Mic, MicOff, PanelRightClose, Search, ShieldCheck, Sparkles, Square, SquarePen, X } from 'lucide-react';
import { usePanel } from './usePanel';
import { QuestionCard } from './QuestionCard';
import { ActionTimeline } from './ActionTimeline';
import { sitePalette } from '../../../shared/site-experience';
import type { Session, ClarificationAnswers } from '../../../shared/types';

export function NovaMark({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true"><g fill="currentColor"><ellipse cx="32" cy="32" rx="8" ry="27"/><ellipse cx="32" cy="32" rx="8" ry="27" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="8" ry="27" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="5" fill="var(--mark-hole, #faf9f7)"/></svg>;
}
function readableActivity(session?: Session) {
  const trace = session?.traces.at(-1);
  const current=session?.actionSteps?.at(-1);
  if(current&&['running','checking'].includes(current.status))return current.status==='checking'?'Checking the result':current.title;
  if (!trace) return 'I’m looking at your request';
  if (trace.kind === 'observe') return 'Reading the page';
  if (trace.kind === 'verify') return 'Checking the result';
  if (trace.kind === 'think' && /Choosing the next action|Planning the next website action/.test(trace.text)) return 'Thinking through your request';
  return trace.text;
}
function ApprovalCard({ panel }: { panel: ReturnType<typeof usePanel> }) {
  const approval = panel.session?.approval;
  const [now, setNow] = useState(Date.now());
  const [sent, setSent] = useState('');
  useEffect(() => { if (!approval) return; setSent(''); const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [approval?.id]);
  if (!approval || !panel.session) return null;
  const expired = now >= approval.expiresAt;
  const decide = (approved: boolean) => { setSent(approval.id); panel.send({ type: 'approve', sessionId: panel.session!.id, approvalId: approval.id, approved }); };
  return <section className="np-approval" aria-label="Action confirmation"><div className="np-approval-label"><ShieldCheck size={15}/><span>Your confirmation</span></div><h3>{approval.target}</h3><p>{approval.action.summary}</p><small>{approval.reason}</small><div className="np-approval-buttons"><button onClick={() => decide(false)} disabled={sent === approval.id}>Cancel action</button><button className="np-button-dark" onClick={() => decide(true)} disabled={expired || sent === approval.id}>{expired ? 'Confirmation expired' : sent === approval.id ? 'Continuing…' : 'Confirm action'}<ArrowUpRight size={14}/></button></div></section>;
}

export function PanelApp() {
  const panel = usePanel();
  const [view, setView] = useState<'chat' | 'voice'>('chat');
  const [draft, setDraft] = useState('');
  const [pairing, setPairing] = useState('');
  const [activity, setActivity] = useState(false);
  const [copied, setCopied] = useState('');
  const [showBottom, setShowBottom] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const nearBottom = useRef(true);
  const previousScrollTop = useRef(0);
  const previousId = useRef<string | undefined>(undefined);
  const session = panel.session;
  const usable = panel.connection === 'ready' && !!session;
  const busy = session?.status === 'running';
  const live = panel.voiceState !== 'off';
  const hostname = (() => { try { return new URL(session?.url || '').hostname.replace(/^www\./, ''); } catch { return ''; } })();
  const messages = session?.messages || [];
  useEffect(() => {
    if (session && previousId.current !== session.id) { previousId.current = session.id; setView('chat'); setDraft(''); setActivity(false); nearBottom.current = true; }
  }, [session?.id]);
  useLayoutEffect(() => {
    if (!list.current) return;
    if (!messages.length) list.current.scrollTop = 0;
    else if (nearBottom.current) {
      const card=list.current.querySelector<HTMLElement>('.np-question-card');
      if(card) { card.scrollIntoView({block:'start'}); nearBottom.current=false; }
      else { list.current.scrollTop=list.current.scrollHeight; setShowBottom(false); }
    }
    previousScrollTop.current=list.current.scrollTop;
  }, [messages.length, session?.clarification?.id, session?.approval?.id, session?.actionSteps?.length, session?.actionSteps?.at(-1)?.status, view, busy]);
  useEffect(() => {
    const viewport=list.current;
    if(!viewport)return;
    // Message wrapping, composer resizing and expanding action steps must keep
    // a reader at the latest update. Reading older content still pauses follow.
    const observer=new ResizeObserver(()=>{
      if(nearBottom.current){viewport.scrollTop=viewport.scrollHeight;previousScrollTop.current=viewport.scrollTop;setShowBottom(false);}
    });
    observer.observe(viewport);
    if(viewport.firstElementChild)observer.observe(viewport.firstElementChild);
    return()=>observer.disconnect();
  }, [view, !!messages.length]);
  useEffect(() => {
    if (!input.current) return;
    input.current.style.height = '43px';
    if (draft) input.current.style.height = `${Math.min(150, input.current.scrollHeight)}px`;
  }, [draft, view, usable]);
  useEffect(() => { if (!copied) return; const timer = setTimeout(() => setCopied(''), 2000); return () => clearTimeout(timer); }, [copied]);
  useEffect(() => { if (!live) { setElapsed(0); return; } const timer = setInterval(() => setElapsed(n => n + 1), 1000); return () => clearInterval(timer); }, [live]);
  const chooseChat = () => { setView('chat'); void panel.stopVoice(); requestAnimationFrame(() => input.current?.focus()); };
  const chooseVoice = () => { setView('voice'); void panel.startVoice(); };
  const submit = (text = draft) => { if (!text.trim() || !usable) return; if (panel.command(text.trim())) { setDraft(''); nearBottom.current = true; } };
  const helpWithQuestions = (answers:ClarificationAnswers) => {
    const details=answers.filter(a=>a.values.some(v=>v.trim())).map(a=>`${session?.clarification?.questions.find(q=>q.id===a.questionId)?.label||a.questionId}: ${a.values.join('; ')}`).join('\n');
    submit(`Help me choose: explain the remaining questions in plain language. Keep my original task and the details I already provided.${details?`\nMy answers so far:\n${details}`:''}`);
  };
  const scrollBottom = () => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' }); nearBottom.current = true; setShowBottom(false); };
  const newChat = () => { setView('chat'); setDraft(''); panel.newChat(); };
  const experience=session?.experience;
  const siteName=experience?.name||hostname||'your website';
  const palette=sitePalette(experience?.accent||'#7360db');
  const suggestions = [
    {icon:Sparkles,title:'Help me get started',detail:'Understand what’s on this page',prompt:'What can you help me do on this page?',send:true},
    ...(experience?.suggestions.length?experience.suggestions:[{title:'Find something here',prompt:'Find '},{title:'Help with a task',prompt:'Help me '}]).map((item,i)=>({...item,icon:i===0?Search:ListChecks,detail:i===0?'A few details, then I’ll handle the steps':'Pick up where you are',send:false})),
  ];
  const voiceLabel = panel.voiceState === 'connecting' ? 'Connecting your microphone' : panel.voiceState === 'speaking' ? 'Nova is speaking' : panel.voiceState === 'thinking' || busy ? 'Working on it' : live ? 'I’m listening' : panel.microphoneSetup ? 'Enable your microphone' : 'Ready when you are';
  return <main className="np-app" data-site={hostname} data-color-scheme={panel.pageColorScheme || session?.pageColorScheme || session?.lastSnapshot?.theme.scheme || 'light'} aria-label="Nova side panel" style={{'--site-accent':palette.accent,'--site-ink':palette.ink,'--site-soft':palette.soft} as CSSProperties}>
    <header className="np-header"><div className="np-brand"><span className="np-brand-mark"><NovaMark size={19}/></span><strong>Nova</strong></div><div className="np-header-actions"><button className="np-new-chat" aria-label="New conversation" title="New conversation" onClick={newChat} disabled={!usable}><SquarePen size={14}/><span>New</span></button><button className="np-icon-button" aria-label="Close Nova panel" title="Close panel" onClick={panel.close}><PanelRightClose size={18}/></button></div></header>
    <div className="np-tabs" role="tablist" aria-label="Conversation mode"><button role="tab" id="chat-tab" aria-controls="chat-panel" aria-selected={view === 'chat'} onClick={chooseChat}><MessageCircle size={14}/> Chat</button><button role="tab" id="voice-tab" aria-controls="voice-panel" aria-selected={view === 'voice'} onClick={chooseVoice} disabled={!usable}><AudioLines size={15}/> Live talk {live && <i/>}</button></div>
    {panel.error && <div className="np-error" role="alert"><span>{panel.error}</span><button className="np-icon-button" aria-label="Dismiss error" onClick={() => panel.setError('')}><X size={14}/></button></div>}
    {usable && panel.browserControl && (!panel.browserControl.granted || panel.browserControl.suspended) && <div className="np-browser-control"><ShieldCheck size={17}/><div><strong>{panel.browserControl.suspended ? 'Browser control paused' : 'Enable reliable browser actions'}</strong><p>Allow Nova to click, type, and see the website in this session. Chrome shows a control banner while connected.</p><button onClick={panel.enableBrowserControl}>{panel.browserControl.suspended ? 'Resume browser control' : 'Enable browser control'}<ArrowUpRight size={13}/></button></div></div>}
    {panel.connection === 'unpaired' ? <section className="np-connect"><span className="np-welcome-mark"><NovaMark size={34}/></span><h1>Let’s get connected.</h1><p>Open a website from your Nova dashboard to pair automatically, or use your local pairing token.</p><form onSubmit={e => { e.preventDefault(); panel.connect(pairing.trim()); }}><label htmlFor="pair-token">Pairing token</label><input id="pair-token" type="password" autoComplete="off" value={pairing} onChange={e => setPairing(e.target.value)} placeholder="Paste from Nova setup" required/><button className="np-button-dark" type="submit">Connect Nova<ArrowUpRight size={16}/></button></form><a href="http://127.0.0.1:5173/#setup" target="_blank" rel="noreferrer">Open Nova setup<ArrowUpRight size={13}/></a></section>
    : panel.connection === 'offline' || panel.connection === 'inactive' ? <section className="np-connect"><span className="np-welcome-mark"><NovaMark size={34}/></span><h1>{panel.connection === 'offline' ? 'Let’s reconnect.' : 'A fresh start awaits.'}</h1><p>{panel.connection === 'offline' ? 'Keep Nova running on your computer, then reconnect to pick up here.' : 'This session ended or moved to another tab. Open a website from your dashboard to start again.'}</p>{panel.connection === 'offline' && <button className="np-button-dark" onClick={() => panel.connect()}>Reconnect<ArrowUpRight size={16}/></button>}<a href="http://127.0.0.1:5173/" target="_blank" rel="noreferrer">Open Nova dashboard<ArrowUpRight size={13}/></a></section>
    : <>
      {view === 'chat' ? <section id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" className="np-chat-panel">
        <div className="np-conversation" ref={list} onWheel={e=>{if(e.deltaY<0)nearBottom.current=false;}} onScroll={() => { const el = list.current!; const atBottom=el.scrollHeight-el.scrollTop-el.clientHeight<90; if(atBottom)nearBottom.current=true;else if(el.scrollTop<previousScrollTop.current-2)nearBottom.current=false;previousScrollTop.current=el.scrollTop;setShowBottom(!atBottom); }}>
          {!messages.length ? <div className="np-welcome"><span className="np-welcome-mark" aria-hidden="true"><NovaMark size={27}/></span><h1>How can I help today?</h1><p>Ask about {siteName}, or tell me what you’d like to get done. I’ll work through the steps with you.</p><div className="np-suggestions">{suggestions.map((item, i) => <button key={item.title} disabled={!usable} onClick={() => item.send ? submit(item.prompt) : (setDraft(item.prompt), input.current?.focus())}><span className="np-suggestion-icon"><item.icon size={17}/></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowUpRight size={14}/></button>)}</div></div>
          : <div className="np-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text"><div className="np-thread-start"><span/>{siteName}<span/></div>{messages.map(message => <Fragment key={message.id}><article className={`np-message ${message.role}`} aria-label={message.role === 'user' ? 'Your message' : 'Nova response'}>{message.role === 'assistant' && <div className="np-message-author"><NovaMark size={15}/><strong>Nova</strong><span className="np-author-ai">AI</span></div>}<div className="np-message-body">{message.clarification ? <QuestionCard key={message.clarification.id} card={message.clarification} active={session?.clarification?.id===message.clarification.id} disabled={!usable||busy} error={panel.error} onSubmit={answers=>{nearBottom.current=true;panel.setError('');return panel.send({type:'answer',sessionId:session!.id,clarificationId:message.clarification!.id,answers});}} onHelp={helpWithQuestions} /> : message.role === 'user' ? message.text : <Markdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={url => /^https?:\/\//i.test(url) ? url : ''} components={{ a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>, img: ({ alt }) => <span>{alt}</span> }}>{message.text}</Markdown>}</div>{message.role === 'assistant' && !message.clarification && <button className="np-copy" aria-label="Copy response" title="Copy response" onClick={() => void navigator.clipboard.writeText(message.text).then(() => setCopied(message.id)).catch(() => panel.setError('Clipboard access was blocked. Select the response text to copy it.'))}>{copied === message.id ? <Check size={13}/> : <Copy size={13}/>}<span>{copied === message.id ? 'Copied' : 'Copy'}</span></button>}</article>{message.role === 'user' && <ActionTimeline steps={(session?.actionSteps||[]).filter(step=>step.taskId===message.id)} active={!!busy && message.id===messages.filter(m=>m.role==='user'&&!m.conversationOnly).at(-1)?.id}/>}</Fragment>)}{busy && !(session?.actionSteps||[]).some(step=>['running','checking'].includes(step.status)) && <div className="np-thinking" role="status"><NovaMark size={16}/><span>{readableActivity(session)}</span><i/><i/><i/></div>}{session?.awaitingAnswer && !session.clarification && <div className="np-clarification"><MessageCircle size={13}/> A quick detail, then I’ll keep going.</div>}</div>}
        </div>
        {showBottom && <button className="np-jump" aria-label="Jump to latest message" onClick={scrollBottom}><ArrowDown size={15}/></button>}
        <ApprovalCard panel={panel}/>
        {activity && <div className="np-activity-log" aria-label="Recent activity">{session?.traces.filter(t => ['act', 'verify', 'error'].includes(t.kind)).slice(-5).map(trace => <div key={trace.id}><span className={trace.kind}/><p>{trace.text}</p></div>)}{!session?.traces.some(t => ['act', 'verify', 'error'].includes(t.kind)) && <p>Your actions will appear here as Nova works.</p>}</div>}
        <div className="np-composer-area">
          {busy && <div className="np-working" role="status"><LoaderCircle size={13}/><span>{readableActivity(session)}</span><button onClick={panel.interrupt}><Square size={10} fill="currentColor"/> Stop</button></div>}
          <form className={`np-composer ${busy ? 'is-working' : ''}`} onSubmit={e => { e.preventDefault(); submit(); }}><textarea ref={input} aria-label="Message Nova" placeholder={session?.awaitingAnswer ? 'Tell Nova a little more…' : 'Ask a question or describe a task…'} rows={2} maxLength={8000} value={draft} disabled={!usable} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }}/><div className="np-composer-tools"><span className="np-page-context"><Globe2 size={12}/><span title={siteName}>{siteName}</span></span><div><button type="button" className="np-icon-button" aria-label="Start live talk" title="Talk to Nova" onClick={chooseVoice} disabled={!usable}><AudioLines size={19}/></button><button type="submit" className="np-send" aria-label="Send message" disabled={!draft.trim() || !usable}><ArrowUp size={17}/></button></div></div></form>
          <div className="np-composer-foot"><span>{busy ? 'You can interrupt or change direction.' : 'Enter to send · Shift + Enter for a new line'}</span><button aria-label="Toggle activity" aria-expanded={activity} onClick={() => setActivity(!activity)}><ListChecks size={12}/><span>Activity</span></button></div>
        </div>
      </section>
      : <section id="voice-panel" role="tabpanel" aria-labelledby="voice-tab" className="np-voice-panel">{session?.clarification ? <div className="np-voice-questions"><QuestionCard key={session.clarification.id} card={{...session.clarification,status:'pending'}} active disabled={!usable||busy} error={panel.error} onSubmit={answers=>{nearBottom.current=true;panel.setError('');return panel.send({type:'answer',sessionId:session.id,clarificationId:session.clarification!.id,answers});}} onHelp={helpWithQuestions}/></div> : <div className="np-voice-content"><div className="np-voice-topline"><span><i className={live ? 'live' : ''}/>{live ? 'LIVE CONVERSATION' : 'VOICE CONVERSATION'}</span><time>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</time></div><div className={`np-voice-art ${live ? 'is-live' : ''} ${panel.voiceState}`} style={{ '--voice-level': Math.min(1, panel.level * 7) } as CSSProperties}><div className="np-voice-ring r1"/><div className="np-voice-ring r2"/><div className="np-voice-orb"><NovaMark size={76}/></div><span className="np-voice-speck sp1"/><span className="np-voice-speck sp2"/></div><div className="np-voice-heading"><h1>{voiceLabel}</h1><p>{live ? 'Speak naturally. You can interrupt me anytime.' : panel.microphoneSetup ? 'Allow access in Nova’s setup tab, then start voice here.' : 'Your voice is the shortcut. Start when you’re ready.'}</p></div><div className="np-waveform" aria-hidden="true">{Array.from({ length: 29 }, (_, i) => <i key={i} style={{ '--bar-height': `${7 + Math.sin(i * 1.7) ** 2 * 23}px`, '--delay': `${i * -.11}s` } as CSSProperties} className={live ? 'active' : ''}/>)}</div><div className="np-live-caption" role="status">{panel.partial || (panel.voiceState === 'speaking' ? messages.filter(m => m.role === 'assistant').at(-1)?.text : busy ? readableActivity(session) : '')}</div></div>}<ApprovalCard panel={panel}/><div className="np-voice-bottom"><div className="np-voice-controls"><button className="np-voice-back" onClick={chooseChat}><MessageCircle size={18}/><span>Back to chat</span></button><button className={`np-voice-toggle ${live ? 'recording' : ''}`} aria-label={live ? 'End voice conversation' : 'Start voice conversation'} onClick={() => live ? void panel.stopVoice() : void panel.startVoice()}>{live ? <MicOff size={23}/> : <Mic size={23}/>}</button><button className="np-voice-back" disabled={!busy && panel.voiceState !== 'speaking'} onClick={panel.interrupt}><Square size={16}/><span>Interrupt</span></button></div><p>{panel.voiceState === 'connecting' ? 'Connecting your microphone…' : live ? 'Microphone is on · click to end' : 'Microphone is off'}</p></div></section>}
    </>}
  </main>;
}
