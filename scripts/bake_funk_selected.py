"""Bake the locked selected Funk sprite into WebView-stable print ink.

The source plate is a 3x2, 512-pixel-cell RGBA sheet. Its RGB engraving is
flat teal (#103135); all the antique shading is in its original alpha.
SVG feColorMatrix(saturate=0) + feComponentTransfer gamma renders the
approved yellow on Chromium, but the CSS pseudo-element filter is unreliable
on Android WebView. Prebake those exact RGB channels, retain alpha unchanged,
and encode a small lossless WebP. Never modify the canonical source sprites.
"""
from pathlib import Path
from PIL import Image

SOURCE_INK = (16, 49, 53)
SHEET_SIZE = (1536, 1024)
CELL_BOX = (1024, 512, 1536, 1024)
GAMMA_EXPONENT = .65
YELLOW_CHANNELS = ((.733, .20), (.83, .17), (.038, .17))


def baked_rgb(ink=SOURCE_INK):
    # feColorMatrix(type=saturate, values=0) uses the sRGB luminance weights.
    gray = (.2126 * ink[0] + .7152 * ink[1] + .0722 * ink[2]) / 255
    return tuple(round(255 * (offset + scale * gray ** GAMMA_EXPONENT))
                 for offset, scale in YELLOW_CHANNELS)


def bake_funk(source, destination):
    source, destination = Path(source), Path(destination)
    with Image.open(source) as image:
        if image.size != SHEET_SIZE:
            raise ValueError("Canonical selected portrait plate geometry changed")
        sprite = image.convert("RGBA").crop(CELL_BOX)
    # The original canonical sprite encodes shading entirely in alpha.
    # Reject future changed art rather than silently baking the wrong plate.
    if set(sprite.getdata(0)) != {SOURCE_INK[0]}:
        raise ValueError("Selected Funk engraving RGB has changed: review the art")
    if sprite.getchannel("G").getextrema() != (SOURCE_INK[1], SOURCE_INK[1]):
        raise ValueError("Selected Funk green channel changed")
    if sprite.getchannel("B").getextrema() != (SOURCE_INK[2], SOURCE_INK[2]):
        raise ValueError("Selected Funk blue channel changed")
    alpha = sprite.getchannel("A")
    baked = Image.new("RGBA", sprite.size, baked_rgb() + (0,))
    baked.putalpha(alpha)
    destination.parent.mkdir(parents=True, exist_ok=True)
    baked.save(destination, "WEBP", lossless=True, method=6)
    return destination
