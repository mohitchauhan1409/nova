# Interfaze preparation — 2026-09-22

Status: public research only; no implementation, browser operation, account access, API call, runtime change, recording or git ref/push changes. Input: https://interfaze.ai/dashboard/playground. Eligibility and all UI workflows await the coordinator.

## Native-agent eligibility

Provisional assessment: no primary public evidence found of an embedded assistant that operates Interfaze's own dashboard settings and saved objects on the user's behalf. Do not skip merely because the core product is an agentic model. Do not claim Interfaze lacks agents: it explicitly offers model-driven tools, headless web browsing, and an agentic MCP entry point. Searches for site-scoped “dashboard assistant”, “copilot”, and “playground settings” returned no indexed results; absence of search results is not proof of absence.

Primary evidence, accessed 2026-09-22:

- https://interfaze.ai/ — positions Interfaze as a multimodal model for OCR, structured extraction, audio and other tasks. Built-in sandbox/browser capabilities are model infrastructure, not evidence of access to the signed-in dashboard. Usage is visible in the dashboard; request observability/logging is described as coming later.
- https://interfaze.ai/docs/integrations/mcp-server — `ask_interfaze` is an agentic entry point using tools for search, scraping, OCR, speech, object/GUI detection, translation and forecasting. Listed tools do not include dashboard settings, saved presets, keys or account administration. This is real agency over model tasks, not established dashboard agency.
- https://interfaze.ai/docs/vision/gui-detection — screenshot input produces interactive-element coordinates and metadata. Examples identify form fields; they do not establish automatic input into the user's live browser or an embedded assistant controlling the current dashboard.
- https://interfaze.ai/docs — SDK/API model requests, configurable outputs and task invocation. Dashboard is referenced for API keys; avoid those pages in recordings.
- https://interfaze.ai/help — public support is a ticket form/community/sales route; do not submit a ticket or message anyone. No dashboard agent described here.
- https://interfaze.ai/blog/12-08-26-updates — playground chat is stored locally and survives refresh; starting a new chat erases the old one. This is not evidence of cloud-saved conversations, multiple retained chat records, or saved reusable presets.
- https://interfaze.ai/docs/structured-output — supports schema-constrained JSON through the API. Need live evidence that the playground exposes corresponding settings before proposing UI configuration as verified.

Bounded coordinator check: inspect native dashboard assistant/help affordances. If a native assistant exists, ask if it can change actual playground settings or retained objects in the current account; distinguish its produced answer from a real dashboard state change. If it claims execution, one reversible synthetic configuration change plus independent readback is decisive. If equivalent native task execution is verified, skip. A core playground response or model tool call alone is not enough to meet the user's exclusion criterion.

## Candidate scenario and substantial flows — unverified

Scenario: Cedar Desk, a fictional small operations team, evaluates Interfaze for reliable document intake and support-message classification. No real customer messages, invoices or personal data. Prefer existing quota; no paid upgrade or new credential exposure.

1. Configure and verify structured support triage. Start with a short concrete request such as “Show me what this playground can return as JSON.” Nova opens the relevant observed settings and reports their actual state without an initial card. Connected task: “Set up Cedar Desk’s support triage and test it.” Clarify desired labels/output fields if needed, then use real UI controls for instructions, response schema and model parameters where exposed. Synthetic input: “Cedar Desk demo: order CD-104 arrived with a cracked mug. Please replace it.” Intended fields: category, urgency, order_id, next_action. Run once, inspect actual result and available token/latency metrics, then use a wording variation. Follow-up revision: add needs_human_review; edit real settings and re-run. Reload to inspect retained result/configuration, accurately distinguishing local retention from server persistence. Do not promise settings survive until tested.

2. Extract and audit a synthetic invoice with a meaningful revision. A simple one-page fictional Cedar Desk supply invoice, clearly marked SAMPLE, can have invoice_id CD-2026-104, two line items, subtotal, tax and total. Through the observed attachment/control path, select the synthetic document and configure extraction fields if supported. Ask which fields matter only if missing, then run real OCR/structured extraction, inspect returned evidence/confidence when actually exposed and compare arithmetic to the fixture. Revise the requested output to include line items or currency and re-run; inspect the genuine changed result and revisit it after refresh. Do not fabricate confidence scores, results or downloadable artifacts. File upload must use supported Nova behavior; operator/API setup cannot masquerade as Nova upload.

If file input cannot be performed by Nova, prefer a verified equally meaningful text-only workflow using a second structured classification or translation configuration. If the dashboard only offers a chat box without substantial settings/persistence and no suitable second flow, report that limitation instead of inflating two prompts into two substantial dashboard workflows.

