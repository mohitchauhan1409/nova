import { sitePalette } from '../../shared/site-experience';

// Presentation only. The installed shared launcher owns actions and lifecycle.
export function launcherStylesFor(url: string): string {
  try { if (new URL(url).hostname !== 'firecrawl.dev') return ''; } catch { return ''; }
  const palette = sitePalette('#ee5829');
  return `
    :host{--site-ink:${palette.ink};--site-soft:${palette.soft};color:#262626}
    .launch{right:104px;bottom:24px;border-color:#eeeeee;background:#ffffff;color:#262626;box-shadow:0 3px 12px #26262612}
    .launch:hover{border-color:#ee5829;box-shadow:0 5px 16px #26262618}
    .launch-affordance{background:#f9f9f9;border-color:#eeeeee}.panel-icon{color:#707070}
    .hint,.notice{right:104px}.hint{background:#262626}.notice{background:#ffffff;border-color:#eeeeee;color:#575757}
    #nova-shell stop:nth-child(1){stop-color:#fff3eb}#nova-shell stop:nth-child(2){stop-color:#ffbf9e}
    #nova-shell stop:nth-child(3){stop-color:#ee5829}#nova-shell stop:nth-child(4){stop-color:#ca4520}#nova-shell stop:nth-child(5){stop-color:#9c341a}
    #nova-eye stop:nth-child(3){stop-color:#f2e8e2}#nova-eye stop:nth-child(4){stop-color:#c8b0a4}
    #nova-pupil stop:nth-child(1){stop-color:#59413a}#nova-pupil stop:nth-child(2){stop-color:#35231e}#nova-pupil stop:nth-child(3){stop-color:#211713}
    .symbol svg ellipse[fill="#604497"]{fill:#9c341a}
    .cursor{filter:drop-shadow(0 3px 4px #26262635)}
    .cursor svg{fill:var(--site-ink);stroke:#ffffff}.cursor b{background:var(--site-ink)}.ring{border-color:var(--site-ink)}
    @media(max-width:450px){.launch{right:100px;bottom:20px}.hint,.notice{right:100px}}
  `;
}
