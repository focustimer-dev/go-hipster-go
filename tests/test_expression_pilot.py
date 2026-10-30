"""Opt-in engraving expression pilot: source art and live behavior remain safe."""
import hashlib
import struct
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "launcher/editions/gig-poster"
CSS = (BASE / "edition.css").read_text()
HTML = (BASE / "index.html").read_text()
APP = (ROOT / "launcher/assets/app.js").read_text()

MOODS = {
    "happy": "happy",
    "angry": "angry",
    "sad": "sad",
    "weird": "weird",
    "criminal": "criminal",
    "funky": "the-funk",
}

class ExpressionPilotTests(unittest.TestCase):
    def test_pilot_images_present_and_readable(self):
        for mood, basename in MOODS.items():
            with self.subTest(mood=mood):
                data = (BASE / "assets" / ("expression-pilot-" + basename + ".png")).read_bytes()
                self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"))
                self.assertEqual(struct.unpack(">II", data[16:24]), (340, 340))
                self.assertGreater(len(data), 30_000)

    def test_only_pressed_state_changes_image(self):
        self.assertNotIn('data-expression-pilot="true"', HTML)
        self.assertNotIn("expression-pilot-", APP)
        self.assertIn('body.gig-poster[data-expression-pilot="true"]', CSS)
        for mood, basename in MOODS.items():
            self.assertIn(
                '.mood[data-mood="' + mood + '"][aria-pressed="true"] .face'
                '{background-image:url("/editions/gig-poster/assets/expression-pilot-' +
                basename + '.png")!important}', CSS)
        self.assertIn('engraved-six-clerks.webp', CSS)
        self.assertIn('weird-v18.webp', CSS)

    def test_cache_hash_and_accessibility(self):
        key = hashlib.sha256((BASE / "edition.css").read_bytes()).hexdigest()[:12]
        for file in (BASE / "index.html", BASE / "setup/index.html"):
            self.assertIn("edition.css?v=" + key, file.read_text())
        self.assertIn('prefers-reduced-motion:reduce', CSS)
        self.assertIn('aria-pressed="false"', HTML)

if __name__ == "__main__":
    unittest.main()
