"""Source provenance and lossless alpha sprite contracts, without authoring dependencies."""
import hashlib
import json
import re
import struct
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'launcher/editions/gig-poster/assets'

class MoodInkTests(unittest.TestCase):
    def test_lossless_alpha_sprites_and_source_provenance(self):
        spec = json.loads((ART/'mood-ink-v2.json').read_text())
        for state in ('neutral','selected'):
            source = (ART/f'moods-{state}-approved-v1.webp').read_bytes()
            self.assertEqual(hashlib.sha256(source).hexdigest(),spec['source_hashes'][state])
            data = (ART/f'moods-{state}-ink-v2.webp').read_bytes()
            self.assertEqual(hashlib.sha256(data).hexdigest(),spec['output_hashes'][state])
            self.assertEqual(data[:4],b'RIFF')
            self.assertEqual(data[8:16],b'WEBPVP8L')
            self.assertEqual(data[20],0x2f)
            bits = struct.unpack('<I',data[21:25])[0]
            self.assertEqual(((bits & 0x3fff)+1,((bits>>14)&0x3fff)+1),(1536,1024))
            self.assertTrue((bits>>28)&1,'Sprite must carry transparency')

    def test_crown_patch_provenance_and_bounds(self):
        spec=json.loads((ART/'mood-ink-v2.json').read_text())
        for state in ('neutral','selected'):
            patch=spec['crown_patches'][state]
            self.assertEqual(patch['rows'],80)
            data=(ART/patch['file']).read_bytes()
            self.assertEqual(hashlib.sha256(data).hexdigest(),patch['sha256'])
            self.assertEqual(data[:8],b'\x89PNG\r\n\x1a\n')
            self.assertEqual(struct.unpack('>II',data[16:24]),(1536,1024))

    def test_funk_lasers_exclude_the_full_figure(self):
        svg=(ART/'funk-laser-exclusion.svg').read_text()
        source=(ART/'moods-selected-ink-v2.webp').read_bytes()
        self.assertIn(hashlib.sha256(source).hexdigest(),svg,'Mask must track the locked portrait alpha')
        rows={}
        for x,y,width in re.findall(r'M(\d+) (\d+)h(\d+)v1H\d+z',svg):
            rows.setdefault(int(y),[]).append((int(x),int(x)+int(width)))
        def excluded(x,y): return any(left<=x<right for left,right in rows.get(y,[]))
        for x,y in [(270,180),(270,240),(280,330),(230,360)]:
            self.assertTrue(excluded(x,y),'Interior portrait highlights must block lasers')
        for x,y in [(0,0),(10,50),(500,25)]:
            self.assertFalse(excluded(x,y),'Background must still show laser linework')
        css=(ART.parent/'mood-portraits.css').read_text()
        self.assertIn('mask-mode:luminance',css)
        self.assertIn('background:#efd0d0',css,'Red cannot mix with the yellow paper')
        self.assertNotIn('background:rgb(214 75 48 / 22%)',css)

    def test_current_pages_preload_ink_sprites(self):
        page=(ROOT/'launcher/editions/gig-poster/index.html').read_text()
        for state in ('neutral','selected'):
            self.assertIn(f'assets/moods-{state}-ink-v2.webp',page)
            self.assertNotIn(f'assets/moods-{state}-approved-v1.webp',page)
