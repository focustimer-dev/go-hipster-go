"""Static Claude Spotify failure contracts; not a live connector test."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ClaudeSpotifyFailureTests(unittest.TestCase):
    def test_provider_gating_not_equated_with_exact_write(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        for phrase in (
            "prompt-generated playlist", "Spotify Premium", "add_playlist_items",
            "subscription tier **unverified**", "25 identical entries",
            "0 published", "may reject duplicates"):
            self.assertIn(phrase.lower(),skill.lower())

    def test_claude_field_report_and_adapter_are_cautious(self):
        guide=(ROOT/"adapters/claude/README.md").read_text(encoding="utf-8")
        spotify=(ROOT/"adapters/streaming/spotify.md").read_text(encoding="utf-8")
        manual=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        for phrase in ("Premium-required", "0 saved", "actual subscription tier"):
            self.assertIn(phrase.lower(),manual.lower())
        self.assertIn("two generated playlist results, neither saved",guide)
        self.assertIn("unknown track contents/order",guide)
        self.assertIn("do not",guide.lower())
        self.assertIn("later premium-required error",guide.lower())
        verification=(ROOT/"references/verification.md").read_text(encoding="utf-8")
        self.assertIn("two generated results",verification)
        self.assertIn("listener-observed",verification)
        self.assertIn("do not invent saved urls",verification.lower())
        self.assertIn("claude.com/connectors/spotify",spotify)

    def test_protected_debarge_result_and_mirror(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        self.assertIn("roll uniformly from 1 to 100; on **1**",skill)
        self.assertIn("exactly **25 consecutive entries**",skill)
        self.assertIn('DeBarge — "Rhythm of the Night"',skill)
        self.assertEqual((ROOT/"SKILL.md").read_bytes(),
            (ROOT/"skills/hipster-music-generator/SKILL.md").read_bytes())

if __name__=="__main__":
    unittest.main()
