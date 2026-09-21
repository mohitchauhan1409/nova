# AgentMail live verification — 2026-09-21

Status: useful live work and repeat draft verification are evidenced; final recording readiness is **not approved**. This document combines retained session summaries with the coordinator’s independent reopened-page observations. All times below are UTC. No raw session JSON, tokens or account configuration are copied into the repository.

## Evidence and build scope

Private batch evidence is under `private/agentmail/`: `live-verification.json`, `metadata-failure-session.json`, `sessions-fixed-latest.json`, and `evidence/20260921T174135.410212Z-64078/summary.json` plus `evidence/20260921T175306.908715Z-67338/summary.json`. The first collector retained 53 polling samples and one seed. The JSON verification file contains earlier pending metadata flags; the later fixed-session summary and coordinator observations below supersede those flags.

The first session was `94e51ab3-7c19-4d43-b0aa-a13be533a154`, with reported runtime build `ae7014e49161e3dc14de5547a86e1a2aeb164ba0`. Fixed targeting was exercised in session `76f3ce7c-0297-4218-ad50-2a9ba04b20d6`. The current reported R3 build is `5f0b05a379718eb324fc8c51846c28d86b024a11`; Git ancestry confirms it contains the generic row-identity fix `a2f52b9`, but not the subsequent policy fix `ebaa871`. The coordinator accepted that policy fix into main separately. A new frozen capture build and live confirmation must identify which fixes it actually contains.

## Outcomes, including failed attempts

| UTC start | Task ID | Outcome and evidence |
| --- | --- | --- |
| 17:36:44.408 | `bf0fcbc5-a4b6-42f2-ad59-c10af8988fab` | Opening rename passed once, seven verified steps. No initial question card. Reopened properties showed Cedar & Finch Care at the same inbox address with team=Customer Care preserved. |
| 17:37:48.897 | `8587683c-4f96-40bc-bdab-eaa1eb7180eb` | Underspecified inbox organization produced a metadata clarification card. |
| 17:38:10.708 | `f4e6d2e1-5e1e-4304-af84-bb9f4af7a54a` | Help-me-choose retained partial answers and clarified the response target. |
| 17:38:42.308 | `6ccf296b-e229-4a60-aa2c-2eb302499068` | Original metadata creation passed, nine verified steps. Saved String fields: team=Customer Care, purpose=Furniture order support, response_target=Within 1 business day. |
| 17:40:30.017 | `4d3ea0d0-0e6b-4a1a-a5cd-5f0d33c234d4` | **Failed.** Reordered key/value rows received wrong values, including incorrect recovery attempts. Nova was stopped; independent reopen confirmed the defect. The coordinator manually repaired purpose and response_target. Per-field equality receipts did not prove correct row selection. This is not a successful rehearsal. |
| 17:44:08.081 | `7a5d0750-6801-46f2-be79-497277416d81` | Draft creation passed after the details card, nine verified steps. Reopen confirmed CF-1048, exact To and Subject, October 2, 2026 dispatch, unsent and unscheduled. |
| 17:45:42.658 | `dce580ac-01d6-44e8-b5fd-b67c0b7482b5` | First date revision passed, three verified steps. One premature completion claim was rejected internally; a further observation supplied evidence without another write. Reopen confirmed October 5, 2026 and preserved To/Subject. |
| 17:47:05.773 | `daa855d6-ea68-4084-8386-b8bed6b6d932` | Completing the same existing draft passed, four verified steps. Saved October 2 dispatch details with exact recipient/subject preserved; no duplicate. |
| 17:49:00.867 | `3df58efa-2ea4-4061-b8e2-dc65e002fa51` | Second date revision passed, three verified steps. A changed page caused safe replanning before input. Reopen confirmed October 5, 2026. |
| 17:53:01.142 | `fefa7782-dc46-4d5a-b87f-54335d219c3e` | After a2f52b9, the original direct-key request filled the correct purpose and response_target rows and preserved team. **Interrupted at unnecessary Update approval**, which the coordinator cancelled. Targeting passed; the uninterrupted policy path did not. |
| 17:54:59.897 | `2b6a3f3f-e88b-448d-9d5e-ebe53e07b3de` | Explicit “Save these inbox metadata changes and reopen the properties” resumed and saved correctly, three verified steps. Reopen verified Furniture order support / 1 business day. This is recovery, not a clean retry of the original request. |
| 17:56:12.672 | `8837bc98-c40e-40ea-b54f-cbd1f18bb435` | “Update this inbox metadata…” variation fully passed, five verified steps, without intervention. Reopen verified purpose=General customer questions, response_target=2 business days, team unchanged. |

