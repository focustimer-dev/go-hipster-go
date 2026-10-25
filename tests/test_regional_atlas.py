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

    def test_additions_are_addressable_and_shipped(self):
        seen = set()
        for key in ['oceania', 'central-america', 'central-africa', 'southern-africa']:
            path = f'references/regions/{key}-additions.md'
            self.assertIn(path, REFERENCES)
            text = (ROOT / path).read_text()
            ids = re.findall(r'^\| `([^`]+)` \|', text, re.M)
            self.assertEqual(ids, [f'{key}:add-{n:02}' for n in range(1, 51)])
            self.assertFalse(seen.intersection(ids))
            seen.update(ids)
            self.assertIn('unverified research leads', text)
        self.assertEqual(len(seen), 200)

    def test_reviewed_lenses_have_evidence_and_real_source_handles(self):
        rows = json.loads((ROOT / 'references/discovery-lenses.json').read_text())
        reviewed = [row for row in rows if row['id'].startswith('review-')]
        self.assertEqual(len(reviewed), 8)
        for row in reviewed:
            self.assertTrue(row['evidence_urls'])
            self.assertEqual(row['review_status'], 'route-supported-recordings-unverified')
            self.assertTrue(set(row['regions']) <= {'oceania', 'us-west', 'central-america', 'central-southern-africa'})
            for handle in row['source_entries']:
                region, entry = handle.split(':')
                suffix = '-additions' if entry.startswith('add-') else ''
                text = (ROOT / f'references/regions/{region}{suffix}.md').read_text()
                self.assertIn(f'`{handle}`', text)
        review = (ROOT / 'references/regional-review.md').read_text()
        self.assertIn('song-level crime narrative evidence', review)
        self.assertIn('discard the cue', review)
