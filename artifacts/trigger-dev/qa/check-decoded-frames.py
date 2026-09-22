from pathlib import Path
from PIL import Image
import json,subprocess,numpy as np
q=Path(__file__).resolve().parent;root=q.parent
receipts=json.loads((q/'reviewed-clicks.json').read_text());rawfs=json.loads((q/'frame-indices.json').read_text())
pairs=[]
for r in receipts:
 for d in (0,30):
  n=r['source_frame']+d
  pairs.append({'id':r['id'],'source_frame':n,'output_frame':n if n<11280 else n-450,'raw_image':f'frames/frame-{rawfs.index(n)+1:03d}.png'})
(q/'export-frame-pairs.json').write_text(json.dumps(pairs,indent=2)+'\n')
fs=sorted({0,30,17029,*range(761,770),*[p['output_frame'] for p in pairs]})
def expr(a):
 if len(a)==1:return f'eq(n,{a[0]})'
 m=len(a)//2;return '('+expr(a[:m])+'+'+expr(a[m:])+')'
folder=q/'decoded-final-frames';folder.mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(root/'media/nova-trigger-dev-clicks.mp4'),'-vf',"select='"+expr(fs)+"',scale=1512:888",'-fps_mode','vfr',str(folder/'frame-%03d.png')],check=True)
(q/'decoded-final-frame-indices.json').write_text(json.dumps(fs))
reports=[]
for p in pairs:
 src=np.asarray(Image.open(q/p['raw_image']).convert('RGB'),dtype=np.int16);dst=np.asarray(Image.open(folder/f'frame-{fs.index(p["output_frame"])+1:03d}.png').convert('RGB'),dtype=np.int16)
 delta=np.abs(src-dst);delta[85:146,6:1119]=0
 reports.append({**p,'mean_absolute_rgb_error':float(delta.mean()),'p99_absolute_rgb_error':float(np.quantile(delta,.99))})
result={'compared_click_and_response_frames':len(reports),'maximum_mean_absolute_rgb_error':max(x['mean_absolute_rgb_error'] for x in reports),'maximum_p99_absolute_rgb_error':max(x['p99_absolute_rgb_error'] for x in reports),'comparison_exclusion':'Measured debugger row plus2scaledpixels for codec ringing; actual output mask exact.','frames':reports}
(q/'decoded-frame-comparison.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='frames'}))
