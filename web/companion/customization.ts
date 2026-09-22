// Presentation only, scoped to the verified Interfaze hostname.
export function launcherStylesFor(url: string): string {
  try { if (new URL(url).hostname !== 'interfaze.ai') return ''; } catch { return ''; }
  return `
    :host{--site-ink:#18181b;--site-soft:#f2f2f2;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#18181b}
    .launch,.notice{background:#fff;color:#18181b;border-color:#e8e8e8;box-shadow:0 3px 14px #0000000d}
    .launch:hover{border-color:#bcbcbc}.launch-affordance{background:#fafafa;border-color:#e8e8e8}.panel-icon{color:#666}
    .hint{background:#18181b;color:#fff}.cursor{filter:drop-shadow(0 2px 3px #00000030)}
    #nova-shell stop:nth-child(1){stop-color:#fafafa}#nova-shell stop:nth-child(2){stop-color:#dedede}#nova-shell stop:nth-child(3){stop-color:#999}#nova-shell stop:nth-child(4){stop-color:#555}#nova-shell stop:nth-child(5){stop-color:#18181b}
    #nova-eye stop{stop-color:#fff}#nova-pupil stop{stop-color:#18181b}.symbol svg [fill="#604497"]{fill:#18181b}
  `;
}
