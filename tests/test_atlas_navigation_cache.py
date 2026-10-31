"""The cached camera data must stay tied to the painted Robinson projection."""
import importlib.util
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('atlas_navigation', ROOT / 'scripts/atlas_navigation.py')
navigation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(navigation)


class AtlasNavigationCacheTests(unittest.TestCase):
    def test_cached_geometry_matches_current_painted_countries(self):
        page = (ROOT / 'launcher/editions/gig-poster/index.html').read_text()
        embedded = json.loads(re.search(r'id="atlasNavigationGeometry">(.*?)</script>', page).group(1))
        self.assertEqual(embedded, navigation.navigation_data(page))
        self.assertGreater(len(embedded['anchors']), 300)
        self.assertEqual(len(set(s[0] for s in embedded['shapes'])), 25)

    def test_polygon_holes_and_direction_keep_their_fill_semantics(self):
        outer = [(0, 0), (10, 0), (10, 10), (0, 10)]
        hole = [(3, 3), (3, 7), (7, 7), (7, 3)]
        self.assertNotEqual(navigation._winding(outer, 1, 1), 0)
        self.assertEqual(navigation._winding(outer, 5, 5) + navigation._winding(hole, 5, 5), 0)
        self.assertEqual(navigation._winding(outer, 15, 5), 0)

    def test_zoom_only_artwork_is_not_an_initial_image_request(self):
        page = (ROOT / 'launcher/editions/gig-poster/index.html').read_text()
        image = re.search(r'<image\b[^>]*id="chart-engravings"[^>]*>', page).group()
        self.assertNotRegex(image, r'\shref=')
        self.assertIn('data-src=', image)
