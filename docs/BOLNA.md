# Bolna companion

The current recording preset contains **three substantial creation journeys plus four supporting tasks**. See [BOLNA-FOUNDER-DEMO.md](BOLNA-FOUNDER-DEMO.md) for exact prompts, expected results, evidence and pending live sign-off. The 19-flow catalogue below remains a research reference.

Nova has a dedicated `platform.bolna.ai` profile with 19 workflow guides, a Bolna introduction, blue accent, and agent-review/prompt-preparation suggestions. The guides use the general browser controller; they do not replace live observation with hard-coded selectors.

## Start

1. Run `npm run dev` in the Nova folder. Keep it running.
2. Open http://127.0.0.1:5173 in the Chrome profile where you are signed in to Bolna.
3. Choose **Your websites → Bolna → Open with Nova**.
4. On the actual Bolna URL, click the Nova floating button to open Chrome's native side panel. Chat is the default; Live voice is optional.

Extension 0.6.7 is built at `web/dist-extension` and available at http://127.0.0.1:5173/downloads/nova-extension.zip. For a fresh installation, follow [SETUP.md](SETUP.md). An existing unpacked installation must be reloaded after its files are updated, then open a fresh Nova session so old content scripts are not reused.

## Real execution lab

See [BOLNA-WORKFLOW-LAB.md](BOLNA-WORKFLOW-LAB.md) for the saved resource IDs, exact creation steps and observed test results. The lab created a multilingual agent, verified both saved prompts after reload, created a structured extraction, ran three matching transcript tests, processed and attached a public knowledge source, and built/validated/published a Start → Wait → End workflow. A separate graph agent passed validation and real text tests after recovering from a static-node warning. Campaign setup reached its published-version template and awaits approval to upload a synthetic file. Nova itself also completed the live extraction-test workflow through its installed extension and side panel. The local smoke fixture remains a separate engineering check.

## Original navigation map (before the execution lab)

| Area | Observed workflow | Validation boundary |
| --- | --- | --- |
| Agent Studio | Agent, Intelligence, Languages, Calling, Engine, Tools, Extractions; prompts, variables, voice/transcription choices, model settings, timing, custom tools, webhook/extraction configuration | All seven editor tabs inspected. Production save/call not exercised. |
| Graph Agent | Search; blank/import/support/order-tracking create choices | No graph created; node wiring not tested live. |
| Workflows | Search/import/create; canvas inspector, Agent/Extraction/Wait/Retry/Condition/API/AiSensy/End nodes; validation, version history, publishing controls | Opening Create immediately created one unpublished Untitled workflow. No nodes configured or published. |
| Knowledge Base | PDF upload, URL import, language support, processing table | No document uploaded or crawl started. |
| Campaigns | Campaigns/Executions, filters; name, workflow, version, contact file, column template | No published workflow/contact file available; no campaign launched. |
| Batches | Agent selector, template link, Upload Batch | No saved agent available; upload disabled. |
| My Numbers | Number/agent/provider, purchase/renewal/rent, unlink, Truecaller, delete | No number bought or routing changed. |
| SIP Trunks | Basics → Authentication → Gateways → Advanced → Review; six provider choices | Required fields left empty; no trunk created. |
| Call History | Agent/batch, Execution ID search, refresh, export, stop queued calls, pagination | Empty account; call detail/recording/transcript paths not exercised. |
| Analytics | Call Funnel/Main Dashboard selector; agent scope; embedded Metabase Date and PDF controls; five funnel stages | Call Funnel inspected. Embedded frame controls remain outside the current general DOM controller. |
| Reports | Sidebar entry and destination | Page did not finish rendering during mapping; no invented report controls. |
| Developers/settings | API Keys, Documentation; Integrations, Organisation; workspace selection | Menus inspected. Credentials, billing and access changes not performed. |

These are mapped guides, not claims that every workflow is end-to-end verified. The trial account restricts outbound calls to verified numbers. Empty accounts, permissions, third-party frames, browser dialogs and graph-canvas semantics can limit execution; Nova must report the concrete limitation.

Live validation on 2026-09-18 confirmed the same-profile launcher, the floating button, the Bolna introduction and suggestions in the native side panel, and navigation to Intelligence. That first navigation exposed the focus-before-click bug described below. Chrome confirmed the installed extension was reloaded as 0.6.2, and the exact regression then passed with the packaged extension in an isolated browser. The final signed-in retry was blocked by intermittent Computer connector `noWindowsAvailable` errors and stale accessibility state. It is not recorded as a successful live end-to-end run.

## Suggested founder-demo sequence

- “Open Intelligence and tell me the selected provider and model. Do not change or save anything.”
- “Open Knowledge Base and tell me whether any knowledge bases are available.”
- “Open Batches and explain what prerequisite is missing.”
- On a designated demo agent: “Prepare this welcome message once: Hello {first_name}, how can I help? Do not save or call anyone.”
- After reviewing that draft, explicitly request saving. Verify the saved record before claiming success.

Live calls, uploads, campaign/batch dispatch, publishing, money, routing and credential/access changes require concrete review. Do not use real customer contacts for a demo without authorization. A timeout must not lead to a duplicate dispatch.

## Engineering checks

`npm run build`, `npm test`, `npm run test:control`, and `npx tsx scripts/bolna-smoke.ts`.

The Bolna smoke test uses a fictional local UI with the real planner and trusted browser input. It checks one complete welcome draft, two verified configuration saves, and a declined call with zero dispatches. This is deliberately separate from live Bolna account validation. Reports are written under `BE/data` without provider keys.

0.6.2 also fixes pointer preparation focusing auto-activating tabs before clicking. Preparing coordinates no longer activates the tab or changes its route. Keyboard actions still focus their intended target. Credential labels and placeholders are protected, and live call/campaign/batch controls require review even if a planner mislabels them read-only.

## 0.6.3 obstruction recovery

A live graph validation attempt exposed Bolna’s inspector covering the toolbar at the narrower side-panel width. Nova’s preflight rejected the click before input, but the runner treated that as a possibly committed action. The pointer controller now returns an explicit `not-sent` receipt for preparation rejection; the runner can re-observe and choose a visible recovery control. Transport failures and post-input failures still stop instead of risking duplicate commits. The graph guide also describes closing the inspector to expose the toolbar.

## Follow-up cards (0.6.7)

Underspecified tasks now collect related missing details in structured cards with choices and custom answers. Workflow intake asks for the intended purpose/sequence and name, then only the additional facts needed for that plan. **Help me choose** carries partial answers into the conversation. Chat and voice answers remain supported. Forms never count as approval to call, publish or dispatch a campaign. See the dated validation record for the distinction between fixture coverage and live Bolna tests.
