"""Trace a laser exclusion mask from the locked Funk ink alpha, never change the portrait.

Authoring requires Pillow, numpy and scipy, matching build_mood_ink.py.
The SVG is a UI mask, not a replacement illustration. Enclosed transparent engraving
highlights are filled so background linework cannot show through the face or clothing.
"""
from pathlib import Path
import hashlib
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ART = Path(__file__).resolve().parents[1] / 'launcher/editions/gig-poster/assets'
source = ART / 'moods-selected-ink-v2.webp'
a = np.array(Image.open(source).convert('RGBA'))[512:1024,1024:1536,3]
shape = ndi.binary_closing(a > 8, iterations=3)
shape = ndi.binary_dilation(ndi.binary_fill_holes(shape), iterations=2)
runs = []
for y, row in enumerate(shape):
    edges = np.diff(np.r_[False,row,False].astype(int))
    for start,end in zip(np.flatnonzero(edges == 1),np.flatnonzero(edges == -1)):
        runs.append(f'M{start} {y}h{end-start}v1H{start}z')
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n'
       '<!-- Laser exclusion mask traced from approved Funk alpha. Source SHA256: '
       + hashlib.sha256(source.read_bytes()).hexdigest() + ' -->\n'
       '<rect width="512" height="512" fill="white"/>\n'
       '<path fill="black" d="'+''.join(runs)+'"/>\n</svg>\n')
(ART/'funk-laser-exclusion.svg').write_text(svg)
print('Built Funk laser exclusion mask from locked selected sprite alpha')
