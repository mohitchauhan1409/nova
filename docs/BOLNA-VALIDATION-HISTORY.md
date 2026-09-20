> Historical engineering log retained from the original Bolna workspace. Entries describe the state at their recorded date and may have been superseded by later entries. Historical artifacts, local objects and temporary files are not included in Git. The two retained recordings are now archived on this branch using Git LFS; see [recordings and recovery](BOLNA-RECORDINGS.md). See VALIDATION.md for the current branch checks.

# Nova validation record

Validated on 16 September 2026 in this workspace, using macOS, Node.js 20.19.6,
Chromium, and the configured OpenAI and Sarvam accounts.

**Current extension: 0.6.2. Release status: functioning local engineering preview.**

## Bolna companion (0.6.2)

- 17 curated guides mapped in the signed-in Chrome account; see [BOLNA.md](BOLNA.md) for coverage and prerequisites. Mapping does not mark entire flows verified.
- Confirmed the Bolna launcher, floating button and native side panel on the real website. The first live Intelligence command exposed focus-triggered navigation during pointer preparation; fixed generically in both browser drivers.
- 183 unit/integration tests pass. The live-planner Bolna fixture passed draft-once, intelligence save, engine timeout save and declined-call checks. Native extension input tests cover the focus-activated tab regression.
- Published 0.6.2 to the local ZIP download and updated/reloaded the existing Chrome unpacked installation without changing permissions.
- Live account validation remains incomplete: no customer calls, contact uploads, purchases, publishing or routing changes were executed. Reports did not finish rendering; embedded Analytics frame controls are not yet supported by Nova's general DOM controller.
- Inspection created one unpublished empty “Untitled workflow.” No workflow was published or run.
The results below establish the tested flows, not universal website compatibility
or production certification.

## Current build and automated checks

| Check | Result |
|---|---|
| TypeScript and production build | Passed; dashboard, native panel, unpacked extension, downloadable ZIP generated |
| Vitest | 157 tests passed across 15 files |
| Dependency audit | Zero known vulnerabilities reported by `npm audit` |
| Packaged credentials | Distribution tests confirm no configured provider key, pairing token, backend configuration, or browser data in the ZIP |
| Dashboard download and native panel | 13 checks passed using the ZIP downloaded through the dashboard |
| First-use microphone permission and reuse | 5 checks passed in an isolated Chromium profile; real permission prompt observed, grant/deny simulated |
| Trusted browser actions and site identity | 10 checks: profile-driven panel, screenshot error recovery, trusted input, visual point recovery, SVG controls, media state and disconnection |
| Public YouTube controls | 6 checks passed: native search, typed panel commands for play/pause/five-second seek, zero model calls for those commands, and screenshot in a signed-out disposable browser |
| Lower-cost model tasks | Sol and Terra each passed product search/details and exact-quantity cart tasks; see `MODELS.md` |
| Unknown website, no flows | Sol completed the unfamiliar project workspace task in 18.122 s: Ready filter, project details, requested favorite and observed deadline; 4 actions, 5 model calls |
| Native panel with live providers | 10 checks passed on 0.6.0 with Sol, Sarvam, synthetic input and a local fictional shop; earlier recognition mismatches described below |

The suite covers observed DOM actions, sensitive fields, typed action validation,
URL/origin boundaries, approval expiration, stale prices, cancellation, and no
retry of a possibly committed mutation. New policy cases distinguish routine
browsing, requested cart changes, clarification context, negated/hypothetical
instructions, explicit requests to wait for approval, and serious actions even
when the model incorrectly marks them as harmless. New voice tests cover late
microphone permission grants and callbacks from closed/replaced provider sockets.

These deterministic rules and prompt instructions improve autonomy; they are not
an exhaustive classifier for all languages or every website control.

## Conversation and privacy guardrails (backend update)

The extension remains 0.6.1; these rules run in the backend and require no extension
reinstallation. Reopen a website session after the development backend restarts.

- Whole-utterance identity, internal-model, Nova pricing and acknowledgement
  questions return short canonical answers without observation or model calls.
  Mixed task requests and clarification answers still reach the worker. Side
  conversation is excluded from task planning and cannot cancel a pending approval.
