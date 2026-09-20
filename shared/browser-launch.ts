export const dashboardOrigins = new Set(['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:8787', 'http://localhost:8787']);
export function isNovaDashboard(value: string) {
  try { const url = new URL(value); return dashboardOrigins.has(url.origin) && ['/', '/index.html'].includes(url.pathname); } catch { return false; }
}
export function websitePermission(value: string) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Choose an HTTP or HTTPS website URL.');
  const host = url.hostname.replace(/^www\./, '');
  return `${url.protocol}//${host === 'localhost' || /^[\d.]+$/.test(host) || host.startsWith('[') ? host : `*.${host}`}${url.port ? `:${url.port}` : ''}/*`;
}
export type TabLaunch = { url: string; speed: 'intelligent' | 'fast'; windowId: number; createdAt: number };
