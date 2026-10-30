"""Selected expressions are gated until matching newly generated art ships."""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"launcher/editions/gig-poster"

class ExpressionPreparationChecks(unittest.TestCase):
    def test_current_neutral_art_untouched_and_feature_disabled(self):
        css=(BASE/"edition.css").read_text()
        html=(BASE/"index.html").read_text()
        self.assertIn("engraved-six-clerks.webp",css)
        self.assertIn("weird-v18.webp",css)
        self.assertNotIn('data-expression-art="v2"',html)
        self.assertIn('[data-expression-art="v2"]',css)

    def test_new_frames_are_separate_and_follow_aria_pressed(self):
        css=(BASE/"edition.css").read_text()
        self.assertIn('engraved-six-clerks-selected.webp',css)
        self.assertIn('weird-v18-selected.webp',css)
        self.assertIn('.mood[aria-pressed=true] .face::after{opacity:1}',css)
        self.assertIn('@media(prefers-reduced-motion:reduce)',css)
        self.assertTrue((BASE/"assets/engraved-six-clerks.webp").is_file())
        self.assertTrue((BASE/"assets/weird-v18.webp").is_file())

if __name__=="__main__":
    unittest.main()
