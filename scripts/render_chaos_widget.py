"""Install approved raster artwork verbatim; never redraw, crop or recompress it."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
ARTWORK = ROOT / "android-lab/artwork/chaos-roll"

def render(destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    for name in ("record", "cassette"):
        shutil.copyfile(ARTWORK / (name + ".png"),
                        destination / ("widget_chaos_" + name + ".png"))
    # Remove the old procedural crops from incremental builds too.
    for old in destination.glob("widget_cassette_*.webp"):
        old.unlink()

if __name__ == "__main__":
    render(ROOT / "android-lab/app/src/main/res/drawable-nodpi")
