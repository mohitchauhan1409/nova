# Onyx Nova delivery

Status: complete and privately backed up on `onyx-nova`.

## Verified outcome

- Created and reopened private project `Northstar Launch Review (Synthetic) [Nova Final 01]`.
- Saved the synthetic-only instructions and uploaded only `onyx-synthetic-launch-brief.md`.
- Left project chat unused.
- Created and reopened private Agent `Northstar Rehearsal Guide (Synthetic) [Nova Final 01]`.
- Verified `No Knowledge`, `No Actions`, and overwrite-system-prompts off.
- No external action, web access, live message, credential, billing, security, or production change was used.

## Final media

| File | Duration | Frames | Streams | SHA-256 |
| --- | ---: | ---: | --- | --- |
| `media/onyx-original.mov` | 393.966667 s | 11,819 | H.264 video, 3024×1776, 30 fps | `e9f9269573452a5177812501a68ddcb4c4da1e932dea139eadaf1c051e02ab3e` |
| `media/onyx-silent.mp4` | 339.566667 s | 10,187 | H.264 video only, 3024×1776, 30 fps | `656ea05fc7bbe62be3f0dff4de5f425f5efa13119f11b6997cb576a4824f6c73` |
| `media/onyx-clicks.mp4` | 339.566667 s | 10,187 | identical H.264 video plus 48 kHz stereo AAC taps | `e67f58e6592181920f5822024a6e1b9185ccf0710054e4654fa4ec22b87e5e1e` |

The edited variants share video-stream hash `3769ef82e24f92adb911e402e427d18092798e0fda751b2765e98c4a7d1a34e3`. The click-only export contains 21 recorded/frame-inspected cues: 11 operator and 10 Nova. Decoded verification found 0.020834 ms maximum onset error and 0.999570 minimum tap correlation.

## Editorial record

- Idle operator review holds were shortened with a frame-based EDL; Agent work, typing, reading, and visible outcomes remain at 30 fps.
- The original is preserved unchanged.
- Edited copies mask only the unrelated signed-in sidebar label and owner emails visible in Agent cards/details.
- The source pointer was hidden; the purple Nova action cursor remains visible.
- `media/onyx-edit-plan.json`, cue data, and the silent/audio verification reports are included beside the exports.

## Verification

- `npm test`: 34 files, 476 tests passed.
- `npm run typecheck`: passed.
- recording-mode extension build: passed.
- final silent export: no audio stream.
- click-only export: AAC audio present, no ambience or keyboard noise, video stream identical to the silent export.
