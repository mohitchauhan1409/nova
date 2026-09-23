// Optional customer theme. Browser actions and activation rules stay shared.
export function launcherStylesFor(url: string): string {
  try {
    if (new URL(url).hostname !== 'app.inngest.com') return '';
  } catch {
    return '';
  }
  return `
    .launch{border-color:#cfe4d5;background:#fbfffc;color:#173f28;box-shadow:0 3px 8px #184a2912,0 12px 30px #184a2914}
    .launch:hover{border-color:#91c9a2;box-shadow:0 4px 10px #184a2918,0 14px 34px #184a291f}
    .launch-affordance{border-color:#d9ecde;background:#f0f9f2;color:#287a42}
    .hint{background:#173f28;color:#ffffff}
  `;
}
