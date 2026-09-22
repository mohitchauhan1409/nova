"""Render a frame-accurate visual EDL. Source and existing deliverables are never modified."""
import argparse, hashlib, json, math, subprocess, tempfile
from pathlib import Path

def run(*args): return subprocess.check_output([str(a) for a in args], text=True).strip()
def probe(path):
    return json.loads(run('ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,nb_frames,duration','-of','json',path))['streams'][0]
def validate(plan,info):
    fps=plan['fps']; num,den=map(int,info['r_frame_rate'].split('/'))
    assert num/den==fps and (plan['width'],plan['height'])==(info['width'],info['height'])
    previous=None
    for s in plan['segments']:
        a,b,n=(s[k] for k in ('start_frame','end_frame','output_frames'))
        assert all(type(v) is int for v in (a,b,n)) and 0<=a<b<=int(info['nb_frames']) and 0<n<=b-a
        assert previous is None or a==previous; previous=b
        assert s['kind'] in ('agent','operator-idle','operator-typing','reading','establishing','ui-scroll') and s.get('reason')
        if s['kind']=='operator-typing': assert (b-a)/n<=1.2+1e-6
        elif s['kind']=='ui-scroll': assert (b-a)/n<=1.5+1e-6
        elif s['kind']!='operator-idle': assert n==b-a

def render(source,plan,output):
    info=probe(source); validate(plan,info); assert not output.exists() and source.resolve()!=output.resolve()
    fps=plan['fps']; frames=sum(s['output_frames'] for s in plan['segments'])
    with tempfile.TemporaryDirectory(prefix='nova-clicks-v2-') as td:
        root=Path(td); parts=[]
        for i,s in enumerate(plan['segments']):
            a,b,n=(s[k] for k in ('start_frame','end_frame','output_frames')); ratio=n/(b-a)
            filters=[f'trim=end_frame={b-a}','setpts=PTS-STARTPTS',f'setpts={ratio:.12f}*PTS',f'fps={fps}','tpad=stop_mode=clone:stop_duration=1',f'trim=end_frame={n}']
            for mask in plan.get('masks',[]):
                start=max(0,math.ceil((mask.get('start_frame',a)-a)*ratio-1e-7)); end=min(n,math.ceil((mask.get('end_frame',b)-a)*ratio-1e-7))
                if end>start: filters.append(f"drawbox=x={mask['x']}:y={mask['y']}:w={mask['width']}:h={mask['height']}:color=0x{mask['color'][1:]}:t=fill:enable='gte(n,{start})*lt(n,{end})'")
            if crop:=plan.get('crop'): filters.append(f"crop={crop['width']}:{crop['height']}:{crop['x']}:{crop['y']}")
            part=root/f'{i:04d}.mp4'
            run('ffmpeg','-v','error','-ss',f'{a/fps:.9f}','-i',source,'-an','-vf',','.join(filters),'-frames:v',n,'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-video_track_timescale',fps*1000,part)
            assert int(probe(part)['nb_frames'])==n; parts.append(part)
        concat=root/'concat.txt'; concat.write_text(''.join(f"file '{p.as_posix()}'\n" for p in parts))
        output.parent.mkdir(parents=True,exist_ok=True)
        run('ffmpeg','-v','error','-f','concat','-safe','0','-i',concat,'-c','copy','-movflags','+faststart',output)
    assert int(probe(output)['nb_frames'])==frames
    report={'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'frames':frames,'seconds':frames/fps}
    output.with_suffix('.validation.json').write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps(report))

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('source',type=Path); p.add_argument('plan',type=Path); p.add_argument('output',type=Path); a=p.parse_args()
    render(a.source,json.loads(a.plan.read_text()),a.output)
