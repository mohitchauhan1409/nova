"""Render an explicit frame EDL and original click-only effects. No UI automation.

python3 scripts/video/edit-recording.py SOURCE PLAN.json SILENT.mp4 CLICKS.mp4
The source is never modified. See README.md for the plan schema.
"""
import argparse
import array
import hashlib
import json
import math
from pathlib import Path
import random
import subprocess
import tempfile
import wave


def run(*args):
    return subprocess.check_output([str(a) for a in args], text=True).strip()


def probe(path):
    return json.loads(run('ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,r_frame_rate,nb_frames,duration', '-of', 'json', path))['streams'][0]


def validate(plan, info):
    fps = plan['fps']
    numerator, denominator = map(int, info['r_frame_rate'].split('/'))
    assert fps > 0 and numerator / denominator == fps, 'Source frame rate must match plan'
    assert (plan['width'], plan['height']) == (info['width'], info['height']), 'Canvas mismatch'
    previous = None
    for segment in plan['segments']:
        a, b, n = (segment[k] for k in ('start_frame', 'end_frame', 'output_frames'))
        assert all(type(v) is int for v in (a, b, n)) and 0 <= a < b <= int(info['nb_frames']) and 0 < n <= b-a
        assert previous is None or a == previous, 'Segments must be contiguous; represent every retained frame'
        previous = b
        kind = segment['kind']
        assert kind in ('agent', 'operator-idle', 'operator-typing', 'reading', 'establishing')
        assert segment.get('reason'), 'Every segment needs an inspection note'
        if kind == 'operator-typing':
            assert (b-a) / n <= 1.2 + 1e-6, 'Typing acceleration exceeds 1.2x'
        elif kind != 'operator-idle':
            assert n == b-a, 'Agent execution, reading and establishing views remain at real speed'
    assert plan['segments'], 'Empty EDL'
    if crop := plan.get('crop'):
        x, y, w, h = (crop[k] for k in ('x', 'y', 'width', 'height'))
        assert all(type(v) is int for v in (x, y, w, h)), 'Crop must use integer native pixels'
        assert 0 <= x < x+w <= plan['width'] and 0 <= y < y+h <= plan['height'], 'Crop must fit the source canvas'
        assert all(v % 2 == 0 for v in (x, y, w, h)), 'Crop must align with yuv420p pixels'
        assert crop.get('reason'), 'Document why the cropped pixels are outside the intended window'
    for mask in plan.get('masks', []):
        x, y, w, h = (mask[k] for k in ('x', 'y', 'width', 'height'))
        assert 0 <= x < x+w <= plan['width'] and 0 <= y < y+h <= plan['height']
        assert len(mask['color']) == 7 and mask['color'][0] == '#'
        int(mask['color'][1:], 16)
    for cue in plan.get('clicks', []):
        assert cue.get('evidence'), 'Click cues require an observed interaction description'
        assert 0.5 <= cue.get('strength', 1) <= 1.2


def mapped_frame(plan, frame):
    output = 0
    for segment in plan['segments']:
        a, b, n = (segment[k] for k in ('start_frame', 'end_frame', 'output_frames'))
        if a <= frame < b:
            return output + (frame-a)*n/(b-a)
        output += n
    return None


def video_hash(path):
    return run('ffmpeg', '-v', 'error', '-i', path, '-map', '0:v:0', '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-')