- Planner instructions keep conversation focused on website tasks, prohibit
  internal configuration disclosure and invented Nova pricing, and discourage
  volunteering personal page information. Public product/model research remains allowed.
- Common account greetings, delivery headers, email addresses and phone patterns
  are filtered from planning context and replies when unnecessary to the task.
  Explicit contact tasks retain relevant details for review. Configured credentials
  and credential-shaped tokens are redacted. Execution and approval fingerprints
  continue to use the actual observation, not the redacted copy.
- Screenshots are blocked when detected private text would bypass text filtering.
  Semantic actions remain available. Sarvam acknowledgements are constrained to
  three short phrases and skipped entirely for canonical conversational replies.

`npx tsx scripts/conversation-smoke.ts` passed eight checks against the live planner
using fictional page data: the four reported examples, a request to override the
rules and reveal internals, unverified billing claims, off-topic conversation, and
an observed adapter price. The four canonical examples made zero model calls;
other examples made one each. Report: `BE/data/conversation-smoke-report.json`.
The composer smoke test also passed again with six live model calls.

This is layered mitigation, not exhaustive personal-data recognition or proof
against every prompt injection. Name/address recognition currently covers common
header patterns; other personal content relies on the planner privacy policy.
Backend-owner settings still expose configured model names for administration;
conversation nondisclosure is not a security boundary for that local owner.

## Composer reliability (0.6.1)

The user's Amazon session trace showed a successful Rufus open with expanded:true
being rejected at completion, repeated verified fills with slightly different
wording, and approvals invalidated by whole-page snapshots. The shared fixes are:

- Exact observed accessible names and equivalent ARIA state spelling are accepted
  as completion evidence; fabricated result text is still rejected.
- Verified writes are retained as prepared inputs. A run cannot keep rewriting the
  same field; “send it” also preserves an existing user draft.
- Message approvals bind the composer, control and field revisions. Unrelated
  banners, transcript updates, observation order and textarea scrolling do not
  invalidate them. Changed drafts still invalidate approval. No raw user field
  value is included in observation metadata.

`npx tsx scripts/composer-smoke.ts` passed with the live Sol model and a fictional
composer: open the panel, draft once without sending, then approve and send the
existing draft exactly once while a banner changes every 120 ms. Six model calls
were used across the three commands. This reproduces the failure mechanics; it
is not a live send into the user's Amazon account. The report is
`BE/data/composer-smoke-report.json`. The packaged extension also passed its ten
native-control checks. Updated approval and draft regressions are in the unit suite.

## General browser engine and site identity (0.6.0)

`npm run test:general` ran against a fictional project workspace with no site
instructions or saved flows. Handlers reject synthetic input. Independent checks
confirmed the custom ARIA filter, opened project, saved favorite and deadline in
Nova's answer. The first run found an unnecessary confirmation for “favorites”;
the shared intent matcher now accepts that explicit request and retains negation
checks. The final run passed without approval. This is one unfamiliar layout,
not a benchmark covering all websites.

DOM tests verify discovery after scrolling beyond 180 controls, viewport text
priority, CSS controls, ARIA options, SVG targets and unnamed scroll containers.
Visual inspection resolves real targets without clicking; subsequent input uses
the inspected point. Moved points, private inputs and unobserved frames fail
explicitly. Sensitive fields outside the bounded list still block screenshots.

The packaged-extension test checks actual profile identity and accent in the
native panel, plus trusted input on an unmarked control whose active area is away
from its center. `browser-control-fixture.png` was visually reviewed. The panel's
scrolling welcome content leaves the composer visible. Suggested tasks prefill
editable text; opening a panel does not execute a flow.

See [architecture and configuration](GENERAL-AGENT.md). Reports are saved locally
in `BE/data/general-agent-smoke-report.json` and
`BE/data/browser-control-smoke-report.json`.

## Native side panel, chat, and voice

`npm run test:tabs` downloads the ZIP through the actual dashboard, extracts it,
and loads that exact folder in an isolated Chromium profile. It verifies:

- Missing extensions lead to setup; there is no separate-browser API request.
- Both official installation links, the copyable settings address, version 0.6.0,
  and responsive setup layout work.
- With two browser windows open, the new website tab belongs to the dashboard's
  window and retains its real website URL.
