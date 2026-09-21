// Polar's observed light dashboard: white surfaces and near-black controls.
// Browser actions, session activation and recording receipts remain shared.
export function launcherStylesFor(url: string): string {
  let hostname: string;
  try { hostname = new URL(url).hostname; } catch { return ''; }
  if (hostname !== 'polar.sh') return '';
  return `
    .launch{background:#17171f;color:#fff;border-color:#17171f;box-shadow:0 2px 5px #17171f12,0 8px 24px #17171f18;bottom:24px;right:24px}
    .launch:hover{background:#30303a;border-color:#30303a}
    .launch:focus-visible{outline-color:#17171f}
    .symbol svg{filter:grayscale(1)}
    .launch-affordance{background:#30303a;border-color:#55555e}
    .panel-icon{color:#fff}
    .hint,.notice{background:#fff;color:#17171f;border-color:#e7e7eb}
    .cursor{filter:drop-shadow(0 1px 2px #ffffffdd)}
    .cursor svg{fill:#17171f;stroke:#17171f}
    .cursor b{background:#17171f;color:#fff}
    .ring{border-color:#17171f}
    :host([data-color-scheme=dark]) .launch{background:#ededf0;color:#17171f;border-color:#ededf0}
    :host([data-color-scheme=dark]) .launch:hover{background:#d6d6dd;border-color:#d6d6dd}
    :host([data-color-scheme=dark]) .launch-affordance{background:#d6d6dd;border-color:#aaaab5}
    :host([data-color-scheme=dark]) .panel-icon{color:#17171f}
    :host([data-color-scheme=dark]) .hint,:host([data-color-scheme=dark]) .notice{background:#1d1d22;color:#ededf0;border-color:#34343c}
    :host([data-color-scheme=dark]) .ring{box-shadow:0 0 1px 1px #ffffffaa}
  `;
}
