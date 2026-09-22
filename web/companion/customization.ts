// Presentation only. Browser actions and lifecycle remain shared.
export function launcherStylesFor(url: string): string {
  try { if (new URL(url).hostname !== 'cloud.trigger.dev') return ''; } catch { return ''; }
  return `
    :host{--site-ink:#5a24e4;--site-soft:#292038;color:#f1f0f3}
    .launch,.notice{background:#1b1a1f;color:#f1f0f3;border-color:#222126;box-shadow:0 4px 18px #00000040}
    .launch:hover{border-color:#5a24e4}.launch-affordance{background:#17161b;border-color:#222126}.panel-icon{color:#c1bdca}
    .hint{background:#5a24e4;color:#fff}.cursor{filter:drop-shadow(0 2px 3px #00000070)}
    .cursor svg{fill:#5a24e4}.cursor b{background:#5a24e4}.ring{border-color:#5a24e4}
    #nova-shell stop:nth-child(1){stop-color:#eee8ff}#nova-shell stop:nth-child(2){stop-color:#c2abff}#nova-shell stop:nth-child(3){stop-color:#9065ef}#nova-shell stop:nth-child(4){stop-color:#5a24e4}#nova-shell stop:nth-child(5){stop-color:#351077}
  `;
}