- The floating launcher opens a real `SIDE_PANEL` extension context. Chat is the
  default, the empty composer has the correct height, and no chat dialog overlays
  the website.
- A typed command changes only the attached tab's native zoom. Page reload restores
  the launcher while the native panel retains the conversation.
- Ordinary visits stay inactive. Launching another Nova session removes the prior
  launcher; ending a session removes Nova without closing the website.
- New domains require browser access before navigation; unknown launch IDs fail.

`npm run test:extension` uses live providers and a preapproved synthetic Chromium
microphone inside the actual native panel. It verifies:

1. Chat opens without requesting the microphone; OpenAI answers the visible ₹799
   demo price from the website observation.
2. Direct tab zoom executes without a model decision.
3. Page reload preserves the panel and messages.
4. Explicitly entering Live voice captures synthetic speech, receives Sarvam's
   transcript and an OpenAI page answer, and schedules streamed audio playback.
5. Returning to Chat ends every microphone track.
6. A delayed microphone grant after leaving voice is cancelled and releases tracks.
7. A clearly requested cart addition adds exactly one fictional item without an
   approval trace.
8. A fixture-only Place order control requires a visible confirmation. Cancel leaves
   the control untouched. No real order or payment occurs.
9. New conversation clears the thread and returns to Chat.
10. Close dismisses the native panel and leaves the website launcher available.

Visuals were reviewed at the native 360 × 753 CSS pixel panel size. The composer
and voice controls stay visible; longer conversations and confirmations scroll.
Screenshots are in ignored local `BE/data`:
`native-panel-welcome.png`, `native-panel-chat.png`, `native-panel-voice.png`,
`native-panel-confirmation.png`, and `same-browser-tab.png`.

Voice uses synthetic audio, not the user's physical microphone. These checks do
not establish perceived voice quality, noisy-room accuracy, acoustic echo
cancellation, accent coverage, or physical-device interruption latency. An earlier
run ended with an unexpected “is that” transcript. During 0.4.1 validation, one run
transcribed the synthetic price question as “What is the purpose of this adapter?”
and correctly answered that different question, failing the expected-price check.
Recognition accuracy remains a separate limitation. The harness checks all
transcripts in the spoken turn rather than assuming that speech always arrives
as a single final segment. The successful rerun heard “Price of the stock” and
answered the visible adapter price from page context. This satisfies the price
intent check but still demonstrates imperfect transcription of the input phrase.

The current native surface is separate from the legacy in-page companion retained
for the dedicated Playwright driver. `test:voice` and `test:launcher` still exercise
that diagnostic driver. Dashboard launches use the extension side panel.

## First-use microphone permission (0.4.1)

Chrome can reject an initial microphone request from a side panel without displaying
its permission bubble. Nova now opens a top-level extension setup tab when access
is not already granted. The setup page requests microphone access, immediately
stops its test stream, and lets the user return to Nova. Subsequent voice attempts
query the browser's current permission and start directly when allowed. Permission
is shared by Nova's extension pages across websites; no application flag can
override a revoked browser or operating-system permission.

`npm run test:microphone` runs without an automatic-permission launch flag. It checks:

1. First use opens the setup tab in the website's browser window and increments
   Chromium's `Permissions.Prompt.Shown` histogram, proving a real prompt appeared.
2. A granted microphone is acquired and immediately released by setup.
3. Returning to the native panel reuses access without another setup tab or prompt;
   switching to Chat releases all microphone tracks.
4. Reloading the website preserves access and voice can start directly again.
5. Revoked access opens setup with recovery instructions instead of trusting stale
   cached permission.

Grant and denial are simulated with Chromium permission overrides in a disposable
profile. Capture uses a synthetic device and provider messages are intercepted in
this permission-only test. These checks do not prove physical microphone access
or persistence after a browser restart. Temporary browser grants may expire.
Reports and screenshots: `microphone-smoke-report.json` and
`microphone-permission-{prompt,granted,blocked}.png` in ignored `BE/data`.

## Browser actions and completion (0.5.0)

