#!/usr/bin/env python3
"""Build a review-only browser route from the canonical Android Lab atlas.

The Android bundle is the single source of geometry, projection transitions and
shipping lanes. Build exclusively into launcher/pwa-atlas for the isolated Worker.
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
    injection = ('<link rel="stylesheet" href="/assets/pwa-themes.css">'
                 '<link rel="stylesheet" href="/pwa-atlas/assets/pwa-atlas-themes.css">'
                 '<script src="/pwa-atlas/assets/pwa-atlas-bridge.js"></script>')
    assert "id=\"labGlobeGeography\"" in html, "Canonical geographic data missing"
    assert 'src="/pwa-atlas/assets/app.js"' in html, "Atlas app URL did not rewrite"
    assert "data-atlas-view" not in html or "robinson" in html
    assert html.count("</head>") == 1
    html = html.replace("</head>", injection + "</head>")
    page.write_text(html, encoding="utf-8")
    print(f"Built canonical Android atlas browser route: {DEST}")

if __name__ == "__main__":
    main()
