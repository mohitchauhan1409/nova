"""Check timing, masks, endpoint and matching content against the original film."""
import concurrent.futures
import json
import math
import subprocess
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[2]
DIR=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'artifacts/bolna/founder-recording-v2/edit-v1'
PLAN=json.loads((DIR/'edit-plan.json').read_text())
OUT=Path(PLAN['output'])
SOURCE=Path(PLAN['source'])
QA=DIR/'qa'
QA.mkdir(exist_ok=True)
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries',
    'format=duration:stream=codec_name,width,height,avg_frame_rate,nb_frames',
    '-of','json',str(OUT)]))
video=meta['streams'][0]
assert len(meta['streams'])==1
assert [video['width'],video['height']]==PLAN['resolution']
assert video['avg_frame_rate']=='30/1'
assert int(video['nb_frames'])==PLAN['expected_frames'], meta
assert abs(float(meta['format']['duration'])-PLAN['expected_seconds'])<.04

def mapped_frame(n):
    removed=0
    for i in PLAN['compressed_pauses']+PLAN.get('compressed_typing',[]):
        a,b,k=i['start_frame'],i['end_frame'],i['output_frames']
        if a<=n<b:
            if i in PLAN['compressed_pauses']:
                raise ValueError('The QA sample must be outside a compressed idle interval')
            removed+=(n-a)*(b-a-k)/(b-a)
        if n>=b:removed+=b-a-k
    return round(n-removed)

TIMES=[0,2.9,10.8,15,29.6,37.8,62.4,69,78.4,90.5,99.5,130.5,
       149.2,149.5,150,180,204,229,257,278,302,360,400,436,
       460,499,512,535,554.9666667]
TIMES=sorted(set(TIMES+[i['source_end']+.2 for i in PLAN.get('compressed_typing',[])]))
def extract(source,n,path):
    subprocess.run(['ffmpeg','-y','-v','error','-ss',f'{n/30:.9f}',
       '-i',str(source),'-frames:v','1',str(path)],check=True)
jobs=[]
for index,t in enumerate(TIMES):
    n=round(t*30)
    output_n=mapped_frame(n)
    jobs.extend([(SOURCE,n,QA/f'{index:02}-source.png'),
                 (OUT,output_n,QA/f'{index:02}-edited.png')])
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(lambda j:extract(*j),jobs))

checks=[]
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',23)
for page in range(math.ceil(len(TIMES)/6)):
    sheet=Image.new('RGB',(1512,1581),'#e7ebf0')
    draw=ImageDraw.Draw(sheet)
    for j in range(6):
        idx=page*6+j
        if idx>=len(TIMES):break
        t=TIMES[idx];n=round(t*30)
        a=np.asarray(Image.open(QA/f'{idx:02}-source.png')).astype(np.float32)
        edited=Image.open(QA/f'{idx:02}-edited.png')
        b=np.asarray(edited).astype(np.float32)
        valid=np.ones(a.shape[:2],bool)
        mask_mean=None
        if n>=PLAN['mask']['source_start_frame']:
            valid[80:202,16:2106]=False
            mask_mean=float(b[86:196,22:2100].mean())
            assert mask_mean>=252,(idx,mask_mean)
        mse=float(((a-b)**2)[valid].mean())
        psnr=10*math.log10(255**2/max(mse,1e-8))
        assert psnr>33,(idx,t,psnr)
        checks.append({'source_time':n/30,'edited_time':mapped_frame(n)/30,
                       'psnr_outside_mask':round(psnr,2),
                       'white_mask_mean':mask_mean})
        x,y=j%2*756,j//2*527
        label=f'Source {n/30:.2f}s → edit {mapped_frame(n)/30:.2f}s'
        draw.text((x+10,y+6),label,font=font,fill='#172032')
        sheet.paste(edited.resize((756,491)),(x,y+34))
    sheet.save(QA/f'contact-{page+1}.jpg',quality=92)
report={'metadata':meta,'checks':checks,'passed':True,
        'final_source_frame':round(TIMES[-1]*30),
        'last_frame_corresponds_to_original_9_15_cutoff':True}
(DIR/'verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'passed':True,'frames':video['nb_frames'],
                  'duration':meta['format']['duration'],
                  'compared_samples':len(checks),
                  'minimum_psnr':min(x['psnr_outside_mask'] for x in checks)}))
