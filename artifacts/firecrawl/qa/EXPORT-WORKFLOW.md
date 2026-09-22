# Reproduce the Firecrawl export

Run from this QA directory using Python with NumPy and Pillow, plus ffmpeg/ffprobe. Use fresh output paths; existing final media must not be overwritten. The original is the immutable source. The full frame EDL preserves all 20,446 frames at 1×.

```sh
python3 prepare-receipts.py
python3 validate-receipts.py --source ../media/nova-firecrawl-original.mov --recorder-log recorder.log --plan edit-plan.json --receipts reviewed-clicks.json --output-dir mapping-reproduced
python3 edit-recording.py ../media/nova-firecrawl-original.mov edit-plan.json /tmp/firecrawl-reproduced-silent.mp4 /tmp/firecrawl-discard-empty-audio.mp4
python3 add-click-sounds.py --source /tmp/firecrawl-reproduced-silent.mp4 --cues mapping-reproduced/final-cues.json --output /tmp/firecrawl-reproduced-clicks.mp4 --report /tmp/firecrawl-sound-report.json
python3 verify-click-export.py /tmp/firecrawl-reproduced-clicks.mp4 mapping-reproduced/final-cues.json /tmp/firecrawl-decoded-audio.json
```

The legacy editor creates an unused empty-sound intermediate because edit-plan.json deliberately has no legacy clicks. Discard that intermediate; only add-click-sounds.py supplies the approved cue audio. The retained silent-validation.json is the editor's initial validation output, subsequently moved out of the primary media directory.

Frame sampling: frame-indices.json lists zero-based raw frames, emitted in sorted order as frames/frame-001.png onward at 1512×888 for review. decoded-final-frame-indices.json similarly maps decoded-final-frames/frame-001.png onward. Use ffmpeg select by exact frame number, scale=1512:888 and -fps_mode vfr; a balanced expression tree avoids parser-depth limits. review-sheets.py combines raw samples; check-decoded-frames.py compares the recorded source/output frame pairs. These extracted images were removed only after completed visual review. Full movies stay at native resolution; no review resize affects delivery.

The mask is measured from this exact take, including its opening animation. Do not reuse it blindly on another take. Sound timing uses action-start receipts, not trusted mouse-dispatch timestamps; see provenance-limits.json and media-QA.md. A numerically precise cue mapping does not remove that source limitation.
