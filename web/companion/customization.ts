// Creem's native dashboard palette; execution and activation remain shared.
export function launcherStylesFor(url: string): string {
  let hostname: string;
  try { hostname = new URL(url).hostname; } catch { return ''; }
  if (hostname !== 'creem.io' && hostname !== 'www.creem.io') return '';
  return `
    .launch{background:#303132;color:#f3f3f5;border-color:#555059;box-shadow:0 2px 4px #0003,0 8px 24px #0003;bottom:24px;right:24px}
    .launch:hover{background:#3a363f;border-color:#cfc2fa;box-shadow:0 3px 8px #0003,0 8px 24px #0003}
    .launch:focus-visible{outline-color:#cfc2fa}
    .launch-affordance{background:#3d3747;border-color:#60556f}
    .panel-icon{color:#d4c5ff}
    .hint,.notice{background:#303132;color:#f3f3f5;border-color:#555059}
  `;
}
