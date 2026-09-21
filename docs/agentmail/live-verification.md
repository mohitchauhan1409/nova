# AgentMail live verification — 2026-09-21

Status: **successful final take 2 captured and exported** on backend `f78542b53572fb953828c3d704b1583e6157d214`, extension `d2d6325`. The coordinator independently verified the saved metadata and revised October 5 draft, exactly one editor and two unsent drafts. Local numerical checks, independent numerical/bounded visual review, and fresh-cache remote recovery all pass. Media were recovered and hashed at `7d8a0c4eed8ddc20a9acdc04e7744d80f6abfa89`; documentation-only follow-up preserves identical media OIDs. Earlier failures and repairs remain below and are not counted as clean passes. See [delivery README](README.md) for exact outputs, captured identities, actual script and latency. A model completion message alone is not outcome proof. Times below are UTC. No raw session JSON, tokens or account configuration are copied into the repository.

## Evidence and build scope

Private evidence is under `/Users/macbook/Desktop/Nova-batch-20260921/private/agentmail/`. Historical observations are in `live-verification.json`, `metadata-failure-session.json`, `empty-drafts-failure.json`, `empty-drafts-verification-notes.json` and the earlier session collectors. Current evidence is summarized in `current-build-verification.json` and `live-verification-notes.md`.

The first session was `94e51ab3-7c19-4d43-b0aa-a13be533a154`, reported runtime `ae7014e49161e3dc14de5547a86e1a2aeb164ba0`. Session `76f3ce7c-0297-4218-ad50-2a9ba04b20d6` exercised the row-identity fix and exposed the later policy and empty-list completion issues. Keep their failed attempts in the evidence history.

The earlier rehearsals and preflight 4 used coordinator-reported runtime **`d2d6325`**, session **`099f9c34-656e-461f-8f39-4fac77d73d68`**, including the policy-grounding, passive initial-theme and completion fresh-snapshot changes from main `b151013`. The continuous collector is `evidence/20260921T181443.693583Z-70689/`; `rehearsal-final-export.log` points to the final retained one-shot export in `evidence/20260921T182601.245821Z-73238/sessions-0001.json` and its `summary.json`. The earlier continuous samples retain more early timing detail than that one-shot export.

Backend identity has since advanced independently of the extension: projection correction `a2de2cf`, guide revision `1922836`, then active backend `f78542b53572fb953828c3d704b1583e6157d214`. The extension remains `d2d6325c657f3b5f45f326db56565300e26826bd`, ZIP SHA-256 `38be34e27e224b1f52c9e547ac1d3ec14b57d477d2f807e47968303720fc3616`. The successful second take uses that backend/extension pair; do not attribute earlier checks silently to a later backend.

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

The generic row-identity fix is recorded in `a2f52b9`. Policy grounding fix `ebaa871` passed the prior offline checks and has now been exercised by the two uninterrupted current-build metadata requests below. Earlier interrupted/repaired attempts remain failures or recoveries, not additional clean passes.

## d2d6325 rehearsal outcomes and retained limitations

| Task ID | Result and independent evidence |
| --- | --- |
| `08adf3c4-f551-413d-81d6-8849c81a6f98` | Opening rename passed: five verified actions, no initial card, saved Cedar & Finch Care. Subsequent reopened properties independently confirmed the name on the same inbox. |
| `88e4be62-b029-4dd8-b41b-43035833eac1` | First clean metadata save/reopen passed with direct key wording: Furniture order support / 1 business day, team=Customer Care and address preserved, no approval. |
| `0af043e3-4ad1-488b-9759-33f3dd6a67fd` | Second clean metadata save/reopen passed: General customer questions / 2 business days, preserved team/address. Reordered key rows were correctly identified. No approval or operator recovery was needed. |
| `444d4c56-11cf-4ac7-9648-cc73fbbcb229` | The original “What remains unsent?” query passed on this build. Nova refreshed Drafts and correctly named both saved subjects. This is one successful regression case, not a guarantee for all list queries. |
| `a527e110-420e-4768-abf9-b4ddfee0257f` → `3810f8e8-f5d4-4a5f-9840-6e6fa0dfe346` | Existing-draft completion passed after one card asking only for missing dispatch facts. Coordinator AX independently verified reopened To, exact Subject, October 2 dispatch, tracking-after-dispatch note and Cedar & Finch Care signoff. Exactly two drafts remained, reference unchanged, unsent and unscheduled. |
| `1580ff7a-b978-4a05-8517-0f5cb5cda11e` | **Not a pass.** “Change the dispatch date to October 5 and keep everything else.” saved the correct date, but Nova stopped because it could not verify completion. The coordinator subsequently reopened and verified To/Subject/body. Correct persistence does not turn the stopped Nova workflow into a successful rehearsal. |
| `ab459a3d-1216-4efa-8442-4d2cc7024b69` | Explicit “Save and reopen the same draft to verify” revision back to October 2 passed, three verified actions. Coordinator independently confirmed persistence and unchanged other fields. |
| `7a2ff1ca-e5e4-408d-a49b-5266258ca146` | Explicit “Save and reopen the draft to verify” revision to October 5 passed, three verified actions. The same draft, recipient, subject, tracking note and signoff were preserved; no duplicate, send or schedule. |
| `2a360cd1-e6ca-4eb5-9916-a1ce5e33832d` → `6fceb00d-62ee-4c04-ae13-aa2cf93d53ad` → `d7fe1c21-7370-41eb-bb9f-16f6099b9e8e` | Response-target choice and Help me choose passed for that field: the explanation correctly described metadata as unenforced, and the chosen 1 business day was saved/reopened. **Do not count this as a purpose-flow pass.** The conversation described purpose as Furniture order support after an operator reset had changed it to General customer questions. That stale statement is retained as a limitation. |