`npm run test:control` loads the distributed extension JS/manifest unchanged in a
disposable Chromium profile. It first reproduces `captureVisibleTab` failing with
the reported `activeTab`/`all_urls` error, then verifies that Nova's debugger-based
capture succeeds without all-site host access. The fixture includes a button that
ignores synthetic events, input/search handlers requiring `isTrusted`, double
click, hover, an open-shadow-root button, an idempotent checkbox, private input,
real HTML media play/pause/seek/mute state, and a disconnected control connection
that requires explicit Resume before input can continue.

The runner now rejects completions without matching page evidence. Tests include
an ignored cart change, a fabricated order confirmation, an unverified action
disguised as an answer, a click receipt incorrectly offered as task evidence, and
a scroll that does not move. Text insertion is checked locally without returning
private field values. UI state changes are not themselves proof of the requested
task: the model must identify the corresponding current result. This remains a
bounded verifier, not a universal semantic proof of task success.

`npx tsx scripts/public-controls-smoke.ts` exercised actual signed-out YouTube:
native search for an observed video, typed native-panel commands for pause, play,
and seeking forward five seconds, and capture. It compares the actual media state
with each confirmation and verifies zero OpenAI calls for those playback commands.
The test copy predeclares YouTube host permission to simulate a user-granted
domain; extension JS is unchanged. It does not test the website permission prompt
or any authenticated account action. Tests exposed and fixed a duplicate Enter
event crossing navigation, a video control overlay incorrectly blocking semantic
playback commands, and bare “pause” being intercepted as an agent-stop command.
“Stop” and “pause Nova” still stop the agent. The final successful report is
`BE/data/public-controls-report.json`.

Model validation uses live APIs and two tasks per model on one fictional shop.
Token usage and approximate costs are recorded in `BE/data/model-smoke-report.json`.
See [model selection and cost](MODELS.md) for samples, official pricing links, and
the limits of the comparison.

## Earlier public-site and provider results

These results predate the 0.4.0 presentation change. The current release has not
rerun authenticated public-site transactions or proved complete checkout coverage.

| Surface | Observed result and limits |
|---|---|
| Amazon India | Searched for a Zebronics adapter, opened a real product URL, and reported observed details. No real cart change, sign-in, or purchase tested. |
| YouTube | Searched for James Webb telescope and reported a visible result/channel. No comment, subscription, or paid action. |
| Google | Search encountered unusual-traffic/human verification. Nova stopped; search completion failed. |
| Dedicated-browser launcher | Button visibility, window resizing, typing/voice entry, and reload checked on Google, YouTube, Amazon with a stubbed session bridge. Separate from live task success. |
| Local demo, explicit approval request | Inspected product, honored a request to confirm its fictional cart action, added once, and verified the cart. |
| Sarvam | Conversation response, realtime STT, and streaming Bulbul audio worked with live APIs. |
| Dashboard | Website registration, private URL rejection, guide/flow editing, and navigation were exercised. |

## Timing samples

The current native-panel test recorded direct zoom in **88 ms**, including its
programmatic text input, click, and UI result. It bypasses model planning. The
latest rerun replaces this value in `BE/data/extension-smoke-report.json`.

Earlier single successful samples: Amazon search through product answer 33.97 s;
YouTube result answer 13.01 s; first voice reply audio 1.88 s after the final
transcript; grounded page-answer audio 2.97 s after the final transcript. Voice
measurements exclude speaking time and endpointing. A first reply may be an
acknowledgement rather than the final answer.

These are samples on this computer and network, not averages, P95 measurements,
provider comparisons, or service guarantees. Read tasks, direct viewport commands,
and transactions have different workloads.

## Reproduce

Keep `npm run dev` running. Browser integration scripts use disposable profiles.
Native panels and window tests require a desktop display; use Xvfb on Linux.
Run integration scripts sequentially because they share local backend limits.

```sh
npm run build
npm test
npm audit
npm run test:tabs
# First-use prompt, permission reuse, and revocation; no live provider calls:
npm run test:microphone
npm run test:control
# Live model comparison on a fictional shop:
npm run test:models
# Signed-out public YouTube control regression:
npx tsx scripts/public-controls-smoke.ts
# Live OpenAI + Sarvam, synthetic microphone and fictional local cart:
npm run test:extension
# Optional diagnostic-driver / public-site checks:
npm run test:launcher
npm run test:voice
npm run test:live
npm run test:live -- --public --site=amazon
npm run test:live -- --public --site=youtube
```

