# Install Nova in your browser

This is a local development extension for Chrome, Edge, and compatible Chromium browsers.
Keep the Nova backend running on this computer. No API keys belong in this folder.

1. Extract nova-extension.zip. Move the extracted nova-extension folder to a
   permanent place, such as Documents. Keep this folder while Nova is installed.
2. In Chrome, copy chrome://extensions into the address bar. In Edge, use
   edge://extensions. Turn on Developer mode.
3. Click Load unpacked. Select the nova-extension folder containing manifest.json.
   Select the extracted folder, not the ZIP and not the parent folder.
4. Open http://127.0.0.1:5173/#setup in the SAME browser and profile. Refresh the
   dashboard after installing. It should say Nova extension connected to this browser.
5. Try the demo, or choose Open with Nova on a website card. The website opens in
   a new tab in the same window. On first use of a domain, click Enable Nova on
   this website and approve the browser's access request.
6. Click the floating Nova button to open the browser side panel beside the website.
   Chat is selected by default. Choose Live talk. On first use, Nova opens a microphone
   setup tab: choose Allow in the browser prompt, click Back to Nova, then start voice
   in the panel. Granted access is reused across websites. Returning to Chat stops
   capture. If blocked, the setup tab provides microphone settings and recovery steps.
7. Nova handles routine browsing without repeated confirmations. Purchases, sending,
   publishing, deletion, and sensitive account changes still need your confirmation.

Normal website visits do not activate Nova. One Nova website session is active
at a time. End it from Dashboard > Activity > End session to remove the companion
without closing the website. Dashboard launches pair automatically.

If Nova is missing: confirm the extension is enabled in this browser profile,
refresh the dashboard, and launch from Nova again. Keep npm run dev running.
Safari, Firefox, and embedded browser previews are not supported by this build.
Browser internal pages, extension stores, and other protected pages cannot host Nova.

Version 0.7.1 uses Chrome’s browser-debugger permission for real input and screenshots.
Accept the new permission if Chrome asks when enabling/reloading Nova. A browser
control banner appears while connected. If you disconnect control, use Resume browser
control in Nova. Close DevTools on that tab if it prevents connection. Ordinary
website visits remain inactive.

To update: replace the files inside the SAME installed folder with the new
extracted files, click Reload on Nova's extension card, and refresh the dashboard.
End old sessions and reopen websites from Nova to use the new scripts.

Official Chrome guide:
https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked
Official Edge guide:
https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading

Project startup (from the Nova project folder, with Node.js 20.19 or newer):
  npm install
  npm run build
  npm run dev

Keep provider credentials in the project's backend .env file. The downloadable
extension contains browser code only; it does not start or include the backend.
