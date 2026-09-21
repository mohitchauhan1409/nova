# Confident live verification ledger

Updated 22 September 2026 (Asia/Kolkata); event times below are UTC on 21 September. This ledger records saved outcomes and retained failures. The final raw take has been captured; all saved business outcomes passed independent postcapture checks. Local media QA and independent acceptance passed; see [local media QA](evidence/final-qa-report.md) and [independent acceptance](evidence/independent-final-acceptance.md). Independent recovery from the private remote passed at `98ed06a`: all three complete file hashes/sizes match local originals and remote LFS pointers; see [remote backup verification](evidence/remote-backup-verification.json). No evaluation results are claimed.

Media results: raw **564.066667 seconds / 16,922 frames**; each edit **528 seconds / 15,840 frames**, native 3024×1776 at 30 fps. The silent edit has no audio; the tap edit uses **42 receipt-backed cues** (32 Nova, 10 operator). Both encoded video streams match. The full 128.001-second case task, menu loop and visible redirect remain at 1×; bounded visual checks and exhaustive cue/audio checks are documented in the linked acceptance.

## Final take — local and independent media QA passed

Session `9ee04cc6-2009-4443-ac45-a43b7e721165`; capture start epoch `1790021120776`; coordinator-reported raw frame count 16,922. Loaded backend remained `94debcde941dcb30de7e3b89aebf26f963b109d9` and extension `b7e3172`; source/docs checkout was `49368c4`. No runtime activation is implied by later docs commits.

Primary collector: `20260921T200451.800496Z-90911`; final one-shot export: `20260921T201445.005724Z-94008`. The collector retains early trace events that the final export cannot reconstruct. The eight exact user events, full task IDs, timings and selected saved identities are in [verification/final-take-receipts.json](verification/final-take-receipts.json); [demo-script.md](demo-script.md) records the actual sequence.

| Captured task | Verified action steps | Observed result |
| --- | ---: | --- |
| Alias rename `6ef04dc2…` | 5/5 | Saved Northstar Returns Readiness on the same six-case dataset. |
| Prompt clarification `baa2cd9c…` | 1/1 | Opened existing prompt and asked a follow-up-style question. |
| Help me choose `c739f412…` | No website action | Explained choices while retaining task context; user chose Group all needed details. |
| Grouped commit `4f4254d8…` | 5/5 | Saved `5562c12`, **Group policy-relevant follow-up questions**. |
| Boundary pair `61ee030d…` | 20/20 | Saved two new records; table reload showed eight cases and empty Actual Output. Six steps were repeated column-selector work; tags remained unexposed in table. |
| Prompt revision `7a785134…` | 7/7 | Saved `5fb11cb`, **Add damage details and shorten response limit**; two rejected visual-point requests preceded recovery. |
| Coverage `5bcaca3b…` | 3/3 | Inspected eight cases and reported coverage; no evaluation was performed. |
| Preview `c4250174…` | 2/2 | Opened saved final prompt in Preview. |

Total: **43 verified action steps**, no failed/unverified recorded action steps. This excludes two rejected visual requests and does not erase repeated column-menu work or the visible user redirect **“Leave the columns as they are.”** No approval interruption was present in the final take. Earlier failed/recovered rehearsals below remain retained.

The coordinator independently reloaded final prompt `5fb11cb`: under-100-word limit, grouped relevant missing details, order reference/description for damage, 30-day standard-item rule with proof, personalized change-of-mind exclusion, 7-day damage review without refund promise, and a single `{customer_message}`. The coordinator then navigated afresh to the dataset and verified the Readiness alias, eight unique IDs and unchanged baseline six. Both exact new records were reopened through Edit Golden: requested tags, full Inputs/Expected Outputs and blank Actual Output passed. Other execution fields showed None or zero defaults. Save was disabled; no postcapture edits were performed. Commit History independently showed both `5562c12` and `5fb11cb`.

| New final golden | Exact saved input | Requested tag / evidence |
| --- | --- | --- |
| `cmuboj3st000slo0tslkn8ehq` | My unused standard jacket was delivered exactly 30 days ago and I have the receipt. Can I return it? | `window-boundary`; entered chip and saved; coordinator independently reopened and verified after capture. |
| `cmubojnd9000tlo0tsp634ae1` | My mug was delivered exactly seven days ago and arrived damaged. What should I do? | `damage-review`; entered chip and saved; coordinator independently reopened and verified after capture. |

