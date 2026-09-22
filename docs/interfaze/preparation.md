# Interfaze preparation and checkpoint — 2026-09-22

**Provisional capture — replacement required:** This take passed local technical media QA and was uploaded at checkpoint `a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5`, but its empty Playground opening fails the required visibly populated baseline. It is not the delivered final or full acceptance. The coordinator is preparing a replacement with a real synthetic baseline conversation. References below to the final take identify this historical candidate at runtime `18a702d`; preserve its exact evidence. Independent remote recovery was underway at this documentation checkpoint.

Interfaze is eligible and customized. Setup and escalation-policy rehearsal passes A/B are verified; the real final raw take is now captured. Local original/silent/click-only media QA is accepted with the documented opening, recovery and cursor-label deviations; see [final media QA](../../artifacts/interfaze/qa/media-QA.md) and the [media manifest](../../artifacts/interfaze/qa/media-manifest.json). The upload completed at commit `a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5`; independent remote LFS recovery is underway and is not yet verified. `recording-script.md` is the actual executed script; `capture-evidence.json` records source identity and retained outcomes. Detailed exact requests and results are in `verification.md` and coordinator-maintained `live-discovery.json`.

## Eligibility and product scope

Starting URL: https://interfaze.ai/dashboard/playground. Coordinator verified signed-in username `itsmohitchauhan1409`. The native model explicitly said it cannot modify its own System Prompt/model settings or navigate the dashboard. This establishes the native dashboard-control distinction; do not claim Interfaze has no agents. Public sources show genuine agentic model/tool capabilities:

- https://interfaze.ai/docs/integrations/mcp-server — agentic `ask_interfaze` and tools for search, scraping, OCR, speech, detection, translation and forecasting.
- https://interfaze.ai/docs/vision/gui-detection — screenshot element coordinates and metadata, not evidence of an embedded assistant operating this signed-in dashboard.
- https://interfaze.ai/docs/structured-output — schema-constrained JSON. The accessible playground's real visual schema editor was separately verified by the coordinator.
- https://interfaze.ai/blog/12-08-26-updates — local playground chat retention; starting a new chat erases previous chat. Preserve task-owned transcripts before resetting.
- https://interfaze.ai/help — human-support route; do not submit support messages as part of the demo.

Public pages described request logging as forthcoming, but the coordinator's signed-in observations supersede that stale information: **Logs exists at `/dashboard/logs`**. Rows expose request ID, status and token counts. Detail displays timestamp, exact Input and Output; long output truncates around 500 characters. Verify concise actual JSON in each matching record. Do not treat status 200 alone as semantic success or use Get help.

## Actual controls, theme and customer code

Observed controls: System Prompt textarea; Temperature/Top P/Max Completion Tokens; Reasoning Auto/On/Off; JSON switch; Visual Editor/Code Editor; repeated property names/types; required/array controls. Initial Temperature/Top P were 1, token limit 32000 and Reasoning Off. Nova subsequently configured Temperature 0 and required category/summary strings; coordinator confirmed retention through navigation/reload. First policy revision additionally saved a required scalar boolean `escalate`.

Native screenshot evidence: private `interfaze-theme.png`, white background `#fff`, surface `#fafafa`, border approximately `#e8e8e8`, monospace and near-black controls. Customer hooks implement a scoped profile/store `sites.interfaze.json`, neutral panel/launcher and solid `#18181b` action cursor. The reviewed inference registry matches only the exact playground composer and model-setting labels; an explicitly requested prepared synthetic model invocation is `change`. Human messaging, external recipients, credentials, billing and access changes retain their safeguards.

Earlier rehearsal runtime was `5fb4a039077a54040b7a64c6cf1a1b359909f58b`. Final capture runtime is `18a702d0f167014c46df07bf840223adcd55ed52`, with frontend built from `68a0957f390289f017aa57e0903cea56ed4bbc43` and unchanged by later backend/profile changes per coordinator. Latest branch/main merges are not automatically the capture identity. No automatic rebuild/restart or live browser operation was performed by this documentation update.

