"""Measure motion in an existing recording; never controls a browser."""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/bolna/founder-recording-v2/edit-v1'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = OUT.parent / 'nova-bolna-two-flows-raw.mp4'
W, H, FPS, END = 1008, 654, 10, 555
# Own Nova session receipts identify when the operator, rather than Nova, was active.
WINDOWS = [(0, 29.371), (39.219, 143.948), (208.171, 248.227),
           (258.228, 351.1), (437.756, 479.969), (505.853, 529.779)]
process = subprocess.Popen([
    'ffmpeg', '-v', 'error', '-i', str(SOURCE), '-t', str(END),
    '-vf', f'fps={FPS},scale={W}:{H}', '-pix_fmt', 'gray',
    '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
rows = []
previous = None
i = 0
while True:
    raw = process.stdout.read(W * H)
    if not raw:
        break
    if len(raw) != W * H:
        raise RuntimeError('Incomplete analysis frame')
    current = np.frombuffer(raw, dtype=np.uint8).reshape(H, W)
    if previous is not None:
        delta = np.abs(current.astype(np.int16) - previous.astype(np.int16))
        changed = delta > 16
        changed[:18] = False  # System menu strip, outside the web content.
        y, x = np.nonzero(changed)
        count = len(x)
        box = [int(x.min()), int(y.min()), int(x.max()), int(y.max())] if count else None
        # An insertion caret blinks even when the operator is idle.
        caret = bool(box and box[2] - box[0] <= 3 and box[3] - box[1] <= 18)
        rows.append({'t': i / FPS, 'pixels': count,
                     'motion': count >= 38, 'bbox': box, 'caret': caret})
    previous = current
    i += 1
    if i % 1000 == 0:
        print(f'Analyzed {i / FPS:.0f}s', flush=True)
assert process.wait() == 0
(OUT / 'motion.json').write_text(json.dumps(rows))
runs = []
for start, end in WINDOWS:
    pending = None
    for row in rows:
        t = row['t']
        if t < start or t >= end:
            continue
        if not row['motion']:
            if pending is None:
                pending = t
        else:
            if pending is not None and t - pending >= 2.5:
                runs.append([round(pending, 2), round(t, 2)])
            pending = None
    if pending is not None and end - pending >= 2.5:
        runs.append([round(pending, 2), round(end, 2)])
(OUT / 'idle-candidates.json').write_text(json.dumps(runs, indent=2))
print(json.dumps({'windows': WINDOWS, 'candidates': runs, 'frames': i}, indent=2))
