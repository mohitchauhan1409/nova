// Only AgentMail receives this neutral console theme. Behavior stays shared.
export function launcherStylesFor(url: string): string {
  try { if (new URL(url).hostname !== 'console.agentmail.to') return ''; }
  catch { return ''; }
  return `
    :host{--agentmail-accent:#f5f5f5;--agentmail-surface:#080808;--agentmail-border:#303030;--agentmail-text:#f5f5f5;color:var(--agentmail-text);color-scheme:dark}
    :host([data-color-scheme="light"]){--agentmail-surface:#fff;--agentmail-border:#d9d9d9;--agentmail-text:#171717;color-scheme:light}
    .launch{background:var(--agentmail-surface);color:var(--agentmail-text);border-color:var(--agentmail-border);border-radius:10px;box-shadow:0 3px 18px #0004}
    .launch:hover{border-color:#777;box-shadow:0 5px 20px #0005}
    .launch:focus-visible{outline-color:var(--agentmail-text)}
    .symbol{filter:grayscale(1)}
    .launch-affordance{background:var(--agentmail-surface);border-color:var(--agentmail-border)}
    .panel-icon{color:var(--agentmail-text)}
    .launch[data-state=running] .symbol{--site-soft:#7772}
    .launch[data-state=approval] .symbol,.launch[data-state=disconnected] .symbol{border-color:var(--agentmail-border);background:var(--agentmail-surface);color:var(--agentmail-text)}
    .hint,.notice{background:var(--agentmail-surface);color:var(--agentmail-text);border:1px solid var(--agentmail-border);box-shadow:0 4px 18px #0004}
    .cursor{filter:drop-shadow(0 2px 3px #0009)}
    .cursor svg{fill:var(--agentmail-accent);stroke:#111;stroke-width:1.6}
    .cursor b{background:var(--agentmail-accent);color:#111;border:1px solid #111}
    .ring{border-color:var(--agentmail-accent);box-shadow:0 0 0 1px #1118}
  `;
}
