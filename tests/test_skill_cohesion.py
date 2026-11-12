"""Cross-check canonical count exceptions against published manual smoke cases."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SkillCohesionTests(unittest.TestCase):
    def test_six_track_smoke_covers_both_debarge_count_cases(self):
        canonical = (ROOT / "SKILL.md").read_text(encoding="utf-8").lower()
        smoke = (ROOT / "adapters/chatgpt/SMOKE_TEST.md").read_text(encoding="utf-8").lower()
        self.assertIn("a requested number of tracks is a normal target", canonical)
        self.assertIn("explicitly non-overridable count", canonical)
        self.assertIn("ordinary six-track target does not by itself block", smoke)
        self.assertIn("exactly 25 consecutive identical debarge entries", smoke)
        self.assertIn("explicitly rigid six-track count", smoke)
        self.assertIn("no spontaneous debarge roll", smoke)


if __name__ == "__main__":
    unittest.main()
