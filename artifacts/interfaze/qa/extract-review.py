from pathlib import Path
import subprocess,json,sys
from PIL import Image,ImageDraw
q=Path(__file__).resolve().parent;fs=json.loads((q/'frame-indices.json').read_text());r=json.loads((q/'reviewed-clicks.json').read_text());out=q/'frames';out.mkdir(exist_ok=True)
def expr(a):
 if len(a)==1:return f'eq(n,{a[0]})'
 m=len(a)//2;return '('+expr(a[:m])+'+'+expr(a[m:])+')'
subprocess.run(['ffmpeg','-v','error','-threads','2','-i',sys.argv[1],'-vf',"select='"+expr(fs)+"',scale=1512:888",'-fps_mode','vfr',str(out/'frame-%03d.png')],check=True)
def picture(n):return Image.open(out/f'frame-{fs.index(n)+1:03d}.png').convert('RGB')
def sheet(name,entries):
 canvas=Image.new('RGB',(1512,468*((len(entries)+1)//2)),'white');draw=ImageDraw.Draw(canvas)
 for i,(n,label) in enumerate(entries):
  x=(i%2)*756;y=(i//2)*468;canvas.paste(picture(n).resize((756,444)),(x,y+24));draw.text((x,y),f'{label} raw{n} {n/30:.3f}s',fill='black')
 canvas.save(q/name,quality=92)
for i in range(0,len(r),3):
 entries=[]
 for c in r[i:i+3]:
  for d in [0,30]:entries.append((c['source_frame']+d,f'{c["id"]} {c["actor"]}'))
 sheet(f'click-sheet-{i//3+1:02d}.jpg',entries)
sheet('extra.jpg',[(n,'review') for n in [0,240,250,253,270,6600,6750,6870,13950,14040,14354]])
sheet('banner-sheet.jpg',[(n,'banner') for n in range(712,739)])
print('Extracted',len(fs),'source reviewframes and15clicksheets')
