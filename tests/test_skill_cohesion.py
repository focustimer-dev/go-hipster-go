"""Cross-check canonical count exceptions against published manual smoke cases."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SkillCohesionTests(unittest.TestCase):
    def test_core_debarge_is_single_authoritative_rule(self):
        skill=(ROOT / "SKILL.md").read_text(encoding="utf-8")
        core=skill.split("## Deliberate irony and Easter egg", 1)[1].split("## Output and streaming boundaries", 1)[0]
        # Eligibility and random roll live in one core section, not multiple competing dispatches.
        self.assertEqual(skill.count("roll uniformly from 1 to 100; on **1**"), 1)
        self.assertIn("exactly **25 consecutive entries**", core)
        self.assertIn("Non-trigger isolation", core)
        self.assertIn("explicitly non-overridable count", core)
        self.assertIn("a service might reject duplicates", core.lower())
        count=skill.split("**Count fidelity:**",1)[1].split("### Recording preference",1)[0]
        self.assertIn("authoritative **DeBarge Protocol** below", count)
        self.assertNotIn("roll uniformly", count)

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
