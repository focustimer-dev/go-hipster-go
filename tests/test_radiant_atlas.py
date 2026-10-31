"""The radiant margin is behind Robinson, not printed across the world."""
from pathlib import Path
import hashlib
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "launcher/editions/gig-poster"
HTML = (BASE / "index.html").read_text()
CSS = (BASE / "edition.css").read_text()
APP = (ROOT / "launcher/assets/app.js").read_text()
SOURCE = (ROOT / "scripts/robinson_atlas.py").read_text()


class RadiantAtlasChecks(unittest.TestCase):
    def test_radials_follow_camera_behind_opaque_moving_world(self):
        self.assertEqual(HTML.count('class="atlas-radial-field"'), 1)
        self.assertLess(HTML.index('class="atlas-radial-field"'), HTML.index('id="crateAtlasMap"'))
        self.assertEqual(HTML.count('class="radial-ray '), 72)
        self.assertNotIn('robinsonMarginMask', HTML)
        self.assertNotIn('radial-density-10', HTML)
        self.assertIn('class="crate-map-ocean" d="M', HTML)
        self.assertIn('class="robinson-plate-content" clip-path="url(#robinsonWorldClip)"', HTML)
        self.assertIn('position:absolute;top:10px;left:0', CSS)
        self.assertIn('#crateAtlasMap{position:relative;z-index:1}', CSS)
        self.assertIn('atlasRadialField.setAttribute("viewBox",view)', APP)
        self.assertIn('attributeFilter:["viewBox"]', APP)
        self.assertNotIn('atlasRadialField.hidden=', APP)
        self.assertIn('def _radial_field():', SOURCE)

    def test_radial_weights_and_angular_spacing(self):
        self.assertEqual(HTML.count('class="radial-ray radial-major"'), 4)
        self.assertEqual(HTML.count('class="radial-ray radial-secondary"'), 4)
        self.assertEqual(HTML.count('class="radial-ray radial-tertiary"'), 16)
        self.assertEqual(HTML.count('class="radial-ray radial-fine"'), 48)

    def test_all_country_strokes_share_ink_hue(self):
        self.assertNotIn('#946a36', CSS)
        self.assertNotIn('#f1ce76', CSS)
        self.assertIn('.crate-map-zone[data-selected=false] path{stroke:var(--ink)', CSS)
        self.assertIn('.crate-map-zone[data-selected=true]:hover path{stroke:var(--ink)', CSS)
        self.assertIn('.crate-map-ocean{stroke:none!important', CSS)

    def test_compact_contiguous_go_controls(self):
        self.assertIn('min-height:64px', CSS)
        self.assertIn('.go-extras{border-bottom:1px solid var(--paper)', CSS)
        self.assertIn('.cover-toggle[aria-pressed=true]::before{content:none}', CSS)
        self.assertIn('.cover-toggle+ .cover-toggle{border-left:1px solid var(--paper)', CSS)
        self.assertEqual(HTML.count('id="includeCover"'), 1)
        self.assertEqual(HTML.count('id="goHard"'), 1)
        self.assertEqual(HTML.count('id="goButton"'), 1)

    def test_css_cache_bust(self):
        digest = hashlib.sha256((BASE / "edition.css").read_bytes()).hexdigest()[:12]
        for path in (BASE / "index.html", BASE / "setup/index.html"):
            self.assertIn("edition.css?v=" + digest, path.read_text())


if __name__ == "__main__":
    unittest.main()