def render(source, plan, silent, clicks):
    info = probe(source)
    validate(plan, info)
    assert source.resolve() not in (silent.resolve(), clicks.resolve())
    assert silent != clicks and not silent.exists() and not clicks.exists(), 'Will not overwrite deliverables'
    fps = plan['fps']
    frames = sum(s['output_frames'] for s in plan['segments'])
    with tempfile.TemporaryDirectory(prefix='nova-video-') as temporary:
        root = Path(temporary)
        parts = []
        for index, segment in enumerate(plan['segments']):
            a, b, n = (segment[k] for k in ('start_frame', 'end_frame', 'output_frames'))
            ratio = n/(b-a)
            filters = [f'trim=end_frame={b-a}', 'setpts=PTS-STARTPTS', f'setpts={ratio:.12f}*PTS',
                       f'fps={fps}', 'tpad=stop_mode=clone:stop_duration=1', f'trim=end_frame={n}']
            for mask in plan.get('masks', []):
                # The filter is downstream of fps/trim, so n is the exact local
                # output frame. Decimal time comparisons can miss a one-frame
                # cover when a 30 fps boundary rounds upward (e.g. 1/30).
                start = max(0, math.ceil((mask.get('start_frame', a)-a)*ratio-1e-7))
                end = min(n, math.ceil((mask.get('end_frame', b)-a)*ratio-1e-7))
                if end <= start:
                    continue
                filters.append(f"drawbox=x={mask['x']}:y={mask['y']}:w={mask['width']}:h={mask['height']}:color=0x{mask['color'][1:]}:t=fill:enable='gte(n,{start})*lt(n,{end})'")
            if crop := plan.get('crop'):
                # Masks and receipts stay in source coordinates. Cropping empty
                # recorder padding never scales the retained browser pixels.
                filters.append(f"crop={crop['width']}:{crop['height']}:{crop['x']}:{crop['y']}")
            part = root / f'{index:04d}.mp4'
            run('ffmpeg', '-v', 'error', '-ss', f'{a/fps:.9f}', '-i', source, '-an', '-vf', ','.join(filters),
                '-frames:v', n, '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
                '-video_track_timescale', fps*1000, part)
            assert int(probe(part)['nb_frames']) == n, f'Segment {index} frame count differs'
            parts.append(part)
        concat = root / 'concat.txt'
        concat.write_text(''.join(f"file '{p.as_posix()}'\n" for p in parts))
        silent.parent.mkdir(parents=True, exist_ok=True)
        clicks.parent.mkdir(parents=True, exist_ok=True)
        run('ffmpeg', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', concat, '-c', 'copy', '-movflags', '+faststart', silent)
        assert int(probe(silent)['nb_frames']) == frames
        # Original damped mechanical clicks; no microphone, keyboard or music.
        rate = 48000
        samples = array.array('f', [0]) * round(frames/fps*rate)
        cues = []
        for index, cue in enumerate(plan.get('clicks', [])):
            mapped = mapped_frame(plan, cue['source_frame'])
            if mapped is None:
                continue
            t = mapped/fps
            cues.append({**cue, 'edited_seconds': t})
            rng = random.Random(index+1701)
            offset = round(t*rate)
            frequency = rng.uniform(1700, 2200)
            for i in range(round(.042*rate)):
                if offset+i >= len(samples):
                    break
                seconds = i/rate
                attack = min(1, i/20)
                sound = (.68*rng.uniform(-1,1)+.32*math.sin(2*math.pi*frequency*seconds))
                samples[offset+i] += .075*cue.get('strength',1)*attack*math.exp(-seconds*180)*sound
        peak = max(map(abs, samples), default=0)
        assert peak < .85, 'Effects overlap/clipping; inspect cue sheet'
        pcm = array.array('h', (round(max(-1,min(1,v))*32767) for v in samples))
        audio = root / 'clicks.wav'
        with wave.open(str(audio), 'wb') as output:
            output.setnchannels(1); output.setsampwidth(2); output.setframerate(rate); output.writeframes(pcm.tobytes())
        run('ffmpeg', '-v', 'error', '-i', silent, '-i', audio, '-map', '0:v:0', '-map', '1:a:0',
            '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', clicks)
        assert video_hash(silent) == video_hash(clicks), 'Video stream changed during audio mux'
        with source.open('rb') as source_file:
            source_sha256 = hashlib.file_digest(source_file, 'sha256').hexdigest()
        report = {'source_sha256': source_sha256,
            'frames': frames, 'seconds': frames/fps, 'peak_amplitude': peak, 'clicks': cues,
            'crop': plan.get('crop'),
            'video_stream_hash': video_hash(clicks)}
        silent.with_suffix('.validation.json').write_text(json.dumps(report, indent=2)+'\n')
        print(json.dumps(report, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('source', 'plan', 'silent', 'clicks'):
        parser.add_argument(name, type=Path)
    args = parser.parse_args()
    render(args.source, json.loads(args.plan.read_text()), args.silent, args.clicks)
