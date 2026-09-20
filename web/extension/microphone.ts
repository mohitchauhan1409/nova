import { microphoneError } from '../src/microphone';
const title = document.querySelector<HTMLElement>('#title')!;
const status = document.querySelector<HTMLElement>('#status')!;
const allow = document.querySelector<HTMLButtonElement>('#allow')!;
const back = document.querySelector<HTMLButtonElement>('#return')!;
const settings = document.querySelector<HTMLButtonElement>('#settings')!;
const problem = document.querySelector<HTMLElement>('#problem')!;
const help = document.querySelector<HTMLElement>('#help')!;
let requesting = false;
let disposed = false;
let permission: PermissionStatus | undefined;
function fail(error: unknown) {
  const details = microphoneError(error);
  document.body.dataset.state = 'error';
  problem.hidden = false;
  document.querySelector('#problem-title')!.textContent = details.title;
  document.querySelector('#problem-message')!.textContent = details.message;
  title.textContent = details.blocked ? 'Let’s enable your microphone.' : 'Let’s check your microphone.';
  status.textContent = 'Your microphone is off. You can retry here or continue using chat.';
  allow.hidden = false; allow.disabled = false; allow.textContent = 'Try microphone again';
  settings.hidden = false; help.hidden = !details.blocked; back.hidden = false; back.textContent = 'Back to Nova';
}
function granted() {
  document.body.dataset.state = 'granted'; title.textContent = 'You’re ready to talk.';
  status.textContent = 'Microphone access is allowed for Nova. Return to the side panel and start Live voice. Nova will reuse this permission on your websites while it remains allowed.';
  allow.hidden = true; problem.hidden = true; help.hidden = true; settings.hidden = true; back.hidden = false;
}
async function requestAccess() {
  if (requesting || disposed) return;
  requesting = true; allow.hidden = false; allow.disabled = true; allow.textContent = 'Waiting for browser permission…'; problem.hidden = true;
  document.body.dataset.state = 'requesting';
  status.textContent = 'Choose Allow in the browser’s microphone prompt. This enables Nova, so you do not need separate permission on each website.';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    stream.getTracks().forEach(track => track.stop());
    if (!disposed) granted();
  } catch (error) { if (!disposed) fail(error); }
  finally { requesting = false; }
}
allow.onclick = () => void requestAccess();
back.onclick = () => {
  void chrome.runtime.sendMessage({ type: 'nova-microphone-return' }).then(result => {
    if (result?.error) { problem.hidden = false; document.querySelector('#problem-title')!.textContent = 'Return to your website'; document.querySelector('#problem-message')!.textContent = result.error; }
  }).catch(() => { status.textContent = 'Return to your website tab and open Nova. You can close this setup tab.'; });
};
settings.onclick = () => void chrome.runtime.sendMessage({ type: 'nova-microphone-settings' });
window.addEventListener('pagehide', () => { disposed = true; });
void (async () => {
  try {
    permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    permission.onchange = () => { if (disposed || requesting) return; if (permission?.state === 'granted') void requestAccess(); else { document.body.dataset.state = 'prompt'; allow.hidden = false; allow.disabled = false; allow.textContent = 'Allow microphone'; status.textContent = 'Microphone access changed. Click Allow microphone to check access again.'; } };
  } catch { /* getUserMedia remains available if querying permission is unsupported. */ }
  // A top-level extension tab can show Chrome's permission bubble; a side panel cannot.
  await requestAccess();
})();
