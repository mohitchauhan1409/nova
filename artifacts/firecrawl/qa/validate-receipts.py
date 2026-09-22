#!/usr/bin/env python3
"""Private pre-render checks. No browser, capture, rendering, or audio synthesis.

Maps independently reviewed click receipts through the existing frame EDL.
Evidence text is required, not machine-verified proof of a visible click.
"""
import argparse
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import re
import subprocess


class Invalid(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise Invalid(message)


def number(value, label):
    require(type(value) in (int, float, str), f'{label}: expected a finite number')
    try:
        return Fraction(str(value))
    except (ValueError, ZeroDivisionError):
        raise Invalid(f'{label}: expected a finite number') from None


def note(value, label):
    require(isinstance(value, str) and value.strip(), f'{label}: missing evidence')
    return value.strip()


def integer(value, label):
    require(type(value) is int, f'{label}: expected integer')
    return value


def anchor_from_log(text):
    values = re.findall(r'First encoded frame epoch milliseconds:\s*(\d+)', text)
    require(len(values) == 1, 'Recorder log must contain exactly one first-frame epoch')
    return int(values[0])


def probe(source):
    data = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
        'stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,duration',
        '-of', 'json', str(source)], text=True))
    require(len(data.get('streams', [])) == 1, 'Need one selected source video stream')
    info = data['streams'][0]
    require(str(info.get('nb_frames', '')).isdigit(), 'ffprobe must expose raw frame count; do not estimate it from duration')
    require(number(info.get('avg_frame_rate'), 'average fps') == number(info.get('r_frame_rate'), 'nominal fps'), 'Source average and nominal rates differ; inspect CFR before mapping')
    return info


