"""Generate six proportion-preserving translucent cassette backgrounds for Android Lab.
Derived from one editable layered raster master. No external image or fonts.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import math

ROOT = Path(__file__).resolve().parents[1]
W, H = 1080, 700

def rect(draw, xy, fill=None, outline=None, width=1, radius=0):
    if radius:
        draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)
    else:
        draw.rectangle(xy, fill=fill, outline=outline, width=width)

def master():
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")
    rect(d, (21,23,W-18,H-20), fill=(0,0,0,50), radius=50)
    rect(d, (10,10,W-12,H-14), fill=(177,207,212,76),
         outline=(233,254,255,215), width=10, radius=52)
    rect(d, (24,25,W-25,H-26), fill=(220,244,246,35),
         outline=(255,255,255,160), width=3, radius=42)
    rect(d, (41,44,W-43,H-42), fill=(22,27,35,188),
         outline=(176,214,221,113), width=3, radius=32)
    for j in range(8):
        y = 42 + j*7
        d.line((84,y,W-82,y), fill=(228,245,249,max(15,95-j*8)), width=2)
    for j in range(7):
        y = H-86+j*8
        d.line((120,y,W-120,y), fill=(210,231,243,80-j*8), width=2)
    rect(d,(78,89,W-81,235),fill=(16,22,32,220),
         outline=(237,247,250,60),width=2,radius=12)
    d.polygon([(69,226),(69,103),(249,103),(159,231)], fill=(242,15,123,232))
    d.polygon([(107,245),(249,107),(339,107),(193,245)], fill=(235,14,126,180))
    d.polygon([(W-312,107),(W-75,107),(W-75,233),(W-239,233)], fill=(4,183,166,205))
    d.polygon([(W-175,240),(W-70,150),(W-70,290),(W-250,290)], fill=(19,216,198,195))
    rect(d,(77,277,W-78,H-158),fill=(15,13,18,180),
         outline=(223,239,240,53),width=3,radius=24)
    for k in range(23):
        y = 285+k*10
        d.line((94,y,W-94,y), fill=(118,88,76,8+(k%4)*7), width=1)
    for cx in (340, 740):
        cy = 439
        d.ellipse((cx-167,cy-167,cx+167,cy+167),
                  fill=(18,13,18,245), outline=(101,73,55,175), width=5)
        for rr in range(142,171,5):
            d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr), outline=(106,79,63,48), width=2)
        d.ellipse((cx-113,cy-113,cx+113,cy+113),
                  fill=(239,168,7,255), outline=(255,214,51,255), width=9)
        d.ellipse((cx-93,cy-93,cx+93,cy+93),outline=(151,94,5,220),width=6)
        for n in range(16):
            a = math.tau*n/16
            x,y = cx+95*math.cos(a), cy+95*math.sin(a)
            d.ellipse((x-10,y-10,x+10,y+10),
                      fill=(125,78,4,255), outline=(255,215,70,200), width=2)
        d.ellipse((cx-57,cy-57,cx+57,cy+57),
                  fill=(205,225,226,100),outline=(255,244,184,250),width=10)
        for n in range(6):
            a = math.tau*n/6
            x,y = cx+47*math.cos(a),cy+47*math.sin(a)
            d.ellipse((x-8,y-8,x+8,y+8),fill=(252,239,185,250))
        d.ellipse((cx-25,cy-25,cx+25,cy+25),
                  fill=(19,25,31,170),outline=(255,255,255,150),width=2)
    for i in range(5):
        x=504+i*19
        d.line((x,413,x,456),fill=(222,230,219,130),width=5)
    rect(d,(96,H-180,W-95,H-70),fill=(187,228,232,32),
         outline=(245,255,255,134),width=4,radius=27)
    for y in (H-153,H-143,H-133,H-123):
        d.line((132,y,W-132,y),fill=(240,248,255,55),width=2)
    for x,y in ((65,64),(W-64,64),(67,H-69),(W-65,H-69)):
        d.ellipse((x-32,y-32,x+32,y+32),
                  fill=(159,173,177,210),outline=(250,255,255,240),width=7)
        d.ellipse((x-22,y-22,x+22,y+22),
                  fill=(32,37,45,240),outline=(117,121,125,255),width=5)
        d.line((x-15,y,x+15,y),fill=(205,210,211,245),width=6)
        d.line((x,y-15,x,y+15),fill=(204,208,208,245),width=6)
    for x in (164,W-164):
        y=H-85
        d.ellipse((x-27,y-27,x+27,y+27),
                  fill=(240,170,8,250),outline=(255,209,41,240),width=5)
        d.ellipse((x-9,y-9,x+9,y+9),
                  fill=(21,25,28,225),outline=(255,244,169,230),width=2)
    d.line(((92,69),(213,69)),fill=(255,255,255,172),width=5)
    d.line(((W-206,69),(W-94,69)),fill=(255,255,255,102),width=3)
    return im

PRESETS = {
    "mini": (360,360,.29),
    "tall2": (300,600,.29),
    "tall3": (300,800,.29),
    "wide": (780,350,.50),
    "square": (650,650,.50),
    "hero": (580,850,.50)
}

def render(destination):
    destination=Path(destination)
    destination.mkdir(parents=True,exist_ok=True)
    image=master()
    for name,(width,height,focus) in PRESETS.items():
        crop=ImageOps.fit(image,(width,height),method=Image.Resampling.LANCZOS,
                          centering=(focus,.5))
        crop.save(destination/("widget_cassette_"+name+".webp"),"WEBP",
                  quality=82,method=6)

if __name__ == "__main__":
    render(ROOT/"android-lab/app/src/main/res/drawable-nodpi")
