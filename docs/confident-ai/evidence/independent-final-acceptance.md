# Confident AI final media: independent acceptance

**PASS — no release blocker found.** Offline independent check on 2026-09-22. Both `nova-confident-ai-silent.mp4` and `nova-confident-ai-clicks.mp4` retain the native 3024×1776 image at 30 fps, 15,840 frames / 528.000 seconds. The raw recording has 16,922 frames / 564.066667 seconds.

## Integrity and timing

- Reread 132 original full-session exports and independently deduplicated all **42 actual clicks: 32 Nova, 10 operator**. Every receipt matches the final ledger and its output cue after EDL mapping. No click or message is inside an idle compression.
- Only four settled operator-idle intervals are shortened: source 5–16, 78–85, 130–138 and 199–209 seconds, each to one second. Every other retained frame is at 1×. Source ends at 560 seconds, retaining about 8.5 seconds after Preview completion.
- Raw SHA-256: `6904d10a2580d33f035064144dbaa29b446bf12945ed834ea5bebdabecf14f0c`.
- Silent and click editions have identical encoded video streams: SHA-256 `a06f4cc0bc3b4a4950ae740661ad9000e98bcdea8b7806c9eedcef57d120d7fb`. Silent edition has no audio stream. Click edition has stereo 48 kHz AAC with exactly 528 seconds of decoded audio.
- Freshly decoded all audio, independently recreated the approved tap reference and checked all 42 cues. Maximum onset error **0.020833 ms**, minimum waveform correlation **0.999518**. Peak outside cue windows is **0.0**; overall decoded peak **0.216386**, with no clipping. No inferred Enter, response or other fabricated cues.

## Visual checks

- Final frame 0: exactly one Confident AI tab, normal Home, dark launcher and no initial debug strip. Frame 270 / 9 seconds: dark Nova panel, no strip and no captured operator pointer. Source opening ROI measurement covers every frame over 17.7–20.7 seconds; max mean RGB 41.964/255, with no bright theme flash in that area.
- Source frame 1533 equals final frame 1233: the actual Nova arrow interior is RGB **248,248,248** in both; solid white action label and click ring remain. Cursor/label ROI source-to-final MAE is **0.456/255**. Later click samples also retain that style. Input-focus receipts do not imply a visible ring.
- Independently decoded all 12 entry-boundary frames (source 1524–1535, final 1224–1235). No early mask on frames 1524–1526. The debugger mask follows the native animation: heights 16/16/56/88/112 from frame 1527 at x10/y174/w2228. Text, Cancel and debugger X are fully hidden; product banner including its separate X remains. The product immediately below the mask differs only by small encoding error (MAE **0.120–0.441/255**). See `final-debugger-entry-contact.png` and individual native crops.
- Ten representative native output frames show no right-side padding and preserve full width through column 3023. No system/operator pointer was seen in these selected opening, focus, action, recovery and ending frames.
- Final frame 10233 retains the real column-selector attempt. Frame 11550 retains the explicit saved-tag verification limitation and the user's “Leave the columns as they are” redirect. No approval dialog was found in these final-take checkpoints. The case task and recovery are preserved at 1×.
- Frame 13200 shows the persisted prompt commit `5fb11cb`, “Add damage details and shorten response limit”, including the 100-word customer-facing answer limit. **Last frame 15839** ends on saved Northstar Returns Adviser **Preview**, commit `5fb11cb`, with Nova's Preview confirmation. No fabricated evaluation scores or Actual Output were introduced.

This combines exhaustive numeric checks for all documented cues/EDL mappings/audio silence with targeted source-versus-export visual inspection. It is not a claim that every screen pixel in all 15,840 frames was manually inspected.

## Reproducible evidence

- `check-evidence-audio.py`, `independent-evidence.json`, `independent-audio.json`
- `check-final-frames.py`, `independent-final-frames.json`, `independent-streams.json`
- `independent-cursor-comparison.json`, `raw-evidence-audit.json`, `raw-qa-report.md`
- `final-f00000-source-f00000.png`, `final-f00270-source-f00570.png`, `final-f01233-source-f01533.png`
- `final-f10233-source-f11193.png`, `final-f11550-source-f12510.png`, `final-f13200-source-f14160.png`, `final-f15839-source-f16799.png`

All decoding jobs have exited. No UI, runtime, backend, source files or git state were changed by this QA task.

The companion inspection files named above are retained privately under `/Users/macbook/Desktop/Nova-batch-20260921/private/confident-ai/independent-final-qa/`; generated images may be cleaned only after acceptance and remote recovery, while text/JSON evidence is retained.
