"""Offline tests for ChatGPT Project installation artifacts."""
import unittest
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import build_chatgpt_bundle as builder


class ChatGPTBundleTest(unittest.TestCase):
    def test_bundle_matches_canonical_sources(self):
        self.assertEqual(builder.OUTPUT.read_text(encoding="utf-8"), builder.render())

    def test_bundle_contains_required_features(self):
        bundle = builder.render()
        for fragment in ("DeBarge Protocol", "25 consecutive", "Global musical scenes", "Verification and playlist matching", "Peruvian Chicha"):
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, bundle)

    def test_project_setup_does_not_promise_unsupported_tools(self):
        instructions = (ROOT / "adapters/chatgpt/PROJECT_INSTRUCTIONS.md").read_text(encoding="utf-8")
        self.assertIn("when a random tool is accessible", instructions)
        self.assertIn("A recommendation is not a published playlist", instructions)
        self.assertNotIn("youtube_music:create", instructions)


if __name__ == "__main__":
    unittest.main()