Both Expected Outputs are preserved in the scrubbed extract. The first applies the inclusive 30-day eligibility rule without claiming a refund; the second requests order reference and damage description for 7-day review without guaranteeing a refund. The six prior IDs remain present.

### Final-take timing

Seconds from each user event. First progress is a meaningful status event; final reply is a reporting timestamp, not independent saved proof. Help and answer timing is separated from agent execution.

| User event (UTC) | First progress | First action | First card / final reply |
| --- | ---: | ---: | ---: |
| Alias, 20:05:54.985 | 4.364 | 4.364 | 36.940 |
| Prompt question, 20:07:00.897 | 5.363 | 5.364 | Card 18.015 |
| Help, 20:07:41.037 | 7.188 | — | Card 7.189 |
| Grouped answer, 20:08:02.493 | 6.002 | 6.018 | 27.398 |
| New cases, 20:09:37.865 | 4.106 | 4.107 | 128.001 |
| Final revision, 20:12:16.799 | 5.171 | 5.174 | 55.107 |
| Coverage, 20:13:28.907 | 3.010 | 3.011 | 33.260 |
| Preview, 20:14:16.621 | 3.779 | 3.781 | 15.649 |

The capture's first request began 34.209 seconds after the reported recording start; the final reply occurred 551.494 seconds after start. These are server-epoch alignments, not frame-accurate media synchronization. Leave final audiovisual timing/QA to the recording evidence.

No evaluation action occurred in the captured session. Empty outputs and no dataset versions support the stated prepared-asset scope, but alone cannot prove a product-wide history has no past evaluations. The Help card description was visibly truncated after “without promising”; choices and task continuity still worked. A single-question card does not establish multi-question partial-answer behavior.

## Runtime and evidence

Current backend: `94debcde941dcb30de7e3b89aebf26f963b109d9`; extension: `b7e3172`, archive SHA-256 prefix `28e115`. The coordinator alone operated the live browser and independently inspected persisted results. Evidence is private under `/Users/macbook/Desktop/Nova-batch-20260921/private/confident-ai/evidence/`:

- `20260921T185736.785485Z-80880`: first prompt refinement and earlier blocked attempts.
- `20260921T194008.142481Z-86606`: visual dataset opening still failed after the target patch.
- `20260921T194209.425029Z-86911`: backend `0bd15f1`, same extension; explicit dataset Save and two-golden creation.
- `20260921T195133.832491Z-88438`: recorded backend; second saved prompt and failed existing-answer edit attempts.

These folders hold `summary.json` and bounded session snapshots. Raw sessions, credentials and tokens are not included in the repository. The tracked synthetic-object manifest records all eight exact saved IDs/Inputs and the completed independent checks. Source guide commits made after backend activation were not loaded by this docs update; the recorded live runtime remains the stated backend/extension pair.

## Saved outcomes

