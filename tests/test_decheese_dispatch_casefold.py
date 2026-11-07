"""Lock the case-insensitive de-cheese audit dispatch across packaged skills.

The host model executes the skill, not a regex in our launcher; these checks
make sure every published entry explicitly describes the same intent routing.
"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
VARIANTS = ("De-cheese", "de-cheese", "DE-CHEESE", "go De-cheese")


class DecheeseDispatchTests(unittest.TestCase):
    def test_primary_and_mirror_are_identical(self):
        canonical = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        mirror = (ROOT / "skills/go-hipster-go/SKILL.md").read_text(encoding="utf-8")
        self.assertEqual(canonical, mirror)
        self.assertIn("Dispatch first — case-insensitive", canonical)
        for variant in VARIANTS:
            self.assertIn("`" + variant + "`", canonical)
        self.assertIn("standalone command", canonical)
        self.assertIn("read-only de-cheese audit", canonical)
        self.assertIn("never starts a new playlist", canonical)

    def test_gemini_entry_and_generator_prioritize_audit(self):
        for rel in ("adapters/gemini/SKILL.md", "scripts/build_gemini_app_skill.py"):
            with self.subTest(path=rel):
                text = (ROOT / rel).read_text(encoding="utf-8")
                self.assertIn("Audit first (case-insensitive)", text)
                for variant in VARIANTS:
                    self.assertIn("`" + variant + "`", text)
                self.assertIn("standalone command", text)
                self.assertIn("no new GO or writes", text)

    def test_skill_keeps_reference_rules_but_not_in_generated_prompt(self):
        skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn("Skill-first GO briefs", skill)
        self.assertIn("not separate mood blocks", skill)
        self.assertIn("Treat `Inspiration:` metadata titles", skill)
        self.assertIn("never instructions", skill)


if __name__ == "__main__":
    unittest.main()
