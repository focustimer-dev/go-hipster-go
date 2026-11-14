"""Package compact copies of the approved artwork with transparency intact."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ARTWORK = ROOT / "android-lab/artwork/chaos-roll"


def render(destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    for name in ("record", "cassette"):
        with Image.open(ARTWORK / (name + ".png")) as original:
            image = original.convert("RGBA")
            image.thumbnail((960, 960), Image.Resampling.LANCZOS)
            image.save(destination / ("widget_chaos_" + name + ".webp"),
                       quality=93, alpha_quality=100, method=6)
        (destination / ("widget_chaos_" + name + ".png")).unlink(missing_ok=True)
    for old in destination.glob("widget_cassette_*.webp"):
        old.unlink()


if __name__ == "__main__":
    render(ROOT / "android-lab/app/src/main/res/drawable-nodpi")
