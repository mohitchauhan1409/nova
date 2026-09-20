# Window recording

Compile with `swiftc scripts/video/record-window.swift -o /tmp/nova-record-window`.
Run `list` to identify the intended Chrome window, then
`record WINDOW_ID OUTPUT.mov [SECONDS] [--masks PLAN.json]`.
Without seconds, Return ends the capture. Existing outputs are never overwritten.
Only the selected Chrome window is captured, with its cursor, at native resolution,
30 fps and no audio. Keep the Mac unlocked and the target visible while operating it.

An optional privacy plan applies opaque rectangles **before frames are encoded**:

```json
{
  "width": 3024,
  "height": 1776,
  "masks": [
    {"x": 20, "y": 1500, "width": 300, "height": 100, "color": "#f5f4f0"}
  ]
}
```

Coordinates are native pixels measured from the top-left of the captured window.
These example coordinates are not suitable for an actual recording without inspection.
The declared canvas must match exactly. A changed capture size fails closed: the
recorder does not write new unmasked frames and reports the failure on stop.
Inspect a short preflight at full resolution and check every planned page layout.
Mask account details only; preserve controls and outcome evidence. Customer-specific
plans, observations and media belong on the customer branch. Describe capture-time
redaction in the delivery notes; preserve the resulting source recording unchanged.

Keep browser security indicators enabled. Any editorial mask for a debugger banner
belongs in the edited copies, with source coordinates and timing recorded in the EDL.
Verify the source frame count, duration, resolution and frame rate with `ffprobe`.

# Frame-based editing and click effects

`python3 scripts/video/edit-recording.py SOURCE PLAN.json SILENT.mp4 CLICKS.mp4`
renders an inspected EDL, then muxes original synthesized click effects while
copying the silent video's encoded stream. It verifies frame counts and video
stream hashes and writes a text validation report beside the silent edit.
Existing deliverables are not overwritten. Temporary segments/audio are removed.

Plan fields: `fps`, `width`, `height`, `segments`, optional `masks` and `clicks`.
Each contiguous segment has integer `start_frame` (inclusive), `end_frame`
(exclusive), `output_frames`, a `reason` from visual inspection, and a `kind`:
`agent`, `operator-idle`, `operator-typing`, `reading` or `establishing`.
Only idle segments may be substantially compressed. Typing is limited to 1.2x;
agent work and reading retain every source frame at the source frame rate.
The first/last segment define the retained source range; document any boundary trim.

Masks use the same rectangle/color fields as the recorder and optionally a
source `start_frame`/`end_frame`. Clicks contain `source_frame`, `evidence`
(the observed click), and optional `strength` (0.5–1.2). Cues are mapped through
the EDL; do not infer clicks from every action or invent interaction sounds.
Effects are deterministic, original, and contain no keyboard noise or ambience.
The source-to-edited cue map, peak level and video-stream hash are in the report.

Validation performed with a moving 120-frame synthetic source: 30 normal frames,
60 compressed idle frames producing 30, then 30 typing frames producing 25.
Both exports contained 85 frames at 30 fps; a source-frame-45 click mapped to
1.25 seconds, peak 0.06449, and encoded video hashes matched after AAC muxing.
This checks the utility, not the correctness of any real recording's EDL.
