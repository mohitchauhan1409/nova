from pathlib import Path
import subprocess,json
from PIL import Image,ImageDraw
q=Path(__file__).resolve().parent;raw=q.parent/'media/nova-trigger-dev-original.mov'
ranges=[('operator-typing',15,1.6,10,(2260,1420,730,300)),('corrected-json',60.7,3,10,(140,480,1400,420)),('product-json',271,3,10,(140,480,1400,420)),('revision-json',422.1,3,10,(140,480,1400,420)),('card-scroll-1',161,11,2,(2260,330,730,1240)),('card-scroll-2',192,12,2,(2260,330,730,1240)),('card-scroll-3',217,7,2,(2260,330,730,1240)),('card-scroll-4',251,8,2,(2260,330,730,1240)),('output-scroll',530,4,5,(1220,450,1000,1150))]
(q/'focused-review-ranges.json').write_text(json.dumps(ranges,indent=2)+'\n')
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
