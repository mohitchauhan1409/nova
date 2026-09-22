# Interfaze final recording — media QA

Status: local final media accepted with documented visible recovery and cursor-label limitations. This report covers this one final take, not batch completion, two rehearsals or remote recovery.

## Source and visible outcomes

Untouched native original: `../media/nova-interfaze-original.mov`. Recorder first-frame epoch1790049469029 ms. 3024×1776,30fps,23970frames,799.000s. Opening: one Interfaze tab, Nova closed, no debugging row, normal empty native Playground with previous requests accessible through Logs. It is not a populated chat opening.

Actual captured sequence: single-word `damage`; clarification/Help me choose; selected Category + summary and Continue submission; temperature0 and required category/summary schema; CD-104 cracked-mug result and status200 log; revised required boolean escalate policy; CD-105 nine-day delivery result with escalate:true and status200; CD-106 exactly-seven-day delivery result with escalate:false and status200. Closing answer correctly explains the >7-day rule and says temperature0 does not guarantee accuracy. A real Nova scroll ultimately exposes complete saved Output at the end.

The take preserves important limitations and recoveries: the third schema field initially falls below the viewport, repeated stale-target rejection stalls progress, and a visible operator prompt asks Nova to scroll and finish. Nova requests confirmation before the ordinary synthetic CD-105 Send; the operator confirms. Logs fails to fetch and is revisited without rerunning the model. CD-106 briefly shows Failed to fetch, and Nova initially opens the stale CD-105 log before returning and finding the actual CD-106 record. These intervals remain at1×; none is masked, removed or sped up.

## Visual acceptance

All50 actual click positions and response states reviewed in17 `click-sheet-*.png` sheets and indexed adjacent raw frames (review scratch later removed). Fourteen operator clicks reconcile one-to-one with their ledger duplicates;36 Nova mouse events link to actual action records. Operator Confirm and subsequent Nova Send are separate clicks0.138s apart, not duplicates. Keyboard submissions, value selection and scrolls receive no invented taps.

Actual individual-character typing inspected at10Hz: operator9.0–10.3s and Nova27.0–28.3s. Three reading-scroll intervals inspected at4Hz show steady small native movement, selected-card readability and Continue reveal. No synthetic interpolation or speedup. The Nova arrow/ring/label remains black; no second operator/system pointer observed in the reviewed frames. The action label sometimes overlaps adjacent controls and may be clipped by the viewport; those real visual limitations remain. This is sampled visual review, not a claim of inspecting every raw frame for pointer absence.

Ending reviewed at2Hz around781–787s and the final frame: the actual log dialog scroll exposes summary,category:delivery,escalate:false. The complete saved Output holds through the finish.

## Exact edit

Full native canvas, no crop. Only the debugging row is masked, measured from this take. Native RGB249,248,255 (`#f9f8ff`), x16,y174,width2218. Exclusive-end source intervals and heights: [757,758)10px;[758,759)48px;[759,760)80px;[760,761)112px;[761,23970)114px. The close icon is included. Dynamic height follows insertion without covering product content. Evidence: `banner-sheet.png`, native `banner/frame-*.png` and `native-mask-sample.png`.

Only six static prolonged operator waits are compressed. Their boundaries/midpoints were inspected (`idle-sheet-01.png`…`06.png`), with no action, typing, scrolling or active Nova work, and at least5s of preceding/following reading/action guards preserved. Source64–76s becomes3s;228–244s becomes4s;502–518s awaiting confirmation becomes4s;680–697s becomes4s;724–733s becomes3s;751–768s becomes4s. All actions, agent work, retries, loading, card selection, typing and scrolling remain1×. No hidden recovery edits.

Resulting plan:22020frames,734.000s (12m14s);65s shorter than13m19s raw. See `edit-plan.json` and exact fraction mapping in `mapping-v1/source-to-edited-map.json`. Every receipt preserves dispatch epoch, actor, target, source frame and actual response evidence.

## Reproducibility and decoded validation

Strict source/EDL receipt validation passed for50cues. `prepare-final-media.py` records plan/provenance; original `recorder.log`, `operator-ledger.json`, `click-session-provenance.json`, `reviewed-clicks.json` and `deduplication.json` are retained. Approved sound renderer is the established48kHz stereo seed2071/gain1.6 pipeline. The editor legacy-click list is empty, and its temporary empty-sound file is not a deliverable.

Silent and approved-click exports completed and both retain native3024×1776,30fps,22020frames/734.000s. Encoded video streams are identical (SHA256 `c680672ed4e605c62a96a4777f64f9842dd55b921f1027e862c9c9ac8bfdf23f`). Independent decoded audio verification checks all50taps: maximum onset error0.1041667ms, comfortably within33.333ms/oneframe; minimum tap correlation0.9994548361; quiet peak0; decoded peak0.2170882 (no clipping). No keyboard, voice, music or scroll sound added.

All100 mapped click/response frames were decoded and compared to their corresponding raw frames, excluding only the debugging strip for comparison. Maximum mean absolute RGB error0.11775 on the0–255scale; maximum99th-percentile error2.0, consistent with encoding. This confirms the reviewed visible action/response states survived the edit and exact cue mapping. Key decoded sheets, native mask-insertion frames, opening and end were visually inspected. Every insertion frame masks the debugger text, Cancel and close icon without leaking or covering product evidence (`decoded-banner-sheet.png`). Final decoded frame shows the actual complete saved Output and a clean hold.

Exact file hashes and native metadata are in `media-manifest.json`. Original SHA256 was rechecked after export and matches the renderer's original hash. The empty legacy-sound scratch file was removed. No remote upload/recovery performed by this media QA task.

## SHA-256

- `nova-interfaze-original.mov`: `9bf857a9364f16e4ec1fc7952fbaef7b8f6a503d3e9ded301c0694bc0aedc8a5` (128796011 bytes)
- `nova-interfaze-silent.mp4`: `75b85be238d21ed6d48675d04917c8af8755d5274babf9b9b229c661e1e9bdcc` (33104782 bytes)
- `nova-interfaze-clicks.mp4`: `a5b3115e9a4d29188222145aa07c3e21a7265bf8c42b32cda2f4f385f4a16983` (33994352 bytes)

## Cleanup and evidence regeneration

At the coordinator’s request, all task-only inspection PNGs/contact sheets and empty scratch folders were removed after completed QA. Screenshot filenames above identify the inspected evidence, not files still present. Source-frame indices, exact mapping, per-click response observations, native original, extraction/comparison scripts, JSON results and this report remain. `check-decoded-frames.py` regenerates decoded comparisons when supplied raw frame extractions described by `final-frame-indices.json`; inspection does not require any live browser. No unresolved visual defect needs retained scratch images. Only the three primary movies remain in `media/`; all validation text is under `qa/`. No files are in use by a renderer or decoder.
