"""Guard the approved raster pixels against build-time regeneration or cropping."""
import hashlib
from PIL import Image
import runpy
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

class WidgetArtwork(unittest.TestCase):

    def test_release_masks_only_printed_lab_suffix_and_keeps_approved_sources(self):
        module = runpy.run_path(str(ROOT / 'scripts/render_chaos_widget.py'))
        redaction = module['remove_release_lab_mark']
        with Image.open(ROOT / 'android-lab/artwork/chaos-roll/cassette.png') as original:
            untouched = original.convert('RGBA')
            untouched.thumbnail((960, 960), Image.Resampling.LANCZOS)
        result = redaction(untouched.copy())
        w, h = untouched.size
        x1, x2 = round(w * .775), round(w * .904)
        y1, y2 = round(h * .167), round(h * .252)
        assert result.getchannel('A').tobytes() == untouched.getchannel('A').tobytes()
        # No change to the outer sleeve, reels, typography, art outside the
        # top-right '/ LAB' box or the 1x1 record; no global redraw.
        for x, y in ((0, 0), (w-1, h-1), (w//2, h//2),
                     (round(w*.75), round(h*.21)),
                     (round(w*.92), round(h*.21)),
                     (round(w*.82), round(h*.4))):
            self.assertEqual(result.getpixel((x, y)), untouched.getpixel((x, y)))
        changed = sum(
            result.getpixel((x, y)) != untouched.getpixel((x, y))
            for y in range(y1, y2, 3) for x in range(x1, x2, 3)
        )
        self.assertGreater(changed, 25, "Expected to mask existing light LAB lettering")
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            module['render'](target, release_mode=True)
            self.assertTrue((target / 'widget_chaos_cassette.webp').is_file())
            self.assertTrue((target / 'widget_chaos_record.webp').is_file())
            with Image.open(target / 'widget_chaos_cassette.webp') as packaged:
                self.assertEqual(packaged.size, result.size)
                self.assertEqual(packaged.getchannel('A').tobytes(),
                                 untouched.getchannel('A').tobytes())

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
