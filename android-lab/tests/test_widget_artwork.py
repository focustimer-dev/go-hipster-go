"""Guard the approved raster pixels against build-time regeneration or cropping."""
import hashlib
from PIL import Image
import runpy
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

class WidgetArtwork(unittest.TestCase):
    def test_build_packages_compact_artwork_and_removes_old_crops(self):
        expected = {
            'record': 'f89056903c3ff7e672fc08e7de3a4cf8f1d1d267f2251740cc2701e085a087ab',
            'cassette': 'bd07067beb29d718a49b6dd34a6417b3d0c52b1d83c66fdb5cc4e99cc9ef9540',
        }
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            old = target / 'widget_cassette_hero.webp'
            old.write_bytes(b'old procedural crop')
            runpy.run_path(str(ROOT / 'scripts/render_chaos_widget.py'))['render'](target)
            self.assertFalse(old.exists())
            for name, digest in expected.items():
                original = ROOT / 'android-lab/artwork/chaos-roll' / (name + '.png')
                self.assertEqual(digest, hashlib.sha256(original.read_bytes()).hexdigest())
                packaged = target / ('widget_chaos_' + name + '.webp')
                self.assertLess(packaged.stat().st_size, 400_000)
                with Image.open(original) as source, Image.open(packaged) as output:
                    expected_size = source.copy()
                    expected_size.thumbnail((960, 960), Image.Resampling.LANCZOS)
                    self.assertEqual(output.size, expected_size.size)
                    self.assertEqual(output.getchannel('A').tobytes(),
                                     expected_size.convert('RGBA').getchannel('A').tobytes())
