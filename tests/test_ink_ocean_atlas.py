"""Protect Greenland routing, dark-ocean state reset and fixed map furniture."""
from pathlib import Path
import hashlib
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
CANON = ROOT / "launcher/index.html"
EDITION = ROOT / "launcher/editions/gig-poster/index.html"
CSS = ROOT / "launcher/editions/gig-poster/edition.css"
FRAME = ROOT / "launcher/editions/gig-poster/assets/chart-viewport-frame.svg"
FURNITURE = ROOT / "launcher/editions/gig-poster/assets/chart-map-furniture.svg"


class InkOceanAtlasChecks(unittest.TestCase):
    def test_greenland_is_selectable_as_northern_europe(self):
        for source in (CANON, EDITION):
            page = source.read_text()
            match = re.search(r'data-atlas-country="GRL"[^>]*>', page)
            self.assertIsNotNone(match, source)
            self.assertIn('data-atlas-region="northern-europe"', match.group())
            self.assertIn('data-atlas-zone="northern-europe"', page)
            self.assertNotIn('data-atlas-zone=""', page)

    def test_deselection_and_hover_have_one_base_fill(self):
        styles = CSS.read_text()
        self.assertIn("Dark-ocean engraved plate", styles)
        self.assertIn(".crate-map-ocean{fill:var(--ink)}", styles)
        self.assertIn(".crate-map-zone[data-selected=false] path{fill:url(#posterLandEngraving)", styles)
        self.assertIn(".crate-map-zone[data-selected=false]:hover path{fill:url(#posterLandEngraving)", styles)
        self.assertIn(".crate-map-zone[data-selected=true]:hover path{fill:url(#posterSelectedHalftone)", styles)
        self.assertIn('id="posterLandEngraving"', EDITION.read_text())

    def test_rose_is_ornate_and_outside_pannable_map(self):
        frame = FRAME.read_text()
        self.assertIn('class="chart-compass"', frame)
        for item in ("chart-rose-flourishes", "chart-rose-cardinals",
                     "chart-rose-ring", "chart-rose-letters", "chart-rose-north"):
            self.assertIn(item, frame)
        page = EDITION.read_text()
        self.assertEqual(page.count('class="chart-compass"'), 1)
        self.assertIn(frame.strip(), page)
        self.assertIn('class="chart-viewport-frame"', page)
        css = CSS.read_text()
        self.assertIn('.chart-viewport-frame{position:absolute', css)
        self.assertIn('pointer-events:none;z-index:1', css)
        self.assertIn('filter="url(#chart-gold)"', FURNITURE.read_text())

    def test_art_and_try_hard_share_grid_and_mobile_size(self):
        css = CSS.read_text()
        self.assertIn('.go-extras .cover-toggle{display:grid;grid-template-columns:', css)
        self.assertIn('.go-extras .option-copy{display:grid;grid-column:2;', css)
        self.assertIn('.go-extras{grid-template-columns:repeat(2,minmax(0,1fr))}', css)
        page = EDITION.read_text()
        self.assertEqual(page.count('id="includeCover"'), 1)
        self.assertEqual(page.count('id="goHard"'), 1)

    def test_css_cache_hash(self):
        digest = hashlib.sha256(CSS.read_bytes()).hexdigest()[:12]
        for path in (EDITION, ROOT / "launcher/editions/gig-poster/setup/index.html"):
            self.assertIn('edition.css?v=' + digest, path.read_text())


if __name__ == "__main__":
    unittest.main()
