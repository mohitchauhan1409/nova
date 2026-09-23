// Match the observed Autumn Sandbox navy/white and blue environment accent.
// This styles Nova only; activation and browser actions stay in the shared engine.
export function launcherStylesFor(url: string): string {
  let hostname: string;
  try { hostname = new URL(url).hostname; } catch { return ''; }
  if (hostname !== 'app.useautumn.com') return '';
  return `
    .launch{background:#0f9bff;color:#07111f;border-color:#0f9bff;box-shadow:0 2px 5px #0f9bff24,0 8px 24px #0f9bff20;bottom:24px;right:24px}
    .launch:hover{background:#42b0ff;border-color:#42b0ff}
    .launch:focus-visible{outline-color:#0f9bff}
    .launch-affordance{background:#168ee2;border-color:#66bfff}
    .panel-icon{color:#fff}
    .hint,.notice{background:#fafaf9;color:#121212;border-color:#e5e5e5}
    .cursor{filter:drop-shadow(0 1px 2px #ffffffdd)}
    .cursor svg{fill:#0f9bff;stroke:#0f9bff}
    .cursor b{background:#0f9bff;color:#07111f}
    .ring{border-color:#0f9bff}
    :host([data-color-scheme=dark]) .hint,:host([data-color-scheme=dark]) .notice{background:#161616;color:#ddd;border-color:#292929}
    :host([data-color-scheme=dark]) .ring{box-shadow:0 0 1px 1px #42b0ffaa}
  `;
}
