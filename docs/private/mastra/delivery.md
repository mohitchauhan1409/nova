# Mastra Nova delivery

Status: complete and privately backed up on `mastra-nova`.

## Verified outcome

- Ran `northstar-release-review` once with `synthetic: true`, `releaseId: mastra-release-final-01`, and `ownerQueue: release-review` after exact-input confirmation.
- Verified `validate-release` and `compose-summary` completed in 2 ms each. The deterministic output was `decision: ready-for-review` and `externalActions: 0`.
- Ran `northstar-risk-check` once with `synthetic: true`, `reviewId: mastra-risk-final-01`, and `mode: fail` after exact-input confirmation.
- Verified the intended 7 ms fixture failure `SYNTHETIC_RISK_REVIEW_FAILURE:mastra-risk-final-01` and did not retry.
- Everything remained at `localhost:4111`; no model inference, credential, cloud telemetry, repository connection, deployment, external action, production data, or spend occurred.

## Final media

| File | Duration | Frames | Streams | SHA-256 |
| --- | ---: | ---: | --- | --- |
| `media/mastra-original.mov` | 231.000000 s | 6,930 | H.264 video, 3024×1776, 30 fps | `d2bb93102aef8c6472c055df8709f532dc70112c63498ec1688e4283338463d4` |
| `media/mastra-silent.mp4` | 231.000000 s | 6,930 | H.264 video only, 3024×1776, 30 fps | `9e953cd8a36f387b4df932eb2e5b19877b0f97bdb7e871bcc071576122f25ec2` |
| `media/mastra-clicks.mp4` | 231.000000 s | 6,930 | identical H.264 video plus 48 kHz stereo AAC taps | `9555f65f1dacb2ae85110443dd81a3c2e9867fe45095562be735ed2cdf7f3dfe` |

The edited variants share video-stream hash `06bd4070b66989294093c2a89618d45f34ef5abc4b3dd51352c7f669f7951eef`. The click-only export contains 18 recorded/frame-inspected cues: 9 operator and 9 Nova. Decoded verification found 0.020834 ms maximum onset error, 0.999651 minimum tap correlation, and no audio outside cue windows.

## Editorial record

- The full successful take remains at real speed; visual inspection found no prolonged operator-idle interval suitable for compression.
- The original is preserved unchanged; no crop or privacy mask was needed.
- The system pointer was hidden and the themed Nova action cursor remains visible.
- The EDL, session receipt map, click cues, source validation, audio verification, and decoded-audio report are included beside the exports.

## Verification

- fixture `npm run build`: passed.
- Nova `npm test -- --run`: 34 files, 474 tests passed.
- Nova `npm run typecheck`: passed.
- recording-mode extension build: passed.
- final silent export: no audio stream.
- click-only export: AAC audio present, no ambience or keyboard noise, and video stream identical to the silent export.
