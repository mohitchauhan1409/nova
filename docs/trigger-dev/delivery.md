# Trigger.dev delivery

The original and both edited exports are accepted with disclosed limitations. Three real Development runs were independently reopened after capture and their saved payloads, Completed status and output verified. The take retains three actual approvals, a declined redundant replay proposal, fetch-error recovery and a scroll-verification false negative followed by the correct visible readback. It is not an uninterrupted or approval-free demonstration.

## Primary files

All paths are repository-relative. Each movie is stored with Git LFS.

| File | Duration | Frames | Bytes | SHA-256 |
| --- | --- | --- | --- | --- |
| `artifacts/trigger-dev/media/nova-trigger-dev-original.mov` | 582.666667 s | 17,480 | 129,245,723 | `91291323571689815caf603339b25b43d2ad4faea40eb4115addd24d250d33f9` |
| `artifacts/trigger-dev/media/nova-trigger-dev-silent.mp4` | 567.666667 s | 17,030 | 30,247,644 | `089833a418dcf24dd60b88168c3c76340f44943bbeda9b9067eb9226679fdd12` |
| `artifacts/trigger-dev/media/nova-trigger-dev-clicks.mp4` | 567.666667 s | 17,030 | 30,924,910 | `7c03e4f79ed3d06a567cb689d0c4ee62cdeef075e2e28b59a37ab348021aaf93` |

All are H.264, 3024×1776, 30 fps. Original and silent have no audio stream. The clicks export adds only the approved seed-2071 stereo mechanical tap at 48 kHz: 34 genuine dispatches, 17 operator and 17 Nova. No typing, scroll, music or voice sounds were invented. Silent and click versions share identical encoded video SHA-256 `a9b525a72ed7e27fadacfb9b3d7d7a907eb26e65ecbd0c1edfbabd7641736c3b`.

Only the measured browser debugging row is covered. No crop/scale or product-content mask is applied. All execution, typing, scrolling, clarification, reading and recovery remain 1×. The sole speed change compresses static source 376–396 seconds to 5 seconds. Genuine cursor easing may lag dispatch; its label can clip at the viewport edge. These are disclosed in the QA report.

## Evidence and checks

- `final-capture.md`: actual eight typed prompts, clarification choices, run IDs and genuine recoveries. `script.md` is the planning script, explicitly distinguished from the captured sequence.
- `synthetic-objects.json`: manual baseline, separate Nova rehearsal/final objects and independent persistence reports.
- `artifacts/trigger-dev/qa/session-immutable.json`, `operator-ledger.json`, `recorder.log`: frozen source receipts, including session `09b9d208-c1cf-468f-8397-e64797f31e62` and first frame `1790053236706`.
- `media-QA.md`, `independent-review.md`: actual-source/final media acceptance and limitations. All 34 dispatch and response states plus focused ranges were reviewed; independent review sampled decoded states rather than claiming exhaustive frame review.
- `delivery-check.json`: fresh hashes/sizes/ffprobe metadata, accepted versus regenerated cue-map equality, and fresh decoded audio check. All 34 taps pass; maximum onset error 0.020833 ms, minimum correlation 0.9994137 and quiet peak 0. Nearest-frame mapping from dispatch epochs is within 16.667 ms.
- `decoded-frame-comparison.json`: 68 source/export click/response comparisons outside the measured debugging row; maximum mean RGB error 0.171181/255 and p99 3/255.
- `EXPORT-WORKFLOW.md`, EDL, cue maps and Python helpers reproduce the exports/checks. Regenerate scratch image extracts from the unchanged original when needed. Temporary images and legacy scratch movie were removed after QA.

## Reproduce the captured runtime

Frozen source/frontend: `c1db2d16de27cd42b0b5f3490288ea70417edccf`; shared main checkpoint `1b2062b`. Delivery-only commits do not change the recorded build. In an isolated checkout of that source, use Node ≥20.19 and `npm ci`; build with `NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build`. Configure the backend using `.env.example` and privately supplied credentials, then `npm start` (default port 8787). Load that checkout's `web/dist-extension` in the authorized browser and complete normal pairing/host permission. Do not replace another active recording's backend or extension.

From `examples/trigger-dev`, `npm ci --ignore-scripts`, normal Trigger CLI login, then `npm run dev` starts the pinned Development worker. It targets `proj_futnuhorkbwfxqmsvsgv` and registers only the inspected synthetic `harbor-order-summary` task. Stay in organization `nova-56d7`, project `nova-YcS4`, Development. No production deployment is needed. The deterministic fixtures and expected totals are described in `scenario.md`; use normal dashboard controls for any new runs and record new IDs instead of representing saved old output as a new execution. Credentials and backend runtime data are not included in the archive.

## Backup

Target: `https://github.com/mohitchauhan1409/nova.git`, branch `trigger-dev-nova`. Independent fresh-clone recovery **passed** for artifact commit `83c131ee58d078040b5f42ace2c20d77b3a4f5ab`. All three complete movies were downloaded from GitHub into a previously absent isolated LFS store, checked out and independently hashed. All hashes and sizes match; LFS object/pointer integrity checks passed. The measured receipt is `remote-recovery.json`. The later receipt-only commit preserves the media unchanged.
