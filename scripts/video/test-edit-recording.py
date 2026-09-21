"""Native padding crop regression checks; uses FFmpeg and no browser session."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('editor', Path(__file__).with_name('edit-recording.py'))
editor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(editor)


class CropTest(unittest.TestCase):
    def setUp(self):
        self.plan = {'fps': 30, 'width': 160, 'height': 96,
            'segments': [{'start_frame': 0, 'end_frame': 30, 'output_frames': 30,
                          'kind': 'agent', 'reason': 'Real-time fixture'}],
            'crop': {'x': 0, 'y': 0, 'width': 128, 'height': 96,
                     'reason': 'Known 32-pixel black padding at right'}}
        self.info = {'r_frame_rate': '30/1', 'width': 160, 'height': 96, 'nb_frames': '30'}

    def test_uncropped_legacy_plan(self):
        del self.plan['crop']
        editor.validate(self.plan, self.info)

    def test_reject_invalid_geometry(self):
        for update in ({'width': 162}, {'x': -2}, {'width': 127}, {'x': .5}, {'height': 0}, {'reason': ''}):
            with self.subTest(update=update):
                plan = copy.deepcopy(self.plan)
                plan['crop'].update(update)
                with self.assertRaises(AssertionError):
                    editor.validate(plan, self.info)

    def test_export_retains_native_pixels_and_time(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work)
            source, silent, scratch = (root / p for p in ('source.mov', 'silent.mp4', 'scratch.mp4'))
            subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                'color=c=red:s=128x96:r=30:d=1,pad=160:96:0:0:black',
                '-c:v', 'libx264', source], check=True)
            editor.render(source, self.plan, silent, scratch)
            info = editor.probe(silent)
            self.assertEqual((info['width'], info['height'], int(info['nb_frames'])), (128, 96, 30))
            rgb = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', silent,
                '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'])
            self.assertTrue(all(rgb[i] > 240 and rgb[i+1] < 15 and rgb[i+2] < 15
                                for i in range(0, len(rgb), 3)))


if __name__ == '__main__':
    unittest.main()
