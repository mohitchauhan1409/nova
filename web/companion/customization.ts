// This CSS enters the launcher's shadow root only for this exact hostname.
// Recording behavior and action execution stay in the shared engine.
export function launcherStylesFor(url: string): string {
  try { if (new URL(url).hostname !== 'app.confident-ai.com') return ''; }
  catch { return ''; }
  return `
    :host{--confident-bg:#141414;--confident-surface:#1d1d1d;--confident-border:#383838;--confident-text:#f8f8f8;--confident-muted:#b5b5b5;color-scheme:dark}
    :host([data-color-scheme=light]){--confident-bg:#ffffff;--confident-surface:#f5f5f5;--confident-border:#d6d6d6;--confident-text:#171717;--confident-muted:#606060;color-scheme:light}
    .launch{background:var(--confident-surface);border-color:var(--confident-border);color:var(--confident-text);border-radius:9px;box-shadow:0 4px 18px #00000024}
    .launch:hover{border-color:var(--confident-muted);box-shadow:0 5px 22px #00000035}
    .launch:focus-visible{outline-color:var(--confident-text)}
    .launch-affordance{background:var(--confident-bg);border-color:var(--confident-border)}
    .panel-icon{color:var(--confident-muted)}
    .hint,.notice{background:var(--confident-surface);border:1px solid var(--confident-border);color:var(--confident-text)}
    .launch[data-state=running] .symbol{animation:none}
    .cursor{filter:drop-shadow(0 2px 3px #00000080)}
    .cursor svg{fill:#f8f8f8;stroke:#141414;stroke-width:1.6}
    .cursor b{background:#f8f8f8;color:#141414;border:1px solid #141414}
    .ring{border-color:#f8f8f8;box-shadow:0 0 0 1px #141414}
  `;
}
