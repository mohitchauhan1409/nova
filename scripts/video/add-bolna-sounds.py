"""Add original, synthesized interaction foley to an existing Bolna edit.

Requires Python + numpy and FFmpeg. Analyze the retained edit plan/session
receipts once, then render from the resulting cue sheet. Video is stream-copied.
Sounds are editorial effects, not microphone audio from the recording.
"""
import argparse
import json
import math
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'artifacts/bolna/founder-recording-v2'
VIDEO = BASE / 'edit-v2/nova-bolna.mp4'
OUTPUT = BASE / 'edit-v3/nova-bolna-with-sounds.mp4'
PLAN = BASE / 'edit-v2/edit-plan.json'
SESSION_DIR = ROOT / 'artifacts/bolna/chat-recording'
FPS = 30
SR = 48000
RECORDING_START_MS = 1789818647924


def mapping(plan):
    edits = sorted(plan['compressed_pauses'] + plan['compressed_typing'], key=lambda e: e['start_frame'])
    def mapped(seconds):
        f = seconds * FPS
        for e in edits:
            length = e['end_frame'] - e['start_frame']
            f -= min(max(seconds * FPS - e['start_frame'], 0), length) * (1 - e['output_frames'] / length)
        return f / FPS
    return mapped


def typing_changes(start, end):
    """Detect displayed text changes; reject a blinking, stationary caret.

    Only scan the known operator typing windows in the side panel. In particular,
    agent answer streaming, page animations, reading pauses and cursor travel
    outside these windows cannot create keyboard sounds.
    """
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', str(VIDEO), '-t', str(end-start),
           '-vf', 'crop=900:1800:2124:150,scale=450:900,format=gray',
           '-f', 'rawvideo', '-pix_fmt', 'gray', '-']
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    previous = None
    changes = []
    frame_number = 0
    while True:
        data = process.stdout.read(450*900)
        if not data:
            break
        if len(data) != 450*900:
            raise RuntimeError('Incomplete analysis frame')
        gray = np.frombuffer(data, np.uint8).reshape(900,450)[160:840,15:425].astype(np.int16)
        if previous is not None:
            diff = ((gray < 145) != (previous < 145)) & (np.abs(gray-previous) > 24)
            ys, xs = np.where(diff)
            # Cursor blink is a narrow vertical line. A new glyph or moved caret
            # changes multiple columns; very small compression noise is ignored.
            if len(xs) >= 7 and xs.max()-xs.min() >= 3 and len(np.unique(xs)) >= 3:
                changes.append((start+frame_number/FPS, int(len(xs))))
        previous = gray
        frame_number += 1
    if process.wait() != 0:
        raise RuntimeError('Video analysis failed')
    events = []
    for t, area in changes:
        if events and t-events[-1]['time'] < 0.064:
            events[-1]['pixels'] += area
        else:
            events.append({'time':round(max(start,t-0.018),5),'pixels':area})
    return events


def analyze(cue_path):
    plan = json.loads(PLAN.read_text())
    mapped = mapping(plan)
    events = []
    windows = []
    def add(t, kind, label, actor='operator', strength=1.0):
        if 0 <= t < plan['expected_seconds']:
            events.append({'time':round(t,5),'kind':kind,'label':label,'actor':actor,'strength':strength})
    for section in plan['compressed_typing']:
        a,b = mapped(section['source_start']),mapped(section['source_end'])
        detected = typing_changes(a,b)
        windows.append({'label':section['label'],'start':a,'end':b,'visible_text_changes':len(detected)})
        for event in detected:
            add(event['time'],'key',section['label'])
        add(a-0.25,'click','Focus '+section['label'],strength=0.83)
        print(f"{section['label']}: {len(detected)} visible text changes, {a:.2f}–{b:.2f}s",flush=True)

    # Operator interactions observed between the retained typing windows.
    add(3.78,'click','Open Nova')
    add(mapped(58.03),'click','Choose a custom agent name')
    add(mapped(287.6),'click','Choose calling workflow draft')
    sessions = [json.loads((SESSION_DIR/name).read_text()) for name in
                ['v2-agent-progress.json','v2-workflow-progress.json','v2-theme-progress.json','v2-recording-final.json']]
    session = sessions[-1]
    steps = {a['id']:a for s in sessions for a in s.get('actionSteps',[])}
    receipts = {t['id']:t for s in sessions for t in s['traces'] if t['kind']=='act'}
    for message in session['messages']:
        if message['role']=='user':
            source = (message['at']-RECORDING_START_MS)/1000
            if source < plan['source_end_seconds']:
                add(mapped(source)-0.025,'click','Continue / send')
    for step in steps.values():
        if step['status']!='verified':
            continue  # No foley for rejected or uncertain actions.
        source=(step['at']-RECORDING_START_MS)/1000
        if source >= plan['source_end_seconds']:
            continue
        matching = [t for t in receipts.values() if t['text']==step['title'] and 0<=t['at']-step['at']<2000]
        receipt=min(matching,key=lambda t:t['at']) if matching else None
        completed=((receipt['at']-RECORDING_START_MS)/1000 if receipt else source+0.135)
        at=mapped(completed)-0.028
        kind=step['kind']
        if kind in ['click','check','select']:
            add(at,'click','Observed page control','nova',0.76)
        elif kind in ['fill','search','type','paste']:
            add(mapped(source)+0.032,'click','Focus page field','nova',0.58)
            # Instant field replacement gets a short shortcut-like pair of taps,
            # never an invented long typing sequence.
            add(at-0.025,'key','Replace page text','nova',0.69)
            add(at+0.036,'key','Replace page text','nova',0.48)
        elif kind=='press':
            add(at,'key','Confirm field','nova',0.75)
    events.sort(key=lambda e:e['time'])
    cue_path.write_text(json.dumps({'duration':plan['expected_seconds'],'sample_rate':SR,
        'description':'Added interaction foley; no music, ambience or recorded microphone audio.',
        'typing_windows':windows,'events':events},indent=2)+'\n')


