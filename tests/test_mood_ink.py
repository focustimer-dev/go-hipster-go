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
        self.assertIn('background:#d64b30',css,'Use the approved solid vermilion stock')
        self.assertNotIn('background:rgb(214 75 48 / 22%)',css)

    def test_desire_v4_full_crown_and_theme_alpha_masks(self):
        # CI's skill-validation Python environment intentionally has no Pillow.
        # The pinned, exact lossless files are alpha-verified in Android Lab.
        try:
            from PIL import Image
        except ImportError:
            Image = None
        svg=(ART/'desire-heart-ink-mask.svg').read_text()
        self.assertIn('Desire v3',svg)
        self.assertNotIn('Source SHA256',svg,'Old eye-coordinate mask must not survive')
        self.assertIn('viewBox="0 0 1254 1254"',svg)
        self.assertEqual(svg.count('<path '),4)
        css=(ART.parent/'mood-portraits.css').read_text()
        for state in ('neutral','selected'):
            self.assertIn(f'desire-{state}-v4.webp',css)
            path=ART/f'desire-{state}-v4.webp'
            expected = {
                'neutral': '05a4385a45262f70e9eb2f7262a48303de5751784909029fa35e1b0524eabd6d',
                'selected': 'dd93e886c2a08516a0b8e358c39a63a031f7faf81081eedacaa704cf2dfa55bc'
            }
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),expected[state])
            raw=path.read_bytes()
            self.assertEqual(raw[:4],b'RIFF')
            self.assertEqual(raw[8:12],b'WEBP')
            self.assertIn(b'VP8L',raw[:32],'Ink alpha plates must stay lossless')
            if Image is not None:
                with Image.open(path) as image:
                    self.assertEqual(image.size,(1254,1254))
                    rgba=image.convert('RGBA')
                    self.assertEqual(rgba.getchannel('A').getextrema(),(0,230))
                    self.assertLess(rgba.getchannel('A').getbbox()[1],60)
                    self.assertGreater(rgba.getchannel('A').getbbox()[3],1100)
        self.assertIn('mask-mode:alpha',css)
        self.assertIn('background-color:var(--lab-mood-neutral-ink',css)
        self.assertIn('background-color:var(--lab-mood-selected-ink',css)
        self.assertIn('transform:translateY(2%) scale(.92)',css)
        self.assertIn('background:var(--funk-selected-paper)',css)
        page=(ROOT/'launcher/editions/gig-poster/index.html').read_text()
        self.assertIn('class="desire-hearts" aria-hidden="true"',page)
        theme=(ROOT/'android-lab/web/theme-print.css').read_text()
        pwa=(ROOT/'launcher/assets/pwa-themes.css').read_text()
        self.assertIn('opacity:1;filter:none!important',theme)
        self.assertIn('opacity:1;filter:none!important',pwa)
        self.assertNotIn('Desire negative-looking selection plate stays hidden',pwa)
    def test_desire_softening_preserves_midtone_and_tonal_order(self):
        from scripts.soften_desire_ink import ALPHA_LUT
        self.assertEqual(ALPHA_LUT[:192], list(range(192)))
        self.assertEqual(ALPHA_LUT[255], 230)
        self.assertEqual(ALPHA_LUT, sorted(ALPHA_LUT))
        self.assertGreater(len(set(ALPHA_LUT[192:])), 30)

    def test_current_pages_preload_ink_sprites(self):
        page=(ROOT/'launcher/editions/gig-poster/index.html').read_text()
        for state in ('neutral','selected'):
            self.assertIn(f'assets/moods-{state}-ink-v2.webp',page)
            self.assertNotIn(f'assets/moods-{state}-approved-v1.webp',page)
