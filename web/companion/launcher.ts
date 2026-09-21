import { appendTemplate } from './template';
import type { Companion } from './companion';
import { sitePalette } from '../../shared/site-experience';
import { launcherStylesFor } from './customization';

// Only the launch control and action cursor live inside the website. The
// conversation is rendered by Chrome/Edge beside the page in its native panel.
export function mountLauncher(openPanel: () => Promise<void>): Companion {
  if (window.__novaCompanion) return window.__novaCompanion;
  const host = document.createElement('div'); host.dataset.novaRoot = 'launcher';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483646;';
  const root = host.attachShadow({ mode: 'open' });
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    :host{all:initial;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#25252a}*{box-sizing:border-box}button{font:inherit;cursor:pointer}[hidden]{display:none!important}
    .launch{position:absolute;right:20px;bottom:20px;display:flex;align-items:center;gap:8px;min-height:38px;padding:6px 9px 6px 7px;border:1px solid #e3e5e1;border-radius:999px;background:#ffffff;color:#41463f;pointer-events:auto;box-shadow:0 2px 5px #20281e08,0 6px 18px #20281e0d;transition:transform .16s,box-shadow .16s,border-color .16s}
    .launch:hover{transform:translateY(-1px);border-color:#ced3ca;box-shadow:0 3px 7px #20281e0b,0 8px 22px #20281e12}.launch:focus-visible{outline:2px solid var(--site-ink,#6953c2);outline-offset:4px}
    .symbol{width:24px;height:24px;border:1px solid color-mix(in srgb,var(--site-ink,#6953c2) 18%,white);border-radius:50%;display:grid;place-items:center;background:var(--site-soft,#f1eefb);color:var(--site-ink,#6953c2);flex-shrink:0}.symbol svg{width:16px;height:16px}.word{white-space:nowrap}.word strong{font-size:12px;font-weight:550;letter-spacing:-.12px;line-height:20px}.launch-affordance{display:grid;place-items:center;width:23px;height:21px;border:1px solid #e9ebe6;border-radius:5px;background:#fafbf9;margin-left:5px}.panel-icon{width:13px;height:13px;color:#92978d}
    .launch[data-state=running] .symbol{animation:pulse 1.8s ease-in-out infinite}.launch[data-state=approval] .symbol{border-color:#d7b67d;background:#fbf4e8;color:#8f682b}.launch[data-state=disconnected] .symbol{border-color:#dedfdc;background:#f0f1ee;color:#878c83}
    .hint{position:absolute;right:20px;bottom:68px;padding:8px 11px;background:#30372e;color:#fff;font-size:11px;border-radius:7px;opacity:0;transform:translateY(3px);transition:opacity .15s,transform .15s;pointer-events:none;max-width:calc(100vw - 40px)}.launch:hover+.hint,.launch:focus-visible+.hint{opacity:1;transform:translateY(0)}
    .cursor{position:fixed;top:0;left:0;opacity:0;pointer-events:none;transition:transform .12s ease-out,opacity .1s;filter:drop-shadow(0 3px 4px #35265140)}.cursor.visible{opacity:1}.cursor svg{width:26px;height:31px;fill:var(--site-ink,#7964ce);stroke:white;stroke-width:1.6}.cursor b{display:block;margin-left:20px;margin-top:-5px;border-radius:6px;background:var(--site-ink,#7964ce);color:#fff;padding:4px 8px;font-size:10px;font-weight:550;max-width:230px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ring{position:absolute;top:-8px;left:-8px;height:28px;width:28px;border:2px solid #9984df;border-radius:50%;animation:ring .4s ease-out forwards}
    .notice{position:absolute;right:20px;bottom:68px;max-width:min(290px,calc(100vw - 40px));padding:12px 14px;border:1px solid #e3e5e1;border-radius:12px;background:#fff;color:#61685d;font-size:12px;line-height:1.6;box-shadow:0 6px 20px #20281e12;pointer-events:auto}.symbol circle{fill:var(--site-soft,#f1eefb)}
    ${launcherStylesFor(location.href)}
    @keyframes pulse{50%{box-shadow:0 0 0 3px var(--site-soft,#f1eefb)}}@keyframes ring{to{opacity:0;transform:scale(2)}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}@media(max-width:450px){.launch{right:14px;bottom:14px;min-height:44px}.hint,.notice{right:14px;bottom:68px}}
  `);
  root.adoptedStyleSheets = [sheet];
  appendTemplate(root, `<button class="launch" aria-label="Open Nova side panel" title="Open Nova side panel"><span class="symbol"><svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><ellipse cx="32" cy="32" rx="8" ry="27"/><ellipse cx="32" cy="32" rx="8" ry="27" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="8" ry="27" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="5"/></svg></span><span class="word"><strong>Ask Nova</strong></span><span class="launch-affordance" aria-hidden="true"><svg class="panel-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="16" height="14" rx="3"/><path d="M12 3v14"/></svg></span></button><span class="hint">Your AI assistant, ready to help</span><div class="cursor" aria-hidden="true"><svg viewBox="0 0 30 36"><path d="M3 2L27 22L16 23L11 33Z"/></svg><b>Nova</b></div><div class="notice" role="status" hidden></div>`);
  document.documentElement.append(host);
  const button = root.querySelector<HTMLButtonElement>('.launch')!;
  const cursor = root.querySelector<HTMLElement>('.cursor')!;
  const notice = root.querySelector<HTMLElement>('.notice')!;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  const open = () => { void openPanel().catch(error => { notice.textContent = `${error.message} Try the Nova toolbar icon.`; notice.hidden = false; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { notice.hidden = true; }, 7000); }); };
  button.onclick = open;
  const companion: Companion = {
    open,
    receive(event) {
      if (event.type === 'panel-visibility') {
        button.hidden = event.visible;
        root.querySelector<HTMLElement>('.hint')!.hidden = event.visible;
        if (event.visible) notice.hidden = true;
      }
      if (event.type === 'session') { button.dataset.state = event.session.status; button.setAttribute('aria-label', 'Open Nova side panel'); const experience=event.session.experience;if(experience){const palette=sitePalette(experience.accent);host.style.setProperty('--site-ink',palette.ink);host.style.setProperty('--site-soft',palette.soft);root.querySelector('.hint')!.textContent=`Get things done on ${experience.name}`;button.title=`Open Nova`;} }
      if (event.type === 'error') button.dataset.state = 'disconnected';
    },
    async action(x, y, label, kind) {
      clearTimeout(timer); cursor.querySelector('b')!.textContent = label;
      cursor.style.transform = `translate(${Math.min(innerWidth - 30, Math.max(0, x))}px,${Math.min(innerHeight - 34, Math.max(0, y))}px)`;
      cursor.classList.add('visible');
      if (kind?.includes('click')) { const ring = document.createElement('i'); ring.className = 'ring'; cursor.append(ring); setTimeout(() => ring.remove(), 450); }
      await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 100));
      timer = setTimeout(() => cursor.classList.remove('visible'), 850);
    },
    clearCursor() { cursor.classList.remove('visible'); },
    destroy() { clearTimeout(timer); clearTimeout(noticeTimer); host.remove(); delete window.__novaCompanion; },
  };
  window.__novaCompanion = companion;
  return companion;
}
