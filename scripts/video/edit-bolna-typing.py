"""Apply a modest 1.2x pace only to the operator's message/card typing.

Reuse the approved idle edits, banner mask, and source 9:15 endpoint. Render
from the original recording to avoid another generation of video compression.
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'artifacts/bolna/founder-recording-v2'
DIR = BASE / 'edit-v2'
DIR.mkdir(exist_ok=True)
plan = json.loads((BASE / 'edit-v1/edit-plan.json').read_text())
source = Path(plan['source'])
output = DIR / 'nova-bolna-edited-v2.mp4'
FPS = 30
# Reviewed against frame changes in the original recording. These begin after
# the cursor reaches the field and finish before it moves to the next control.
spans = [
    ('Initial request', 10.6, 23.3),
    ('Agent name', 62.2, 71.1),
    ('Agent purpose', 78.4, 93.0),
    ('Business facts', 97.2, 115.4),
    ('Desired outcome', 119.1, 140.9),
    ('Workflow request', 227.2, 244.6),
    ('Workflow name', 276.9, 282.3),
    ('Workflow steps', 295.5, 319.6),
    ('Required input', 324.7, 327.4),
    ('Rename steps request', 459.0, 478.4),
    ('Account information request', 510.5, 527.6),
]
typing = []
for label, start, end in spans:
    a, b = round(start * FPS), round(end * FPS)
    kept = round((b-a) / 1.2)
    typing.append({'label':label, 'start_frame':a, 'end_frame':b,
                   'source_start':a/FPS, 'source_end':b/FPS,
                   'output_frames':kept, 'speed':(b-a)/kept})
all_edits = sorted(plan['compressed_pauses'] + typing,
                   key=lambda i:i['start_frame'])
for previous, following in zip(all_edits, all_edits[1:]):
    assert previous['end_frame'] <= following['start_frame']
removed = sum(i['end_frame']-i['start_frame']-i['output_frames'] for i in all_edits)
typing_removed = sum(i['end_frame']-i['start_frame']-i['output_frames'] for i in typing)
terms = []
for i in all_edits:
    a,b,k=i['start_frame'],i['end_frame'],i['output_frames']
    length=b-a
    terms.append(f'min(max(N-{a},0),{length})*{length-k}/{length}')
pts = '(N-' + '-'.join(terms) + ')/(30*TB)'
end_frame = plan['source_end_seconds'] * FPS
mask = plan['mask']
vf=(f'trim=end_frame={end_frame},'
    f'drawbox=x={mask["x"]}:y={mask["y"]}:w={mask["width"]}:h={mask["height"]}'
    f":color=white:t=fill:enable='gte(n,{mask['source_start_frame']})',"
    f"setpts='{pts}',fps=30:round=near,format=yuv420p")
plan.update({'output':str(output), 'compressed_typing':typing,
             'typing_target_speed':1.2, 'typing_seconds_removed':typing_removed/FPS,
             'expected_frames':end_frame-removed,
             'expected_seconds':(end_frame-removed)/FPS,
             'unchanged':'Previous idle compression, banner mask, and 9:15 source cutoff are retained. Cursor travel, clicks, scrolling, and Nova execution remain at their prior speeds.'})
(DIR/'edit-plan.json').write_text(json.dumps(plan,indent=2))
(DIR/'filter.txt').write_text(vf)
print(json.dumps({'typing_sections':len(typing),
                   'expected_seconds':plan['expected_seconds'],
                   'additional_seconds_saved':typing_removed/FPS}),flush=True)
command=['ffmpeg','-y','-hide_banner','-loglevel','warning','-i',str(source),
         '-an','-vf',vf,'-c:v','h264_videotoolbox','-b:v','14M',
         '-maxrate','20M','-bufsize','40M','-pix_fmt','yuv420p','-r','30',
         '-video_track_timescale','30000','-movflags','+faststart',
         '-progress',str(DIR/'render-progress.txt'),str(output)]
with (DIR/'render.log').open('w') as log:
    subprocess.run(command,stderr=log,check=True)
print('Render complete',flush=True)
