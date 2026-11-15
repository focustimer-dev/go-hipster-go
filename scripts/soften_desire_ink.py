"""Apply the approved v4 alpha-only correction once to pinned original plates."""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'launcher/editions/gig-poster/assets'
ORIGINALS = {
    'neutral': '59680b820cb7406639dbe67164835108ca3e6f0c284a97f2051dd3526f9ed207',
    'selected': 'dc7c2204ac872c1a1a743fbd07329bfb5e32d39e66497189d6320e4d0bcaa4d7',
}
# Preserve alpha 0..191 exactly. Compress only the darkest quarter smoothly
# toward 230/255 (90.2%) at full ink, without flattening that tonal range.
ALPHA_LUT = [a if a <= 191 else round(191 + (a - 191) * 39 / 64) for a in range(256)]

def main():
    from PIL import Image
    for state, expected in ORIGINALS.items():
        path = ART / f'desire-{state}-v4.webp'
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise SystemExit(f'Refusing repeated or unverified processing: {path.name}')
    for state in ORIGINALS:
        path = ART / f'desire-{state}-v4.webp'
        with Image.open(path) as source:
            image = source.convert('RGBA')
        image.putalpha(image.getchannel('A').point(ALPHA_LUT))
        image.save(path, format='WEBP', lossless=True, exact=True, method=6)
        print(path.name, hashlib.sha256(path.read_bytes()).hexdigest(), path.stat().st_size)

if __name__ == '__main__':
    main()
