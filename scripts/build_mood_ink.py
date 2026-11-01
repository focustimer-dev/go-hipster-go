"""Rebuild approved ink sprites. Offline authoring needs Pillow, numpy and scipy."""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ART = Path(__file__).resolve().parents[1] / 'launcher/editions/gig-poster/assets'

def build(check=False, version="v2"):
    spec = json.loads((ART / ('mood-ink-'+version+'.json')).read_text())
    for state in ('neutral', 'selected'):
        source = ART / f'moods-{state}-approved-v1.webp'
        assert hashlib.sha256(source.read_bytes()).hexdigest() == spec['source_hashes'][state], 'Approved source changed'
        sheet = Image.open(source).convert('RGB')
        result = np.zeros((1024, 1536, 4), dtype=np.uint8)
        for i, _ in enumerate(spec['cells']):
            x, y = i % 3 * 512, i // 3 * 512
            rgb = np.array(sheet.crop((x, y, x+512, y+512)))
            gray = np.sum(rgb * np.array([.2126, .7152, .0722]), axis=2)
            strength = np.clip((spec['paper_level'] - gray) / (spec['paper_level'] - spec['ink_level']), 0, 1)
            strength[strength < spec['noise_floor']] = 0
            alpha = np.rint(strength * 255).astype(np.uint8)
            roi = np.zeros_like(alpha)
            x0, y0, x1, y1 = spec['roi'][state][i]
            roi[y0:y1, x0:x1] = 255
            alpha = np.minimum(alpha, roi)
            yy, xx = np.indices(alpha.shape)
            r = spec['frame_rules']
            faint = (alpha > r['min_alpha']) & (alpha < r['max_alpha'])
            horizontal = ndi.binary_opening(faint, structure=np.ones((1,r['min_length']),bool)) & ((yy < r['perimeter_top']) | (yy > r['perimeter_bottom']))
            vertical = ndi.binary_opening(faint, structure=np.ones((r['min_length'],1),bool)) & ((xx < r['perimeter_left']) | (xx > r['perimeter_right']))
            alpha[ndi.binary_dilation(horizontal | vertical, iterations=r['dilation_pixels'])] = 0
            if i == 0:
                alpha = np.minimum(alpha, np.array(Image.open(ART / f'happy-{state}-ink-support-v1.png')))
            if 'crown_patches' in spec:
                patch = spec['crown_patches'][state]
                patch_path = ART / patch['file']
                assert hashlib.sha256(patch_path.read_bytes()).hexdigest() == patch['sha256']
                crown = np.array(Image.open(patch_path))
                alpha[:patch['rows']] = crown[y:y+patch['rows'],x:x+512]
            result[y:y+512,x:x+512,:3] = spec['ink_rgb']
            result[y:y+512,x:x+512,3] = alpha
        target = ART / f'moods-{state}-ink-{version}.webp'
        if check:
            actual = np.array(Image.open(target).convert('RGBA'))
            assert np.array_equal(actual[:,:,3],result[:,:,3]), state+' alpha differs'
            assert np.array_equal(actual[:,:,:3][actual[:,:,3]>0],result[:,:,:3][actual[:,:,3]>0]), state+' ink differs'
        else:
            Image.fromarray(result).save(target, lossless=True, exact=True, method=6)
        print(('Verified' if check else 'Built')+' '+target.name)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--version', choices=['v1','v2'], default='v2')
    args = parser.parse_args()
    build(args.check, args.version)