| Outcome | Task and result | Verification and limits |
| --- | --- | --- |
| First prompt refinement | `8ecdbd2e-33c3-4b2a-8615-d03b87f17581`; saved commit `b217d68`; 8/8 verified execution steps after clarification | Coordinator reopened the editor and Preview: grouped missing details, all three policy rules, variable, warm tone, under 120 words and no refund promise. Earlier `select_text` on the editable failed and recovered; not an error-free full flow. |
| Dataset alias | `1ee3710a-8455-43f4-9661-5248cce79887`; explicit Save continuation; 2/2 verified steps | Save and reload persisted Northstar Returns Readiness on the same dataset. The prior bare-rename request was gated and canceled, so this is not proof bare rename works. |
| Two new goldens | `a26a62c4-077f-4269-b158-19852863db37`; 13/13 verified steps | Two create/fill/tag/Save sequences plus reload. Four unique rows; originals preserved. Coordinator independently reopened each new row's tag and blank Actual Output; other execution fields remained unset. |
| Second prompt refinement | `6c02c6e4-de29-42f1-a8b8-6757988af609`; commit `ecd3bf0`, **Ask for missing return details one at a time**; 10 verified steps, 1 unverified | Escape did not close the commit modal; a click recovered. Nova also corrected duplicated customer-message text before committing. History and full Preview verified policy, sequential follow-ups, damage order-reference/description guidance and exactly one variable. No approval interruption; saved outcome with recovery, not 11/11. Coordinator independently reloaded and confirmed the exact saved content. |
| Second distinct-pair creation | `bfe66987-096e-4878-939d-6adaf00e6d82` → `ba09a850-026b-4e2d-b3a5-dc9bb900b345` → `615b6b55-3910-4763-8352-6f9b4726699b`; final reload task `f15992de-8c15-405f-9ffa-7ffd944ecc72` | Six saved cases verified after Nova reload. Coordinator independently opened both new forms and verified exact Inputs/Expected Outputs, tags and blank Actual Output. Multi-request recovery with tag gating/stale approval and one approved Save; not a clean single-request pass. |
| Existing-answer refinement | `f6681c39-3dba-4342-ba28-90ac5f8a4656` | Filter URL navigation returned a failed action, then a body-text grid-cell target containing policy wording triggered approval. Coordinator canceled. Retry `4dbdc10e-b271-4d87-ac10-0e5f04d9e3ba` reached legitimate unlabeled-control review; the coordinator approved after inspecting the exact synthetic row. Its single dispatched click did not open a verified editor. A separately approved inline-cell double-click (`d930309a-760f-4dad-bba0-2ccc41a597ee`) also failed and was stopped. No existing-answer edit pass is claimed. |

The existing prompt is `cmubijzhk0005pb0tn3tnafcn`; dataset is `cmubimef70007qs0tgjd1c7sq`, in Vector / My first project (`cmubhm6yf0002o30tjtp072vo`). The final recording will refine these same objects, not create replacements.

## Six rehearsal baseline goldens

| ID | Exact input | Verified tag / treatment |
| --- | --- | --- |
| `cmubimf6c000gqv0tjhxrck3o` | My unused jacket arrived 18 days ago and I have the receipt. Can I return it? | Preserve original input and expected standard-return answer. |
| `cmubiocqd0008ki0tvl8gti6s` | I ordered a personalized flask 10 days ago and changed my mind. Can I return it? | `policy-boundary`; preserve original exclusion answer. |
| `cmubnlza9000ple0tt1g6y0b6` | My mug was delivered five days ago and arrived damaged. What should I do? | `damage-review`; preserve the saved record unchanged. |
| `cmubnmgmw001aki0t2qstgfia` | I have an unused jacket, but I don’t know when it was delivered. Can I return it? | `missing-information`; preserve the saved record unchanged. |
| `cmubo3f8x001dki0t52jmmpnm` | My unused standard jacket was delivered 31 days ago and I have the receipt. Can I return it? | `window-boundary`; independently reopened; preserve unchanged. |
| `cmubo5jww000xmh0tboexaj5b` | My personalized flask arrived damaged six days after delivery. What should I do? | `damage-review`; independently reopened; preserve unchanged. |

The new rows' current full Expected Output text is not transcribed here. Policy-correct creation and tag persistence were inspected; existing-answer editing failed and is excluded from the final. Actual Output is blank and no evaluation was run.

## Receipt timing

Seconds from the corresponding user request. First progress is a meaningful status event; first action is the dispatched step's start. Final reply does not itself establish persistence. These are rehearsal observations across the stated builds, not final-video timings or guarantees.

| Task | User time UTC | First progress | First action | Final reply / clarification |
| --- | --- | ---: | ---: | ---: |
| Prompt initial clarification `c7583b8c…` | 18:59:30.784 | 3.902 | 3.903 | Card at 18.022 |
| Help me choose `d5352d7d…` | 18:59:56.574 | 5.079 | — | Reply/card at 5.080 |
| Clarified prompt execution `8ecdbd2e…` | 19:00:30.411 | 6.854 | 6.865 | 46.569 |
| Explicit alias Save `1ee3710a…` | 19:43:14.968 | 2.266 | 2.285 | 14.776 |
| New golden pair `a26a62c4…` | 19:44:04.765 | 3.276 | 3.290 | 64.377 |
| Sequential prompt refinement `6c02c6e4…` | 19:51:08.967 | 7.695 | 7.713 | 70.755 |
| Second pair initial request `bfe66987…` | 19:56:36.876 | 6.439 | 6.457 | Stale-approval reply at 63.666; no completion |
| Jacket Save/flask continuation `ba09a850…` | 19:57:52.627 | 5.250 | 5.273 | Tag-gate reply at 32.717; no completion |
| Flask tag/Save continuation `615b6b55…` | 19:59:05.521 | 3.874 | 31.763 | 83.675; includes human approval time |
| Six-case reload check `f15992de…` | 20:00:37.539 | 4.262 | 4.263 | 16.425 |