Public checks decline consequential actions. `test:live -- --public` also tries
Google; encountering verification is a blocked completion, not a passed search.
Reports are private ignored artifacts under `BE/data` and are replaced on rerun.

## Remaining release work

- Larger versioned evaluations across websites, logged-in accounts, languages,
  changing layouts, and interruptions; measure success and P50/P95 latency.
- Physical microphone testing, OS permissions, device changes, echo/noise, unreliable
  networks, and browser-version compatibility beyond the tested Chromium build.
- Explicit transaction contracts before claiming checkout coverage. Passwords,
  payment details, OTP, and CAPTCHA currently require the person.
- Cross-origin frames, closed shadow roots, arbitrary
  canvas interfaces, file dialogs, uploads/downloads, and browser protected surfaces.
- Hosted account isolation, durable encrypted storage, production security review,
  operations monitoring, and browser-store distribution before a public deployment.
- Mobile drivers. `app/` is a documented scaffold, not a working mobile agent.

Adding a URL registers a site and its guide. It does not grant browser permission
or discover every account-specific flow. See [setup](SETUP.md) and
[capabilities](CAPABILITIES.md) for installation and the supported action surface.


## Bolna real workflow lab — 18 September 2026

See [BOLNA-WORKFLOW-LAB.md](BOLNA-WORKFLOW-LAB.md) for exact objects, steps, results and remaining gates. Direct signed-in Computer testing created and verified a saved multilingual agent, three structured extraction outputs, processed and persisted a URL knowledge attachment, a published validated Start/Wait/End workflow, and a saved graph with actual chat answers. Nova’s own Chrome side panel also completed the real extraction test and reported the observed objective correctly. Campaign contacts have not been uploaded; no phone call or customer dispatch was made.

0.6.3 distinguishes pointer preparation rejection (`dispatch: not-sent`) from ambiguous input/transport failure, allowing obstruction recovery without weakening no-duplicate-commit behavior. Build/typecheck passed. All 189 tests across 17 files passed, including new receipt/recovery regressions. The packaged browser-control smoke passed trusted input, screenshot permissions, media states, focus-activated tabs and interruption checks.

The 0.6.3 live replay also passed: Nova navigated to the saved graph, received the actual no-input obstruction receipt, closed Bolna’s inspector, clicked Validate once successfully and returned the exact visible clean validation result. The retained report is `artifacts/bolna/nova-graph-regression.json`.

## 2026-09-18 — Structured question cards (0.6.4)

Implemented bounded structured forms across the model schema, runner, authenticated websocket, extension relay, native panel and voice view. Chat/voice corrections supersede old forms; partial answers accompany Help me choose. Backend validation rejects missing/unknown/duplicate answers and stale/replayed submissions before browser execution. Card answers do not grant a transaction approval. Credential/payment-secret questions are rejected before display.

Validation so far: 198 tests in 18 files pass; typecheck and packaged build pass. The isolated question-card UI test passed required-field focus, numeric input validation, custom-choice replacement, help with partial answers, answer receipt, one submission and 320px layout. Screenshot: `artifacts/bolna/question-card.png`. The packaged extension's trusted browser-input regression passed.

The live-model Bolna fixture passed ambiguous workflow intake without writes (9,078 ms), a help/correction turn without mutations, exactly one welcome draft, saved Intelligence and Engine settings and a declined call with zero dispatch. This is a fictional local UI, not proof of live-account Bolna coverage. Report: `BE/data/bolna-smoke-report.json`. Actual account card testing is recorded separately when completed.

The complete packaged side-panel path also passed using the real model against Nova's isolated local demo: two questions appeared together in 6,053 ms, Continue sent both answers through the extension and backend, the card became an answered receipt, and Nova recommended the observed ₹799 adapter within the supplied ₹1,500 budget without adding it to cart. Report: `artifacts/bolna/question-panel-transport.json`. This does not substitute for a live Bolna workflow creation test.

An initial side-panel test failed because its native test clicks raced with scroll rendering and the second answer went into the previous field. The form blocked the incomplete submission. The test driver now waits for layout, checks hit testing and verifies focus before typing; the replay passed.

