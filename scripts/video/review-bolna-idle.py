"""Build an auditable first/last-frame review for candidate stationary pauses."""
import concurrent.futures
import json
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/bolna/founder-recording-v2/edit-v1'
SOURCE = OUT.parent / 'nova-bolna-two-flows-raw.mp4'
runs = json.loads((OUT / 'idle-candidates.json').read_text())
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 20)
def frame(job):
    i, label, t = job
    path = OUT / f'idle-{i:02}-{label}.png'
    subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t),'-i',str(SOURCE),
                    '-frames:v','1',str(path)], check=True)
    return path
jobs = [(i, label, t) for i,(a,b) in enumerate(runs)
        for label,t in [('first',a+.35),('last',b-.35)]]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(frame,jobs))
checks=[]
for page in range((len(runs)+3)//4):
    sheet=Image.new('RGB',(1360,1210),'#e8ebf0')
    draw=ImageDraw.Draw(sheet)
    for j in range(4):
        i=page*4+j
        if i>=len(runs):break
        a,b=runs[i]
        first=Image.open(OUT/f'idle-{i:02}-first.png')
        last=Image.open(OUT/f'idle-{i:02}-last.png')
        ar=np.asarray(first.resize((1008,654))).astype(np.int16)
        br=np.asarray(last.resize((1008,654))).astype(np.int16)
        d=np.max(np.abs(ar-br),axis=2)>20
        count=int(d[18:].sum())
        checks.append({'index':i,'start':a,'end':b,'endpoint_difference_pixels':count})
        # Preserve the whole page thumbnail plus a larger crop of the operator's panel.
        x,y=(j%2)*680,(j//2)*600
        draw.text((x+10,y+6),f'{i+1}. {a:.2f}s–{b:.2f}s | changed pixels: {count}',font=font,fill='#172032')
        for k,im in enumerate([first,last]):
            panel=im.crop((2110,350,3024,1964)).resize((320,565))
            sheet.paste(panel,(x+10+k*332,y+33))
    sheet.save(OUT/f'idle-review-{page+1}.jpg',quality=92)
(OUT/'idle-review.json').write_text(json.dumps(checks,indent=2))
print(json.dumps(checks,indent=2))
