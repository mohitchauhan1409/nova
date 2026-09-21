# AgentMail final edit plan and evidence

Source: `artifacts/agentmail/media/nova-agentmail-original.mov`, untouched native 3024×1776, 30 fps, 11,602 frames (386.7333 s), no audio. SHA-256 `20640dd4f09cc5fc55d7119d91393b68bd523efdc7c0e3e355972e3c1e59a9d7`. Backend `f78542b53572fb953828c3d704b1583e6157d214`; extension `d2d6325c657f3b5f45f326db56565300e26826bd`, ZIP SHA-256 `38be34e27e224b1f52c9e547ac1d3ec14b57d477d2f807e47968303720fc3616`. First-frame epoch 1790016420563; session `0cd61961-28fb-4947-9139-4ae96d103475`.

The source shows successful rename, explicit purpose/Help me choose/target saving, existing-draft completion after one facts card, October 5 revision with reopen, setup/unsent summary, and the final already-open review request. The coordinator independently verified all three String metadata fields/address, exact draft To/Subject/body, one editor, two total drafts and unchanged reference; nothing was sent or scheduled. The final request appropriately observes the already-open draft without another click.

## Frame edit decisions

All Nova execution, operator typing, card reading and transitions remain at **1×**. Only the following settled operator waits are reduced, each to one second. Source panel samples show the reply and empty composer stable throughout; no clicks occur inside the reduced spans. Reading time and a guard before the next focus click remain.

| Source frames [start,end) | Source seconds | Output duration | Context |
| --- | --- | ---: | --- |
| 1911–2064 | 63.700–68.800 | 1 s | After renamed result, before next request |
| 8334–8496 | 277.800–283.200 | 1 s | After verified October 2 draft, before correction |
| 9840–10023 | 328.000–334.100 | 1 s | After verified October 5 result, before summary question |
| 10638–10803 | 354.600–360.100 | 1 s | After readable summary, before final review request |

Retain source frames 0–11399 (through 380 s), leaving almost eight seconds after the final confirmation and trimming only the subsequent 6.733 s static tail. Output target: **10,857 frames / 361.900 s**. No crop, zoom, title card or other cover is added. Normal-speed segments in the EDL use the conservative `agent` class even where they also contain operator typing/reading; their source/output frame counts are equal.

## Debugger row

The actual row first appears at frame 630 (21.000 s). The sole mask is x10/y174/width2228, color `#f9f8ff`. It follows measured animated heights 34 px at frame630, 74 at631, 98 at632, and112 from633 onward. The one-pixel boundary shadow and product beneath remain visible. No mask precedes the row. Source native frames show text, Cancel and X within this row; no ordinary account/product content is covered. Decoded entry frames 629–634 were extracted for independent visual review.

## Click provenance and cursor

[final-click-ledger.json](final-click-ledger.json) retains **37 unique full-session receipts: 25 Nova and12 operator**, including launcher/composer clicks before the first message. Deduplication uses epoch, actor, target and button across the full available collector exports. The independent reviewer found 38 session files and recovered the identical 37-click set. Task-filtered summaries alone would omit the opening operator clicks. Each receipt maps to its nearest native source frame, inspected visually, then through the exact EDL into [final-click-cues.json](final-click-cues.json). No click is invented for Enter submissions, typing, thinking, scrolling or the final no-op review response.

All37 native receipt frames show the intended targets or operator focus/card responses. Nova's actual targets have the single white arrow/action label and matching ring or focus cursor; native carets remain. No extra system/tool pointer was seen in these frames, source-wide five-second contacts, native pause panels or debugger-entry frames. This is bounded inspection and must be supplemented by final continuity review, not described as exhaustive pointer certification.

## Completed render and remaining independent acceptance

The shared frame editor ran with empty `clicks` and two encoding threads; its required secondary output stayed in temporary scratch and was removed. The unchanged approved renderer then produced 48 kHz stereo taps with seed 2071, gain 1.6, cap 0.30 and existing actor panning. Exactly three primary media remain, with raw SHA unchanged.

Both edits have 10,857 frames / 361.900 s at full native canvas and identical encoded video. All 37 cue frames, entry frames and EDL boundary frames were extracted; receipt-frame source comparison outside the mask has maximum mean error 0.233/255 and p99 error 4/255, consistent with encoding. Decoded tap verification passes with quiet peak 0, peak 0.2171, maximum onset error 0.0417 ms and minimum reference correlation 0.9996. Root checked the encoded metadata action and final saved October 5 draft. Independent numerical and bounded visual review passed, and all three remote-recovered hashes matched at `7d8a0c4eed8ddc20a9acdc04e7744d80f6abfa89`. See [final-qa-report.json](final-qa-report.json) and [delivery README](../README.md) for hashes, coverage and status. No further rendering is required absent a demonstrated defect.
