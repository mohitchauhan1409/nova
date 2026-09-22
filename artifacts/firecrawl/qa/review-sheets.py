from PIL import Image,ImageDraw
from pathlib import Path
import json
q=Path(__file__).resolve().parent;fs=json.loads((q/'frame-indices.json').read_text());s=json.loads((q/'session-immutable.json').read_text());cs=[x for x in s['actionSteps'] if x['kind']=='click'];a=1790057516342
for page in range((len(cs)+3)//4):
 out=Image.new('RGB',(1512,4*468),'white');d=ImageDraw.Draw(out)
 for row,c in enumerate(cs[page*4:page*4+4]):
  f=round((c['at']-a)*.03)
  for col,n in enumerate([f+4,f+30]):
   im=Image.open(q/'frames'/f'frame-{fs.index(n)+1:03d}.png').resize((756,444));out.paste(im,(col*756,row*468+24));d.text((col*756+4,row*468+4),f'click{page*4+row} raw{n} {n/30:.3f}s',fill='black')
 out.save(q/f'click-sheet-{page+1:02d}.jpg')
for i,p in enumerate(sorted(q.glob('banner-*.png'))):
 a=Image.open(p);dark=[y for y in range(14,150) if max(a.getpixel((200,y)))<100];print(465+i,dark[0] if dark else None)
