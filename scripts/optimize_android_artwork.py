"""Compress disposable Android artwork copies; preserve canonical GitHub masters.

Theme colors stay driven by existing CSS masks and tokens, not duplicate images.
"""
from pathlib import Path
from PIL import Image

ART = Path("editions/gig-poster/assets")
PORTRAITS = (
    "desire-neutral-v1.webp",
    "desire-selected-v1.webp",
    "triumph-neutral-v1.webp",
    "triumph-selected-v1.webp",
)
ENGRAVING = "atlas-engraved-details.png"
QUALITY = 92


def optimize(destination):
    destination = Path(destination)
    assets = destination / ART
    saved = []
    for name in (*PORTRAITS, ENGRAVING):
        source = assets / name
        if not source.is_file():
            raise FileNotFoundError("Missing canonical Android artwork: " + str(source))
        size_before = source.stat().st_size
        with Image.open(source) as original:
            rgba = original.convert("RGBA")
        alpha = rgba.getchannel("A").tobytes()
        temporary = source.with_name(source.stem + ".optimized.webp")
        rgba.save(temporary, format="WEBP", quality=QUALITY, method=3, exact=True)
        with Image.open(temporary) as check:
            if check.size != rgba.size or check.convert("RGBA").getchannel("A").tobytes() != alpha:
                temporary.unlink()
                raise ValueError("Artwork size or transparency changed: " + name)
        size_after = temporary.stat().st_size
        if size_after >= size_before:
            temporary.unlink()
            saved.append((name, size_before, size_before))
            continue
        if source.suffix == ".png":
            target = source.with_suffix(".webp")
            if target.exists():
                raise FileExistsError("Refusing to overwrite existing artwork " + str(target))
            temporary.rename(target)
            references = 0
            for page in destination.rglob("*"):
                if page.is_file() and page.suffix.lower() in (".html", ".css", ".js", ".svg"):
                    content = page.read_text(encoding="utf-8")
                    count = content.count(source.name)
                    if count:
                        references += count
                        page.write_text(content.replace(source.name, target.name), encoding="utf-8")
            if not references:
                target.unlink()
                raise RuntimeError("Original Atlas engraving reference absent")
            source.unlink()
        else:
            temporary.replace(source)
        saved.append((name, size_before, size_after))
    return saved


if __name__ == "__main__":
    import sys
    for filename, old, new in optimize(sys.argv[1]):
        print(f"{filename}: {old} -> {new} ({old-new} bytes saved)")
