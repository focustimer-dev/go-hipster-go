"""Keep retired poster art out of the public PWA upload without changing sources."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "launcher"
IGNORE = SITE / ".assetsignore"
ANDROID_ASSETS = ROOT / "android-lab/web/runtime-assets.json"

class PwaAssetBudgetTests(unittest.TestCase):
    def test_ignored_sources_have_no_live_pwa_references(self):
        lines = [line.strip() for line in IGNORE.read_text().splitlines()
                 if line.strip() and not line.lstrip().startswith("#")]
        self.assertEqual(len(lines), len(set(lines)), "Duplicate ignore entry")
        self.assertGreaterEqual(len(lines), 12)
        # Exact paths only: a broad glob could silently hide future active art.
        self.assertTrue(all("*" not in name and "?" not in name and
                            name.startswith("editions/gig-poster/assets/")
                            for name in lines))
        android = set(json.loads(ANDROID_ASSETS.read_text()))
        # Static HTML/CSS/JS manifests are all browser-deliverable references.
        runtime = {p: p.read_text(errors="replace") for p in SITE.rglob("*")
                   if p.is_file() and p.suffix in
                   {".html", ".css", ".js", ".webmanifest"}}
        excluded_bytes = 0
        for relative in lines:
            image = SITE / relative
            self.assertTrue(image.is_file(), relative)
            self.assertNotIn(relative, android, "Do not omit Android runtime files")
            basename = image.name
            for source, content in runtime.items():
                self.assertNotIn(basename, content,
                                 f"Active reference in {source.relative_to(SITE)}")
            excluded_bytes += image.stat().st_size
        self.assertGreaterEqual(excluded_bytes, 14000000)
        remaining = sum(p.stat().st_size for p in SITE.rglob("*")
                        if p.is_file() and p.relative_to(SITE).as_posix() not in lines)
        self.assertLess(remaining, 16000000)
        print(f"PWA static upload: omits {excluded_bytes:,} bytes, retains {remaining:,} bytes")

    def test_never_excludes_canonical_ongoing_media(self):
        content = IGNORE.read_text()
        for filename in ("the-funk.webp","moods-neutral-ink-v2.webp",
                         "moods-selected-ink-v2.webp","desire-selected-v1.webp",
                         "triumph-selected-v1.webp","bird-globe.webp",
                         "atlas-engraved-details.png","stock.webp"):
            self.assertNotIn("editions/gig-poster/assets/"+filename+"\n", content)

if __name__ == "__main__":
    unittest.main()