Original prompt request through final saved-revision reply took 106.196 seconds, including user clarification/help time. For the second prompt the collector did not infer a `completion_report` field; the table uses its observed final reply, with saved evidence described separately. The second pair's original request through final six-case reload reply spans 257.088 seconds, including human review and additional requests; it is not pure agent latency. Nova's creation reply explicitly said tags were not visible in the grid; the coordinator's independent modal reopen supplies tag proof. Snapshot polling can miss overwritten trace history; independent UI checks supply outcome proof without precise receipt timings.

## Retained failures and open gates

- The settled prompt index twice said **Create your first prompt** while the trusted saved URL opened the existing prompt. Absence from that index is not deletion proof.
- Visual dataset row opening resolved a broad ancestor containing Delete controls and required approval both before and after the attempted generic targeting fix. The second task was `9d042689-1d34-4157-a4a9-b211b7c7cb66`. Original hit ancestry/coordinates were not retained sufficiently to prove the precise remaining cause. Trusted record URLs are used through normal navigation; visual index opening remains unresolved.
- Bare rename task `76db98e8-95e5-49a3-afa5-79448733d1ff` reached a Save approval; it was canceled. The successful continuation explicitly requested Save.
- Earlier new-golden task `25775543-7da9-4b47-bd39-b0ba58d3c710` hit an unnecessary tag-Enter approval; attempted approval was stale and did not submit. The unsaved modal was canceled after restart; it created no golden. The later 13/13 task is separate evidence.
- Earlier prompt task `42df48e7-b721-4b34-814f-f7d0b83ff6ef` hit a needless approval while focusing a rich editor whose accessible name contained policy wording. It was stopped. The backend focus fix preceded the separately tracked saved `ecd3bf0` outcome.
- The approved pencil target `m9u71dx-115` was an empty-name generic `div`, `visual: true`, with no role, editable metadata or context. It was clicked once; fresh observations over approximately 8.8 seconds still showed 62 controls and no modal. Snapshots do not retain its selector, rectangle, original hit ancestry or inspect coordinates, so the precise miss cannot be reconstructed. The body-cell target `m9u71dx-114` was also an ordinary `div` without edit/gridcell metadata; its name included “proof of purchase.” No broad policy exemption or shared targeting change was made.
- Prompt refinement recoveries, the second dataset edit outcome, final reset, fresh-session opener, final capture, cursor/audio checks and backup must retain their true status. No paid version, trial, model connection or evaluation is required or claimed.

## Final structured creation path — capture outcome

Existing-row editing is excluded. The second creation rehearsal has saved the 31-day standard jacket and personalized six-day damage cases, with six total independently verified. The final created exactly-30-day standard-jacket and exactly-7-day standard-mug boundary cases, for eight total, with no deletion or duplicate. A prompt revision from 120 to 100 words replaces the planned row-edit correction. The final request must use “delivered exactly seven days ago and arrived damaged” and an explicit separate tag sentence: the tag guard rejected a bare “after” in the prior request as if it were conditional authorization. No further policy change was made. The two final creations and prompt revisions are now observed in the captured session above; independent tag reopens, all business acceptance checks, local media QA and independent acceptance passed; independent private-remote recovery passed at `98ed06a`, with all three full file hashes/sizes matching local originals and remote pointers; see [remote backup verification](evidence/remote-backup-verification.json).

Authorized post-backup cleanup is complete: 323 generated scratch media and 3 independently verified recovery duplicates were removed, totaling 525,996,575 bytes. The three primary media hashes still match, and report/runtime/build records remain intact; see [cleanup manifest](evidence/cleanup-manifest.json). Earlier visual sample filenames are historical inspection inputs; their measurements and reproducible scripts remain preserved after their generated images were cleaned.
