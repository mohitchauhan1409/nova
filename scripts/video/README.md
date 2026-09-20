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
