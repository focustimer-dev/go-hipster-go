#!/usr/bin/env python3
"""PWA-only two-ink neutral portrait press. Never changes canonical source art."""
import argparse
import hashlib
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ART=Path(__file__).resolve().parents[1]/"launcher/editions/gig-poster/assets"
SIX_SHA="d51203d8a3b84cb76e246b5b9322cd17625da07624692a1d43ae32c4f981ab74"
FOREST=np.array((6,56,33),dtype=np.float32)
CREAM=np.array((246,210,171),dtype=np.float32)
# Face/neck INSET zones, not outlines or character segmentation.
ZONES=(
 ((260,293,85,105),(252,410,49,50)), # happy
 ((257,295,89,112),(255,405,48,50)), # angry
 ((257,311,88,109),(256,414,48,49)), # sad
 ((257,300,85,104),(254,403,48,42)), # weird
 ((254,270,64,84),),                   # criminal
 ((258,312,84,108),(260,416,50,43)), # funky
)

def press(alpha,zones,name):
    """Preserve original ink alpha pixel-for-pixel; insert warm cream UNDER it."""
    a=np.asarray(alpha,dtype=np.float32)
    h,w=a.shape
    assert a.min()>=0 and a.max()<=1, name
    yy,xx=np.mgrid[:h,:w]
    region=np.zeros((h,w),dtype=np.float32)
    allowed=np.zeros((h,w),dtype=bool)
    for cx,cy,rx,ry in zones:
        radius=np.sqrt(((xx-cx)/rx)**2+((yy-cy)/ry)**2)
        t=np.clip((1.02-radius)/0.18,0,1)
        region=np.maximum(region,(t*t*(3-2*t)).astype(np.float32))
        allowed|=radius<1.02
    # Local density of ACTUAL approved linework protects open exterior hair gaps.
    density=ndi.gaussian_filter(a,sigma=max(4.0,h/64))
    support=np.clip((density-0.10)/0.13,0,1)
    cream_a=(0.94*region*support*(1-a)).astype(np.float32)
    out_a=a+cream_a*(1-a)
    premul=FOREST[None,None,:]*a[:,:,None]+CREAM[None,None,:]*(cream_a*(1-a))[:,:,None]
    rgb=np.where(out_a[:,:,None]>0,premul/np.maximum(out_a[:,:,None],1e-7),0)
    rgba=np.empty((h,w,4),dtype=np.uint8)
    rgba[:,:,:3]=np.clip(np.rint(rgb),0,255).astype('uint8')
    rgba[:,:,3]=np.clip(np.rint(out_a*255),0,255).astype('uint8')
    added=(rgba[:,:,3].astype(np.int16)-np.rint(a*255).astype(np.int16))>2
    assert not np.any(added&~allowed),name+' cream leaked outside face/neck interior'
    assert added.sum()>10,name+' has no warm highlights'
    print(name,':',int(added.sum()),'inboard cream pixels')
    return Image.fromarray(rgba,'RGBA')

def save_or_check(image,path,check):
    if check:
        assert np.array_equal(np.asarray(image),np.asarray(Image.open(path).convert('RGBA'))),path
    else:
        image.save(path,format='WEBP',lossless=True,exact=True,method=6)
    print('Verified' if check else 'Built',path.name)

def alpha_for_newer(source,reference_ink=False):
    rgba=np.asarray(Image.open(ART/source).convert('RGBA'),dtype=np.float32)
    out=rgba[:,:,3]/255
    if reference_ink:
        luminance=(rgba[:,:,:3]*[.2126,.7152,.0722]).sum(axis=2)/255
        out=out*np.clip((1-luminance)*1.12-.10,0,1)
    return out

def build(check=False):
    original=ART/'moods-neutral-ink-v2.webp'
    assert hashlib.sha256(original.read_bytes()).hexdigest()==SIX_SHA,'Canonical neutral ink bytes changed'
    src=np.asarray(Image.open(original).convert('RGBA'))
    assert src.shape==(1024,1536,4)
    sheet=Image.new('RGBA',(1536,1024),(0,0,0,0))
    names=('happy','angry','sad','weird','criminal','funky')
    for i,(name,zones) in enumerate(zip(names,ZONES)):
        x,y=(i%3)*512,(i//3)*512
        tile=press(src[y:y+512,x:x+512,3]/255,ZONES[i],name)
        sheet.paste(tile,(x,y))
    save_or_check(sheet,ART/'usiku-neutral-two-ink-v1.webp',check)
    # Separate approved neutral portrait assets; keep exactly their CSS registration.
    for mood,source,reference,zones in (
      ('desire','desire-neutral-v1.webp',True,((.50,.43,.25,.27),)),
      ('triumph','triumph-neutral-v1.webp',False,((.51,.40,.25,.29),)),
    ):
        a=alpha_for_newer(source,reference)
        h,w=a.shape
        scaled=tuple((cx*w,cy*h,rx*w,ry*h) for cx,cy,rx,ry in zones)
        save_or_check(press(a,scaled,mood),ART/f'usiku-{mood}-neutral-two-ink-v1.webp',check)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    build(parser.parse_args().check)
