#!/usr/bin/env python3
"""Build a review-only browser route from the canonical Android Lab atlas.

The Android bundle is the single source of geography, projection transitions,
theme-compatible paint hooks and shipping lanes. Build only into launcher/pwa-atlas.
The public gig-poster, native Lab files and main PWA adapter remain untouched.
"""
from pathlib import Path
import re
import shutil
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.bundle_android_lab import bundle

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "launcher" / "pwa-atlas"
PREFIX = "/pwa-atlas"

def rewrite_absolute_assets(value):
    # Preserve all absolute URLs and installed skill paths; rewrite only paths
    # that point to assets inside the self-contained Android Lab snapshot.
    # Match quoted URL strings and url(...) values without changing URLs
    # already under /pwa-atlas or strings containing https://.
    for root in ("assets/", "editions/", "manual-guide.html", "atlas-lab.html",
                 "setup/", "icon.svg", "manifest.webmanifest", "gemini-manifest.webmanifest"):
        for start in ('"/', "'/", "url(/", 'url("/', "url('/"):
            if start.startswith("url("):
                needle = start + root
                value = value.replace(needle, start + "pwa-atlas/" + root)
            else:
                needle = start + root
                value = value.replace(needle, start + "pwa-atlas/" + root)
    return value

# The canonical Android atlas now reads optional theme paints directly.
# The PWA injects GHGAtlasPaintColors before the generated app script; no
# brittle production JS source rewriting or second renderer is necessary.

def main():
    bundle(DEST)
    shutil.copyfile(ROOT / "launcher/assets/pwa-atlas-bridge.js",
                    DEST / "assets/pwa-atlas-bridge.js")
    shutil.copyfile(ROOT / "launcher/assets/pwa-atlas-themes.css",
                    DEST / "assets/pwa-atlas-themes.css")
    for file in DEST.rglob("*"):
        if file.is_file() and file.suffix.lower() in {".html", ".css", ".js", ".json", ".webmanifest"}:
            # MapLibre's compiled JS is copied byte-for-byte, not rewritten.
            if "/maplibre/" in file.as_posix() or file.name == "cahill-keyes-vendor.js":
                continue
            original = file.read_text(encoding="utf-8")
            updated = rewrite_absolute_assets(original)
            if updated != original:
                file.write_text(updated, encoding="utf-8")
    page = DEST / "index.html"
    html = page.read_text(encoding="utf-8")
    # The PWA has its own palette owner (pwa-atlas-bridge.js). Strip the
    # native Lab appearance controller here to avoid fighting MapLibre
    # setPaintProperty loops and an Atlas that never reaches loaded()/idle.
    native_theme='<script src="/pwa-atlas/assets/lab-themes.js"></script>'
    assert html.count(native_theme)==1,"Android theme boot script path changed"
    html=html.replace(native_theme,"")
    # The canonical Android bundle already carries the *same* two shared CSS
    # links. Duplicate injection produces redundant styles and fails palette
    # contract checks; keep a single stylesheet instance per source.
    for css in ("pwa-themes.css", "pwa-atlas-themes.css"):
        link=f'<link rel="stylesheet" href="/pwa-atlas/assets/{css}">'
        assert html.count(link)==1, f"Expected one shared theme link for {css}"
    injection = '<script src="/pwa-atlas/assets/pwa-atlas-bridge.js"></script>'
    assert "id=\"labGlobeGeography\"" in html, "Canonical geographic data missing"
    assert 'src="/pwa-atlas/assets/app.js"' in html, "Atlas app URL did not rewrite"
    assert "data-atlas-view" not in html or "robinson" in html
    assert html.count("</head>") == 1
    html = html.replace("</head>", injection + "</head>")
    page.write_text(html, encoding="utf-8")
    print(f"Built canonical Android atlas browser route: {DEST}")

if __name__ == "__main__":
    main()
