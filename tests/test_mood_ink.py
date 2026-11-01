"""Source provenance and lossless alpha sprite contracts, without authoring dependencies."""
import hashlib
import json
import struct
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'launcher/editions/gig-poster/assets'

class MoodInkTests(unittest.TestCase):
    def test_lossless_alpha_sprites_and_source_provenance(self):
        spec = json.loads((ART/'mood-ink-v1.json').read_text())
        for state in ('neutral','selected'):
            source = (ART/f'moods-{state}-approved-v1.webp').read_bytes()
            self.assertEqual(hashlib.sha256(source).hexdigest(),spec['source_hashes'][state])
            data = (ART/f'moods-{state}-ink-v1.webp').read_bytes()
            self.assertEqual(hashlib.sha256(data).hexdigest(),spec['output_hashes'][state])
            self.assertEqual(data[:4],b'RIFF')
            self.assertEqual(data[8:16],b'WEBPVP8L')
            self.assertEqual(data[20],0x2f)
            bits = struct.unpack('<I',data[21:25])[0]
            self.assertEqual(((bits & 0x3fff)+1,((bits>>14)&0x3fff)+1),(1536,1024))
            self.assertTrue((bits>>28)&1,'Sprite must carry transparency')

    def test_current_pages_preload_ink_sprites(self):
        page=(ROOT/'launcher/editions/gig-poster/index.html').read_text()
        for state in ('neutral','selected'):
            self.assertIn(f'assets/moods-{state}-ink-v1.webp',page)
            self.assertNotIn(f'assets/moods-{state}-approved-v1.webp',page)
