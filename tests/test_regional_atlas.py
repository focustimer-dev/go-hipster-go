"""Check regional lookup integrity and portable reference availability."""
import json
import re
import unittest
from pathlib import Path
from scripts.build_gemini_app_skill import REFERENCES

ROOT = Path(__file__).resolve().parents[1]


class RegionalAtlasTests(unittest.TestCase):
    def test_every_map_region_has_thirty_addressable_routes(self):
        app = (ROOT / 'launcher/assets/app.js').read_text()
        regions = json.loads(re.search(r'const crateRegions=(\[.*?\]);', app)[1])
        index = (ROOT / 'references/regional-atlas.md').read_text()
        skill = (ROOT / 'SKILL.md').read_text()
        seen = set()
        self.assertEqual(len(regions), 24)
        for region in regions:
            rid = region['id']
            path = f'references/regions/{rid}.md'
            text = (ROOT / path).read_text()
            self.assertIn(f'`{rid}`', index)
            self.assertIn(path, skill)
            self.assertIn(path, REFERENCES)
            self.assertIn('unverified leads', text)
            self.assertIn('Drive source', text)
            ids = re.findall(r'^\| `([^`]+)` \|', text, re.M)
            self.assertEqual(ids, [f'{rid}:{n:02}' for n in range(1, 31)])
            self.assertFalse(seen.intersection(ids))
            seen.update(ids)
        self.assertEqual(len(seen), 720)

    def test_reference_links_resolve_in_source_and_distribution(self):
        for prefix in [ROOT, ROOT / 'skills/go-hipster-go']:
            for path in [prefix / 'SKILL.md', *list((prefix / 'references/regions').glob('*.md')), prefix / 'references/regional-atlas.md']:
                for link in re.findall(r'\]\(([^)]+)\)', path.read_text()):
                    if link.startswith(('https:', 'http:', '#')):
                        continue
                    target = link.split('#')[0]
                    self.assertTrue((path.parent / target).is_file(), f'{path}: {link}')
