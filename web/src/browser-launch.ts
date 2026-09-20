type BrowserReply = { ok?: boolean; error?: string; tabId?: number; version?: string };
export type BrowserConnection = { connected: boolean; version?: string; error?: string };
function request(type: 'ping' | 'open-tab', payload: Record<string, unknown> = {}, timeout = 8000): Promise<BrowserReply> {
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const finish = () => { clearTimeout(timer); window.removeEventListener('message', receive); };
    const receive = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== location.origin || event.data?.source !== 'nova-browser' || event.data.id !== id) return;
      finish();
      if (event.data.result?.error) reject(new Error(event.data.result.error));
      else resolve(event.data.result);
    };
    const timer = setTimeout(() => { finish(); reject(new Error('Add or reload the Nova extension in this browser, then refresh the dashboard.')); }, timeout);
    window.addEventListener('message', receive);
    window.postMessage({ source: 'nova-dashboard', id, type, ...payload }, location.origin);
  });
}
export async function browserExtensionStatus(): Promise<BrowserConnection> {
  try { const reply = await request('ping', {}, 1000); return { connected: !!reply.ok, version: reply.version }; }
  catch (error) { return { connected: false, error: (error as Error).message }; }
}
export async function browserExtensionReady() { return (await browserExtensionStatus()).connected; }
export async function openWebsiteTab(url: string, speed: string) {
  const result = await request('open-tab', { url, speed });
  if (!result.ok) throw new Error('Nova could not open the website tab.');
}
