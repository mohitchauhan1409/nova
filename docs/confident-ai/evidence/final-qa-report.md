# Confident AI media delivery

**Local export and independent acceptance passed.** All three media also passed fresh independent remote LFS recovery and full-file checksum comparison at commit `98ed06a79d180de3cacb3b25ceca99e9ab8e6109`; see [remote backup verification](remote-backup-verification.json). Exactly three primary recordings are in `artifacts/confident-ai/media`:

| File | Duration | Frames | Bytes |
| --- | ---: | ---: | ---: |
| nova-confident-ai-original.mov | 564.066667 s | 16,922 | 165,225,828 |
| nova-confident-ai-silent.mp4 | 528.000 s | 15,840 | 54,468,446 |
| nova-confident-ai-clicks.mp4 | 528.000 s | 15,840 | 55,125,561 |

All retain native 3024×1776 at 30 fps. The raw is unchanged. The MP4s have identical encoded video; silent has no audio. The click export uses the exact approved mechanical renderer (48 kHz stereo, seed 2071), with 42 receipt-backed taps: 32 Nova and 10 operator. Decoded audio has zero signal outside guarded tap windows, peak 0.216386 without clipping, maximum onset error 0.020833 ms and minimum reference correlation 0.999455. Actual receipt-to-frame quantization is separately bounded by one half-frame. All 42 cues agree with 132 source exports and independent audit.

All Nova execution and typing stay at 1×. The complete 128.001-second case task, repeated column-selector attempts, honest saved-tag visibility limitation and the user’s “Leave the columns as they are...” redirect remain. Only four settled operator waits were shortened; source retained through 560s leaves 8.506s after the final Preview answer. There is no splice that makes the partial verification appear uninterrupted or faster.

The actual debugger row is covered including its animated entry and X; no other product cover or crop is used. Source and encoded receipt frames retain the real white Nova arrow, solid action label and ring/focus cursor. No second pointer was observed in reviewed frames. This is bounded visual inspection, not an exhaustive every-pixel claim. The independently decoded last frame shows saved Northstar Returns Adviser in Preview at commit 5fb11cb and Nova’s Preview confirmation. The coordinator separately reopened and verified saved tags, 8 goldens and prompt history after recording.

Captured backend: 94debcde941dcb30de7e3b89aebf26f963b109d9. Extension source: b7e31723147e0b79d5e181796e7e2edaa82702b9; ZIP SHA256: 28e1152748e9f193067e8f2abf8296b4551d73bd0e142e5438a3edd567249e96. Keep these captured identities separate from later branch delivery commits.

Exact file hashes and metrics: [final-qa-report.json](final-qa-report.json). Reproduction: [render-final.py](render-final.py), [EDL](final-edit-plan.json), [full cue ledger](final-click-ledger.json), [mapped cues](final-click-cues.json), [renderer provenance](final-renderer-provenance.json). [Independent acceptance](independent-final-acceptance.md) found no blocker. No render/decoder jobs remain active.
