"""Build lossless runtime copies; original approved PNG plates remain canonical."""
from pathlib import Path
from PIL import Image

ART=Path(__file__).resolve().parents[1]/'launcher/editions/gig-poster/assets'
for stem in ('desire-neutral-v1','desire-selected-v1','triumph-neutral-v1','triumph-selected-v1'):
    source=Image.open(ART/(stem+'.png')).convert('RGBA')
    target=ART/(stem+'.webp')
    source.save(target,format='WEBP',lossless=True,exact=True,method=6)
    if source.tobytes()!=Image.open(target).convert('RGBA').tobytes():
        raise ValueError('Runtime pixels changed: '+stem)
    print(target.relative_to(ART.parent))
