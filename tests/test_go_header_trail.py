"""Protect the Gig Poster's non-interactive GO instruction trail."""
from pathlib import Path
import hashlib
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class GigPosterGoTrailTests(unittest.TestCase):
    def test_explainer_is_a_noninteractive_instruction_trail(self):
        page = (ROOT / "launcher/editions/gig-poster/index.html").read_text()
        self.assertIn('class="poster-go-trail"', page)
        self.assertIn('PICK YOUR SOUND', page)
        self.assertIn('PASTE IN YOUR AI', page)
        self.assertIn('GO copies your music request. The AI takes it from there.', page)
        self.assertNotIn('class="poster-explainer"', page)
        trail = re.search(r'<div class="poster-go-trail">.*?</div>\s*<aside', page, re.S)
        self.assertIsNotNone(trail)
        self.assertNotRegex(trail.group(0), r'<(?:a|button)(?:\s|>)')
        self.assertIn('id="goButton"', page)
        self.assertLess(page.index('class="poster-go-trail"'), page.index('id="goButton"'))

    def test_trail_is_build_source_and_mobility_safe(self):
        generator = (ROOT / "scripts/build_gig_poster.py").read_text()
        css = (ROOT / "launcher/editions/gig-poster/edition.css").read_text()
        self.assertIn('class="poster-go-trail"', generator)
        self.assertIn('.poster-go-trail-word:last-child{white-space:normal}', css)
        self.assertIn('grid-template-columns:max-content 11px max-content 11px minmax(0,1fr)', css)
        self.assertNotIn('.poster-explainer{', css)

    def test_generated_css_cache_key_matches_content(self):
        page = (ROOT / "launcher/editions/gig-poster/index.html").read_text()
        css = (ROOT / "launcher/editions/gig-poster/edition.css").read_bytes()
        key = hashlib.sha256(css).hexdigest()[:12]
        self.assertIn(f'edition.css?v={key}', page)


if __name__ == "__main__":
    unittest.main()
