"""Regression checks for opt-in region/era-authentic sleeve generation."""

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class CoverArtPolicyTests(unittest.TestCase):
    def test_opt_in_and_complete_material_contract(self):
        policy = read("references/cover-art.md")
        self.assertIn("`Cover art: yes`", policy)
        self.assertIn("Skip all artwork work when not requested", policy)
        for layer in (
            "1. **Packaging and substrate architecture.",
            "2. **Regional print method and ink behavior.",
            "3. **Vernacular regional typography.",
            "4. **Subject, composition and label furniture.",
        ):
            self.assertIn(layer, policy)
        self.assertIn("original release date", policy)
        self.assertIn("exact final playlist title", policy)
        self.assertIn("No generic CGI", policy)
        self.assertIn("Do not claim the art was uploaded", policy)

    def test_entrypoints_route_optional_art_without_inline_bloat(self):
        for path in ("SKILL.md", "references/reference-index.md",
                     "references/verification.md"):
            content = read(path)
            self.assertIn("cover-art.md", content, path)
        self.assertIn("skip it otherwise", read("SKILL.md"))

    def test_all_packagers_ship_reference(self):
        for path in (
            "scripts/build_agent_packages.py",
            "scripts/build_chatgpt_bundle.py",
            "scripts/build_gemini_app_skill.py",
        ):
            self.assertIn('"references/cover-art.md"', read(path), path)
        for path in ("SKILL.md", "references/reference-index.md",
                     "references/verification.md", "references/cover-art.md"):
            self.assertEqual(read(path), read("skills/go-hipster-go/" + path))
        for path in (
            "adapters/chatgpt/CHATGPT_KNOWLEDGE.md",
            "adapters/gemini/GEM_KNOWLEDGE.md",
        ):
            self.assertIn("# BEGIN SOURCE: references/cover-art.md", read(path))
        self.assertIn("/references/cover-art.md", read("adapters/gemini/references/workflow.md"))


if __name__ == "__main__":
    unittest.main()
