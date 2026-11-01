"""Trace the selected Desire heart ink without changing the approved portrait.

Authoring uses Pillow, numpy and scipy, matching the existing ink-sprite builder.
A small opening disconnects the heart fill from fine surrounding engraving.
"""
from pathlib import Path
import hashlib
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ART=Path(__file__).resolve().parents[1]/'launcher/editions/gig-poster/assets'
source=ART/'desire-selected-v1.png'
a=np.array(Image.open(source).convert('RGBA'))
gray=np.sum(a[:,:,:3]*[.2126,.7152,.0722],axis=2)
dark=(gray<80)&(a[:,:,3]>100)
labels,_=ndi.label(ndi.binary_opening(dark,iterations=4))
hearts=np.isin(labels,[labels[570,470],labels[570,680]])
hearts=ndi.binary_dilation(hearts,iterations=2)&dark
runs=[]
for y,row in enumerate(hearts):
    edges=np.diff(np.r_[False,row,False].astype(int))
    for left,right in zip(np.flatnonzero(edges==1),np.flatnonzero(edges==-1)):
        runs.append(f'M{left} {y}h{right-left}v1H{left}z')
svg=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254">\n'
     '<!-- Exact original heart ink. Source SHA256: '+hashlib.sha256(source.read_bytes()).hexdigest()+' -->\n'
     '<path fill="white" d="'+''.join(runs)+'"/>\n</svg>\n')
(ART/'desire-heart-ink-mask.svg').write_text(svg)
print('Built Desire heart color mask from approved source')
