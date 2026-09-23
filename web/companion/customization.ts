// Optional customer theme. Browser actions and activation rules stay shared.
export function launcherStylesFor(url: string): string {
  let hostname: string;
  try { hostname = new URL(url).hostname; } catch { return ''; }
  if (hostname !== 'app.requesty.ai') return '';
  return `
    .launch{background:#0d1f1a;color:#ecfdf5;border-color:#245246;box-shadow:0 8px 26px #0d1f1a38}
    .launch:hover{background:#163b30;border-color:#34d399}
    .launch:focus-visible{outline-color:#34d399}
    .launch-affordance{background:#245246;border-color:#3c6f60}
    .panel-icon{color:#34d399}
    .hint,.notice{background:#0d1f1a;color:#ecfdf5;border-color:#245246}
    .cursor svg{fill:#34d399;stroke:#0d1f1a}
    .cursor b{background:#0d1f1a;color:#ecfdf5}
    .ring{border-color:#34d399}
    :host([data-color-scheme=dark]) .launch{background:#34d399;color:#0d1f1a;border-color:#6ee7b7}
    :host([data-color-scheme=dark]) .launch:hover{background:#6ee7b7}
    :host([data-color-scheme=dark]) .launch-affordance{background:#a7f3d0;border-color:#6ee7b7}
    :host([data-color-scheme=dark]) .panel-icon{color:#0d1f1a}
  `;
}
