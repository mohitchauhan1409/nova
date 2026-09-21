# Nova

A local, website-aware AI companion with real browser actions, English voice conversation, editable site guides, and confirmation before consequential actions.

## Confident AI demonstration

This startup branch contains the Confident AI appearance and trusted site guide. The captured Northstar workflow saved prompt commits `5562c12` and `5fb11cb` and expanded the existing dataset from six to eight synthetic cases. Read the [actual captured requests](docs/confident-ai/demo-script.md), [live verification and limitations](docs/confident-ai/live-verification.md), and [activation details](docs/confident-ai/setup-and-validation.md). The take used backend `94debcde…` with extension `b7e3172`; later source/docs commits do not change that loaded identity. Independent postcapture business checks passed, including exact new tags and blank execution outputs. Media QA and delivery evidence remain separate; no evaluation results are claimed.

## Repository branches

- **`main`** is the reusable Nova product: the dashboard, website-adaptive interface, browser engine, chat, question cards, complete action timeline, verification, privacy controls, and optional Live talk.
- **`bolna-nova`** builds on core with Bolna guides, scoped visual styling, workflow/agent/campaign fixtures, and the recording tools. Customer code stays on that branch.

New startup branches should start from `main`. See [customer customization and branch workflow](docs/CUSTOMIZATION.md) for the extension points and how to share engine improvements.

## Run

Requires Node.js 20.19+ and a Chromium-compatible desktop environment.

```sh
npm ci
cp .env.example .env
# Add your OpenAI and Sarvam API keys to .env.
npm run build
npm run dev
```