def band_noise(rng, n, low, high):
    noise=rng.normal(size=n)
    freq=np.fft.rfftfreq(n,1/SR)
    shape=(1-np.exp(-(freq/low)**3))*np.exp(-(freq/high)**4)
    value=np.fft.irfft(np.fft.rfft(noise)*shape,n)
    return value/max(np.std(value),1e-8)


def key_sound(rng, weight=1):
    n=int(SR*0.105);t=np.arange(n)/SR
    # Damped plastic switch/body resonances with soft, broadband contact noise.
    contact=band_noise(rng,n,650,6300)*np.exp(-t/rng.uniform(.0035,.006))
    body=band_noise(rng,n,120,1400)*np.exp(-t/.011)*.42
    resonance=sum(np.sin(2*np.pi*f*t+rng.uniform(0,.3))*np.exp(-t/.006)*a
                  for f,a in [(rng.uniform(280,430),.28),(rng.uniform(800,1350),.13)])
    x=(contact*.50+body+resonance)*(1-np.exp(-t/.0002))
    release=int(SR*rng.uniform(.034,.060))
    x[release:] += .18*band_noise(rng,n-release,900,6500)*np.exp(-np.arange(n-release)/SR/.003)
    x *= np.minimum(1,np.maximum(0,(.105-t)/.005))
    x /= max(np.max(np.abs(x)),1e-8)
    return x*rng.uniform(.10,.16)*weight


def click_sound(rng, weight=1):
    n=int(SR*.13);t=np.arange(n)/SR
    x=band_noise(rng,n,1050,8200)*np.exp(-t/.0025)*(1-np.exp(-t/.00008))
    x += .30*band_noise(rng,n,230,2600)*np.exp(-t/.006)
    release=int(SR*rng.uniform(.038,.060))
    tr=np.arange(n-release)/SR
    x[release:] += .68*band_noise(rng,n-release,1300,7000)*np.exp(-tr/.0018)*(1-np.exp(-tr/.00008))
    x /= max(np.max(np.abs(x)),1e-8)
    return x*rng.uniform(.12,.18)*weight


def render(cue_path, work):
    cues=json.loads(cue_path.read_text());rng=np.random.default_rng(2071)
    mix=np.zeros((round(cues['duration']*SR),2),dtype=np.float32)
    for event in cues['events']:
        sample=(key_sound if event['kind']=='key' else click_sound)(rng,event['strength'])
        pan=rng.uniform(-.10,.10)+(0.10 if event['actor']=='operator' else -.10)
        stereo=np.column_stack((sample*np.sqrt((1-pan)/2),sample*np.sqrt((1+pan)/2)))
        start=round(event['time']*SR);size=min(len(sample),len(mix)-start)
        mix[start:start+size]+=stereo[:size]
    # Keep short, quiet transients audible on laptop speakers without a noise bed.
    mix*=1.6
    peak=float(np.max(np.abs(mix)))
    if peak>.30:mix*=.30/peak
    wav=work/'interaction-foley.wav'
    with wave.open(str(wav),'wb') as out:
        out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR)
        out.writeframes((mix*32767).astype('<i2').tobytes())
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run(['ffmpeg','-y','-v','warning','-i',str(VIDEO),'-i',str(wav),
        '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k',
        '-ar',str(SR),'-t',str(cues['duration']),'-movflags','+faststart',str(OUTPUT)],check=True)
    def video_hash(path):
        return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:v:0',
            '-c','copy','-f','streamhash','-hash','sha256','-']).decode().strip()
    assert video_hash(VIDEO)==video_hash(OUTPUT),'Video stream changed'
    metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries',
        'format=duration:stream=codec_name,codec_type,width,height,nb_frames,sample_rate,channels',
        '-of','json',str(OUTPUT)]))
    assert len(metadata['streams'])==2
    assert abs(float(metadata['format']['duration'])-cues['duration'])<.04
    assert metadata['streams'][0]['nb_frames']=='11964'
    assert not np.any(np.abs(mix)>=1)
    report={'output':str(OUTPUT),'video_stream_identical':True,
        'audio_peak_dbfs':round(20*math.log10(float(np.max(np.abs(mix)))),2),
        'key_events':sum(e['kind']=='key' for e in cues['events']),
        'click_events':sum(e['kind']=='click' for e in cues['events']),'metadata':metadata}
    (OUTPUT.parent/'sound-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2),flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work',type=Path,required=True)
    parser.add_argument('--source',type=Path,required=True)
    parser.add_argument('--output',type=Path,default=OUTPUT)
    parser.add_argument('--cues',type=Path,default=ROOT/'scripts/video/bolna-sound-cues.json')
    parser.add_argument('--analyze',action='store_true')
    parser.add_argument('--render',action='store_true')
    args=parser.parse_args();args.work.mkdir(parents=True,exist_ok=True)
    VIDEO=args.source.resolve();OUTPUT=args.output.resolve()
    if VIDEO==OUTPUT:raise ValueError('Use a separate output file to preserve the source.')
    cues=args.cues;cues.parent.mkdir(parents=True,exist_ok=True)
    if args.analyze:analyze(cues)
    if args.render:render(cues,args.work)
