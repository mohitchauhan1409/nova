from pathlib import Path
from PIL import Image
import json,subprocess,numpy as np
q=Path(__file__).resolve().parent;rawfs=json.loads((q/'frame-indices.json').read_text());rs=json.loads((q/'reviewed-clicks.json').read_text());pairs=[{'id':r['id'],'source_frame':r['source_frame']+d,'output_frame':r['source_frame']+d,'raw_image':f'frames/frame-{rawfs.index(r["source_frame"]+d)+1:03d}.png'} for r in rs for d in [0,4,30]]
(q/'export-frame-pairs.json').write_text(json.dumps(pairs,indent=2)+'\n');fs=sorted({0,30,20445,*range(153,166),*[p['output_frame']for p in pairs]})
def expr(a):
 if len(a)==1:return f'eq(n,{a[0]})'
 k=len(a)//2;return '('+expr(a[:k])+'+'+expr(a[k:])+')'
f=q/'decoded-final-frames';f.mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(q.parent/'media/nova-firecrawl-clicks.mp4'),'-vf',"select='"+expr(fs)+"',scale=1512:888",'-fps_mode','vfr',str(f/'frame-%03d.png')],check=True)
(q/'decoded-final-frame-indices.json').write_text(json.dumps(fs));reports=[]
for p in pairs:
 a=np.asarray(Image.open(q/p['raw_image']),dtype=np.int16);b=np.asarray(Image.open(f/f'frame-{fs.index(p["output_frame"])+1:03d}.png'),dtype=np.int16);d=np.abs(a-b);d[85:146,6:1119]=0
 reports.append({**p,'mean_absolute_rgb_error':float(d.mean()),'p99_absolute_rgb_error':float(np.quantile(d,.99))})
r={'compared_action_and_response_frames':len(reports),'maximum_mean_absolute_rgb_error':max(x['mean_absolute_rgb_error']for x in reports),'maximum_p99_absolute_rgb_error':max(x['p99_absolute_rgb_error']for x in reports),'comparison_exclusion':'Only measured stable debugger row plus2scaledpixels codec-edge allowance; all action frames follow completed sidebar opening.','frames':reports};(q/'decoded-frame-comparison.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items()if k!='frames'}))
