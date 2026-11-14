"""Package compact copies of the approved artwork with transparency intact."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ARTWORK = ROOT / "android-lab/artwork/chaos-roll"


def remove_release_lab_mark(image):
    """Remove only the printed '/ LAB' suffix from the release cassette.

    The user-approved Lab PNG remains pristine; the product/RC builds must not
    display the Lab identifier. The black label has a quiet ink background
    directly underneath the lettering. Use its existing nearby pixels instead
    of redrawing the case, reels, tape, headline, highlights, or lettering.

    Bounds are measured relative to the *full approved cassette image* after
    inspection: the suffix is in the upper-right black banner. Any change to
    the original art needs a new reviewed mask, not an automatic guess.
    """
    from PIL import ImageDraw
    w, h = image.size
    # Suffix '/ LAB' on the black title panel, clear of 'HIPSTER GO'.
    x1, x2 = round(w * .775), round(w * .904)
    y1, y2 = round(h * .167), round(h * .252)
    # Sample the unlettered black region just below the suffix.
    # Keep original alpha intact at every pixel, including sleeve edges.
    sample_rows = [round(h * frac) for frac in (.263, .271, .279, .287)]
    pixels = image.load()
    for x in range(x1, x2):
        samples = [pixels[x, y][:3] for y in sample_rows]
        # A dark ink swatch from the cassette's own printed black panel.
        rgb = tuple(sorted(v[channel] for v in samples)[1] for channel in range(3))
        for y in range(y1, y2):
            a = pixels[x, y][3]
            pixels[x, y] = (*rgb, a)
    return image


def render(destination, *, release_mode=False):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    for name in ("record", "cassette"):
        with Image.open(ARTWORK / (name + ".png")) as original:
            image = original.convert("RGBA")
            image.thumbnail((960, 960), Image.Resampling.LANCZOS)
            if release_mode and name == "cassette":
                image = remove_release_lab_mark(image)
            image.save(destination / ("widget_chaos_" + name + ".webp"),
                       quality=93, alpha_quality=100, method=6)
        (destination / ("widget_chaos_" + name + ".png")).unlink(missing_ok=True)
    for old in destination.glob("widget_cassette_*.webp"):
        old.unlink()


if __name__ == "__main__":
    render(ROOT / "android-lab/app/src/main/res/drawable-nodpi")
