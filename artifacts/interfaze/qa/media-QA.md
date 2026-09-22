# Interfaze final2 media QA — local export checks passed

This report concerns session `afbb051f-28e4-496d-a4e1-dc228e111c1a` only. The previous empty-opening candidate is superseded. Frozen backend is `bd98d2500625f8821aa38836272b2568cb0fb4e5`, recording frontend `1f7c8755a8cf1133534272c0083615156639d91e`, shared main `dad9db1f1ff9a172d47a2f3e095eab4a6c96daf7`.

The untouched native original has 14,355 frames at 30 fps, 3024×1776, 478.5 seconds and no audio. Recorder anchor is 1790054964125. Source SHA256: `81efdc5a1a641e1ac0cf48b66fce66bd1b136b1050f5832d2e443cc8fbf02fc8`.

## Source review

All 43 actual click frames and one-second response frames were inspected in 15 contact sheets, with adjacent frame indices retained. Opening frame 0 has one Interfaze Playground tab, a real populated CD-300 synthetic prompt/reply, Nova closed with launcher, and no debugger row. The baseline is preparation, not on-camera Nova work. App and Nova share light surfaces and near-black controls; the single Nova arrow/ring/label is dark. No physical/operator pointer was visible in reviewed frames; this is sampled evidence, not an every-frame pointer audit. Cursor labels can overlap controls or clip at the page edge.

The opener enters and submits the exact prompt and receives damage before clarification. Help me choose, Category + summary selection and Continue are genuine. Nova enters the concise system prompt, changes Temperature 1→0, enables JSON, creates two required string properties, scrolls settings before editing the lower row, and tests “A cracked mug.”. Native output is category damage and summary “A cracked mug.”. Logs opens, refreshes and verifies the new matching request/status 200.

The policy revision adds required boolean escalate and the strict over-seven-days rule. The CD-305 nine-day test returns delivery/true; CD-306 exactly seven days returns delivery/false. Native Logs refreshes are retained at normal speed and do not resubmit inference. The final answer correctly states zero temperature does not guarantee accuracy. Nova really scrolls Log detail to Output and confirms the visible CD-306 result, followed by a closing hold. No recovery request or ordinary approval occurs in this take. Coordinator independently reopened all three structured-result requests after reload; full IDs are in the final capture documentation.

## Receipt reconciliation and editing

The bounded session contains 42 clicks: 33 Nova and 9 operator. The separate operator ledger contains 10. Nine are duplicates of session entries; the first composer focus click is ledger-only. Source frames 251/253 show the transition from no caret to focused caret, then progressive text at 255/261/270/283, corroborating the actual ledger action. Its cue uses source frame 253 (8.433 seconds), aligned with the completion receipt and visible focus. The candidate union therefore contains 43 unique actual clicks: 33 Nova + 10 operator. Keyboard Enter submissions, slider values, boolean selection and scrolling do not become invented taps.

The strict receipt/EDL mapper passes. Only static operator wait source 220–229 seconds becomes 3 seconds; the same Log dialog and completed response appear at raw frames 6600/6750/6870. At least 5.883 seconds of prior reading and 5.824 seconds before the next click/typing are retained. No action or click falls in that interval. Six seconds are saved, yielding 14,175 frames / 472.5 seconds. All Nova execution, model processing, character entry, card feedback, navigation, refreshing and scrolling stay at 1×. These are media durations, not measured agent latency.

The only mask is the actual browser debugger row: native x16, y174, width 2218, fill #f9f8ff (RGB 249,248,255), including the close icon and lower border. Native source frames 716–723 were measured. No mask before 717; heights 20/52/84 apply at 717/718/719; height 114 from 720 through ending. Product content, URL, account information and Nova panel remain visible; canvas is not cropped or scaled.

## Decoded export checks

The native silent and click-only exports each contain 14,175 frames at 30 fps, 3024×1776, lasting 472.5 seconds. The original remains unchanged at its recorded SHA256. Silent has no audio. The click version adds only the unchanged established 48 kHz stereo tap, seed 2071, with original gain/panning. The encoded video stream is identical in both exports (`7595d7f6822b76b759db13d3636a69adbdd76b7faf6eb68f91408d3bc00caec3`).

All 43 decoded taps match the renderer: maximum onset error 0.020833 milliseconds, minimum correlation 0.9994467, decoded peak 0.215913, and zero audio outside permitted tap windows. No clipping, missing, duplicate or invented tap was found. The 86 source/export click and response frame comparisons have maximum mean absolute RGB difference 0.130345 and p99 difference 3, excluding only the measured debugger row plus two scaled pixels for codec ringing. Actual masks use the exact documented native geometry.

Decoded opening, mask-insertion frames, selected radio, concise policy entry, result navigation and ending were visually inspected. Actual raw and decoded 10 Hz typing samples show individual characters and caret movement for operator text, the product prompt and system policy. The single near-black Nova arrow/label persists during field entry; no operator pointer appears in these samples. Final scrolling was also inspected at native 30 Hz around source 464.3 seconds (edited 458.3), showing intermediate positions and settling on Output; 10 Hz settings samples show the real lower-field scroll. No postproduction character or cursor animation was added. Cursor label overlap/clipping remains disclosed.

Primary hashes, sizes, probes and measured timings are in `media-manifest.json` and `timings.json`. Independent selected-frame/hash/probe review passed; see `independent-review.md`. Remote LFS recovery passed: all three objects were fetched from the private remote into a separate initially empty cache and matched exact SHA256/size. See `remote-recovery.json`. No claim of exhaustive dashboard capability or accuracy guarantee is made.
