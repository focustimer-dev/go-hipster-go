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
            self.assertIn("`pocket` in playlist titles by default**", text, path)
            self.assertIn("scannable region and mood/sonic context in the title", text, path)
            self.assertIn("no mandatory subtitle formula", text, path)
            self.assertIn("never invent routes or eras", text, path)
            self.assertIn("Check visible recent titles once", text, path)
            self.assertIn("don\'t invent history or add research, candidate generation or scoring", text, path)

    def test_manual_case_and_benchmark_title_are_updated(self):
        docs = read("tests/discovery-cases.md")
        self.assertEqual(docs, read("skills/go-hipster-go/tests/discovery-cases.md"))
        self.assertIn("The Pocket Has No Passport", docs)
        self.assertIn("Offbeat Correspondence — West African & Nordic Funk", docs)
        fixture = json.loads(read("research/pwa-ab-2026-10-29/fixture.json"))
        self.assertEqual(fixture["try_hard"]["title"], "Offbeat Correspondence — West African & Nordic Funk")
        self.assertNotIn("pocket", fixture["try_hard"]["title"].lower())
        self.assertIn(
            "Offbeat Correspondence — West African & Nordic Funk",
            read("research/pwa-ab-2026-10-29/README.md"),
        )


if __name__ == "__main__":
    unittest.main()
