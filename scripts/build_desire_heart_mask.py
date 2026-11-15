"""Regenerate Desire v3's face-independent vector selected-state hearts."""
from pathlib import Path
ART = Path(__file__).resolve().parents[1] / 'launcher/editions/gig-poster/assets'
MASK = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254">
<!-- Desire v3: vector selected-state hearts in the negative space.
     No old eye-coordinate mask, extra opacity processing or external asset use. -->
<g fill="white">
<path transform="translate(159 206) scale(.77)" d="M0 -22 C-38 -60 -92 -5 0 72 C92 -5 38 -60 0 -22Z"/>
<path transform="translate(1075 187) scale(.90) rotate(9)" d="M0 -22 C-38 -60 -92 -5 0 72 C92 -5 38 -60 0 -22Z"/>
<path transform="translate(76 329) scale(.34) rotate(-12)" d="M0 -22 C-38 -60 -92 -5 0 72 C92 -5 38 -60 0 -22Z"/>
<path transform="translate(1165 302) scale(.34) rotate(14)" d="M0 -22 C-38 -60 -92 -5 0 72 C92 -5 38 -60 0 -22Z"/>
</g>
</svg>'''
(ART/'desire-heart-ink-mask.svg').write_text(MASK+'\n')
print('Built Desire v3 decorative heart accent mask')
