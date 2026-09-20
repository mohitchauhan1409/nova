import { isNovaDashboard } from '../../shared/browser-launch';

// Only the local dashboard may ask this isolated script to open a website.
// Pairing stays between this script and the extension, never in a tab URL.
if (window === window.top && isNovaDashboard(location.href)) {
  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin) return;
    const message = event.data;
    if (message?.source !== 'nova-dashboard' || typeof message.id !== 'string' || message.id.length > 100) return;
    const reply = (result: unknown) => window.postMessage({ source: 'nova-browser', id: message.id, result }, location.origin);
    if (message.type === 'ping') {
      void chrome.runtime.sendMessage({ type: 'nova-dashboard-ping' }).then(reply).catch(() => reply({ error: 'Reload the dashboard after reloading the Nova extension.' }));
    } else if (message.type === 'open-tab' && typeof message.url === 'string' && message.url.length <= 4096 && ['intelligent', 'fast'].includes(message.speed)) {
      void (async () => {
        const response = await fetch('/api/bootstrap', { cache: 'no-store' });
        if (!response.ok) throw new Error('Start the Nova backend before opening a website.');
        const { token } = await response.json();
        return chrome.runtime.sendMessage({ type: 'nova-dashboard-launch', url: message.url, speed: message.speed, token });
      })().then(reply).catch(error => reply({ error: error.message }));
    }
  });
}
