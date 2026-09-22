# Interfaze preparation and checkpoint — 2026-09-22

Interfaze is eligible and customized. Two configured damage-test passes and the first escalation-policy revision pass are verified; the second policy revision is running. This is an incomplete production run: final preflight, capture, exports and recoverable remote media backup remain outstanding. Detailed exact requests and results are in `verification.md` and coordinator-maintained `live-discovery.json`.

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

Active frontend/backend build is `5fb4a039077a54040b7a64c6cf1a1b359909f58b`. Current branch contains later backend safety fix `78501ad`, not activated per coordinator. Retain this distinction in the recording manifest. No automatic rebuild/restart or live browser operation was performed by this documentation update.

## Scenario and verified progress

Cedar Desk is fictional; every ticket is synthetic. The supported scenario uses actual dashboard configuration and request Logs, not uploads, invoice extraction or API-only work. `scenario.json` supplies candidate policy/input values; `rehearsal-checklist.md` supplies current concise operator wording and card choices.

- Setup A: Nova submitted a cracked-mug ticket using configured required JSON fields; actual Logs result was `damage`, status 200. Exact input/output and retained settings independently inspected.
- Setup B: Nova limited summaries to 12 words and tested reworded damage input. The independently reopened result was `damage` and a four-word summary. Nova verbally counted five; the limit invariant passes, but avoid repeating the incorrect count.
- Revision A: Nova added required boolean escalation and a damage-or-delay-over-seven-days policy. Independently reopened nine-day test returned `delivery/true`; exactly-seven-day test returned `delivery/false`.
- Revision B: greater-than-five-days policy and six-day/exactly-five-day tests are running. No successful second revision pass is claimed.

The earlier one-word opener returned `damage` in a real saved request, but that attempt failed autonomous acceptance due to a routine approval and premature stop. It must pass cleanly on the final active build. Do not count a later model completion as a successful uninterrupted opener.

A genuine Help me choose exchange plus custom card answer worked on prior build `339f12a`. A limited five-second decoded typing observation at private `media-checks/interfaze-typing-observations` showed approximately 6.7 characters/second, one Nova cursor and hidden operator pointer. These are useful receipts, not the combined final-build preflight.

## Remaining work and preservation

Finish and independently verify revision B. Rehearse the clean opener and affected final-build interactions. Preserve exact task-owned chats, request IDs and output receipts before restoring the baseline. Earlier real request logs may populate the opening dashboard, documented as rehearsal/setup; never imply they were created during the final take. Do not prebuild the full classifier and imply on-camera creation by Nova.

Complete a fresh Nova launch with exactly one target tab, Nova initially closed, populated normal dashboard and no existing debugger strip. The actual combined capture/export preflight must include operator and website progressive typing, genuine card help/choice, meaningful scroll, native theme, cursor separation and click receipts. Keep the accepted raw take immutable. Produce original/silent/approved-click-only media, measured edit/mask/cue evidence, independent decoded QA and remotely recovered checksum verification before delivery. None of those final production gates is marked complete here.
