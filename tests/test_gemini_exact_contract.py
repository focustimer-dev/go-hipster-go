"""Static Gemini publishing-contract checks; these do not exercise live music tools."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


class GeminiExactPublishingContractTests(unittest.TestCase):
    def test_exact_writer_required_on_normal_go(self):
        # Guard canonical source, generated online entry, and portable/Gem instructions.
        required = {
            "SKILL.md": "do not** generate a theme-based substitute",
            "adapters/gemini/SKILL.md": "DO NOT call it as a fallback",
            "adapters/gemini/GEM_KNOWLEDGE.md": "DO NOT call it as a fallback",
            "adapters/gemini/GEM_INSTRUCTIONS.md": "only when the actual writer accepts explicit ordered tracks",
            "adapters/gemini/README.md": "only if the authorized writer supports explicit ordered track entries",
            "README.md": "one playlist attempt only if an authorized writer can accept the ordered tracklist",
        }
        for path, marker in required.items():
            with self.subTest(path=path):
                self.assertIn(marker, read(path))

    def test_unavailable_and_theme_only_retain_original(self):
        for path in ("SKILL.md", "adapters/gemini/SKILL.md",
                     "adapters/gemini/GEM_INSTRUCTIONS.md",
                     "adapters/gemini/README.md", "README.md"):
            with self.subTest(path=path):
                self.assertIn("PLAYLIST NOT CREATED", read(path))
        self.assertIn("exact-track publishing unavailable", read("adapters/gemini/GEM_INSTRUCTIONS.md"))
        self.assertIn("exact-track publishing unavailable", read("adapters/gemini/SKILL.md"))

    def test_approximation_is_separate_and_explicit(self):
        gem = read("adapters/gemini/GEM_INSTRUCTIONS.md")
        guide = read("adapters/gemini/README.md")
        self.assertIn("An explicitly requested separate thematic approximation", gem)
        self.assertIn("APPROXIMATE", gem)
        self.assertIn("only after an explicit listener request", guide)
        self.assertIn("not the ordinary GO fallback", guide)

    def test_text_only_and_publish_reuse_never_write_unrequested(self):
        self.assertIn("Text-only skips writer preflight and publication", read("SKILL.md"))
        self.assertIn("go, text only opts out", read("adapters/gemini/GEM_INSTRUCTIONS.md"))
        policy = read("references/gemini-publish.md")
        for phrase in ("No duplicates.", "SAVE TOOL UNAVAILABLE", "SAVE FAILED",
                       "Never save a text-only crate", "unmodified URI/URL"):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, policy)

    def test_partial_preview_is_unknown_not_failed(self):
        for path in ("SKILL.md", "adapters/gemini/SKILL.md"):
            with self.subTest(path=path):
                self.assertIn("8 of 12", read(path))
        policy = read("references/gemini-publish.md")
        self.assertIn("unverified", policy)
        self.assertIn("not matched or missing", policy)

    def test_plain_language_handoff_reachable_from_go_and_gem(self):
        policy = read("references/gemini-publish.md")
        entry = read("adapters/gemini/SKILL.md")
        gem = read("adapters/gemini/GEM_INSTRUCTIONS.md")
        self.assertIn("## Gemini-specific playlist creation and saving", policy)
        self.assertIn("**YouTube Music handoff:**", entry)
        self.assertIn("Gemini Publish", entry)
        self.assertIn("do not provide a separate list of track titles", gem)
        self.assertIn("do not resend the individual track links", gem)
        self.assertIn("SAVE UNCONFIRMED", policy)
        self.assertIn("Do not automatically retry a failed save", policy)
        self.assertIn("17–21 tracks", policy)
        self.assertIn("including an empty or null list", policy)
        for forbidden in ("youtube_music:", "media_intent_type", "video_titles",
                          "number_of_videos", "video_uris", "```json"):
            with self.subTest(forbidden=forbidden):
                self.assertNotIn(forbidden, policy)

    def test_no_composer_handoff_in_gem_runtime(self):
        for path in ("adapters/gemini/SKILL.md", "adapters/gemini/GEM_KNOWLEDGE.md"):
            with self.subTest(path=path):
                self.assertNotIn("ChatGPT plugin composer", read(path))
        self.assertIn("Never direct Gemini listeners to ChatGPT's plugin composer",
                      read("adapters/gemini/GEM_INSTRUCTIONS.md"))


if __name__ == "__main__":
    unittest.main()
