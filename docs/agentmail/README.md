# AgentMail delivery

The successful second take completes two connected workflows: configure the existing support inbox with a chosen response target, then finish and revise its existing oak-desk draft. It also includes a useful rename before any question card, Help me choose, and two final questions. The coordinator independently reopened and checked the saved metadata and draft; no mail was sent or scheduled.

Backend `f78542b53572fb953828c3d704b1583e6157d214`; extension source `d2d6325c657f3b5f45f326db56565300e26826bd`, ZIP SHA-256 `38be34e27e224b1f52c9e547ac1d3ec14b57d477d2f807e47968303720fc3616`.

These are the identities used in the footage. A later branch delivery commit may include unrelated fixes and must be recorded separately; it does not change the captured build.

## Three primary media files

All files retain the native 3024×1776 canvas at 30 fps. The MOV is the untouched source. Edited files last **6:01.900**; all typing and Nova execution remain **1×**. Only four settled operator waits and the static tail were shortened. The silent and approved-click exports have identical encoded video streams.

| File | Duration | Bytes |
| --- | ---: | ---: |
| [nova-agentmail-original.mov](../../artifacts/agentmail/media/nova-agentmail-original.mov) | 386.733 s | 111,445,281 |
| [nova-agentmail-silent.mp4](../../artifacts/agentmail/media/nova-agentmail-silent.mp4) | 361.900 s | 25,570,518 |
| [nova-agentmail-clicks.mp4](../../artifacts/agentmail/media/nova-agentmail-clicks.mp4) | 361.900 s | 26,044,418 |

Exact file hashes are in [final-qa-report.json](evidence/final-qa-report.json). There are exactly these three primary media files. [Frame EDL and row-mask measurements](evidence/final-edit-plan.json), [receipt ledger](evidence/final-click-ledger.json), [mapped cues](evidence/final-click-cues.json), and [renderer provenance](evidence/final-renderer-provenance.json) make the edit reproducible through [render-final.py](evidence/render-final.py).

The approved 48 kHz stereo mechanical tap (seed 2071) uses **37 real receipts: 25 Nova and 12 operator**, including launcher/focus clicks before the first message. Enter submissions, typing and the final no-op review add no invented clicks. Decoded checks pass: silence outside tap windows, peak 0.2171 without clipping, maximum onset error 0.0417 ms relative to frame-mapped cues, and minimum reference correlation 0.9996. Mapping actual receipts to the nearest 30 fps frame adds at most 16.334 ms. Only the measured debugger row, including its animated entry and X, is covered; no crop or product privacy covers were used.

Source review covered every receipt frame, source-wide contacts, idle boundaries and row entry. Root independently inspected the encoded metadata action and final October 5 draft. The actual white Nova arrow/label/ring is present in reviewed actions; no second system/tool pointer was observed. This is bounded visual coverage, not exhaustive pointer certification. Independent numerical review passed; targeted independent visual review is finishing. Remote Git LFS upload and independently recovered hashes remain coordinator-owned and are not claimed here.

## Actual script and measured response time

[demo-script.md](demo-script.md) records the exact six requests and actual card answers. [final-session-timing.json](evidence/final-session-timing.json) retains actual server event times and messages for session `0cd61961-28fb-4947-9139-4ae96d103475`. Seconds below start at each request or card-answer submission; they exclude operator answering time and are independent of edited duration. “Final reply” is the reported response, corroborated separately by the coordinator’s saved-page checks.

| Turn | First progress | First action | Card | Final reply |
| --- | ---: | ---: | ---: | ---: |
| Rename (8 verified steps) | 3.557 | 3.572 | — | 41.250 |
| Purpose/target card | 4.980 | — | 4.981 | — |
| Help me choose card | 5.455 | — | 5.456 | — |
| Target answer/save (7 steps) | 3.091 | 3.104 | — | 32.243 |
| Open draft/facts card (4 steps) | 3.319 | 3.329 | 34.672 | — |
| Facts answer/save (3 steps) | 4.894 | 4.913 | — | 19.895 |
| October 5 revision (3 steps) | 4.106 | 4.124 | — | 20.483 |
| Setup/unsent summary | 4.377 | — | — | 4.378 |
| Review already-open draft | 4.338 | — | — | 4.339 |

The opening used eight verified steps; its 41.250-second response should not be confused with an earlier five-step rehearsal. The two metadata clarification rounds and draft facts round are retained, including their true waiting and typing sequence. The final review correctly recognized the already-open draft and made no redundant action.

## Coverage and retained failures

Final saved result: same inbox address, **Cedar & Finch Care**; String metadata `team=Customer Care`, `purpose=Furniture order support`, `response_target=1 business day`. Existing draft **Your oak desk order update** to **orders@customer.example** contains CF-1048, oak desk, dispatch **October 5, 2026**, tracking after dispatch and Cedar & Finch Care signoff. Exactly two drafts remain; **Care handoff — order CF-1042** is unchanged, with one editor and nothing sent or scheduled. Metadata is descriptive, not an enforced SLA or automation.

[Live verification](live-verification.md) retains earlier failures: wrong repeated-row metadata targeting, unnecessary save approval, false-empty Drafts response followed by fresh-query recovery, a correctly saved terse revision whose completion verification stopped, and a stale-purpose statement after an operator reset. The first full take failed when two separate clicks opened duplicate editors; it is excluded from deliverables. The asynchronous editor guard then passed both bounded regressions and the successful full second take. Historical repairs are not counted as clean rehearsals. [Activation](activation.md) records isolated data, existing-store guide synchronization, source build flags and backend/extension activation. [Eligibility](eligibility-and-scenario.md) records why AgentMail was included.

Independent final visual and decoded-audio acceptance passed; see [acceptance](evidence/independent-final-acceptance.md). The recording identities above remain fixed; later shared DOM target/tag-entry fixes were merged without changing the recorded extension or media. Remote recovery verification is recorded separately after push.