The dashboard ZIP installation and native-tab smoke also passed with 0.6.4: version reporting, same-window new tabs, automatic launcher, native side panel, command transport, reload continuity, no injection on normal visits, session cleanup and explicit access for new sites. The user's unpacked folder was updated with identical permissions and backed up. Activation in their Chrome profile and a new live Bolna card-to-workflow run remain pending coordination because the user was actively interacting with that browser; no claim of live completion is made.

## 2026-09-18 — Live 0.6.4 activation and inline rename

Chrome visually confirmed installed 0.6.4. Real Bolna question cards, partial-answer help, no repeated name question, and single form submission passed. The run created one draft, then exposed an unnecessary Enter-to-rename approval. The backend rule is fixed and 200 tests pass, including generic-message/sensitive-setting regressions. The real-input local rename reproduction passes. Live workflow completion remains unverified because Computer returned no controls or screenshots after creation; the user confirmed an unlocked Mac. The existing draft URL and replay record are in BOLNA-WORKFLOW-LAB.md.

## 2026-09-18 — Loop diagnosis and 0.6.6 regression

The resumed 0.6.5 live workflow verification stopped after 29 model calls / 19 executed actions / 232.7 seconds. Its Unit combobox did not expose the selected value, and targetless Escape was rejected by both policy and the native controller. The planner also lost earlier settings when their inspector closed because only the latest few traces were retained. Report: `artifacts/bolna/nova-loop-reproduction.json`.

0.6.6 exposes selected custom-combobox state and narrowly scoped structural field identifiers, supports targetless Escape while retaining tab ownership and policy guards, records bounded per-run observed settings/action progress, invalidates settings across reload/navigation or field edits, reports covered targets, and sends at most three relevant expanded workflow guides. These changes apply to generic browser tools, without a Bolna-specific click script. Targetless Enter/Delete remain blocked; arbitrary private field values remain excluded.

208 tests in 19 files passed; typecheck and build passed. The new headless isolated workflow regression uses the real model and native input, begins with the previously stuck Unit menu, corrects Wait from 30 to 1, checks Start/End, reloads exactly once and checks persistence. It passed in 59,859 ms with 10 actions / 11 model calls / 69,705 input tokens, exactly one field write and zero approvals. This is a local fictional UI, not proof of live Bolna coverage. Report: `artifacts/bolna/workflow-loop-regression.json`; replay: `npx tsx scripts/workflow-loop-smoke.ts`.

Updated the existing unpacked folder and visually confirmed 0.6.6 in the signed-in Chrome profile with no changed permissions. Live replay results are appended below when verified.

Live 0.6.6 replay **passed** in the signed-in Chrome profile: 109,431 ms, 18 model calls, 16 actions, 155,804 input tokens, zero rewrites/approvals, exactly one reload. Nova completed verification of the existing draft. Independent Computer inspection confirmed reference_id/text/required, Wait 1 minute, End success, both edges, fresh No issues found validation, and Version history with no published versions. Report: `artifacts/bolna/nova-workflow-066-live.json`. The previous failing run took 232.7 seconds and 29 calls; these are individual runs, not aggregate performance claims. Full 208-test suite also passed after rebuilding the distributed 0.6.6 ZIP. Remaining latency includes model round trips, two rendering waits and inspector-dismissal recovery; broader Bolna coverage remains bounded by the workflow lab's execution gates.

## 2026-09-18 — Four-flow founder preset and 0.6.7 readback fix

Added an explicit opt-in recording preset (`BE/src/sites/bolna-demo.ts`, `npm run demo:bolna`) containing only welcome editing, intelligence tuning, structured extraction testing and existing-workflow delay correction. It backs up the previous local profile; the full Bolna research catalogue remains available in source. The preset was applied to the user's saved Bolna profile. Exact prompts, reset variants and pass criteria are in BOLNA-FOUNDER-DEMO.md.

Both configured models passed all four flows against an isolated fictional UI, with a separate out-of-scope campaign prompt producing zero actions. `artifacts/bolna/founder-demo/model-fixture-comparison.json` records the per-phase timings. This is not live Bolna coverage; no model was changed globally based on one comparison.

