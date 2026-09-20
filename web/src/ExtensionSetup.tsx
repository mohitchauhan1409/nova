import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, Download, ExternalLink, Play, Puzzle, RefreshCw } from 'lucide-react';
import { browserExtensionStatus, type BrowserConnection } from './browser-launch';
import type { ExtensionRelease } from '../../shared/distribution';
import type { useNova } from './useNova';
import './extension-setup.css';

const guides = {
  chrome: { name: 'Google Chrome', address: 'chrome://extensions', help: 'https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked' },
  edge: { name: 'Microsoft Edge', address: 'edge://extensions', help: 'https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading' },
};

export function ExtensionSetup({ nova, connected, onConnectionChange, onTryDemo, launching }: {
  nova: ReturnType<typeof useNova>; connected: boolean; onConnectionChange(value: boolean): void; onTryDemo(): void; launching: boolean;
}) {
  const [browser, setBrowser] = useState<'chrome' | 'edge'>(/Edg\//.test(navigator.userAgent) ? 'edge' : 'chrome');
  const [release, setRelease] = useState<ExtensionRelease>();
  const [connection, setConnection] = useState<BrowserConnection>({ connected });
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const guide = guides[browser];
  const check = useCallback(async () => {
    setChecking(true);
    const status = await browserExtensionStatus();
    setConnection(status); onConnectionChange(status.connected); setChecking(false);
  }, [onConnectionChange]);
  const loadRelease = useCallback(async () => {
    setError('');
    try { setRelease(await nova.api<ExtensionRelease>('/extension-release')); }
    catch (error) { setError((error as Error).message); }
  }, [nova.api]);
  useEffect(() => { if (nova.config) void loadRelease(); }, [nova.config, loadRelease]);
  useEffect(() => { void check(); window.addEventListener('focus', check); return () => window.removeEventListener('focus', check); }, [check]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(timer); }, [notice]);
  const copy = async (value: string, success: string) => {
    try { await navigator.clipboard.writeText(value); setNotice(success); }
    catch { setNotice('Clipboard access was blocked. Select and copy the address shown below.'); }
  };
  const updateAvailable = connection.connected && release?.available && connection.version !== release.version;
  return <section className="browser-setup" aria-labelledby="browser-setup-title">
    <div className="browser-setup-header">
      <span className="browser-setup-icon"><Puzzle size={24}/></span>
      <div><span className="browser-setup-kicker">ONE-TIME BROWSER SETUP</span><h2 id="browser-setup-title">A little Nova. On your websites.</h2><p>Install once, then open any supported website from this dashboard. Your real website URL, your sign-in, and a new tab in this same window.</p></div>
    </div>
    <div className={`browser-connection ${connection.connected ? 'is-connected' : ''}`}>
      <span className="browser-connection-dot"/>
      <div role="status"><strong>{connection.connected ? 'Nova extension connected to this browser.' : 'Nova extension is not connected to this browser yet.'}</strong><small>{connection.connected ? `Installed version: ${connection.version || 'unknown — reload the latest extension'}` : 'Follow the steps below, then refresh this dashboard.'}</small></div>
      <button className="button secondary" disabled={checking} onClick={() => void check()}><RefreshCw size={14}/>{checking ? 'Checking…' : 'Check connection'}</button>
    </div>
    {updateAvailable && <p className="browser-setup-warning" role="status">A different build is installed. Download version {release.version}, replace the files in your installed folder, then click Reload on Nova’s extension card and refresh this dashboard.</p>}
    <ol className="browser-install-steps">
      <li><span className="browser-step-number">1</span><div><h3>Download & extract</h3><p>Download the ZIP, then double-click it on Mac or choose <strong>Extract All</strong> on Windows. Keep the extracted <code>nova-extension</code> folder somewhere permanent, such as Documents.</p>
        <div className="browser-step-actions">{release?.available ? <a className="button primary" href={release.downloadUrl} download="nova-extension.zip"><Download size={16}/> Download Nova extension</a> : <button className="button primary" disabled><Download size={16}/> {release ? 'Build required' : 'Preparing download…'}</button>}
        {release?.available && <span className="browser-download-meta">v{release.version} · {Math.round(release.bytes / 1024)} KB ZIP<br/>Chrome & Edge · local development build</span>}</div>
        {release && !release.available && <p className="browser-setup-warning">{release.message} <button className="text-button" onClick={() => void loadRelease()}>Check download again</button></p>}
        {error && <p role="alert">{error} <button className="text-button" onClick={() => void loadRelease()}>Retry download check</button></p>}
      </div></li>
      <li><span className="browser-step-number">2</span><div><h3>Load it into this browser</h3><div className="browser-picker" role="group" aria-label="Installation instructions for browser">{(Object.keys(guides) as Array<keyof typeof guides>).map(key => <button key={key} aria-pressed={browser === key} onClick={() => { setBrowser(key); setNotice(''); }}>{guides[key].name}</button>)}</div>
        <p>Copy this address, paste it into a new tab’s address bar, and press Enter.</p>
        <div className="browser-address"><code>{guide.address}</code><button className="button secondary" onClick={() => void copy(guide.address, 'Address copied. Paste it into your browser’s address bar.')}><Copy size={14}/> Copy address</button></div>
        <p>Turn on <strong>Developer mode</strong> → click <strong>Load unpacked</strong> → select the extracted <code>nova-extension</code> folder containing <code>manifest.json</code>.</p>
        <a className="text-button" href={guide.help} target="_blank" rel="noreferrer">Official {guide.name} installation guide <ExternalLink size={14}/></a>
        <small className="browser-step-note">Select the folder, not the ZIP. Browser settings addresses must be opened from the address bar.</small>
      </div></li>
      <li><span className="browser-step-number">3</span><div><h3>Come back & connect</h3><p>Return to this dashboard in the same browser and profile, then refresh it. Look for the green connection status above. Pairing happens automatically when you launch a website.</p><div className="browser-step-actions"><button className="button secondary" onClick={() => location.reload()}><RefreshCw size={15}/> Refresh dashboard</button><span className="browser-download-meta">Keep the Nova backend running.</span></div></div></li>
      <li><span className="browser-step-number">4</span><div><h3>Open a website. Meet Nova.</h3><p>Choose <strong>Open with Nova</strong> on a website card. On a new domain, click <strong>Enable Nova on this website</strong> and allow the browser’s access request. The website opens in the same tab with Nova’s floating button.</p><p>Click the floating button to open Nova in your browser’s side panel. Chat is ready by default. Choose <strong>Live voice</strong> when you want to speak. On first use, allow access in Nova’s microphone setup tab, click <strong>Back to Nova</strong>, then start voice. Your browser reuses this permission across websites. Start with the fictional demo shop to check your setup.</p><button className="button dark" onClick={onTryDemo} disabled={!connection.connected || !nova.connected || launching}><Play size={15}/>{launching ? 'Opening…' : 'Test with the demo shop'}<ArrowUpRight size={15}/></button></div></li>
    </ol>
    <p className="browser-setup-notice" role="status" aria-live="polite">{notice}</p>
    <div className="browser-setup-footer"><Check size={16}/><p>Nova activates only in tabs you launch with Nova or explicitly attach using its toolbar icon. Ordinary visits stay unchanged. One website session is active at a time; <strong>Activity → End session</strong> removes the companion and keeps the website open.</p></div>
    <details className="browser-setup-details"><summary>Floating button missing, or connection not detected?</summary><ul><li>Use Chrome, Edge, or a compatible Chromium browser. This build does not support Safari, Firefox, or embedded previews. Open <a href="http://127.0.0.1:5173/#setup">the local dashboard</a> in the browser where you installed Nova.</li><li>Make sure Nova is enabled in the same browser profile. After installing or reloading the extension, refresh the dashboard and launch the website from Nova again.</li><li>Keep <code>npm run dev</code> running. Check that the dashboard says “Nova is online.”</li><li>Allow the requested website access on the launch screen. A different domain may need its own permission. Protected browser pages and extension stores cannot host the assistant.</li><li>If the microphone is blocked, allow microphone access for the Nova extension in your browser’s microphone settings, then choose Live voice again. Chat always works without microphone access.</li></ul></details>
    <details className="browser-setup-details"><summary>Update or remove the extension</summary><p>Download the new ZIP and extract it. Replace the files inside the <strong>same installed folder</strong>, click <strong>Reload</strong> on Nova’s extension card, and refresh this dashboard. For version 0.6.1, accept the new browser-control permission if Chrome asks. It enables trusted clicks, typing, and screenshots. Chrome shows a banner while control is connected. End old sessions and launch them again. Keep the installed folder in place while using Nova.</p><p>To uninstall, end your session, open your browser’s extensions page, and click <strong>Remove</strong> on Nova.</p></details>
    <details className="browser-setup-details"><summary>Run Nova locally or pair manually</summary><p>From the Nova project folder, with Node.js 20.19 or newer:</p><pre>npm install{'\n'}npm run build{'\n'}npm run dev</pre><p>Open <a href="http://127.0.0.1:5173/#setup">http://127.0.0.1:5173/#setup</a> in your supported browser. Keep provider credentials in the backend <code>.env</code>; the ZIP contains browser code only.</p><p>Dashboard launches pair automatically. If you attach through the extension toolbar, use the local pairing token:</p><button className="button secondary" disabled={!nova.config} onClick={() => nova.config && void copy(nova.config.token, 'Pairing token copied. Paste it into Nova’s extension setup panel.')}><Copy size={14}/> Copy pairing token</button></details>
  </section>;
}
