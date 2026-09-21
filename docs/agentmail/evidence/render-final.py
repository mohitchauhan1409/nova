"""Reproduce the inspected AgentMail final edit; run only in a safe render window."""
from pathlib import Path
import importlib.util
import json
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = Path(__file__).resolve().parent
MEDIA = ROOT / 'artifacts/agentmail/media'
PRIVATE = Path('/Users/macbook/Desktop/Nova-batch-20260921/private/agentmail/final-edit-qa')
PRIVATE.mkdir(parents=True, exist_ok=True)
SOURCE = MEDIA / 'nova-agentmail-original.mov'
SILENT = MEDIA / 'nova-agentmail-silent.mp4'
CLICKS = MEDIA / 'nova-agentmail-clicks.mp4'
PID_FILE = PRIVATE / 'active-media-child.pid'


def run(*arguments):
    command = [str(item) for item in arguments]
    if command[0] == 'ffmpeg':
        command[1:1] = ['-threads', '2', '-filter_threads', '1']
        if 'libx264' in command:
            command[-1:-1] = ['-threads', '2']
            print('Encoding inspected segment:', Path(command[-1]).name, flush=True)
    child = subprocess.Popen(command, stdout=subprocess.PIPE, text=True,
                             start_new_session=True)
    PID_FILE.write_text(str(child.pid))
    try:
        output, _ = child.communicate()
        if child.returncode:
            raise subprocess.CalledProcessError(child.returncode, command, output)
        return output.strip()
    finally:
        PID_FILE.unlink(missing_ok=True)


print('Render parent PID:', os.getpid(), flush=True)
spec = importlib.util.spec_from_file_location('editor', ROOT / 'scripts/video/edit-recording.py')
editor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(editor)
editor.run = run
plan = json.loads((EVIDENCE / 'final-edit-plan.json').read_text())
with tempfile.TemporaryDirectory(prefix='nova-agentmail-final-') as scratch:
    editor.render(SOURCE, plan, SILENT, Path(scratch) / 'editor-silent-audio.mp4')

print('Silent render finished; adding unchanged approved taps.', flush=True)
run(os.sys.executable, ROOT / 'scripts/video/add-click-sounds.py',
    '--source', SILENT, '--cues', EVIDENCE / 'final-click-cues.json',
    '--output', CLICKS, '--report', EVIDENCE / 'final-sound-verification.json')
print('Approved taps muxed; verifying decoded audio.', flush=True)
run(os.sys.executable, ROOT / 'scripts/video/verify-click-export.py',
    CLICKS, EVIDENCE / 'final-click-cues.json',
    EVIDENCE / 'final-decoded-audio.json', '--fps', '30')
print('Final render and decoded audio verification finished.', flush=True)