## Live prerequisites and acceptance

Coordinator must establish account/workspace, normal Home route, plan/quota, native-agent eligibility, current chat preservation, actual control labels, available settings, upload support, run result/metric views, and local persistence behavior. Preserve existing chat before any “new chat” action: official docs say it erases the prior one. Prefer one synthetic conversation continued across both flows if no independent saved sessions exist.

Two successful rehearsals per critical flow require real successful runs and independent readback; include wording variation or targeted revision. Actual UI labels, record URLs if any, output and timings must replace these hypotheses before the final script. Never portray API-only schema settings or programmatic fixture setup as Nova's browser work.

Implementation, if eligible: isolated `BE/src/sites/customizations.ts` preset, id `interfaze`, domain `interfaze.ai`, separate `sites.interfaze.json`, measured live accent and concise guide. Existing shared experience consumes name, greeting, accent and flow suggestions. No implementation is authorized to this worker yet; only this report was written.

If eligible, retain original/silent/click-only recordings under this startup only, plus real script, cue/timing map, verified build and private remote recovery evidence. None exists at this preparation stage.

## Live eligibility and implementation handoff

Coordinator verified signed-in username `itsmohitchauhan1409` at the supplied playground. The native model explicitly said it cannot alter its own System Prompt, model selection/settings, or navigate the dashboard. The coordinator confirmed Interfaze is eligible. The initial chat was empty; only the task's eligibility question now exists. Preserve its exact transcript via the coordinator before any reset; this report records the conclusion, not a verbatim transcript.

Observed UI: expandable System Prompt textarea (placeholder “You are a helpful assistant...”); Temperature 1, Top P 1, Max Completion Tokens 32000; Reasoning Auto/On/Off with Off selected. Structured Output JSON switch exposes Visual Editor/Code Editor, property name textbox, string type popup, array/required/delete controls, Add property. Light white/gray page, monospace, near-black controls, blue JSON switch. These observations establish controls, not successful runs or persistence.

Implementation now prepared in the isolated customer hooks: `BE/src/sites/customizations.ts` includes Interfaze identity, scoped store filename, two conditional guides and conservative near-black accent `#18181b`; `web/src/panel/customization.css` scopes monospace to Interfaze. The accent is a conservative approximation, not sampled exact color. No launcher override or shared engine changes were made. Both guides remain `verified: false`.

The support-triage scenario now replaces the earlier invoice proposal. Exact candidate text and schema are in `scenario.json`; no fixture values are recorded output. The first request now runs a short concrete cracked-mug classification and verifies its actual result; temperature zero is a configuration step inside the larger workflow, not the opener. See acceptance-review.md for the current scenario decisions. The larger task genuinely needs category/output preferences. Flow one creates two required string schema fields and runs a damaged-order ticket. Flow two revises policy, adds a required boolean, tests a late order, and inspects real output/retention. Schema `additionalProperties: false` is fixture intent; do not claim the visual editor exposes or saves it unless observed.

Do not build/activate until coordinator theme and readiness gates. Required preflight: actual slider interaction/readback; repeated row targeting; type selection and required state; genuine progressive entry; JSON response validation; reload retention of both transcript and settings; initial launcher/panel/cards/cursor colors. Runtime/extension activation remains coordinator-only. Existing shared theme and browser behavior are unchanged.


Coordinator later verified Logs at `/dashboard/logs`: request rows show ID/status/input/output token counts; row detail exposes timestamp, exact Input and Output (long output truncates near 500 characters). Eligibility request `req-c11330c6-079c-4322-89d5-c428e417c2a2` has status 200, 3163 input tokens and 365 output tokens. This verifies that request's log persistence, not the candidate flow runs. Prefer concise JSON and inspect each matching request detail as independent outcome evidence. Do not use Get help. Public documentation about absent request logging was stale relative to this signed-in observation.

Theme evidence supplied by coordinator: private/interfaze-theme.png, white #fff background, #fafafa surfaces, approximately #e8e8e8 borders, near-black controls and monospace. Panel and launcher now have scoped neutral overrides; action cursor uses the same solid #18181b accent before/after session initialization. The shared launcher character is shaded gray; no extra pointer is introduced. Exact visual acceptance still needs coordinator preflight.


Opening live feedback: the CD-104 opener asked for classification but omitted labels/output format; Nova requested category and escalation choices at zero steps. Current scenario replaces it with a fully specified single-prompt test and the profile explicitly distinguishes test execution from classifier configuration. Escalation questions apply only when the user requests unspecified escalation behavior. No successful opener rehearsal is claimed.
