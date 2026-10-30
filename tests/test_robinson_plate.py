"""Prevent old Mercator lines and the compass from rejoining the moving map."""
import hashlib
import re
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"launcher/editions/gig-poster"
PAGE=(BASE/"index.html").read_text()
CSS=(BASE/"edition.css").read_text()
FRAME=(BASE/"assets/chart-viewport-frame.svg").read_text()
FURNITURE=(BASE/"assets/chart-map-furniture.svg").read_text()


class RobinsonPlateTests(unittest.TestCase):
    def test_world_has_closed_robinson_outline_and_clip(self):
        self.assertIn('id="robinsonWorldClip"', PAGE)
        self.assertIn('class="crate-map-ocean" d="M', PAGE)
        self.assertIn('class="robinson-plate-content" clip-path="url(#robinsonWorldClip)"', PAGE)
        self.assertNotIn('<rect class="crate-map-ocean"', PAGE)
        self.assertNotIn('class="crate-zone-boundaries"', PAGE)
        self.assertIn('.crate-map-frame{background:transparent', CSS)
        self.assertIn('.crate-map-ocean{fill:var(--ink);stroke:var(--bone)', CSS)
        self.assertIn("def _world_shape():", (ROOT/"scripts/robinson_atlas.py").read_text())

    def test_no_obsolete_rectangle_or_mercator_chart(self):
        self.assertNotIn('class="chart-edge"', PAGE)
        self.assertNotIn('class="chart-edge"', FRAME)
        self.assertNotIn('class="chart-rhumbs"', PAGE)
        self.assertNotIn('class="chart-routes"', PAGE)
        self.assertNotIn('class="chart-rhumbs"', FURNITURE)
        self.assertNotIn('class="chart-routes"', FURNITURE)

    def test_compass_is_a_sibling_of_pannable_svg(self):
        self.assertIn('class="chart-compass"', FRAME)
        self.assertEqual(PAGE.count('class="chart-compass"'), 1)
        self.assertIn(FRAME.strip(), PAGE)
        self.assertRegex(PAGE, r'</g></svg><div class="chart-viewport-frame"')
        self.assertIn('.chart-viewport-frame{position:absolute', CSS)
        self.assertIn('pointer-events:none;z-index:2;transform:none!important', CSS)
        self.assertIn('id="crateAtlasMap"', PAGE)
        self.assertIn('class="chart-compass-fixed"', FRAME)
        self.assertIn('viewBox="-65 -65 130 130"', FRAME)
        self.assertNotIn('transform="translate(59 228)"', FRAME)
        self.assertIn('inset:auto auto 12% 3%', CSS)
        self.assertIn('stroke:none!important;fill:var(--ink)', CSS)

    def test_nautical_routes_and_scaled_engraved_figures(self):
        self.assertIn('class="chart-nautical-routes"', FURNITURE)
        self.assertIn('class="chart-nautical-routes"', PAGE)
        self.assertIn('clip-path="url(#robinsonWorldClip)"', PAGE)
        self.assertNotIn('class="chart-rhumbs"', FURNITURE)
        self.assertEqual(FURNITURE.count('<svg x='), 3)
        import re
        sizes = [int(n) for n in re.findall(r'<svg x="[^"]+" y="[^"]+" width="(\d+)"', FURNITURE)]
        self.assertEqual(len(sizes), 3)
        self.assertTrue(all(size <= 26 for size in sizes))
        self.assertIn('stroke:var(--ink)', CSS)


    def test_css_edition_key_matches(self):
        digest=hashlib.sha256((BASE/"edition.css").read_bytes()).hexdigest()[:12]
        self.assertIn('edition.css?v='+digest, PAGE)
        self.assertIn('edition.css?v='+digest, (BASE/"setup/index.html").read_text())

if __name__=="__main__":
    unittest.main()
