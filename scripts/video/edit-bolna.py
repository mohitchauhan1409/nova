"""Edit real Bolna screen footage. No browser control or synthetic website frames.
Usage: python edit-bolna.py edit.json
The edit decision list declares every cut, speed change, crop and focus point.
"""
import json, math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
cfg=json.loads(Path(sys.argv[1]).read_text()); out=Path(cfg['output']);out.parent.mkdir(parents=True,exist_ok=True)
W,H,FPS=1920,1080,30
fontdir=Path('/System/Library/Fonts/Supplemental')
def font(n,b=False):return ImageFont.truetype(str(fontdir/('Arial Bold.ttf' if b else 'Arial.ttf')),n)
fonts={n:font(n) for n in [18,20,22,24,26,30,36,44,64,88]}; bold={n:font(n,True) for n in [22,26,32,44,64,88]}
def ease(x):x=max(0,min(1,x));return x*x*(3-2*x)
def mix(a,b,t):return a+(b-a)*t
def mark(im,x,y,s,color=(179,164,255,255)):
 layer=Image.new('RGBA',(s*3,s*3));d=ImageDraw.Draw(layer);c=s*1.5
 for deg in (0,60,120):
  petal=Image.new('RGBA',layer.size);p=ImageDraw.Draw(petal);p.ellipse((c-s*.13,c-s*.49,c+s*.13,c+s*.49),fill=color);layer.alpha_composite(petal.rotate(deg,resample=Image.Resampling.BICUBIC))
 im.paste(layer,(int(x-s*1.5),int(y-s*1.5)),layer)
# Small gradient upscaled once, rather than per-frame pixel work.
bg=Image.new('RGB',(480,270));px=bg.load()
for y in range(270):
 for x in range(480):
  glow=math.exp(-(((x-375)/160)**2+((y-70)/140)**2));g2=math.exp(-(((x-55)/200)**2+((y-240)/140)**2))
  px[x,y]=(int(11+21*glow+6*g2),int(14+13*glow+9*g2),int(24+43*glow+20*g2))