A live 0.6.6 welcome rehearsal produced two clarification questions, consumed both answers once, filled one greeting and clicked Save once. It then falsely described the unchanged placeholder Hey there! as the field contents and reported non-persistence. Independent native accessibility showed the complete intended greeting in the actual Value property. The first failed result is retained as `artifacts/bolna/founder-demo/welcome.json`.

0.6.7 sends Nova's already-prepared drafts as optional snapshot expectations. The DOM bridge compares a current field's value with that known text and returns only an equality state, never arbitrary field contents. Unique name/tag/type/context identity can match a remounted field; ambiguous candidates, another URL or sensitive fields do not match. The planner is explicitly told that a placeholder is not a field value. This is a generic observation improvement, not a site-specific click script.

209 tests passed, typecheck/build passed, and the packaged browser-control suite passed in a headless disposable Chromium profile, including end-to-end snapshot transport and exact comparison after an input remount. The installed extension was updated with unchanged permissions and visually confirmed as 0.6.7. Its previous folder was backed up locally before the update.

Final live four-flow replay remains blocked by the Computer connection returning blank Chrome content and intermittent noWindowsAvailable/stale-element errors after refresh. Re-selecting Chrome, raising its observed window, refreshing and resetting the tool runtime did not restore page content. The user was asked to foreground the signed-in Chrome profile. Do not certify the four flows for recording until the exact final prompts and their variations pass in that account.

Final current-model isolated regression passed after the readback fix: welcome-card 4810 ms, welcome-save 10506 ms, intelligence 17102 ms, extraction 20426 ms, scope-boundary 2961 ms, workflow 17022 ms. Report: `artifacts/bolna/founder-demo/remount-regression.json`. The first replay stopped because the test incorrectly required ready for an intentionally blocked out-of-scope campaign; the harness now accepts ready or stopped there while still requiring zero actions and zero approvals. All actual four demo tasks continue to require ready and their concrete result assertions.

## Larger Bolna creation demos

Removed the previous preset's explicit prohibition on new agents/workflows/campaigns. Added creation guides with grouped missing-detail collection, exact-name duplicate recovery, workflow schema/node/edge verification, published-version dependency checks and truthful native-file handoff. Applied using `npm run demo:bolna`; existing extension stays 0.6.7.

Validation: typecheck passed; 209 unit tests passed; four supporting real-model fixture tasks and campaign card passed. New isolated creation cases passed individually: agent from brief (37,398 ms), connected calling-workflow draft (70,260 ms), campaign name/version/file handoff (26,492 ms), unpublished dependency (8,912 ms). Two initial fixture defects were corrected and their failed results retained; see the founder guide. No actual dispatch, file upload or publication is certified by those fixtures. Live-account rehearsal is tracked separately.

### Live rehearsal recovery fix

The initial larger workflow run created one draft (`780b361b-1e5c-4958-bc26-39b5f3d8c4a7`), configured the Agent/Wait/End nodes and discovered the required `first_name` mapping. It ended with a false-failure path after trying a stale validation-issue control. The pointer driver explicitly reported `dispatch: not-sent`, but the runner replaced its prior verified effect with an unverified one and subsequently rejected completion despite new evidence. The runner now preserves the prior effect/pending observation on a confirmed no-input rejection; fresh completion evidence remains mandatory. New regressions cover both current valid evidence and removed/stale evidence. All **211 tests** pass, and typecheck passes. This is a backend fix; no extension permissions or package version changed.

Initial live failure retained in `artifacts/bolna/founder-demo/full-workflow-live.json` (321,937 ms, 41 model calls, 36 executed actions). Trace retention is bounded, so the capture script now labels retained action/approval counts and possible truncation rather than presenting them as complete totals. Final replies are selected from the last assistant message, not an earlier approval message.

### Campaign filter regression

The first live campaign attempt stopped after choosing `search` for Bolna's ordinary `Filter this page by name or id` text field. The policy correctly prohibited implicit Enter submission, but its error did not suggest a recovery and the planner repeated it. Updated the generic planner instruction and rejection reason to use `fill` for ordinary filters; retained the submission restriction. The Bolna guide now describes this observed filter. The isolated campaign fixture now uses an ordinary Name or ID input and the real-model rerun passed in 22,699 ms with six actions, no approvals, no publication and no launch. All 211 tests and typecheck passed again. The original live failure is retained in `campaign-preparation-live.json`.
