"""Verify decoded click-only audio against the established tap renderer.

Usage: python3 verify-click-export.py VIDEO CUES.json REPORT.json [--fps 30]
This checks decoded audio timing and silence. Visual click evidence must still
be inspected and mapped from the source recording before creating the cue file.
"""
import argparse
import importlib.util
import json
import subprocess
from pathlib import Path
import numpy as np


def verify(video, cues_path, report_path, fps):
    spec = importlib.util.spec_from_file_location('tap', Path(__file__).with_name('add-click-sounds.py'))
    tap = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tap)
    cues = json.loads(cues_path.read_text())
    rate = tap.SR
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(video),
        '-map', '0:a:0', '-f', 'f32le', '-ar', str(rate), '-ac', '2', '-'])
    actual = np.frombuffer(raw, dtype='<f4').reshape(-1, 2)
    assert abs(len(actual)/rate-cues['duration']) <= 1/fps, 'Decoded duration differs'
    expected = np.zeros_like(actual)
    permitted = np.zeros(len(actual), dtype=bool)
    rng = np.random.default_rng(2071)
    for event in cues['events']:
        assert event.get('evidence') and event['actor'] in ('operator', 'nova')
        sample = tap.click_sound(rng, event.get('strength', 1))
        pan = rng.uniform(-.10, .10) + (.10 if event['actor']=='operator' else -.10)
        stereo = np.column_stack((sample*np.sqrt((1-pan)/2), sample*np.sqrt((1+pan)/2)))
        start = round(event['time']*rate)
        size = min(len(sample), len(actual)-start)
        assert 0 <= start < len(actual) and size > 0
        expected[start:start+size] += stereo[:size]
        # AAC's short transform may spread tiny energy around the actual tap.
        permitted[max(0,start-round(rate/fps)):min(len(actual),start+size+round(rate/fps))] = True
    expected *= 1.6
    peak = float(np.abs(expected).max())
    if peak > .30:
        expected *= .30/peak
    checks = []
    for event in cues['events']:
        start = round(event['time']*rate)
        a, b = max(0,start-round(rate/fps)), min(len(actual),start+round(.13*rate))
        reference, decoded = expected[a:b], actual[a:b]
        threshold = float(np.abs(reference).max())*.2
        expected_onset = np.flatnonzero(np.max(np.abs(reference),axis=1)>threshold)[0]+a
        decoded_candidates = np.flatnonzero(np.max(np.abs(decoded),axis=1)>threshold)
        assert len(decoded_candidates), f'Missing tap at {event["time"]}'
        decoded_onset = int(decoded_candidates[0])+a
        error = (decoded_onset-expected_onset)/rate
        corr = float(np.corrcoef(reference.ravel(),decoded.ravel())[0,1])
        assert abs(error) <= 1/fps, f'Tap outside one output frame: {event["time"]}'
        assert corr > .98, f'Tap does not match established renderer: {event["time"]}: {corr}'
        checks.append({'time':event['time'],'actor':event['actor'], 'onset_error_ms':error*1000,'correlation':corr})
    quiet_peak = float(np.abs(actual[~permitted]).max(initial=0))
    assert quiet_peak < .001, 'Unexpected audio outside click windows'
    decoded_peak = float(np.abs(actual).max(initial=0))
    assert decoded_peak < 1, 'Clipped decoded audio'
    report = {'decoded':True,'fps':fps,'events':checks,'quiet_peak':quiet_peak,
        'decoded_peak':decoded_peak,'max_onset_error_ms':max((abs(c['onset_error_ms']) for c in checks),default=0),
        'minimum_tap_correlation':min((c['correlation'] for c in checks),default=1)}
    report_path.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='events'},indent=2))


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    for name in ('video','cues','report'):
        parser.add_argument(name,type=Path)
    parser.add_argument('--fps',type=int,default=30)
    args=parser.parse_args()
    verify(args.video,args.cues,args.report,args.fps)
