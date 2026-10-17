"""Structural guardrails for curation iteration; not evidence of music quality."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class CurationContractTests(unittest.TestCase):
    def test_canonical_and_packaged_skill_are_identical(self):
        self.assertEqual((ROOT / "SKILL.md").read_bytes(),
                         (ROOT / "skills/hipster-music-generator/SKILL.md").read_bytes())

    def test_debarge_protocol_is_preserved(self):
        t=(ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn('roll uniformly from 1 to 100; on **1**',t)
        self.assertIn('exactly **25 consecutive entries**',t)
        self.assertIn('DeBarge — "Rhythm of the Night"',t)
        self.assertIn('explicit request for "DeBarge Protocol" runs it without a roll',t)

    def test_new_behavior_has_manual_regression_cases(self):
        skill=(ROOT / "SKILL.md").read_text(encoding="utf-8")
        cases=(ROOT / "tests/discovery-cases.md").read_text(encoding="utf-8")
        for s in ('two or three genuinely different sonic theses',
                  '*track-specific* musical hook', '"more like #4"',
                  'exact recordings and order not independently confirmed'):
            self.assertIn(s,skill)
        for s in ('ChatGPT + Spotify','Gemini + YouTube Music',
                  'requested count','provider result','Feedback:'):
            self.assertIn(s,cases)

    def test_insufferable_clerk_is_distinct_and_factual(self):
        skill=(ROOT / "SKILL.md").read_text(encoding="utf-8")
        examples=(ROOT / "references/curation-examples.md").read_text(encoding="utf-8")
        cases=(ROOT / "tests/discovery-cases.md").read_text(encoding="utf-8")
        for phrase in (
            "## Voice: the Insufferable Record-Store Clerk",
            "subtly passive-aggressive",
            "absurdly superior without having earned it",
            "Every track still needs its real artist/title",
            "plain technical status",
            "less snark",
            "Keep the Easter egg secret",
        ):
            self.assertIn(phrase.lower(), skill.lower())
        self.assertIn("curator's thoroughly unearned superiority", examples)
        self.assertIn("Voice and substance regression", cases)
        self.assertIn("not published", cases.lower())

    def test_playlist_reconciliation_does_not_invent_confirmation(self):
        reference=(ROOT / "references/verification.md").read_text(encoding="utf-8")
        self.assertIn('**unknown**',reference)
        self.assertIn('item list or playlist read-back',reference)
        self.assertIn('positionally',reference)

if __name__ == "__main__":
    unittest.main()
