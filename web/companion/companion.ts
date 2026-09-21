import type { ServerEvent, Session } from '../../shared/types';
import type { PageThemeEvent } from '../../shared/page-theme';
import { VoiceClient } from '../src/voice';
import { appendTemplate } from './template';

export type CompanionOptions = { send(message: unknown): void; color?: string; workletUrl?: string };
export type CompanionEvent = ServerEvent | PageThemeEvent | { type: 'panel-visibility'; visible: boolean };
export type Companion = { receive(event: CompanionEvent): void; open(): void; action(x: number, y: number, label: string, kind?: string): Promise<void>; clearCursor(): void; destroy(): void };
declare global { interface Window { __novaCompanion?: Companion; __novaRelay?: (message: string) => void } }

const mark = '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><ellipse cx="32" cy="32" rx="8" ry="26"/><ellipse cx="32" cy="32" rx="8" ry="26" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="8" ry="26" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="5" fill="white"/></svg>';
const mic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>';

export function mountCompanion(options: CompanionOptions): Companion {
  if (window.__novaCompanion) return window.__novaCompanion;
  const host = document.createElement('div'); host.dataset.novaRoot = 'companion';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483646;pointer-events:none;';
  const root = host.attachShadow({ mode: 'open' });
  const pageButton=document.querySelector('button[type="submit"],button[class*="primary"],button[class*="Primary"]');
  const rgb=pageButton?getComputedStyle(pageButton).backgroundColor.match(/\d+/g)?.slice(0,3).map(Number):undefined;
  const pageAccent=rgb?.length===3&&Math.max(...rgb)-Math.min(...rgb)>40?'#'+rgb.map(v=>Math.round(v*.72).toString(16).padStart(2,'0')).join(''):undefined;
  const accent = /^#[0-9a-f]{6}$/i.test(options.color || '') ? options.color! : /amazon\./.test(location.hostname) ? '#a96313' : /youtube\./.test(location.hostname) ? '#d72d40' : /google\./.test(location.hostname) ? '#3869c7' : pageAccent||'#7560cc';
  const markup = `<style>
    :host{all:initial;color:#252433;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.5;--accent:${accent}}*{box-sizing:border-box}button,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.5;cursor:wait}button:focus-visible,textarea:focus-visible{outline:3px solid #af9ee8;outline-offset:3px}svg{width:22px;height:22px}button{border:0} [hidden]{display:none!important}
    .launcher{position:absolute;right:24px;bottom:22px;pointer-events:auto;display:flex;align-items:center;gap:10px;background:#fff;color:#282335;border:1px solid #e8e2ee;border-radius:999px;padding:9px 18px 9px 9px;box-shadow:0 6px 30px #21123626;font-weight:650;font-size:13px;transition:transform .15s}.launcher:hover{transform:translateY(-2px)}.launcher .mark{display:grid;place-items:center;width:36px;height:36px;background:var(--accent);color:white;border-radius:50%}.launcher svg{width:26px;height:26px}.live-dot{width:6px;height:6px;border-radius:50%;background:#71a68d}.card{display:flex;flex-direction:column;pointer-events:auto;position:absolute;right:24px;bottom:90px;width:354px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 118px);overflow:hidden;background:#fcfbff;border:1px solid #e6e0ed;border-radius:24px;box-shadow:0 18px 65px #2317332b;animation:appear .18s ease-out}.card.typing{width:390px}.head{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:17px 19px;border-bottom:1px solid #efebf3}.head .logo{width:30px;height:30px;color:var(--accent)}.brand{flex:1}.brand strong{font-size:15px;letter-spacing:-.4px}.brand small{display:block;color:#777082;font-size:10px}.icon{background:transparent;border-radius:8px;color:#726981;width:29px;height:29px;font-size:20px}.icon:hover{background:#ebe7f4}.intro{text-align:center;padding:26px 25px 13px}.orb{width:82px;height:82px;display:grid;place-items:center;border-radius:50%;margin:0 auto 18px;color:white;background:radial-gradient(circle at 30% 20%,#e6d5ff,var(--accent) 65%,#493068);box-shadow:0 0 0 9px #b69de714,0 8px 23px #6d51a32e;transition:transform .1s}.orb svg{width:47px;height:47px}.orb.live{animation:breathe 2s ease-in-out infinite}.intro h2{font-size:24px;font-weight:650;letter-spacing:-.8px;line-height:1.2;margin:0 0 10px}.intro p{font-size:13px;line-height:1.7;color:#777082;margin:0}.transcript{color:#5b4b7a;padding:0 22px;font-size:12px;min-height:18px;text-align:center}.voice-status{font-size:11px;text-align:center;color:var(--accent);padding:9px 14px}.voice-controls{flex-shrink:0;display:flex;gap:8px;padding:8px 21px 19px}.primary{color:white;background:var(--accent);border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:12px;flex:1}.secondary{background:#eee9f5;color:#655379;border-radius:12px;padding:11px 12px;font-size:12px}.safety{font-size:10px;color:#938b9d;text-align:center;padding:0 14px 17px}.messages{flex:1;min-height:0;max-height:260px;overflow:auto;padding:4px 20px}.messages:empty{display:none}.message{font-size:12px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0;padding:12px;border-radius:13px;background:#f0edf6}.message.user{margin-left:35px;background:var(--accent);color:white}.message small{display:block;font-size:9px;opacity:.65;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}.card:not(.typing) .messages{max-height:190px}.card:not(.typing) .message.user{display:none}.card:not(.typing) .message.assistant:not(:last-child){display:none}.composer{flex-shrink:0;padding:12px 18px 16px;border-top:1px solid #eae5f1}.composer textarea{width:100%;resize:vertical;min-height:68px;max-height:140px;border:1px solid #ded7e9;border-radius:12px;background:white;color:#292333;padding:11px 12px;font-size:12px}.composer-bar{display:flex;justify-content:space-between;align-items:center;margin-top:7px}.composer-bar button{font-size:11px;padding:9px 14px}.approval{background:#fff5de;border:1px solid #ebd59e;border-radius:13px;margin:12px 18px;padding:14px;font-size:12px}.approval strong{display:block;margin-bottom:6px}.approval p{white-space:pre-wrap;font-size:12px;margin:0 0 10px}.approval .buttons{display:flex;gap:8px}.approval small{display:block;color:#866936;font-size:10px;margin-bottom:10px;overflow-wrap:anywhere}.question{color:#785696;text-align:center;padding:6px 15px;font-size:11px;font-weight:650}.error{margin:12px 18px;padding:12px;border-radius:10px;background:#fff0ef;color:#a34343;font-size:11px}.activity{flex-shrink:0;display:flex;gap:7px;padding:12px 20px;color:#6e617e;font-size:11px;border-top:1px solid #eeebf3;align-items:center}.activity span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.stop{background:#f0e8ee;color:#a04c63;border-radius:8px;padding:6px 10px;font-size:10px}.cursor{position:fixed;left:0;top:0;pointer-events:none;opacity:0;transition:transform .13s ease-out,opacity .1s;z-index:2;filter:drop-shadow(0 3px 5px #30124744)}.cursor.visible{opacity:1}.cursor svg{width:29px;height:34px;fill:var(--accent);stroke:#fff;stroke-width:1.6}.cursor b{display:block;margin-left:23px;margin-top:-4px;padding:4px 8px;color:white;background:var(--accent);border:1px solid #ffffff66;border-radius:6px;font-size:10px;font-weight:550;white-space:nowrap;max-width:225px;overflow:hidden;text-overflow:ellipsis}.ripple{position:absolute;width:34px;height:34px;border:2px solid var(--accent);border-radius:50%;top:-9px;left:-9px;animation:ripple .5s ease-out forwards}.dock-note{position:absolute;right:24px;bottom:84px;max-width:300px;padding:9px 13px;border-radius:12px;background:#fff;color:#62536f;border:1px solid #e4deed;font-size:11px;box-shadow:0 5px 25px #21123619;pointer-events:auto}.dock-note button{background:none;color:var(--accent);font-weight:650;margin-left:8px}.copy-result{margin:8px 18px;font-size:11px;border-radius:8px;padding:10px;background:#edf5ef;color:#3b7756}@keyframes appear{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes breathe{50%{box-shadow:0 0 0 14px #b69de71b,0 8px 23px #6d51a32e}}@keyframes ripple{to{transform:scale(2);opacity:0}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}@media(max-width:450px){.card{right:16px;bottom:84px}.launcher{right:16px;bottom:16px}}
  </style><div class="cursor" aria-hidden="true"><svg viewBox="0 0 30 36"><path d="M3 2L27 22L16 23L11 33Z"/></svg><b>Nova</b></div>
  <section class="card" hidden role="dialog" aria-label="Nova website companion"><header class="head"><span class="logo">${mark}</span><div class="brand"><strong>nova.</strong><small class="site-name"></small></div><button class="icon minimize" aria-label="Minimize Nova">−</button><button class="icon close" aria-label="Close Nova">×</button></header>
  <div class="intro"><div class="orb">${mark}</div><h2>Hi, I’m Nova.<br/>Right here with you.</h2><p>Say what you need. I’ll help you browse,<br/>find things, and get them done.</p></div><div class="question" hidden>YOUR TURN · A QUICK QUESTION</div><div class="transcript" aria-live="polite"></div><div class="voice-status" role="status">Ready when you are</div><div class="error" role="alert" hidden></div><div class="messages" aria-live="polite"></div><div class="approval" hidden><strong>Before I do this…</strong><p></p><small></small><div class="buttons"><button class="secondary decline">Not now</button><button class="primary approve">Yes, proceed</button></div></div>
  <div class="voice-controls"><button class="primary talk">${mic}<span>Start talking</span></button><button class="secondary type-toggle">Type instead</button></div><form class="composer" hidden><textarea aria-label="Message Nova" placeholder="Ask me to do something on this page…" maxlength="8000" rows="2"></textarea><div class="composer-bar"><button type="button" class="secondary voice-mode">Back to voice</button><button class="primary send" type="submit">Send ↗</button></div></form><div class="activity"><span>Here on this website</span><button class="stop" hidden>■ Stop</button></div><div class="safety">You can interrupt anytime. Important actions need your say.</div></section>
  <div class="dock-note" hidden><span></span><button>Open</button></div><button class="launcher" aria-label="Open Nova assistant"><span class="mark">${mark}</span><span>Ask Nova</span><i class="live-dot"></i></button>`;
  const styleEnd=markup.indexOf('</style>');const stylesheet=new CSSStyleSheet();stylesheet.replaceSync(markup.slice('<style>'.length,styleEnd));root.adoptedStyleSheets=[stylesheet];appendTemplate(root,markup.slice(styleEnd+'</style>'.length));
  document.documentElement.append(host);
  const el = <T extends HTMLElement = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const card=el('.card'), cursor=el('.cursor'), orb=el('.orb'), status=el('.voice-status'), error=el('.error'), messages=el('.messages'), note=el('.dock-note');
  el<HTMLButtonElement>('.send').disabled=true;status.textContent='Connecting Nova to this page…';
  el('.site-name').textContent = `Your companion on ${location.hostname.replace(/^www\./,'')}`;
  let session: Session | undefined; let voice: VoiceClient | undefined; let voiceState='off'; let lastMessages=''; let hiddenTimer: ReturnType<typeof setTimeout> | undefined; let greeting=false;
  const tell = (message: unknown) => options.send(message);
  const fail = (message: string) => { error.textContent=message; error.hidden=false; };
  const show = () => { card.hidden=false; note.hidden=true; };
  const setMode = (typing: boolean) => { card.classList.toggle('typing',typing); el('.composer').hidden=!typing; el('.voice-controls').hidden=typing; el('.intro').hidden=typing||!!session?.approval||!!session?.awaitingAnswer; if(typing)el<HTMLTextAreaElement>('textarea').focus({preventScroll:true});requestAnimationFrame(()=>{messages.scrollTop=messages.scrollHeight;}); };
  const stopVoice = async () => { const active=voice; voice=undefined; voiceState='off'; await active?.stop(); orb.classList.remove('live'); el('.talk span').textContent='Start talking'; status.textContent='Microphone off'; };
  const startVoice = async () => {
    if(voice){await stopVoice();return;} if(!session){fail('Nova is connecting to this page. Try again in a moment.');return;}
    error.hidden=true; voiceState='connecting'; status.textContent='Connecting your microphone…';
    const client=new VoiceClient(tell,level=>{orb.style.transform=`scale(${1+Math.min(.12,level*.9)})`;},options.workletUrl); voice=client;
    try { await client.start(session.id); if(voice!==client){await client.stop();return;} orb.classList.add('live'); el('.talk span').textContent='Stop voice'; greeting=true; }
    catch(err){voice=undefined;voiceState='off';fail(`Microphone unavailable: ${(err as Error).message}. You can use Type instead.`); status.textContent='Choose typing or allow your microphone';}
  };
  const command = () => { const input=el<HTMLTextAreaElement>('textarea'); const text=input.value.trim(); if(!text||!session)return; tell({type:'command',sessionId:session.id,text});input.value='';status.textContent='On it…'; };
  el('.launcher').onclick=e=>{if(!e.isTrusted)return;if(!card.hidden){card.hidden=true;return;}show();if(!greeting&&!voice)void startVoice();};
  el('.talk').onclick=e=>{if(e.isTrusted)void startVoice();};
  el('.type-toggle').onclick=e=>{if(e.isTrusted){void stopVoice();setMode(true);}};
  el('.voice-mode').onclick=e=>{if(e.isTrusted)setMode(false);};
  el('.minimize').onclick=()=>{card.hidden=true;};
  el('.close').onclick=e=>{if(!e.isTrusted)return;card.hidden=true;void stopVoice();if(session&&['running','approval'].includes(session.status))tell({type:'stop',sessionId:session.id});};
  el('.dock-note button').onclick=show;
  el<HTMLFormElement>('.composer').onsubmit=e=>{e.preventDefault();if(e.isTrusted)command();};
  el('textarea').onkeydown=e=>{if(e.isTrusted&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();command();}};
  el('.stop').onclick=e=>{if(e.isTrusted&&session){voice?.interrupt();tell({type:'interrupt',sessionId:session.id});}};
  for(const [selector,approved] of [['.approve',true],['.decline',false]] as const)el(selector).onclick=e=>{if(e.isTrusted&&session?.approval)tell({type:'approve',sessionId:session.id,approvalId:session.approval.id,approved});};
  const companion: Companion = {
    open:show,
    receive(event) {
      if(event.type==='error'){fail(event.message);return;}
      if(event.type==='voice'){
        if(event.event==='resume'){if(!voice)void startVoice();return;}
        voice?.handle(event);
        if(event.event==='partial')el('.transcript').textContent=event.text||'';
        if(event.event==='transcript'){el('.transcript').textContent=event.text||'';status.textContent='On it…';}
        if(['listening','speech-start','speech-done'].includes(event.event)){voiceState='listening';status.textContent='Listening · you can interrupt anytime';}
        if(event.event==='speaking'){voiceState='speaking';status.textContent='Nova is speaking · interrupt anytime';}
        if(event.event==='error'){fail(event.message||'Voice disconnected');void stopVoice();}
        if(event.event==='off')void stopVoice();
        return;
      }
      if(event.type!=='session')return;
      session=event.session;
      el<HTMLButtonElement>('.send').disabled=false;
      const serialized=JSON.stringify(session.messages);
      if(serialized!==lastMessages){lastMessages=serialized;messages.replaceChildren();for(const m of session.messages.slice(-24)){const item=document.createElement('div');item.className=`message ${m.role}`;const author=document.createElement('small');author.textContent=m.role==='assistant'?'Nova':'You';const text=document.createElement('span');text.textContent=m.text;item.append(author,text);messages.append(item);}messages.scrollTop=messages.scrollHeight;}
      const pending=session.approval;el('.approval').hidden=!pending;messages.hidden=!!pending;el('.intro').hidden=card.classList.contains('typing')||!!pending||!!session.awaitingAnswer;
      if(pending){el('.approval p').textContent=pending.action.summary;el('.approval small').textContent=`${pending.target} · ${new URL(pending.url).hostname}`;show();}
      el('.question').hidden=!session.awaitingAnswer;
      if(session.awaitingAnswer)show();
      const trace=session.traces.slice().reverse().find(t=>t.kind==='act'||t.kind==='think'&&!t.text.startsWith('Choosing the next action'));
      el('.activity span').textContent=session.status==='running'?(trace?.text||'Reading this page…'):pending?'Waiting for your decision':session.awaitingAnswer?'Tell me a little more':session.status==='stopped'?'Paused. Ready when you are.':'Here on this website';
      el('.stop').hidden=!['running','approval'].includes(session.status);
      if(session.status==='running'){status.textContent='Working with you…'; if(card.hidden){note.hidden=false;el('.dock-note span').textContent=trace?.kind==='act'?trace.text.slice(0,85):'Nova is working on this page';}}
      else{companion.clearCursor();if(voiceState==='off')status.textContent=session.awaitingAnswer?'A quick question before I continue':session.status==='stopped'?'Paused. You’re in control.':'Ready when you are';if(card.hidden&&session.messages.length){note.hidden=false;el('.dock-note span').textContent=session.awaitingAnswer?'Nova has a question for you':'Nova has an update for you';}}
    },
    async action(x,y,label,kind='click'){
      clearTimeout(hiddenTimer);
      // Make room for the real target without moving the website or stealing focus.
      const bounds=card.getBoundingClientRect();if(!card.hidden&&x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom)card.hidden=true;
      cursor.style.transform=`translate(${Math.max(0,x)}px,${Math.max(0,y)}px)`;cursor.classList.add('visible');el('.cursor b').textContent=`Nova · ${label.slice(0,65)}`;
      if(/click|point|check/.test(kind)){const ripple=document.createElement('i');ripple.className='ripple';cursor.append(ripple);setTimeout(()=>ripple.remove(),550);}
      await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:95));
      hiddenTimer=setTimeout(()=>cursor.classList.remove('visible'),1300);
    },
    clearCursor(){clearTimeout(hiddenTimer);hiddenTimer=setTimeout(()=>cursor.classList.remove('visible'),400);},
    destroy(){void stopVoice();clearTimeout(hiddenTimer);host.remove();delete window.__novaCompanion;}
  };
  window.__novaCompanion=companion;
  return companion;
}
