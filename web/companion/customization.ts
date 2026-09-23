// Optional customer theme. Browser actions and activation rules stay shared.
export function launcherStylesFor(url: string): string {
  let hostname: string;
  try { hostname = new URL(url).hostname; } catch { return ''; }
  if (!['projects.mastra.ai', 'localhost'].includes(hostname)) return '';
  return `
    .launch{background:#242424;color:#f7f7f7;border-color:#3a3a3a;box-shadow:0 8px 28px #08080840}
    .launch:hover{background:#303030;border-color:#fa7b6a}
    .launch:focus-visible{outline-color:#fa7b6a}
    .launch-affordance{background:#3a3a3a;border-color:#62666d}
    .panel-icon{color:#fa7b6a}
    .hint,.notice{background:#242424;color:#f7f7f7;border-color:#3a3a3a}
    .cursor svg{fill:#fa7b6a;stroke:#242424}
    .cursor b{background:#242424;color:#f7f7f7}
    .ring{border-color:#fa7b6a}
    :host([data-color-scheme=light]) .launch{background:#242424;color:#fff}
    :host([data-color-scheme=dark]) .launch{background:#fa7b6a;color:#242424;border-color:#fdac53}
    :host([data-color-scheme=dark]) .launch:hover{background:#fdac53}
    :host([data-color-scheme=dark]) .panel-icon{color:#242424}
  `;
}
