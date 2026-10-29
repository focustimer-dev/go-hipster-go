"""Minimal contract checks for playlist-title variety in all skill distributions."""
from pathlib import Path
import json
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


class TitleVariationContract(unittest.TestCase):
    def test_title_guidance_reaches_all_skill_surfaces(self):
        canonical = read("SKILL.md")
        self.assertEqual(canonical, read("skills/go-hipster-go/SKILL.md"))
        for path in (
            "SKILL.md",
            "adapters/chatgpt/CHATGPT_KNOWLEDGE.md",
            "adapters/gemini/GEM_KNOWLEDGE.md",
            "adapters/gemini/references/workflow.md",
        ):
            text = read(path)
            self.assertIn("**Avoid `pocket` in playlist titles by default**", text, path)
            self.assertIn("other seed words belong in musical notes", text, path)
            self.assertIn("Check visible recent titles once", text, path)
            self.assertIn("No extra research, candidate generation or scoring.", text, path)

    def test_manual_case_and_benchmark_title_are_updated(self):
        docs = read("tests/discovery-cases.md")
        self.assertEqual(docs, read("skills/go-hipster-go/tests/discovery-cases.md"))
        self.assertIn("The Pocket Has No Passport", docs)
        self.assertIn("Missed the One on Purpose", docs)
        fixture = json.loads(read("research/pwa-ab-2026-10-29/fixture.json"))
        self.assertEqual(fixture["try_hard"]["title"], "Missed the One on Purpose")
        self.assertNotIn("pocket", fixture["try_hard"]["title"].lower())
        self.assertIn(
            "Missed the One on Purpose",
            read("research/pwa-ab-2026-10-29/README.md"),
        )


if __name__ == "__main__":
    unittest.main()
