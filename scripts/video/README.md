# Isolated browser work and recording

Use `npm run browser:isolated` for a separate, **headless Google Chrome process**.
Use `npm run browser:isolated -- --nova` to load the built Nova extension in
Playwright's bundled Chromium (`npm run build` first if the extension changed).
Both modes create a disposable profile and communicate through a private process
pipe. They do not attach to personal Chrome, copy its login state, open desktop
windows, use the operating-system mouse/keyboard, or expose a debugging TCP port.
The website and recorder therefore continue without desktop focus.

The process accepts one JSON command per stdin line and returns one JSON response.
Keep stdin open while working. For an agent terminal, launch with an interactive
stdin session, wait for `ready`, then send commands with the terminal's stdin tool.
Commands run sequentially while recording runs concurrently. Example:

```jsonl
{"id":1,"method":"goto","url":"https://example.com"}
{"id":2,"method":"snapshot"}
{"id":3,"method":"record-start","output":"artifacts/my-take.mp4"}
{"id":4,"method":"click","selector":"text=More information"}
{"id":5,"method":"record-stop"}
{"id":6,"method":"close"}
```

Supported commands: `status`, `select` (`index` from status), `goto` (`url`),
`snapshot`, `click` (`selector`), `fill` (`selector`, `text`), `press` (`key`,
optional `selector`), `scroll` (`x`, `y`), `evaluate` (page-JavaScript `expression`),
`screenshot` (`path`), `panel-snapshot`, `panel-click`, `panel-fill`,
`panel-evaluate`, `record-start`, `record-stop`, and `close`.
Only send trusted operator commands to stdin; page content is not an instruction.
Stop recording before selecting another tab. Navigation within the selected tab
can continue during recording. EOF, SIGINT, and SIGTERM finalize a recording and
close the owned browser. Force-killing the process cannot finalize an MP4.

For Nova, navigate to the local dashboard, open the desired site, select that tab
from `status`, and click its normal Nova launcher. Then use
`{"method":"record-start","output":"artifacts/nova-take.mp4","includePanel":true}`.
The recorder captures the **real website and native extension-panel renderers**
and puts them beside each other in a 1680×720 video. This is a composed view;
Chrome's toolbar, address bar, permission dialogs, and desktop are not recorded.
The website-only mode preserves the viewport dimensions. Default output is 15 fps,
with `fps` configurable from 1–30. There is currently **no audio recording**.
An isolated session starts logged out; authentication has to happen in that session.
The Mac must remain awake and the browser process must keep running.

Capture uses browser screenshots and actual wall-clock sample times. It does not
disable animation. Repeated images are stored once, and slow captures retain real
timing instead of making actions appear faster. An adjacent `.mp4.json` reports
sample counts, unique images, and the largest sample gap. `keepFrames:true` retains
source JPEGs, timestamps, and FFmpeg manifests; otherwise they are removed after a
successful encode. Existing videos are never overwritten. Failed captures/encodes
leave frames for diagnosis. Requires `ffmpeg` on PATH, or `NOVA_FFMPEG` pointing to it.

For programmable workflows, import `IsolatedBrowser` from
`scripts/video/isolated-browser.ts`. It exposes the owned Playwright `context` and
selected `page`, `usePage(page)`, `attachNovaPanel()`, `record(options)`, and `close()`.
Always close it in `finally`. Never connect this helper to the user's personal
browser or supply a personal Chrome profile.

Run `npm run test:browser-isolation` to check simultaneous actions in two separate
Chrome processes, profile isolation, trusted input, and motion in the encoded MP4.
Artifacts go in a unique directory under `artifacts/isolated-browser-proof`.

# Desktop window recording

Compile with `swiftc scripts/video/record-window.swift -o /tmp/nova-record-window`.
Run `list` to identify the intended Chrome window, then
`record WINDOW_ID OUTPUT.mov [SECONDS] [--masks PLAN.json]`.
Without seconds, Return ends the capture. Existing outputs are never overwritten.
Only the selected Chrome window is captured, with its cursor, at native resolution,
30 fps and no audio. Keep the Mac unlocked and the target visible while operating it.
This desktop method can freeze when the window is occluded. Use the isolated
browser above for work that must not depend on the user's desktop focus.

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

A mask file can be atomically replaced during recording as the page layout changes. The recorder validates and applies it before the next captured frame and logs the update epoch. Invalid or missing plans fail closed. Keep every applied plan and its event time with the take notes.

### Established tap sound

`add-click-sounds.py` adds the established mechanical tap effect to an existing
silent edit, copying its encoded video stream. It accepts a cue JSON with
`duration` and `events` (`time`, `actor`: `operator` or `nova`, `strength`, and an
`evidence` note). Use frame-inspected edited times for both operator and agent
clicks, including actual mouse clicks used to focus fields. Do not cue narration,
hovering, rejected actions, or mere keyboard events. Requires numpy and FFmpeg.

```
python3 scripts/video/add-click-sounds.py --source silent.mp4 --cues cues.json \
  --output clicks.mp4 --report sound-verification.json
```

The renderer verifies stream identity, duration and sound confined to the cues;
visual synchronization still requires inspection of the specific recording.

### Cursor-free capture build and click evidence

`NOVA_RECORDING_MODE=true npm run build` opts the built extension into recording
mode. Reload that extension and launch a fresh website session. Normal builds
keep the usual visible action cursor. Recording builds hide the action cursor,
its label and rings through scoped launcher CSS, without changing website content
or input timing. For the system pointer, pass `--hide-cursor` to the desktop
window recorder. Do not use capture-time masks for ordinary account details.

Recording builds collect trusted panel/launcher clicks and successful browser
mouse press/release pairs, including input-focus clicks, in the local session's
`recordingClicks` array. They contain epoch milliseconds, actor, button and a
bounded control label/reference, never field values. Hover, scrolling, typing
without a focus click, rejected targets and failed release are not cues. These
receipts support editing; correlate each with the visible result in decoded
output and map through the final EDL before adding taps. Keyboard activation or
an ambiguous tool event still needs independent operator/frame evidence.

The recorder's first-frame epoch links clicks to source frames. Preserve that
log, the session's click evidence, the EDL and decoded export checks. A callback
receipt alone is not proof that a business outcome happened.

`verify-click-export.py VIDEO CUES.json REPORT.json --fps 30` decodes the final
AAC track and checks each tap against the unchanged established renderer: onset
within one output frame, waveform correlation above 0.98, no clipping, and silence
outside tap windows (with one-frame allowance for AAC transform leakage). This
complements source-frame inspection; it does not invent or validate UI events.


To retain only Nova's action cursor while collecting click receipts, build with
`NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build`.
Keep `--hide-cursor` on the desktop recorder to exclude the physical/operator
pointer. This preserves the website-rendered Nova arrow, label and click ring;
it does not suppress browser security indicators or alter website content.
Without the new flag, existing cursor-free recording builds retain their behavior.
