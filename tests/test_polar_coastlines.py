"""The polar paths must use complete coastlines rather than cropped source latitudes."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class PolarCoastlineTests(unittest.TestCase):
    def test_antarctica_is_explicit_opt_in_across_skill_routes(self):
        for path in ('SKILL.md', 'references/regions/antarctica.md'):
            text = (ROOT / path).read_text()
            for guard in ('Explicit opt-in only', 'plain `go`', 'worldwide/global/all-region',
                          'automatic regional shuffle', 'prior Antarctica playlist',
                          'explicit region selections never imply Antarctica'):
                self.assertIn(guard, text, path)
        compact = (ROOT / 'scripts/build_gemini_app_skill.py').read_text()
        self.assertIn('Exclude it from plain go', compact)
        self.assertIn('Past use is not consent', compact)

    def test_complete_greenland_and_antarctica_are_inside_robinson_plate(self):
        page = (ROOT / 'launcher/editions/gig-poster/index.html').read_text()
        paths = {}
        for tag in re.findall(r'<path [^>]*data-atlas-country=[^>]*>', page):
            code = re.search(r'data-atlas-country="([^"]+)"', tag).group(1)
            if code in {'GRL', 'ATA'}:
                d = re.search(r'\bd="([^"]+)"', tag).group(1)
                paths[code] = [(float(x), float(y)) for x, y in re.findall(r'[ML](-?[\d.]+)\s+(-?[\d.]+)', d)]
        self.assertEqual(set(paths), {'GRL', 'ATA'})
        self.assertLess(min(y for _, y in paths['GRL']), 30)
        self.assertGreater(len(paths['ATA']), 500)
        self.assertEqual(max(y for _, y in paths['ATA']), 356)
        for points in paths.values():
            self.assertTrue(all(20 <= x <= 700 and 20 <= y <= 356 for x, y in points))

    def test_antarctica_is_a_normal_selectable_and_persistable_region(self):
        page = (ROOT / 'launcher/index.html').read_text()
        app = (ROOT / 'launcher/assets/app.js').read_text()
        regions = json.loads(re.search(r'const crateRegions=(\[.*?\]);', app).group(1))
        self.assertEqual(len(regions), 25)
        self.assertIn({'id': 'antarctica', 'label': 'Antarctica', 'continent': 'antarctica'}, regions)
        self.assertIn('data-crate-region="antarctica"', page)
        self.assertIn('data-atlas-region="antarctica"', page)
