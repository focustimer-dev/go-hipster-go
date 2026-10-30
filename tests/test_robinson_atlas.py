"""Regression checks for the framed Robinson atlas and the unique mood frieze."""
from pathlib import Path
import re
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "launcher/editions/gig-poster/index.html"
CSS = ROOT / "launcher/editions/gig-poster/edition.css"
APP = ROOT / "launcher/assets/app.js"


class RobinsonEditionTests(unittest.TestCase):
    def test_geometry_and_region_interactions_are_preserved(self):
        page = INDEX.read_text()
        self.assertIn('class="crate-robinson"', page)
        self.assertIn("ROBINSON · WORLD LISTENING ATLAS", page)
        self.assertIn('id="posterLandEngraving"', page)
        self.assertNotIn('class="crate-mercator"', page)
        canonical = (ROOT / "launcher/index.html").read_text()
        country_id = r'data-atlas-country="([^"]+)"'
        self.assertEqual(
            sorted(re.findall(country_id, page)),
            sorted(re.findall(country_id, canonical)),
        )
        self.assertGreaterEqual(len(re.findall(country_id, page)), 180)
        self.assertIn('data-atlas-zone=', page)
        self.assertIn('id="atlasHome"', page)
        self.assertIn("const atlasViews=", APP.read_text())

    def test_northern_land_avoids_the_frame(self):
        page = INDEX.read_text()
        d_values = re.findall(r'<path d="([^"]+)"[^>]*data-atlas-country=', page)
        self.assertGreaterEqual(len(d_values), 180)
        points = []
        for d in d_values:
            points.extend((float(x), float(y)) for x, y in
                          re.findall(r'[ML](-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)', d))
        self.assertTrue(points)
        # The original Mercator plate cropped islands against y=0.
        self.assertGreater(min(y for _, y in points), 20)
        self.assertLess(max(y for _, y in points), 349)
        self.assertGreater(min(x for x, _ in points), 20)
        self.assertLess(max(x for x, _ in points), 700)

    def test_the_six_original_characters_sit_above_atlas(self):
        page = INDEX.read_text()
        self.assertLess(page.index('class="mood-grid"'), page.index('id="crateGeo"'))
        self.assertEqual(len(re.findall(r'<button class="mood" data-mood=', page)), 6)
        self.assertEqual(page.count('class="mood-grid"'), 1)
        self.assertIn("engraved-six-clerks.webp", CSS.read_text())
        self.assertIn("weird-v18.webp", CSS.read_text())
        self.assertNotIn("The masthead is the imprint: one bold ink plate", CSS.read_text())

    def test_gig_poster_builder_is_reproducible(self):
        before = INDEX.read_bytes()
        process = subprocess.run(
            [sys.executable, str(ROOT / "scripts/build_gig_poster.py")],
            cwd=ROOT, capture_output=True, text=True, check=False,
        )
        self.assertEqual(process.returncode, 0, process.stderr)
        after = INDEX.read_bytes()
        if before != after:
            import difflib
            lines = list(difflib.unified_diff(
                before.decode().splitlines(), after.decode().splitlines(),
                fromfile="checked-in", tofile="generated", n=1
            ))
            self.fail("The committed Robinson page differs from the generator:\n"
                      + "\n".join(lines[:22]))


if __name__ == "__main__":
    unittest.main()