Metadata field values are intentionally omitted from serialized snapshots. Semantic key contexts and prepared-input match states corroborate the coordinator’s direct AX checks; the repeated-row identity must not be inferred from equality of an unrelated field. The two new clean metadata passes are the current-build evidence for that behavior.

The earlier false-empty Drafts answer is also retained. In session `76f3ce7c…`, task `79d75069-0073-46de-a879-4bc0e91e4b4a` used a post-navigation snapshot without draft rows or an explicit empty-state message and incorrectly answered that nothing remained unsent. Fresh query `b4803fb5-b9bf-4c98-ba5e-0c59788082d9` then correctly observed both subjects. The historical corrective query is recovery, not initial success. The current-build original-query pass above is separate evidence that Nova refreshed and used the actual list.

The final script therefore explicitly supplies the purpose: **“Use Furniture order support as the purpose, and help me choose a response target.”** Its response-target guidance must preserve that supplied purpose and team, then verify all fields after saving. That historical stale conversation was not a pass. The explicit combined wording subsequently passed in the final second take, independently verified. The final date revision explicitly requests save/reopen verification. See [demo-script.md](demo-script.md) for the coordinator’s current script; this report does not modify it.

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

## d2d6325 rehearsal timing

These intervals come from server event timestamps. They measure user message to progress/action/card/final reply, not edited video duration. Card-answer timing starts when the answer is submitted. A stopped task’s reply time is not successful completion latency.

| Task | First meaningful progress | First action | First Nova click | First card | Final reply |
| --- | ---: | ---: | ---: | ---: | ---: |
| Opening `08adf3c4` | 2.688 | 2.709 | 2.827 | — | 25.326 |
| Metadata pass 1 `88e4be62` | 3.506 | 3.517 | 3.636 | — | 38.747 |
| Metadata pass 2 `0af043e3` | 3.726 | 3.739 | 3.850 | — | 25.245 |
| Drafts question `444d4c56` | 3.300 | 3.311 | 3.424 | — | 23.729 |
| Draft facts card `a527e110` | 4.832 | 4.849 | 4.967 | 11.395 | — |
| Draft facts answer `3810f8e8` | 4.997 | 5.014 | 5.130 | — | 22.353 |
| Stopped terse revision `1580ff7a` | 3.195* | 3.195 | 3.312 | — | 19.817, stopped |
| Explicit October 2 revision `ab459a3d` | 3.712* | 3.712 | 3.827 | — | 18.529 |
| Explicit October 5 revision `7a2ff1ca` | 3.766* | 3.766 | 3.879 | — | 21.664 |
| Help me choose `6fceb00d` | 5.830 | — | — | 5.832 | — |
| Response-target answer `d7fe1c21` | 3.534 | 3.544 | 3.660 | — | 30.545 |

*The one-shot export no longer retained every early trace for these tasks. Its first progress equals the earliest retained action and may be an upper bound. Final reply timestamps are retained; successful outcomes above rely on independent reopened-page verification. Do not treat null completion inference as either proof of success or failure.

## Operator-prepared baseline used for final take 2

