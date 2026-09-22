# Interfaze verification ledger

Historical snapshot: relative source/media references below refer to Git checkpoint `a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5`, not current replacement files. Current delivery is in `delivery.md`.

**Provisional capture — replacement required:** This take passed local technical media QA and was uploaded at checkpoint `a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5`, but its empty Playground opening fails the required visibly populated baseline. It is not the delivered final or full acceptance. The coordinator is preparing a replacement with a real synthetic baseline conversation. References below to the final take identify this historical candidate at runtime `18a702d`; preserve its exact evidence. Independent remote recovery was underway at this documentation checkpoint.

Checkpoint: setup passes A/B and policy revision passes A/B are verified. A final raw take has been captured and reconciled against its session/operator evidence. Local original/silent/click-only media QA is accepted with the documented opening, recovery and cursor-label deviations; see [final media QA](https://github.com/mohitchauhan1409/nova/blob/a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5/artifacts/interfaze/qa/media-QA.md) and the [media manifest](https://github.com/mohitchauhan1409/nova/blob/a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5/artifacts/interfaze/qa/media-manifest.json). The upload completed at commit `a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5`; independent remote LFS recovery is underway and is not yet verified.

Final source: runtime `18a702d0f167014c46df07bf840223adcd55ed52`; frontend source `68a0957f390289f017aa57e0903cea56ed4bbc43` (identical frontend in the capture runtime per coordinator). Raw MOV: `artifacts/interfaze/media/nova-interfaze-original.mov`; recorder reports 23,970 frames, 3024×1776, nominal 30 fps / 799 seconds. The final media QA now records probe and decoded audiovisual verification; original duration/frame count match the recorder metadata. See `capture-evidence.json` and `recording-script.md` for actual take details.

Evidence sources: coordinator-maintained `live-discovery.json`, saved session `da49453e-4fd1-4889-8642-70dec21414d6`, and coordinator's independent native UI readbacks. Request output below is observed, not expected fixture data.

## Scope, build and setup

- Native eligibility: coordinator verified the native model cannot operate its own dashboard settings/navigation.
- Account: `itsmohitchauhan1409`; URL `https://interfaze.ai/dashboard/playground`.
- Earlier rehearsal frontend/backend build: `5fb4a039077a54040b7a64c6cf1a1b359909f58b`. It was superseded for capture by runtime `18a702d`; working HEAD and later merges are not automatically the recorded source.
- Theme: white `#fff`, surface `#fafafa`, border approximately `#e8e8e8`; near-black `#18181b` control/cursor and monospace. Final media QA accepts local exports with the documented deviations; this is not a claim of full compliance with every capture requirement.
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

## Historical opening and interaction evidence

- The original ambiguous CD-104 opener asked for categories/escalation before acting: failed, zero successful steps.
- The explicit one-word opener submitted on earlier build `339f12a` returned `damage`; request `req-15007b9e-b715-4f9c-9e15-835ce115a87c`, status 200, was independently reopened. That autonomous opener still failed acceptance because it requested routine approval and stopped waiting prematurely. Product completion does not erase the interaction failure. The later final take passed the clean opener as recorded below; this earlier failure remains a separate receipt.
- Genuine “Help me choose” interaction and a custom card answer worked on prior build `339f12a`. Preserve that historical receipt. The final take separately includes Help me choose, Category + summary selection and Continue; it does not retroactively establish that a combined preflight passed.
- A limited five-second actual typing clip under private `media-checks/interfaze-typing-observations` showed approximately 6.7 characters/second, a single Nova cursor and no operator pointer. This is only a focused typing/cursor observation, not the full preflight. Earlier operator receipt recorded 86 characters in 13.6 seconds.

## Final take evidence and limitations

Final session `6608e1ac-cd47-42a1-9bb0-1277db1eeb3f` reached ready with 51 reported steps. It submitted the explicit cracked-mug prompt and returned `damage` before cards. A genuine Help me choose action reissued the clarification; the operator selected the actual Category + summary radio and Continue. Nova configured required category/summary strings, JSON on and Temperature 0, then ran CD-104 and verified saved status-200 damage output. Temperature was already zero in the opening baseline, so do not claim a new temperature change.

Nova revised the policy/schema to required boolean escalation. Saved CD-105 output was delivery/true for nine days; final CD-106 output was delivery/false for exactly seven days. Nova then actually scrolled the log dialog to Output. The final boundary request's full retained ID is `req-f112ef24-2dff-41ea-b544-8c9e487e25c5`. Earlier final-take IDs are unavailable in bounded retained snapshots; do not replace them with rehearsal IDs. Coordinator confirms the matching status-200 results; final log conversation context also contains the actual earlier model replies.

Preserved limitations: the new escalate field required a visible operator follow-up to scroll the settings pane; a routine CD-105 Send confirmation appeared and was clicked; Logs loading and a stale CD-105 record required recovery while verifying CD-106. These events remain in the raw and must not be edited away to imply uninterrupted or approval-free work. All model submissions are real; no operator secretly completed website fields. The final answer correctly explained that temperature zero does not guarantee accuracy.

Opening was a clean Playground with empty task-only local chat, empty System Prompt, JSON off and historical synthetic requests in server Logs. This does not meet the requested visibly populated dashboard opening. Cursor-label overlap/clipping is also a documented final-media limitation. Do not describe visibly populated initial chat. Earlier failed opener/freshness attempts remain failed receipts; the clean final opening does not erase them.

## Final media status and remaining backup gate

The [final media QA](https://github.com/mohitchauhan1409/nova/blob/a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5/artifacts/interfaze/qa/media-QA.md) and [media manifest](https://github.com/mohitchauhan1409/nova/blob/a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5/artifacts/interfaze/qa/media-manifest.json) record completed measured debugger masking, approved tap cues and decoded audiovisual QA. The original remains unchanged at 799 seconds / 23,970 frames; silent and click-only edits are 734 seconds / 22,020 frames. Six static operator waits save 65 seconds; all execution, model processing, typing and recovery remain at 1x. Fifty actual clicks are mapped: 14 operator and 36 Nova. These durations describe media, not agent latency. Independent remote LFS recovery and checksum verification remain required before claiming the backup verified. This status reconciliation refers to the media worker’s evidence; it did not itself render media or perform remote recovery.
