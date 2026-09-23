// Optional customer theme. Browser actions and activation rules stay shared.
export function launcherStylesFor(url: string): string {
  try {
    if (new URL(url).hostname !== 'cloud.onyx.app') return '';
  } catch {
    return '';
  }
  return `
    .launch{border-color:#d7d8f7;background:#ffffff;color:#26235f;box-shadow:0 3px 8px #312e8112,0 12px 30px #312e8115}
    .launch:hover{border-color:#a9a7ed;box-shadow:0 4px 10px #312e8118,0 14px 34px #312e811f}
    .launch-affordance{border-color:#e0e0fa;background:#f7f7ff;color:#4f46e5}
    .hint{background:#252158;color:#ffffff}
  `;
}