Draft coverage is **two preparation passes** (one creation and one completion of the existing draft) and **two date-revision passes**. The coordinator independently verified exact To `orders@customer.example`, Subject `Your oak desk order update`, persisted reopens, and two total drafts with the original `Care handoff — order CF-1042` intact. No sending or scheduling was performed. This is not a claim of two new-draft creation passes.

The generic row-identity fix and its tests are recorded in `a2f52b9`. The subsequent generic policy grounding fix `ebaa871` passed 130 policy tests and a pure check of the saved approval snapshot. Those offline checks do not establish a fresh uninterrupted live pass of the original direct-key wording on the newly loaded build.

## Observed latency

Seconds from each task’s recorded user-message timestamp; card-answer tasks begin at answer submission. “Final reply” measures the reported response, not independent business verification. Short task IDs below refer to the full IDs above.

| Task | First meaningful progress | First action | First Nova click | First card | Final reply |
| --- | ---: | ---: | ---: | ---: | ---: |
| Opening `bf0fcbc5` | 3.415* | 3.415 | 3.540 | — | 33.523 |
| Metadata question `8587683c` | 3.965 | — | — | 3.970 | — |
| Help choosing `f4e6d2e1` | 4.618 | — | — | 4.621 | — |
| Metadata answer `6ccf296b` | 5.709 | 5.719 | 5.832 | — | 56.394 |
| Draft details answer `7a5d0750` | 2.068 | 2.079 | 2.192 | — | 44.813 |
| Date revision 1 `dce580ac` | 3.031 | 3.047 | 3.164 | — | 24.827 |
| Existing-draft completion `daa855d6` | 4.004 | 4.020 | 4.141 | — | 28.160 |
| Date revision 2 `3df58efa` | 3.451 | 3.468 | 3.589 | — | 20.325 |
| Metadata variation `8837bc98` | 3.437 | 3.449 | 3.560 | — | 24.950 |

*The opening’s earliest retained progress may be an upper bound because sampling started later. Unknown timings remain unavailable, not zero. Completion inference was retained for the four draft tasks and the later metadata variation; the early opening/metadata terminal transitions were not sampled. Their success rests on the coordinator’s reopened-page checks, not inferred status alone. Human answer time, manual repairs, baseline resets and edited-video duration are excluded from these per-task timings.

## Baseline for the next take

The coordinator restored the inbox name to Cedar & Finch Support manually and saved it. The same address and team remain. Latest verified metadata is General customer questions / 2 business days; the take should revise existing keys to Furniture order support / 1 business day instead of adding duplicates. The CF-1048 draft body was reset outside the take to `Order CF-1048 — oak desk. Dispatch update awaiting review. Cedar & Finch Care.` while preserving its recipient and subject. Two task-owned drafts exist, including the untouched CF-1042 reference. These manual resets are preparation, not Nova achievements. Recheck this baseline before recording.

The final script uses **“Complete our oak-desk draft with the revised dispatch details.”** Nova must recover and complete the existing CF-1048 draft, request missing dispatch facts naturally, then revise the same record when the date changes. See [demo-script.md](demo-script.md) and [synthetic-objects.md](synthetic-objects.md).

## Capture limitations and remaining gates

Preflight 1 proved the actual near-white Nova arrow/label/ring and a 12-second approved-tap export segment. It started mid-task and had right-side padding. Preflight 2 corrected geometry to 3024×1776 and showed no system/tool pointer in reviewed operator footage, but 22 typed characters arrived in about 0.067 seconds with long idle gaps. It is not acceptable final typing. Character-at-a-time input needs a fresh decoded-source check.

Fresh opening has an initial theme-scheme issue under investigation by the isolated theme worker. This prevents claiming a clean initial Home/launcher/panel state. Existing cursor and partial audio results do not certify that opening. Remeasure the debugger strip mask on final geometry and preserve all Nova actions at normal speed.

Still pending: the final loaded build identity, passive initial-theme fix and fresh opening, natural typing preflight, fresh direct-key policy retry, final raw/silent/approved-click-only recordings, complete cue/export QA, and independently recovered remote media checksums. No final take, full readiness, or remote media recovery is claimed here.