## Scenario and verified progress

Cedar Desk is fictional; every ticket is synthetic. The supported scenario uses actual dashboard configuration and request Logs, not uploads, invoice extraction or API-only work. `scenario.json` and `rehearsal-checklist.md` preserve historical rehearsal candidates and card choices; `recording-script.md` is authoritative for the actual final prompts and answers.

- Setup A: Nova submitted a cracked-mug ticket using configured required JSON fields; actual Logs result was `damage`, status 200. Exact input/output and retained settings independently inspected.
- Setup B: Nova limited summaries to 12 words and tested reworded damage input. The independently reopened result was `damage` and a four-word summary. Nova verbally counted five; the limit invariant passes, but avoid repeating the incorrect count.
- Revision A: Nova added required boolean escalation and a damage-or-delay-over-seven-days policy. Independently reopened nine-day test returned `delivery/true`; exactly-seven-day test returned `delivery/false`.
- Revision B: greater-than-five-days policy and independently reopened six-day/exactly-five-day requests passed with delivery/true and delivery/false respectively. Exact IDs are retained in `verification.md` and `live-discovery.json`.

The earlier one-word opener returned `damage` in a real saved request, but that attempt failed autonomous acceptance due to a routine approval and premature stop. The final fresh empty-chat take subsequently passed this opening without an initial card; retain the earlier failure as separate evidence. Do not count a later model completion as a successful uninterrupted opener.

A genuine Help me choose exchange plus custom card answer worked on prior build `339f12a`. A limited five-second decoded typing observation at private `media-checks/interfaze-typing-observations` showed approximately 6.7 characters/second, one Nova cursor and hidden operator pointer. These are historical focused receipts, not proof of a combined final-build preflight. Actual final card/cursor observations are recorded in the final take and media QA below.

## Final capture and preservation

The recorder reports 23,970 frames at nominal 30 fps, 3024×1776 and no audio in `artifacts/interfaze/media/nova-interfaze-original.mov` (799 seconds nominal). Its first encoded frame epoch is `1790049469029`. Final session `6608e1ac-cd47-42a1-9bb0-1277db1eeb3f` and separate operator receipts establish the actual prompts, radio/help/Continue actions, typed follow-up and confirmation.

The opening Playground had empty task-only local chat, empty System Prompt, JSON off and Temperature 0 already retained; historical synthetic server Logs existed. The recorded task includes real classification, schema configuration, policy revision, saved result inspection and final actual scroll to Output. It also includes an offscreen-field recovery request, one routine Send confirmation and Logs load/stale-record recoveries. The empty Playground opening does not meet the requested visibly populated dashboard baseline. These are real limitations, not an uninterrupted demonstration. The cursor label sometimes overlaps controls or clips at the viewport. The accepted edit preserves these events and all execution at 1x.

No secret field work, fabricated output or replayed API setup substitutes for Nova browser work. The exact final CD-106 request is `req-f112ef24-2dff-41ea-b544-8c9e487e25c5`. Earlier final request full IDs are not available in bounded retained snapshots; keep them unknown rather than guessing from abbreviated labels or using rehearsal IDs.

The [final media QA](../../artifacts/interfaze/qa/media-QA.md) and [media manifest](../../artifacts/interfaze/qa/media-manifest.json) record local export and decoded QA acceptance: the immutable original is 799 seconds / 23,970 frames; both edits are 734 seconds / 22,020 frames. Six static operator waits save 65 seconds, all Nova execution remains at 1x, and 50 actual click cues cover 14 operator and 36 Nova clicks. Media durations are not measured agent latency. Independent remote recovery remains the outstanding backup gate. Keep the native raw MOV immutable. Reproduction guidance is in `reproduction.md`; actual script and limitations are in `recording-script.md`. This documentation update did not inspect/render/modify media, change source/runtime, perform browser work or mutate Git.
