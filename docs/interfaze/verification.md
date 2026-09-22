# Interfaze verification ledger

Checkpoint: setup passes A/B and policy revision passes A/B are verified. A final raw take has been captured and reconciled against its session/operator evidence. Final silent/click-only export QA and remotely recoverable media backup are not asserted here.

Final source: runtime `18a702d0f167014c46df07bf840223adcd55ed52`; frontend source `68a0957f390289f017aa57e0903cea56ed4bbc43` (identical frontend in the capture runtime per coordinator). Raw MOV: `artifacts/interfaze/media/nova-interfaze-original.mov`; recorder reports 23,970 frames, 3024×1776, nominal 30 fps / 799 seconds. The recorder explicitly requires decoded duration/CFR verification before delivery. See `capture-evidence.json` and `recording-script.md` for actual take details.

Evidence sources: coordinator-maintained `live-discovery.json`, saved session `da49453e-4fd1-4889-8642-70dec21414d6`, and coordinator's independent native UI readbacks. Request output below is observed, not expected fixture data.

## Scope, build and setup

- Native eligibility: coordinator verified the native model cannot operate its own dashboard settings/navigation.
- Account: `itsmohitchauhan1409`; URL `https://interfaze.ai/dashboard/playground`.
- Earlier rehearsal frontend/backend build: `5fb4a039077a54040b7a64c6cf1a1b359909f58b`. It was superseded for capture by runtime `18a702d`; working HEAD and later merges are not automatically the recorded source.
- Theme: white `#fff`, surface `#fafafa`, border approximately `#e8e8e8`; near-black `#18181b` control/cursor and monospace. Full capture acceptance remains pending.
- Configuration: Nova set Temperature 0 and required scalar string fields `category` and `summary`. Coordinator independently verified those settings and System Prompt retention after navigation/reload. Revision pass A additionally verified required scalar boolean `escalate`, arrays off, and damage-or-delay-over-seven-days policy.
- Earlier local checks: TypeScript no-emit and seven site/theme tests passed; reviewed inference submission tests later passed (27). These checks do not substitute for live or recording acceptance.

## Live results

| Pass | Saved request ID | Observed result | Independent evidence |
| --- | --- | --- | --- |
| Setup A | `req-75fb9430-96c0-4512-aef2-c43c51e6cfd2` | Status 200; input `CD-104 arrived with a cracked mug.`; `category: damage`; summary `The customer reported that item CD-104 arrived with a cracked mug.` | Nova submitted and inspected Logs; coordinator opened exact Input/Output and verified retained schema/temperature |
| Setup B, summary revision | `req-b1461ba7-1829-4b1e-bfac-b81d80a782c4` | Status 200; reworded input `CD-104's mug arrived broken.`; `category: damage`; summary `CD-104's mug arrived broken.` | Exact request independently reopened; actual summary is four whitespace-separated words and satisfies the 12-word limit |
| Revision A, positive | `req-c4ebeb4f-8275-4213-90a0-ae5490d9fcd5` | Status 200; nine-day delay, no damage; `category: delivery`, `escalate: true` | Exact request independently reopened; schema and greater-than-seven policy independently observed |
| Revision A, boundary | `req-0d3cebe9-5cf1-4cb8-bd57-7a17166724eb` | Status 200; exactly seven days late, no damage; `category: delivery`, `escalate: false` | Exact request independently reopened |

Revision B is independently verified in `live-discovery.json`: greater-than-five-days policy; six-day request `req-d515c2d8-336a-4de3-af11-c74cda89d7bd` returned `delivery/true`, status 200; exactly-five-day request `req-f3f839d7-6d11-4675-991d-592f0b0f749b` returned `delivery/false`, status 200. Both exact requests were independently reopened. These are rehearsal IDs, not the final take's requests.

Reporting issue: Nova described setup B's four-word summary as five words. The 12-word limit still passes. Correct such counts or omit unnecessary word-count claims in the final demonstration.

## Opening and interaction evidence

- The original ambiguous CD-104 opener asked for categories/escalation before acting: failed, zero successful steps.
- The explicit one-word opener submitted on earlier build `339f12a` returned `damage`; request `req-15007b9e-b715-4f9c-9e15-835ce115a87c`, status 200, was independently reopened. That autonomous opener still failed acceptance because it requested routine approval and stopped waiting prematurely. Product completion does not erase the interaction failure. Rehearse the clean opener on the final active build.
- Genuine “Help me choose” interaction and a custom card answer worked on prior build `339f12a`. Preserve that receipt; final-build combined capture preflight remains pending.
- A limited five-second actual typing clip under private `media-checks/interfaze-typing-observations` showed approximately 6.7 characters/second, a single Nova cursor and no operator pointer. This is only a focused typing/cursor observation, not the full preflight. Earlier operator receipt recorded 86 characters in 13.6 seconds.

## Final take evidence and limitations

Final session `6608e1ac-cd47-42a1-9bb0-1277db1eeb3f` reached ready with 51 reported steps. It submitted the explicit cracked-mug prompt and returned `damage` before cards. A genuine Help me choose action reissued the clarification; the operator selected the actual Category + summary radio and Continue. Nova configured required category/summary strings, JSON on and Temperature 0, then ran CD-104 and verified saved status-200 damage output. Temperature was already zero in the opening baseline, so do not claim a new temperature change.

Nova revised the policy/schema to required boolean escalation. Saved CD-105 output was delivery/true for nine days; final CD-106 output was delivery/false for exactly seven days. Nova then actually scrolled the log dialog to Output. The final boundary request's full retained ID is `req-f112ef24-2dff-41ea-b544-8c9e487e25c5`. Earlier final-take IDs are unavailable in bounded retained snapshots; do not replace them with rehearsal IDs. Coordinator confirms the matching status-200 results; final log conversation context also contains the actual earlier model replies.

Preserved limitations: the new escalate field required a visible operator follow-up to scroll the settings pane; a routine CD-105 Send confirmation appeared and was clicked; Logs loading and a stale CD-105 record required recovery while verifying CD-106. These events remain in the raw and must not be edited away to imply uninterrupted or approval-free work. All model submissions are real; no operator secretly completed website fields. The final answer correctly explained that temperature zero does not guarantee accuracy.

Opening was a clean Playground with empty task-only local chat, empty System Prompt, JSON off and historical synthetic requests in server Logs. Do not describe visibly populated initial chat. Earlier failed opener/freshness attempts remain failed receipts; the clean final opening does not erase them.

## Remaining delivery gates

Preserve the original MOV unchanged. Final media worker owns measured debugger masking, permitted operator-idle cuts, exact approved tap cues, decoded audiovisual QA and export evidence. Keep actual execution, model processing, typing and recovery at 1x. Verify original/silent/click-only assets and recover remote media into an independent cache before claiming backup or startup delivery complete. This documentation reconciliation is not media QA or remote verification.
