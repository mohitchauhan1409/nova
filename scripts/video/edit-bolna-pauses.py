"""Compress reviewed idle time only, white-mask the banner, and trim at source 9:15.

The original recording remains untouched. All non-idle frames keep their 30 fps
timing. No browser control, synthetic UI, zoom, soundtrack, or replacement text.
"""
import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / 'artifacts/bolna/founder-recording-v2/edit-v1'
SOURCE = DIR.parent / 'nova-bolna-two-flows-raw.mp4'
OUTPUT = DIR / 'nova-bolna-edited.mp4'
FPS, END = 30, 555
candidates = json.loads((DIR / 'idle-candidates.json').read_text())
intervals = []
for a, b in candidates:
    if a < 3:
        continue  # Keep the short establishing shot before opening Nova.
    start = math.ceil((a + .4) * FPS)
    end = math.floor((b - .4) * FPS)
    kept = 24  # 0.8 seconds, in addition to the untouched boundary guards.
    assert end - start > kept
    intervals.append({'start_frame': start, 'end_frame': end,
                      'output_frames': kept, 'source_start': start/FPS,
                      'source_end': end/FPS, 'speed': (end-start)/kept})

removed = sum(i['end_frame']-i['start_frame']-i['output_frames'] for i in intervals)
expected = END * FPS - removed
terms = []
for i in intervals:
    a,b,k=i['start_frame'],i['end_frame'],i['output_frames']
    length=b-a
    terms.append(f'min(max(N-{a},0),{length})*{length-k}/{length}')
pts = '(N-' + '-'.join(terms) + ')/(30*TB)'
# The native banner first appears on source frame 4480 (149.333 seconds).
# Apply the rectangle before changing timestamps so its timing stays exact.
vf = (f'trim=end_frame={END*FPS},'
      "drawbox=x=16:y=80:w=2090:h=122:color=white:t=fill:enable='gte(n,4480)',"
      f"setpts='{pts}',fps=30:round=near,format=yuv420p")
(DIR / 'filter.txt').write_text(vf)
plan = {'source':str(SOURCE),'output':str(OUTPUT),'source_end_seconds':END,
        'fps':FPS,'resolution':[3024,1964], 'expected_frames':expected,
        'expected_seconds':expected/FPS,'idle_seconds_removed':removed/FPS,
        'compressed_pauses':intervals,
        'mask':{'x':16,'y':80,'width':2090,'height':122,'color':'white',
                'source_start_frame':4480},
        'unchanged':'All cursor movement, typing, scrolling, clicks, and Nova task execution retain 1x speed.'}
(DIR / 'edit-plan.json').write_text(json.dumps(plan,indent=2))
print(json.dumps({'output':str(OUTPUT),'pauses':len(intervals),
                  'expected_seconds':expected/FPS,'removed_seconds':removed/FPS}),flush=True)
command=['ffmpeg','-y','-hide_banner','-loglevel','warning','-i',str(SOURCE),
         '-an','-vf',vf,
         '-c:v','h264_videotoolbox','-b:v','14M','-maxrate','20M','-bufsize','40M',
         '-pix_fmt','yuv420p','-r','30','-video_track_timescale','30000',
         '-movflags','+faststart','-progress',str(DIR/'render-progress.txt'),str(OUTPUT)]
with (DIR/'render.log').open('w') as log:
    subprocess.run(command,stderr=log,check=True)
print('Render complete',flush=True)
