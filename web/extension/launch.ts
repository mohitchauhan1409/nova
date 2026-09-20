import { websitePermission, type TabLaunch } from '../../shared/browser-launch';
const id = location.hash.slice(1);
const status = document.querySelector<HTMLElement>('#status')!;
const error = document.querySelector<HTMLElement>('#error')!;
const allow = document.querySelector<HTMLButtonElement>('#allow')!;
const fail = (message: string) => { error.textContent = message; error.hidden = false; allow.disabled = false; };
async function open() {
  allow.disabled = true; status.textContent = 'Opening your website with Nova…';
  const result = await chrome.runtime.sendMessage({ type: 'nova-launch-continue', id });
  if (result?.error) throw new Error(result.error);
}
void (async () => {
  const result = await chrome.runtime.sendMessage({ type: 'nova-launch-details', id });
  if (result?.error) throw new Error(result.error);
  const launch = result.launch as TabLaunch;
  const origins = [websitePermission(launch.url)];
  if (await chrome.permissions.contains({ origins })) { await open(); return; }
  status.textContent = `Allow Nova on ${new URL(launch.url).hostname} to show its floating button and help with your commands.`;
  allow.hidden = false;
  allow.onclick = () => {
    error.hidden = true;
    // Chrome requires a direct user gesture for a new website permission.
    void chrome.permissions.request({ origins }).then(async granted => {
      if (!granted) { fail('Website access was not granted. You can try again when ready.'); return; }
      await open();
    }).catch(reason => fail(reason.message));
  };
})().catch(reason => fail(reason.message));