After rehearsals, the coordinator used the real UI to save and reopen this baseline: **Cedar & Finch Support**, same inbox address, String metadata **purpose=General customer questions**, **response_target=2 business days**, **team=Customer Care**. This final reset supersedes the intermediate response-target choice of 1 business day. It is operator preparation, not a Nova achievement.

The CF-1048 draft is again unfinished: `Order CF-1048 — oak desk. Dispatch update awaiting review. Cedar & Finch Care.` Its exact recipient `orders@customer.example` and subject `Your oak desk order update` remain. The coordinator refreshed Drafts and independently verified exactly two rows, including the unchanged `Care handoff — order CF-1042` reference. No deletion, dispatch or scheduling was used. Final take 2 completed and revised this existing record without duplication.

## Bounded preflight 4 result and remaining gates

[Private preflight 4 QA](/Users/macbook/Desktop/Nova-batch-20260921/private/agentmail/preflight4-qa/qa-report.md) reports **PASS for the bounded source preflight**, not for final edited media or every cursor pixel. Source SHA-256 is `5f6250db32bbf9fa90725f5d2c2cf1b49d1f017daad935611e9541f61f344b89`: 1,463 frames, 30 fps, 3024×1776, 48.766667 seconds, no audio.

The source starts on real Overview with one target tab, a dark launcher, and no debugger strip. At 4 seconds the newly opened Nova panel is already dark with an empty composer; all 240 panel-interior frames in the first eight seconds stayed dark, resolving the earlier large light-panel flash in this setup. The request grows visibly over approximately eight seconds and remains readable. Sampled actual clicks show the same white Nova arrow/ring/label at Inboxes, the display-name field and Update. No additional system/tool pointer was observed in the reviewed opening, typing sequence, native key frames or selected action intervals. This is sampled visual evidence, **not exhaustive pointer certification**. The native canvas has no prior right padding, and the saved rename is visible at the end.

The earlier preflight 3 sample proved the approved tap pipeline and a measured animated debugger-row mask; it failed initial theme and had slow typing. Preflight 4 is source-only and does not certify a final mask or audio export. Its visual frame times must not be substituted for actual click receipts. Remeasure the complete debugger row, including its animated entry and X, from the final source; preserve raw and all Nova execution motion at normal speed. Keep the readable operator typing at 1× unless a separately verified edit justifies at most 1.2×.

These were preflight gates at that checkpoint. Final take 2 and all three exports now exist; the final-source evidence below supersedes capture/export readiness. Independent targeted visual acceptance and remote branch/media recovery subsequently passed; their reports are linked in the delivery README.

## Backend-only projection correction

Shared commit `68b0daa1e78d7d99cfbfa22ab21733a8935d2f00`, integrated into main `377eeaac596ace01d27fcb149f3e50b80030152e`, corrects a reproducible mismatch between exact privacy-projected planner evidence and raw verifier text/URLs. The actual rejected model proof array was not retained, so this is a demonstrated likely cause rather than certainty about the original citation. 85 focused verification, runner and privacy tests plus typecheck passed. The backend used for that activation checkpoint was `a2de2cfa50773f3d9cb9c7beb70efcf7470dcad4`; extension remains the visually verified `d2d6325` artifact with SHA256 `38be34e27e224b1f52c9e547ac1d3ec14b57d477d2f807e47968303720fc3616`. Later guide and asynchronous-editor changes are recorded below.

## Failed first take and asynchronous editor guard

The historical `take1-duplicate-editor.mov` was a **failed take, not a final deliverable**. Its temporary video was removed only after final acceptance and verified remote backup; all text/JSON failure evidence remains. On backend `1922836`, opening rename and the explicit purpose/Help me choose metadata sequence worked. The third request then opened two composers for the same draft through two separate single-click actions before any draft edits. This was not a double-click gesture. The successful opening and metadata segment do not establish completion of the whole demonstration; do not splice the unfinished draft sequence into an apparent success.

`take1-export.log` points to `evidence/20260921T183828.268193Z-75986/sessions-0001.json` and `summary.json`, session `f45cd715-50ce-477a-bd6d-d8dac1d3821e`. The retained tasks are opening `58ec4aa6-76e9-4b62-a1da-a69a3602f660`, purpose/target question `a9e89ad6-05dc-413a-a587-d5b3282616b1`, Help me choose `94ac578f-f5aa-4b01-aef9-da8ffaa64517`, answer/save `ba40aee5-0ade-4e79-ada4-609ae9346852`, and failed draft opening `7e0d6300-1031-4598-b8d8-b9e0707352bf`. That last task records draft-row activations starting at epochs 1790015841814 and 1790015845463; these are action-start timestamps, not sound cues. The coordinator observed both composers and stopped the take before editing them. The metadata answer reports both requested String fields saved, corroborating the coordinator’s successful metadata observation in this take; it does not erase the older stale-purpose failure.