Open [Nova setup](http://127.0.0.1:5173/#setup) in Chrome or Edge. Download and install the extension using the steps there. Keep the terminal running. Choose **Try the demo** to test the complete search/product/cart flow without a real transaction. Install the Nova extension in the browser hosting the dashboard, then choose a website card to open a new tab in that same window. The dashboard does not launch a separate browser. Click the floating **Nova** button to open its native browser side panel beside the website. **Chat** is selected by default; choose **Live talk** and allow Nova’s microphone request to speak. The website resizes to make room. Conversations and approvals stay in the panel; the dashboard manages websites and sessions.

For the production web bundle served locally:

```sh
npm run build
npm start
```

Open **http://127.0.0.1:8787**. This build intentionally binds to loopback; it is not a hosted multi-user deployment.

## Use Nova in your existing browser

1. Run `npm run build`, then `npm run dev`. Keep the terminal running.
2. In Chrome or Edge, open [Settings & setup](http://127.0.0.1:5173/#setup). Click **Download Nova extension**, or use the [direct ZIP download](http://127.0.0.1:5173/downloads/nova-extension.zip).
3. Extract the ZIP (double-click on Mac; **Extract All** on Windows). Keep the extracted `nova-extension` folder in a permanent location such as Documents.
4. Copy `chrome://extensions` (Chrome) or `edge://extensions` (Edge) into the address bar. These browser settings addresses cannot be opened as normal webpage links. Enable **Developer mode** → **Load unpacked** → select the extracted `nova-extension` folder containing `manifest.json`.
5. Return to the dashboard in the **same browser and profile**, then refresh. Settings should report the extension connection and installed version **0.7.1**. Pairing is automatic when launching from the dashboard.
6. Choose **Test with the demo shop**, or **Open with Nova** on a website card. On first use of a domain, choose **Enable Nova on this website** and approve the browser access request. The new tab then navigates to the real website URL.
7. Click the floating Nova button. Chat opens in the browser side panel; **Live talk** is optional. Nova’s cursor shows its actions on the website.

Official instructions: [Chrome: load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked), [Edge: sideload an extension](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading).

You can also load the generated `web/dist-extension` folder directly. `npm run build` generates both that folder and `web/releases/nova-extension.zip`; the ZIP includes its own `INSTALL.md`. It includes browser code only, without API keys, pairing tokens, or the backend. To run the diagnostic Playwright browser tests, additionally run `npm run setup:browser`.

To update an installed download, replace the files inside the **same installed folder**, click **Reload** on Nova’s extension card, and refresh the dashboard. End old sessions and launch websites again. Keep the extracted folder while using Nova. To remove it, end the session and click **Remove** on the extension card.

The [full setup and troubleshooting guide](docs/SETUP.md) also covers the locally served production build.

Dashboard launches request optional access for the chosen website and its subdomains. The extension uses the dashboard tab’s window ID, so it follows whichever supported browser and window hosts Nova; it never opens a system-default browser. Toolbar invocation can still use `activeTab` access. Invoke Nova again after crossing to a website you have not enabled. Its background connection preserves the task through page reloads. The launcher reinstalls on the website while the native panel keeps the conversation. Voice capture belongs to the extension panel, independently of website navigation. Returning to Chat, closing the panel, or activating another tab stops capture.

This build supports Chrome, Edge, and compatible Chromium browsers. Safari, Firefox, and embedded browser previews need a separate integration. If the extension is missing, the dashboard shows setup instead of silently opening a separate browser. Reload the unpacked extension and refresh the dashboard after rebuilding an earlier version. One extension website session is active at a time; opening another stops the previous session and removes its companion. Ordinary website visits never activate Nova. **Activity → End session** removes the companion without closing the website; reloading an ended tab does not reactivate it.

Nova cannot inject into browser internal pages, the extension store, or other protected browser surfaces. Your existing cookies stay in your browser; the extension sends bounded page observations to the local backend, which uses the configured model provider.

## What is implemented

- `BE/`: Fastify API, authenticated WebSocket transport, OpenAI planner, policy/approval system, browser drivers, site storage, and Sarvam voice pipeline.
- `web/`: React launch dashboard, native browser side panel with chat and optional live voice, floating launcher, agent cursor, and Manifest V3 browser extension. A legacy in-page companion remains for diagnostic driver tests.
- `app/`: Mobile-phase placeholder and platform constraints.
- `shared/`: Typed actions, protocol, and shared DOM observation/execution.
- `tests/`: Policy, cancellation, approval, progress memory, structured questions, customization, and actual DOM fixture tests.
- `docs/RESEARCH.md`: Research, library decisions, competitor lessons, performance strategy, and release criteria.
- `docs/VALIDATION.md`: What has actually been tested and the remaining limits.

Built-in guides cover Amazon India, YouTube, and Google. Additional public URLs can be registered. First-page observation can suggest simple unverified flows and an accent color; use **Flow library** to add domain-specific instructions and steps. Guides are hints, not an exhaustive map of every website state.

## Interactions

See [one browser engine, a companion for each website](docs/GENERAL-AGENT.md) for general discovery, visual recovery, and profile customization. Saved flows are optional.

Nova has 29 typed action primitives: click/tap, double-click, right-click, hover, drag between observed targets, replace/append/clear text, paste explicit text, keyboard controls, dropdown selection, checkbox/radio selection, page and nested-container scrolling, scroll-to, zoom, media playback/seek, text selection/copy, navigation, search, screenshots, visual target inspection, visual clicks, completion, and clarification.

Both browser drivers use native pointer and keyboard input. A labeled Nova cursor marks action targets. The extension uses Chrome's browser-control connection for trusted input and screenshots, and its native tab-zoom API. Version 0.7.1 requires Chrome's debugger permission at installation/update; Chrome displays a control banner during use. Semantic controls such as HTML selects and media state use the shared DOM bridge. Completion requires matching observed evidence; unsupported or inconclusive steps are reported without assuming success.

Exact commands such as **scroll down**, **scroll to the bottom**, **zoom in**, and **zoom to 125 percent** bypass LLM planning. Ambiguous instructions and compound requests go through the model and the same action policy. The agent uses the request and clarification history to continue routine work. Searches, navigation, scrolling, filters, text drafts, and clearly requested cart or ordinary preference changes do not need repeated approvals. Purchases, sending/publishing, deletion, legal agreements, sensitive account changes, and uncertain consequential controls still require a concrete confirmation in the side panel.

See [the action support matrix](docs/CAPABILITIES.md) for platform differences and remaining gaps.

Grouped question cards collect missing details in one turn. Partial answers and requests for help stay in the conversation. The action timeline shows every step while work is active, follows new steps unless the user scrolls back, and can expand completed tasks. The launcher hides while the side panel is open. The planner keeps bounded evidence of settings it already inspected and avoids repeating unchanged draft text or completed steps.

## Models and voice

`OPENAI_MODEL=gpt-5.6-sol` is the default flagship planner. `OPENAI_FAST_MODEL=gpt-5.6-terra` selects the lower-cost option. No request automatically escalates to Astra. Models, reasoning effort, Sarvam model IDs, and speaker are configurable in `.env`. Restart the backend after changing them.

See [model pricing and task samples](docs/MODELS.md). Sol's current standard input/output rates are 60% below Astra's; actual cost and quality depend on the task.

Opening the panel never starts microphone capture. The user explicitly selects **Live talk** to start it. On first use, a Nova extension tab requests microphone permission because Chrome cannot reliably present the first permission prompt inside a side panel. After allowing access, return to Nova and start voice. The browser owns and remembers the permission; Nova queries it again each time and respects revocation. No permission flag is cached in application storage. Voice uses Saaras realtime STT → OpenAI browser decisions → Bulbul v3 streaming TTS, with Sarvam-105B Conversations providing short English acknowledgements alongside browser work. Microphone audio is streamed as PCM, not saved locally. AudioWorklet is preferred, with a PCM callback fallback where a site blocks worklet loading. Barge-in stops speech playback and pauses further browser actions.

## Verification

```sh
npm test
npm run typecheck
npm run build
npm audit
# Same-window launch + native side panel; requires a desktop display and the dashboard/backend, no paid providers:
npm run test:tabs
# First microphone prompt, grant reuse, revocation; synthetic device, no paid APIs:
npm run test:microphone
# Trusted browser actions, screenshots, media state, and disconnect recovery:
npm run test:control
# Live model tasks on a fictional shop:
npm run test:general
npm run test:models
# Signed-out public YouTube playback regression (predeclared test host permission):
npx tsx scripts/public-controls-smoke.ts
# Dedicated-browser launcher; no paid providers:
npm run test:launcher
# The commands below call paid providers using .env and require a running backend:
npm run check:providers
npm run test:live
npm run test:live -- --public
npm run test:extension # native side panel, live OpenAI + Sarvam, synthetic microphone; desktop display required
npm run test:voice
npx tsx scripts/voice-roundtrip.ts
```

Public smoke tests do not approve purchases or cart changes. Local demo tests use fictional products; explicit add-to-cart requests now proceed without an extra approval. Integration reports are written to ignored `BE/data` files. Do not run multiple live smoke scripts simultaneously: they share the local server's browser-session limits.

`test:launcher` checks the floating button on Google, YouTube, and Amazon in actual desktop windows, including resizing, voice/typing controls, and reload. It uses synthetic microphone input and a stubbed session bridge, with no paid provider calls. It requires a desktop display; on Linux, use Xvfb. The dedicated browser fits its page to the real window so the button stays within the visible content.

## Operational boundaries

This is a local engineering preview. It has not passed a production security review, large-sample browser-agent benchmark, or browser-store review. Google can present human verification; some websites require sign-in or reject automation. Cross-origin frames, closed shadow roots, trusted-input-only extension widgets, downloads/uploads, arbitrary canvas controls, and complete checkout coverage are not universally supported.

Passwords, one-time codes, and payment details are entered manually in the website. Approvals expire after two minutes and apply to one concrete action. If the page changes during confirmation, Nova stops for a fresh review. An action already sent to a website cannot always be undone by Stop.

The local `.env`, pairing token, browser data, and integration reports are ignored by source control. Do not commit them. Rotate credentials shared in chat before deploying publicly. Site profiles persist; browser sessions and conversation history are in memory and end when the backend restarts.