def prepare(info, first_epoch_ms, plan, receipts):
    fps = integer(plan.get('fps'), 'EDL fps')
    require(fps > 0 and number(info['r_frame_rate'], 'raw fps') == fps, 'Raw and EDL frame rates must match')
    frames = int(info['nb_frames'])
    require(frames > 0, 'Raw video has no frames')
    require((plan.get('width'), plan.get('height')) == (info['width'], info['height']), 'EDL canvas differs from raw')
    epoch = number(first_epoch_ms, 'first-frame epoch')
    require(epoch > 0, 'First-frame epoch must be positive')
    segments = plan.get('segments')
    require(isinstance(segments, list) and segments, 'Empty EDL')
    require(not plan.get('clicks'), 'Keep EDL clicks empty: its legacy renderer is not the approved effect')
    previous, output_frames = None, 0
    mapped_segments = []
    for i, segment in enumerate(segments):
        a, b, n = (integer(segment.get(k), f'segment {i} {k}') for k in ('start_frame', 'end_frame', 'output_frames'))
        require(0 <= a < b <= frames and 0 < n <= b-a, f'segment {i}: outside raw or invalid length')
        require(previous is None or previous == a, 'EDL must be contiguous, ordered and nonoverlapping')
        kind = segment.get('kind')
        require(kind in ('agent', 'operator-idle', 'operator-typing', 'reading', 'establishing'), f'segment {i}: invalid kind')
        note(segment.get('reason'), f'segment {i} reason')
        if kind == 'operator-typing':
            require(Fraction(b-a, n) <= Fraction(6, 5), 'Operator typing exceeds 1.2x')
        elif kind != 'operator-idle':
            require(n == b-a, 'Agent execution, reading and establishing must remain 1x')
        mapped_segments.append({**segment, 'output_start_frame': output_frames})
        previous, output_frames = b, output_frames + n
    require(isinstance(receipts, list) and receipts, 'Receipts must be a nonempty JSON array')
    identities, dispatches, frame_keys = set(), set(), set()
    mapped = []
    for index, receipt in enumerate(receipts):
        label = f'receipt {index}'
        rid = note(receipt.get('id'), f'{label} id')
        require(rid not in identities, f'Duplicate receipt id: {rid}')
        identities.add(rid)
        actor = receipt.get('actor')
        require(actor in ('operator', 'nova'), f'{rid}: missing/invalid actor')
        button = receipt.get('button')
        require(button in ('left', 'right'), f'{rid}: expected mouse button left/right')
        target = note(receipt.get('target'), f'{rid} target')
        at = number(receipt.get('at'), f'{rid} dispatch epoch')
        estimated_frame = (at-epoch)*fps/1000
        require(0 <= estimated_frame < frames, f'{rid}: dispatch outside raw recording')
        dispatch_key = (actor, at, button, target)
        require(dispatch_key not in dispatches, f'{rid}: duplicate dispatch')
        dispatches.add(dispatch_key)
        source_frame = integer(receipt.get('source_frame'), f'{rid} reviewed source_frame')
        require(0 <= source_frame < frames, f'{rid}: reviewed frame outside raw')
        frame_key = (actor, button, target, source_frame)
        require(frame_key not in frame_keys, f'{rid}: duplicate actor/target click in one source frame')
        frame_keys.add(frame_key)
        evidence = note(receipt.get('evidence'), f'{rid} dispatch evidence')
        response = note(receipt.get('response'), f'{rid} visible response')
        frame_evidence = note(receipt.get('frame_evidence'), f'{rid} frame evidence')
        correction = Fraction(source_frame)-estimated_frame
        if abs(correction) > 1:
            note(receipt.get('timing_adjustment_reason'), f'{rid} timing adjustment exceeds one frame')
        segment = next((s for s in mapped_segments if s['start_frame'] <= source_frame < s['end_frame']), None)
        require(segment is not None, f'{rid}: click outside retained EDL')
        a, b, n = (segment[k] for k in ('start_frame', 'end_frame', 'output_frames'))
        require(not (segment['kind'] == 'operator-idle' and n != b-a), f'{rid}: a clicked segment is not compressible idle')
        require(not (actor == 'nova' and n != b-a), f'{rid}: Nova click/execution cannot be accelerated')
        out = Fraction(segment['output_start_frame']) + Fraction((source_frame-a)*n, b-a)
        strength = number(receipt.get('strength', 1), f'{rid} strength')
        require(Fraction(1, 2) <= strength <= Fraction(6, 5), f'{rid}: strength outside approved range')
        mapped.append({**receipt, 'id': rid, 'actor': actor, 'target': target,
            'evidence': evidence, 'response': response, 'frame_evidence': frame_evidence,
            'epoch_estimated_source_frame_exact': str(estimated_frame),
            'reviewed_source_frame': source_frame, 'frame_adjustment_exact': str(correction),
            'output_frame_exact': str(out), 'time_exact': str(out/fps),
            'time': float(out/fps), 'strength': float(strength)})
    mapped.sort(key=lambda row: (Fraction(row['output_frame_exact']), row['id']))
    events = [{'time': row['time'], 'actor': row['actor'], 'strength': row['strength'],
               'evidence': f"{row['id']}; {row['target']}; {row['evidence']}; source frame {row['reviewed_source_frame']}: {row['frame_evidence']}; response: {row['response']}"}
              for row in mapped]
    cues = {'duration': output_frames/fps, 'events': events}
    report = {'status': 'receipt-and-EDL-validation-only', 'first_frame_epoch_ms': str(epoch),
              'raw_frames': frames, 'fps': fps, 'output_frames': output_frames,
              'duration_exact': str(Fraction(output_frames, fps)), 'segments': mapped_segments,
              'receipts': mapped, 'limitations': [
                  'Required evidence notes are not automated verification of visible UI actions.',
                  'Inspect every source and final cue, cursor and response; use decoded audio verifier after export.',
                  'No completeness claim: compare retained receipts against all operator dispatches and Nova recordingClicks.',
                  'No source/rendered media, mask geometry, backup or outcome validation is performed here.']}
    return cues, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('source', 'recorder-log', 'plan', 'receipts', 'output-dir'):
        parser.add_argument('--'+key, type=Path, required=True)
    args = parser.parse_args()
    require(not args.output_dir.exists(), 'Output directory exists; use a fresh revision to preserve earlier mappings')
    info = probe(args.source)
    first = anchor_from_log(args.recorder_log.read_text())
    plan, receipts = (json.loads(path.read_text()) for path in (args.plan, args.receipts))
    cues, report = prepare(info, first, plan, receipts)
    report['source'] = str(args.source.resolve())
    report['raw_probe'] = info
    report['input_sha256'] = {str(path.resolve()): hashlib.sha256(path.read_bytes()).hexdigest()
                             for path in (args.recorder_log, args.plan, args.receipts)}
    args.output_dir.mkdir(parents=True)
    for name, data in (('final-cues.json', cues), ('source-to-edited-map.json', report)):
        (args.output_dir/name).write_text(json.dumps(data, indent=2)+'\n')
    print(json.dumps({'receipts': len(cues['events']), 'output_frames': report['output_frames'],
                      'duration': cues['duration'], 'output_dir': str(args.output_dir)}, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (Invalid, KeyError, TypeError, json.JSONDecodeError) as error:
        raise SystemExit(f'REJECTED: {error}') from None