Shared guard `3eed`, merged through main `2d2b1e4` into AgentMail backend **`f78542b53572fb953828c3d704b1583e6157d214`**, checks for an editor that appears asynchronously before executing a planned action. The coordinator reports **89 focused tests passed**. These are shared-core test results, not a test run by this documentation worker and not proof of complete live coverage. The trusted single-click guide remains necessary; the guard addresses the timing gap exposed by repeated separate clicks. Extension visuals and ZIP bytes are unchanged.

The read-only collector `evidence/20260921T184250.079092Z-76920/` records session `12af52f4-8b68-485c-a097-e3d482bd729b`:

| Regression | Retained evidence | Current conclusion |
| --- | --- | --- |
| `7fb85ef5-2e50-4861-94cf-6b334bf339f1`: open the existing draft for review, unchanged and unsent | Four verified steps; first progress 3.180 s; first action 3.196 s; final reply 26.099 s | Passed this bounded check. Coordinator independently confirmed exactly one composer and unchanged baseline. |
| `0cfe6f63-9253-4784-bb35-9231d537359b`: close and reopen for review, unchanged and unsent | Two verified steps; first progress 3.890 s; first action 3.908 s; final reply 14.925 s | Passed this bounded check. Coordinator AX confirmed exactly one Edit Draft, the same reserved recipient/subject and unchanged unfinished body; completion reported unchanged and unsent. |

The second independent AX check verified To `orders@customer.example`, Subject `Your oak desk order update`, and body `Order CF-1048 — oak desk. Dispatch update awaiting review. Cedar & Finch Care.` Both affected regressions passed before final take 2. These bounded checks by themselves did not certify the entire final workflow; the later complete take is separate evidence.

Those times measure server events, not edited footage. The first collector attempt (`collector-take2.log`) found no matching session and saved no unrelated data; the live collector above is the applicable evidence. A successful open-only regression does not certify a full prepare/revise workflow or final recording. The final EDL and cues were subsequently measured from the finalized second-take source.

## Successful final take 2 and export evidence

Session `0cd61961-28fb-4947-9139-4ae96d103475`, first-frame epoch `1790016420563`, captured the full six-request script with actual metadata Help me choose and dispatch-facts card answers. Continuous evidence is `evidence/20260921T184729.501485Z-77630/`; `final-take2-export.log` points to `evidence/20260921T185327.517725Z-80068/sessions-0001.json`. Backend is `f78542b53572fb953828c3d704b1583e6157d214`; extension source/ZIP remain `d2d6325` / `38be34e27e224b1f52c9e547ac1d3ec14b57d477d2f807e47968303720fc3616`.

The coordinator independently reopened and confirmed Cedar & Finch Care on the same address, all three String fields (Customer Care / Furniture order support / 1 business day), the existing draft with exact reserved recipient and subject, October 2 preparation followed by October 5 revision, tracking after dispatch and signoff. Exactly two drafts remained and CF-1042 was unchanged; one editor, no send or schedule. The final review request correctly recognized the already-open draft without an unnecessary click. This is the clean full-take outcome; earlier failures above remain part of the history.

The untouched source is 11,602 frames / 386.733 seconds. Both edits are 10,857 frames / 361.900 seconds at native 3024×1776/30 fps, with typing and Nova actions at 1×. Only settled operator waits and the static tail were shortened. The complete debugger row and its entry animation were measured from this source. Thirty-seven deduplicated full-session click receipts include pre-message launcher/focus clicks: 25 Nova and 12 operator. Local decoded audio and video-identity checks pass; independent numerical review passed. Root inspected the encoded metadata action and final correct single-editor draft. Visual coverage is bounded, not an exhaustive pointer claim. Independent targeted visual review and fresh-cache remote recovery have also passed; see the reports linked in the delivery README.

[Delivery README](README.md) contains exact files, hashes, response latency (including the eight-step opening and each clarification round), actual card answers, reproduction links and current review status. [final-session-timing.json](evidence/final-session-timing.json) preserves the nine actual task intervals; [final-qa-report.json](evidence/final-qa-report.json) records exported-file identity and numerical checks.
