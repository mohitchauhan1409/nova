"""Stream-copy a video and add click-only foley from frame-verified cue times.

Uses Nova's established damped mechanical tap effect. Requires numpy and FFmpeg.
Cue JSON: duration, events [{time, actor, strength, evidence}].
"""
import argparse
import hashlib
import json
import math
import subprocess
import tempfile
import wave
from pathlib import Path
import numpy as np
SR = 48000

def band_noise(rng, n, low, high):
    noise=rng.normal(size=n)
    freq=np.fft.rfftfreq(n,1/SR)
    shape=(1-np.exp(-(freq/low)**3))*np.exp(-(freq/high)**4)
    value=np.fft.irfft(np.fft.rfft(noise)*shape,n)
    return value/max(np.std(value),1e-8)


def click_sound(rng, weight=1):
    n=int(SR*.13);t=np.arange(n)/SR
    x=band_noise(rng,n,1050,8200)*np.exp(-t/.0025)*(1-np.exp(-t/.00008))
    x += .30*band_noise(rng,n,230,2600)*np.exp(-t/.006)
    release=int(SR*rng.uniform(.038,.060))
    tr=np.arange(n-release)/SR
    x[release:] += .68*band_noise(rng,n-release,1300,7000)*np.exp(-tr/.0018)*(1-np.exp(-tr/.00008))
    x /= max(np.max(np.abs(x)),1e-8)
    return x*rng.uniform(.12,.18)*weight


def render(source, cue_path, output, report_path):
    assert source.resolve() != output.resolve() and not output.exists()
    cues = json.loads(cue_path.read_text())
    duration = cues['duration']
    rng = np.random.default_rng(2071)
    mix = np.zeros((round(duration * SR), 2), dtype=np.float32)
    permitted = np.zeros(len(mix), dtype=bool)
    for event in cues['events']:
        assert event.get('evidence') and 0 <= event['time'] < duration
        assert event['actor'] in ('operator', 'nova')
        assert .5 <= event.get('strength', 1) <= 1.2
        sample = click_sound(rng, event.get('strength', 1))
        pan = rng.uniform(-.10, .10) + (.10 if event['actor'] == 'operator' else -.10)
        stereo = np.column_stack((sample * np.sqrt((1-pan)/2), sample * np.sqrt((1+pan)/2)))
        start = round(event['time'] * SR)
        size = min(len(sample), len(mix)-start)
        mix[start:start+size] += stereo[:size]
        permitted[start:start+size] = True
    mix *= 1.6
    peak = float(np.max(np.abs(mix)))
    if peak > .30:
        mix *= .30/peak
    assert not np.any(mix[~permitted]) and not np.any(np.abs(mix) >= 1)
    with tempfile.TemporaryDirectory(prefix='nova-clicks-') as work:
        wav = Path(work)/'clicks.wav'
        with wave.open(str(wav), 'wb') as out:
            out.setnchannels(2); out.setsampwidth(2); out.setframerate(SR)
            out.writeframes((mix*32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-i', str(wav),
            '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
            '-ar', str(SR), '-t', str(duration), '-movflags', '+faststart', str(output)], check=True)
    def video_hash(path):
        return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:v:0',
            '-c','copy','-f','streamhash','-hash','sha256','-'], text=True).strip()
    before, after = video_hash(source), video_hash(output)
    assert before == after, 'Video stream changed'
    metadata = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries',
        'format=duration:stream=codec_name,codec_type,width,height,nb_frames,sample_rate,channels',
        '-of','json',str(output)]))
    assert len(metadata['streams']) == 2 and abs(float(metadata['format']['duration'])-duration) < .04
    report = {'video_stream_identical': True, 'video_stream_hash': after, 'sound_mode': 'clicks-only',
        'effect': 'Nova established mechanical tap; 48 kHz stereo; seed 2071',
        'audio_peak_dbfs': round(20*math.log10(float(np.max(np.abs(mix)))), 2),
        'click_events': len(cues['events']), 'operator_clicks': sum(e['actor']=='operator' for e in cues['events']),
        'nova_clicks': sum(e['actor']=='nova' for e in cues['events']), 'metadata': metadata,
        'output_sha256': hashlib.file_digest(output.open('rb'), 'sha256').hexdigest()}
    report_path.write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('source', 'cues', 'output', 'report'):
        parser.add_argument('--'+name, type=Path, required=True)
    args = parser.parse_args()
    render(args.source, args.cues, args.output, args.report)
