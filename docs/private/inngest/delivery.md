# Inngest Nova delivery

Status: complete and privately backed up on `inngest-nova`.

## Verified outcome

- Sent one local synthetic release event for `final-release-01`; `northstar-release-review` completed and both `validate-release` and `compose-summary` were verified.
- Sent one local synthetic risk event for `final-risk-01`; `northstar-risk-check` intentionally failed in `validate-risk` after one retry with `SYNTHETIC_RISK_REVIEW_FAILURE`.
- Neither function was rerun. No Production, credential, integration, deployment, billing, or external system was touched.

## Final media

| File | Duration | Frames | Streams | SHA-256 |
| --- | ---: | ---: | --- | --- |
| `media/inngest-original.mov` | 233.333333 s | 7,000 | H.264 video, 3024×1776, 30 fps | `d13ec47663cfb5f9105773b5d12a1ec9cb307342059215710c66198cce8e51f5` |
| `media/inngest-silent.mp4` | 191.666667 s | 5,750 | H.264 video only, 3024×1776, 30 fps | `a62ef78336408ff261c93285bd2fab3b0b60d6fef43f7a2f77cdbc0251f89d33` |
| `media/inngest-clicks.mp4` | 191.666667 s | 5,750 | identical H.264 video plus 48 kHz stereo AAC taps | `1ef1b9b4d45745a34b96d0366dfa8def71c343c021b76f471a29417acb7ecbe2` |

The edited variants share video-stream hash `58c7c2397f1d4bb3b659846899ad53e3ec01c06acebd2751850ee94c32c07630`. The click-only export contains 19 recorded/frame-inspected cues: 8 operator and 11 Nova. Decoded verification found 0.020834 ms maximum onset error, 0.999635 minimum tap correlation, and no audio outside cue windows.

## Editorial record

- Only the extended operator pause at the final risk-event confirmation was shortened; all Nova work, progressive input, retry timing, and evidence inspection remain at 30 fps.
- The original is preserved unchanged; no crop or privacy mask was needed.
- The source pointer was hidden and the themed Nova action cursor remains visible.
- The EDL, click cue data, source validation, audio verification, and decoded-audio report are included beside the exports.

## Verification

- `npm test -- --run`: 34 files, 486 tests passed.
- `npm run typecheck`: passed.
- recording-mode extension build: passed.
- final silent export: no audio stream.
- click-only export: AAC audio present, no ambience or keyboard noise, video stream identical to the silent export.