bg=bg.resize((W,H),Image.Resampling.BICUBIC)
enc=subprocess.Popen(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
count=0; checks=[]
def send(im):
 global count
 enc.stdin.write(im.tobytes())
 if count%(FPS*5)==0:im.resize((768,432)).save(out.parent/f'qa-{count//FPS:03}.jpg')
 count+=1

def word(d,xy,s,f,c):d.text(xy,s,font=f,fill=c)
# Editorial opening, visibly separate from the recorded screen.
for i in range(90):
 t=i/FPS;im=bg.copy();d=ImageDraw.Draw(im);dy=round(28*(1-ease(t/.8)))
 mark(im,127,110,52);word(d,(168,86),'nova.',bold[44],'#f6f3ff');word(d,(99,231+dy),'BOLNA / REAL PRODUCT DEMO',fonts[22],'#b2a5f0')
 word(d,(94,304+dy),'One request.',bold[88],'#ffffff');word(d,(94,411+dy),cfg.get('title','A prepared campaign.'),bold[88],'#c8baff')
 word(d,(99,569+dy),cfg.get('subtitle','Watch Nova configure the real Bolna dashboard.'),fonts[30],'#b6bccd')
 for j,s in enumerate(['01  Describe the task','02  Nova takes action','03  Review the result']):word(d,(99+j*555,849),s,fonts[26],'#dadeed')
 d.line((99,793,1820*ease(t/1.2),793),fill='#5d538b',width=2)
 word(d,(99,990),'RECORDED SCREEN FOOTAGE  ·  NO SIMULATED WEBSITE',fonts[18],'#828b9e');send(im)
# Actual screen recording segments, with explicitly declared speed.
box=(183,150,1554,874);mask=Image.new('L',(box[2],box[3]));ImageDraw.Draw(mask).rounded_rectangle((0,0,box[2]-1,box[3]-1),24,fill=255)
for k,seg in enumerate(cfg['segments']):
 duration=(seg['end']-seg['start'])/seg.get('speed',1)
 crop=cfg['crop'];cw,ch=crop[2:]
 vf=f"trim=start={seg['start']}:end={seg['end']},setpts=(PTS-STARTPTS)/{seg.get('speed',1)},crop={cw}:{ch}:{crop[0]}:{crop[1]},fps={FPS},scale=1554:874"
 dec=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-i',cfg['source'],'-vf',vf,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
 n=0
 while True:
  raw=dec.stdout.read(1554*874*3)
  if len(raw)!=1554*874*3:break
  t=n/FPS;screen=Image.frombytes('RGB',(1554,874),raw)
  # Mask account identity on the original image before applying any transform.
  sd=ImageDraw.Draw(screen)
  for r in cfg.get('redactions',[]):sd.rounded_rectangle(tuple(int(v*(1554 if j%2==0 else 874)) for j,v in enumerate(r)),radius=9,fill='#202736')
  zoom=seg.get('zoom',1);z=1+(zoom-1)*ease(t/.9)*ease((duration-t)/.8)
  fx,fy=seg.get('focus',[.5,.5]);vw,vh=1554/z,874/z
  left=max(0,min(1554-vw,fx*1554-vw/2));top=max(0,min(874-vh,fy*874-vh/2))
  screen=screen.crop((left,top,left+vw,top+vh)).resize((1554,874),Image.Resampling.BICUBIC)
  im=bg.copy();d=ImageDraw.Draw(im);mark(im,109,75,34);word(d,(143,53),'nova.',bold[32],'#ffffff');word(d,(269,61),'ON BOLNA',fonts[20],'#aab3c9')
  label=f"{seg.get('speed',1):g}× PLAYBACK" if seg.get('speed',1)!=1 else 'REAL-TIME PLAYBACK'
  word(d,(1535,64),label,fonts[20],'#c8baff');word(d,(590,59),seg['caption'],fonts[26],'#eff0f8')
  d.rounded_rectangle((box[0]-2,box[1]-2,box[0]+box[2]+2,box[1]+box[3]+2),26,fill='#49506b');im.paste(screen,box[:2],mask)
  # Motion accent identifies the current editorial chapter, never changes UI.
  d=ImageDraw.Draw(im)
  if cfg.get('elapsed'):word(d,(70,1040),f"Actual Nova task: {cfg['elapsed']} seconds  ·  {cfg.get('scope','Campaign preparation only')}",fonts[18],'#9ca7bb')
  word(d,(1450,1040),'RECORDED ON BOLNA',fonts[18],'#9ca7bb');send(im);n+=1
 dec.stdout.close();dec.wait()
for i in range(120):
 im=bg.copy();d=ImageDraw.Draw(im);dy=round(20*(1-ease(i/25)));mark(im,129,109,52);word(d,(171,85),'nova.',bold[44],'#f6f3ff')
 word(d,(98,267+dy),cfg.get('outroTitle','Prepared. Ready for your review.'),bold[64],'#ffffff')
 for j,s in enumerate(cfg.get('checks',['Campaign named','Workflow selected','Version matched'])):
  y=420+j*97;d.ellipse((103,y+6,136,y+39),fill='#8070c3');word(d,(112,y+7),'✓',fonts[22],'white');word(d,(163,y),s,fonts[36],'#dddfea')
 word(d,(100,799),cfg.get('nextStep','Next step: select your contact file.'),fonts[30],'#bbabf4');word(d,(100,850),cfg.get('limit','No file uploaded. No campaign launched or scheduled.'),fonts[26],'#a5adc0')
 word(d,(100,992),'EDITING PREVIEW  /  REAL NOVA + BOLNA FOOTAGE',fonts[18],'#808ba1');send(im)
enc.stdin.close();assert enc.wait()==0
Path(str(out)+'.edit.json').write_text(json.dumps(cfg,indent=2));print(json.dumps({'output':str(out),'frames':count,'seconds':count/FPS}))
