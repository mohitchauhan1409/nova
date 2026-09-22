# Interfaze verification ledger

Checkpoint: two configured damage-test passes and policy revision pass A are verified. Policy revision pass B is running. No final capture, final export or remote media backup is complete.

Evidence sources: coordinator-maintained `live-discovery.json`, saved session `da49453e-4fd1-4889-8642-70dec21414d6`, and coordinator's independent native UI readbacks. Request output below is observed, not expected fixture data.

## Scope, build and setup

- Native eligibility: coordinator verified the native model cannot operate its own dashboard settings/navigation.
- Account: `itsmohitchauhan1409`; URL `https://interfaze.ai/dashboard/playground`.
- Active frontend/backend build: `5fb4a039077a54040b7a64c6cf1a1b359909f58b`. Later working-branch changes include backend safety fix `78501ad`; coordinator reports it is not activated. Working HEAD is not automatically the recording/runtime identity.
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

Revision B changes the delay threshold to over five days and tests six-day versus exactly-five-day cases. The saved session is still running on the six-day request at this checkpoint. Neither result nor a pass is claimed yet.

Reporting issue: Nova described setup B's four-word summary as five words. The 12-word limit still passes. Correct such counts or omit unnecessary word-count claims in the final demonstration.

## Opening and interaction evidence

- The original ambiguous CD-104 opener asked for categories/escalation before acting: failed, zero successful steps.
- The explicit one-word opener submitted on earlier build `339f12a` returned `damage`; request `req-15007b9e-b715-4f9c-9e15-835ce115a87c`, status 200, was independently reopened. That autonomous opener still failed acceptance because it requested routine approval and stopped waiting prematurely. Product completion does not erase the interaction failure. Rehearse the clean opener on the final active build.
- Genuine “Help me choose” interaction and a custom card answer worked on prior build `339f12a`. Preserve that receipt; final-build combined capture preflight remains pending.
- A limited five-second actual typing clip under private `media-checks/interfaze-typing-observations` showed approximately 6.7 characters/second, a single Nova cursor and no operator pointer. This is only a focused typing/cursor observation, not the full preflight. Earlier operator receipt recorded 86 characters in 13.6 seconds.

## Outstanding delivery gates

Finish revision B with independent Logs readback. Revalidate the final-build opener and any affected behavior after activation changes. Preserve task-owned conversation, exact request IDs and output receipts before baseline restoration; do not erase unrelated content. Complete the fresh-launch, one-tab, populated-dashboard preflight through the real export path, including card help/choice, paced operator and website typing, meaningful scroll, theme, cursor separation and click receipts.

No final original/silent/click-only recordings, audiovisual QA, remote branch/media recovery verification or final delivery acceptance exist yet. Keep raw source immutable. Follow `rehearsal-checklist.md` and the batch's complete media/backup gates; do not mark the startup complete from these partial passes.
