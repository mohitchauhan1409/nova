# Requesty Nova delivery

Status: complete and privately backed up on `requesty-nova`.

## Verified outcome

- Created and reopened `nova-demo-triage-fallback-final-01` with exact OpenAI Global `gpt-5.6-luna` primary, `gpt-5.4-mini` fallback, and one attempt each.
- Created and reopened `nova-demo-triage-prompt-final-01` with the final synthetic-only SYSTEM schema `severity`, `summary`, and `owner_queue`. The optional Model search returned no exact policy match, so Model remained unset.
- Closing Overview showed 0 requests, 0 tokens, `$0.00` spend, and `$0.00` balance. No inference, Playground run, credential, billing, credit, external communication, or unrelated record change occurred.

## Final media

| File | Duration | Frames | Streams | SHA-256 |
| --- | ---: | ---: | --- | --- |
| `media/requesty-original.mov` | 469.133333 s | 14,074 | H.264 video, 3024×1776, 30 fps | `775165cb26b3b8ff7f0d3328a3f9e745f131d1361fd267536775c99be5c21146` |
| `media/requesty-silent.mp4` | 469.133333 s | 14,074 | H.264 video only, 3024×1776, 30 fps | `e8a35a63c9877bbfe19fa0c1ea1ea10e173cb3af6a6b1f8cb3704b08c1ea6816` |
| `media/requesty-clicks.mp4` | 469.133333 s | 14,074 | identical H.264 video plus 48 kHz stereo AAC taps | `491b1f57b9ebd290dcb4460d0f405aaae6f51a4193ce23a3e81cdca3b2f0b6d3` |

The edited variants share video-stream hash `d5694c30f9f8bd47bbffae02cb21fb3f0eef3ee2e42e3db852c891c8c8308c26`. The click-only export contains 36 recorded/frame-inspected cues: 10 operator and 26 Nova. Decoded verification found 0.020834 ms maximum onset error, 0.999629 minimum tap correlation, and no audio outside cue windows.

## Editorial record

- The full successful take remains at real speed; visual inspection found no prolonged operator-idle interval suitable for compression.
- The original is preserved unchanged; no crop or privacy mask was needed.
- The source pointer was hidden and the themed Nova action cursor remains visible.
- The EDL, click receipt map, click cues, source validation, audio verification, and decoded-audio report are included beside the exports.

## Verification

- `npm test -- --run`: 34 files, 474 tests passed.
- `npm run typecheck`: passed.
- recording-mode extension build: passed.
- final silent export: no audio stream.
- click-only export: AAC audio present, no ambience or keyboard noise, video stream identical to the silent export.
