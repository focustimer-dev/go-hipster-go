"""Create Desire v2's portrait-independent decorative heart selection mask.

Older Desire art had heart-shaped pupils. Those coordinates must never be used
with the approved classical portrait; the source artwork now stores ink in alpha.
The decorative mask does not modify either portrait's alpha or theme pigments.
"""
from pathlib import Path

ART = Path(__file__).resolve().parents[1]/'launcher/editions/gig-poster/assets'
MASK = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254">
<!-- Desire v2: selected-state hearts printed at the outside of the portrait,
     not extracted from the old face. Ink color belongs to the theme CSS. -->
<defs><path id="heart" d="M0 -22 C-38 -60 -92 -5 0 72 C92 -5 38 -60 0 -22Z"/></defs>
<g fill="white">
<use href="#heart" transform="translate(159 206) scale(.77)"/>
<use href="#heart" transform="translate(1075 187) scale(.90) rotate(9)"/>
<use href="#heart" transform="translate(76 329) scale(.34) rotate(-12)"/>
<use href="#heart" transform="translate(1165 302) scale(.34) rotate(14)"/>
</g>
</svg>'''
(ART/'desire-heart-ink-mask.svg').write_text(MASK+'\n')
print('Built Desire v2 decorative heart accent mask')
