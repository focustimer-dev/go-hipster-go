"""Keep approved identities and paired sprite dimensions stable across releases."""
import hashlib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'launcher/editions/gig-poster/assets'


class ApprovedMoodSprites(unittest.TestCase):
    def test_approved_bytes_are_locked(self):
        expected = {
            'neutral': 'fc61de6740b8ad4f909c561bb3b34b2d6e5d9347b84cc9fcb2387f425dd5c794',
            'selected': 'f45fa9c3d5915723f393e71a7ee8cb26d11c3931ec533fd8b98f6ace74625a72',
        }
        for state, digest in expected.items():
            data = (ART / f'moods-{state}-approved-v1.webp').read_bytes()
            self.assertEqual(hashlib.sha256(data).hexdigest(), digest, state)
            self.assertEqual(data[:4], b'RIFF')
            self.assertEqual(data[8:12], b'WEBP')

    def test_production_page_has_filter_and_stylesheet(self):
        page = (ROOT / 'launcher/editions/gig-poster/index.html').read_text()
        css = (ROOT / 'launcher/editions/gig-poster/mood-portraits.css').read_bytes()
        version = hashlib.sha256(css).hexdigest()[:12]
        self.assertIn(f'mood-portraits.css?v={version}', page)
        for name in ['ghg-mood-paper', 'ghg-mood-selected']:
            self.assertEqual(page.count(f'id="{name}"'), 1)
