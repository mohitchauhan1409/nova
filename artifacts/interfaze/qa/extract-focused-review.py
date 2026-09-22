from pathlib import Path
import subprocess,json,sys
from PIL import Image,ImageDraw
q=Path(__file__).resolve().parent;raw=Path(sys.argv[1])
ranges=[('operator-typing',8.6,1.6,10,(2270,1390,720,320)),('nova-prompt-typing',24.3,2,10,(360,1450,930,260)),('nova-policy-typing',113.8,2,10,(1320,480,860,350)),('settings-scroll',152,4,4,(1310,300,890,1430)),('output-scroll',462,6,4,(340,310,1720,1410))]
if len(sys.argv)>2 and sys.argv[2]=='edited':
 ranges=[('decoded-'+name,start if start<220 else start-6,duration,fps,crop) for name,start,duration,fps,crop in ranges]
(q/('decoded-focused-review-ranges.json' if len(sys.argv)>2 else 'focused-review-ranges.json')).write_text(json.dumps(ranges,indent=2)+'\n')
for name,start,duration,fps,crop in ranges:
 folder=q/name;folder.mkdir(exist_ok=True);x,y,w,h=crop
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(start),'-i',str(raw),'-t',str(duration),'-vf',f'fps={fps},crop={w}:{h}:{x}:{y}','-fps_mode','vfr',str(folder/'f-%03d.png')],check=True)
 files=sorted(folder.glob('*.png'));thumbw=500;thumbh=round(h/w*thumbw)
 for page in range((len(files)+11)//12):
  out=Image.new('RGB',(thumbw*3,(thumbh+24)*4),'white');d=ImageDraw.Draw(out)
  for i,p in enumerate(files[page*12:page*12+12]):
   a=Image.open(p).resize((thumbw,thumbh));cx=i%3*thumbw;cy=i//3*(thumbh+24);out.paste(a,(cx,cy+24));d.text((cx,cy),f'{name} t~{start+(page*12+i)/fps:.2f}s',fill='black')
  out.save(q/f'{name}-sheet-{page+1:02d}.jpg')
print('Focused actual character and native scrolling review frames extracted.')
