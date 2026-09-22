from pathlib import Path
from PIL import Image, ImageDraw
import json,subprocess,numpy as np
q=Path(__file__).resolve().parent;root=q.parent
pairs=json.loads((q/'export-frame-pairs.json').read_text())
fs=sorted({0,30,22019,*range(747,765),*[p['output_frame'] for p in pairs]})
def expr(a):
 if len(a)==1:return f'eq(n,{a[0]})'
 n=len(a)//2;return '('+expr(a[:n])+'+'+expr(a[n:])+')'
folder=q/'decoded-final-frames';folder.mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(root/'media/nova-interfaze-clicks.mp4'),'-vf',"select='"+expr(fs)+"',scale=1512:888",'-fps_mode','vfr',str(folder/'frame-%03d.png')],check=True)
(q/'decoded-final-frame-indices.json').write_text(json.dumps(fs))
reports=[]
for p in pairs:
 src=np.asarray(Image.open(q/p['raw_image']).convert('RGB'),dtype=np.int16)
 dst=np.asarray(Image.open(folder/f'frame-{fs.index(p["output_frame"])+1:03d}.png').convert('RGB'),dtype=np.int16)
 # Ignore only the measured debugging-row region plus two scaled pixels for codec boundary ringing.
 delta=np.abs(src-dst); delta[85:146,6:1119]=0
 reports.append({**p,'mean_absolute_rgb_error':float(delta.mean()),'p99_absolute_rgb_error':float(np.quantile(delta,.99))})
result={'compared_click_and_response_frames':len(reports),'maximum_mean_absolute_rgb_error':max(x['mean_absolute_rgb_error'] for x in reports),'maximum_p99_absolute_rgb_error':max(x['p99_absolute_rgb_error'] for x in reports),'mask_excluded_comparison_only':'x6..1118,y85..145 at1512x888 (source-measured debugger region plus2scaled-pixel codec-boundary allowance; output mask itself remains exact)','frames':reports}
(q/'decoded-frame-comparison.json').write_text(json.dumps(result,indent=2)+'\n')
for start in range(0,50,3):
 out=Image.new('RGB',(1512,3*468),'white');d=ImageDraw.Draw(out)
 for row,ci in enumerate(range(start,min(start+3,50))):
  for col,p in enumerate(pairs[ci*2:ci*2+2]):
   im=Image.open(folder/f'frame-{fs.index(p["output_frame"])+1:03d}.png').resize((756,444));out.paste(im,(col*756,row*468+24));d.text((col*756+4,row*468+4),f'{p["id"]} source{p["source_frame"]} -> output{p["output_frame"]}',fill='black')
 out.save(q/f'decoded-click-sheet-{start//3+1:02d}.png')
print(json.dumps({k:v for k,v in result.items() if k!='frames'},indent=2))
