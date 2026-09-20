# Private-video revision

The current deliverables are a new continuous take, freshly launched from Nova
onto SageOx Home with the panel closed. The prior capture had account masks baked
into its pixels, so those could not be removed from that source. Its original
bytes remain recoverable from customer-branch commit 8747138; previous edit receipts
are retained in `previous-masked-take/`.

Per the owner's revised instruction, this recording has no account, tab, URL,
avatar, greeting, uploader, sidebar, or page-content redactions. The raw source is
unmodified after capture. Only the browser-owned debugging row is covered in the
edited copies; the actual browser security feature stays enabled.

## Capture and edit

Chrome window 24466, first encoded frame epoch 1789910487261 ms. Native
3024 × 1776, 30 fps, 10,470 frames / 349.000 seconds, no captured audio.
The final edits contain 8,835 frames / 294.500 seconds (4:54.5).

Frames 0–10111 are retained, including ten seconds after the last reply. The
52-segment contiguous EDL shortens nine operator pauses and modestly accelerates
eight typing intervals, at no more than 1.2×. Plans-question typing overlapped
Nova's work and therefore remains at real speed. All 4,780 frames of active Nova
execution remain at 1×. Pointer movement, scrolling, clicks and actual responses
are retained. No successful result is fabricated, replaced, or spliced.

The sole cover is x=16, y=174, width=2220 in native pixels. The browser row's
observed slide-in starts at frame 2965, with heights 30, 54, 94, then 112 pixels
at frames 2965–2968. The cover includes its close icon and does not cover product
content or the Nova panel. The raw retains the real indicator.

## Sound

The click-only soundtrack uses exactly the `band_noise` and `click_sound`
synthesis functions from the Bolna recording utility (verified by AST comparison),
with the same 48 kHz stereo construction and gain. There are 46 individually
aligned cues: 19 operator clicks and 27 Nova clicks, including mouse focus of
editable fields. There are no keyboard effects, narration cues, music, ambient
sound, or invented taps for rejected input.

Each source cue was inspected around its actual visible focus, click feedback or
control response and mapped through the EDL. The opening cue is frame 112, just
before panel motion begins at 113. The transcript-focus cue is before the paste,
not on the later text change. The title refocus before Enter gets a mouse cue,
not a keyboard sound. The prior blanket five-frame offset is not used.

`sound-cues.json` records each frame, actor, evidence and edited time. These are
added editorial effects, not recorded microphone audio. `add-click-sounds.py`
copies the encoded silent video stream and validates audio duration, cue bounds,
levels and stream identity. Decoded audio peaks at −13.73 dBFS; all 46 attack
peaks fall within 1.8 ms of their assigned frame time, with zero decoded signal
outside cue windows. Final validation and checksums are recorded alongside.

## Live outcome and honest recovery

Nova added BayBoard / Bay Board and CrewLedger / Crew Ledger, reopened Vocabulary
and observed 13 total terms. It imported one complete synthetic VTT, verified Maya
Chen and Eli Brooks and 01:20 duration, renamed the same discussion to
**Harborlight field decisions**, and saved it for later. Its final Summary was
processed and visible, with per-user cache encryption accurately identified as
unresolved. No sharing, messages, CLI connection or production work occurred.

One stale discussion-row target was rejected without sending input; Nova then
observed the saved detail page and completed verification. Its first Plans answer
was incomplete, so the operator clarified: “Open Plans and check whether there is
a browser create option.” Nova inspected Plans and correctly reported no visible
browser creation option; the page subsequently showed its coding-session commands.
Both moments remain in this continuous take. The ending flow completed without
cycling through Distillation.

A short live preflight on the existing saved discussion passed before the fresh
launch. An earlier unmasked attempt was stopped before any website writes after
an operator accessibility-index mismatch opened Chrome's menu; it is not part of
the delivered take. During this take a missing semicolon key mapping caused a brief
operator typing pause, then the same field was completed normally. Only that idle
pause was compressed; the source remains untouched.
