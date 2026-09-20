# Extension-free website sessions

Status: evaluated alternative, not selected or implemented. The user rejected a Nova session URL and subsequently accepted a browser extension for native website tabs. The selected implementation is the dashboard plus a minimal extension: it opens a tab in the dashboard’s own browser window, retains the actual website URL, and injects the companion only into explicitly launched or attached tabs. Setup and a downloadable ZIP are in the dashboard.

The streamed-session design below remains research. It must not replace the selected native-tab experience. An ordinary webpage cannot inject controls into an unrelated website tab on its own; the installed extension supplies the required authorized browser access.

## Browser constraint

Opening a third-party website from the dashboard does not grant access to its document. The same-origin boundary applies to windows opened with `window.open`, too. A dashboard script cannot add a floating button, read the DOM, or operate arbitrary controls in a normal `amazon.in` tab. A URL parameter does not change that boundary. Directly framing a website also does not grant DOM access, and sites can disallow framing altogether.

Sources: [HTML cross-origin window access](https://html.spec.whatwg.org/multipage/nav-history-apis.html), [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy), [frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).

## Proposed experience

1. The person clicks **Open with Nova** in the dashboard.
2. A Nova session page opens in a new tab of that browser. The local address could be `/session/<id>`; production would use the Nova domain.
3. The backend creates an isolated browser session, navigates to the chosen website, and streams its live viewport into that page.
4. The floating voice/typing companion appears automatically over the live website view. Human input and agent actions operate the same browser session.
5. Ordinary visits to the website in other tabs remain untouched. Ending the Nova session ends its control and streaming.

The website is real and actions affect its real state. Its page runs in the controlled browser; the user's tab displays that session. The browser address bar remains on Nova, and the target website address must be shown clearly within the session page. Sign-in takes place in that isolated session and does not automatically reuse the person's everyday browser cookies.

## Fit with this repository

- Reuse `ControlledBrowser`, `AgentRunner`, site profiles, action policies, approvals, and OpenAI planning. The driver runs without opening a visible browser window on the user's desktop.
- Add a session viewer in `web/` and a session-scoped display/input transport in `BE/`. The dashboard opens this viewer rather than requesting the extension.
- Reuse the companion UI and Sarvam voice client on the viewer page. Capture the microphone in the user's actual browser, after their click. Target-site navigation can then occur without destroying the microphone document.
- Forward actual agent target coordinates to the viewer's cursor. Resize the controlled viewport to match the viewer and map human input against that size.
- Authenticate the viewer and bind every display/input connection to its session. Do not expose the browser's debugging endpoint or put provider keys in viewer URLs.
- Pause agent execution when the person takes over. Do not treat manual input or viewer reconnection as approval to resume a transaction. Existing confirmations remain explicit.

## Transport and verification

For an initial local implementation, the installed Chromium and CDP capabilities can provide display frames and native input without adding a paid browser provider. Screenshot streaming is a prototype transport, not a claim of smooth video or low-latency performance. A production path should benchmark WebRTC video, audio, clipboard, keyboard composition, resizing, reconnects, and accessibility before selecting the transport.

Managed examples establish the feasibility of an embedded interactive browser: [Browserbase Live View](https://docs.browserbase.com/platform/browser/observability/session-live-view) documents browser interaction and embedding; [Steel Live Sessions](https://docs.steel.dev/overview/sessions-api/embed-sessions/live-sessions) describes WebRTC streaming. Neither provider is currently configured in this repository, and no provider purchase or deployment is part of this proposal.

Acceptance checks must cover an extension-free browser profile, no separate visible browser window, floating voice/typing controls, native human input, agent cursor alignment, navigation continuity, session isolation, explicit confirmations, and unchanged ordinary website visits. Measure interaction and speech latency separately. Website video/audio, downloads/uploads, login challenges, and protected media need explicit tests; successful page navigation alone does not prove those features.
