// Personalization never enables a session or changes the shared browser engine.
export function launcherStylesFor(url: string): string {
  try { if (new URL(url).hostname !== 'sageox.ai') return ''; } catch { return ''; }
  return `
    .launch{border:1px solid #d7e0cf;border-radius:16px;background:#f9faf6;color:#30462a;box-shadow:0 3px 8px #344a2510,0 10px 28px #344a251b;padding:10px 13px 10px 10px}
    .symbol{border-radius:11px;background:#50794a;color:#fff;box-shadow:none}
    .symbol circle{fill:#50794a}
    .word strong{color:#30462a}.word small{color:#748069}
    .divider{background:#dfe5d8}.panel-icon{color:#69855b}.dot{background:#638d53}
    .hint{background:#3e5f34}.cursor b{border-radius:7px;background:#50794a;color:white}
    .ring{border-color:#50794a}
  `;
}
