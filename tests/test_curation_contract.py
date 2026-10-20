"""Structural guardrails for curation iteration; not evidence of music quality."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class CurationContractTests(unittest.TestCase):
    def test_canonical_and_packaged_skill_are_identical(self):
        self.assertEqual((ROOT / "SKILL.md").read_bytes(),
                         (ROOT / "skills/go-hipster-go/SKILL.md").read_bytes())

    def test_fresh_crate_and_recent_repeat_rules_present(self):
        skill=(ROOT / "SKILL.md").read_text(encoding="utf-8")
        cases=(ROOT / "tests/discovery-cases.md").read_text(encoding="utf-8")
        app=(ROOT / "launcher/assets/app.js").read_text(encoding="utf-8")
        self.assertIn("Fresh-crate discovery and repeat control",skill)
        self.assertIn("artist + title + recording/version",skill)
        self.assertIn("last *up to three* sets",skill)
        self.assertIn("Fresh-crate diversity regression",cases)
        self.assertIn("crypto.getRandomValues",app)
        self.assertIn("ghg-crate-routes-v1",app)
        self.assertIn("Fresh-crate discovery lens",app)
        self.assertIn("Random crate spark",app)
        self.assertIn("nextCrateSparkPhrase",app)
        self.assertNotIn("geminiCurateOnly",app)
        self.assertIn("Create one playlist if the connected app permits",app)
        self.assertIn("Plain `go` (also `go live`)",skill)
        self.assertNotIn("TWO-STAGE workflow. THIS GO",app)
        self.assertIn("go live",skill)
        self.assertNotIn("Create ONE playlist in @YouTubeMusic",app)
        self.assertNotIn('return "@go-hipster-go "+go+" @youtube-music"',app)
        self.assertIn("Gemini search-card and spark-combination regression",cases)
        self.assertIn("PLAYLIST NOT CREATED",skill)
        self.assertIn("publication is the default, not an optional second feature",skill)
        self.assertIn("Explicit no-publish override",skill)
        self.assertIn("Gemini two-stage publication boundary",cases)
        self.assertIn("Report observed differences honestly",skill)
        self.assertIn("Gemini artist-anchor collapse and count integrity",cases)

    def test_debarge_protocol_is_preserved(self):
        t=(ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn('roll uniformly from 1 to 100; on **1**',t)
        self.assertIn('exactly **25 consecutive entries**',t)
        self.assertIn('DeBarge — "Rhythm of the Night"',t)
        self.assertIn('explicit request for "DeBarge Protocol" runs it without a roll',t)

    def test_easter_egg_cannot_leak_as_an_ordinary_playlist_joke(self):
        skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        cases = (ROOT / "tests/discovery-cases.md").read_text(encoding="utf-8")
        self.assertIn("**Non-trigger isolation (especially for Gemini):**", skill)
        self.assertIn("not a candidate, reference artist", skill)
        self.assertIn("not generally banned", skill)
        self.assertIn("exactly 25 consecutive identical entries", skill)
        self.assertIn("DeBarge selection leakage (manual qualitative check)", cases)
        self.assertIn("position **12**", cases)

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

    def test_playlist_copy_has_voice_and_real_metadata_boundaries(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        examples=(ROOT/"references/curation-examples.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        for marker in (
            "## Playlist writing: sell the music, not a spreadsheet",
            "**Title:**", "**Playlist description:**", "**Track commentary:**",
            "Suggested description", "generic titles", "actual character limit",
        ):
            # Lowercased checks permit small editorial phrasing differences.
            if marker == "Suggested description":
                self.assertIn("suggested description", skill.lower())
            elif marker == "generic titles":
                self.assertIn("generic titles", skill.lower())
            else:
                self.assertIn(marker.lower(),skill.lower())
        self.assertIn("Suggested playlist description",examples)
        self.assertIn("Claude plugin",cases)
        self.assertIn("Claude + Spotify",cases)
        self.assertIn("DeBarge",cases)

    def test_playlist_reconciliation_does_not_invent_confirmation(self):
        reference=(ROOT / "references/verification.md").read_text(encoding="utf-8")
        self.assertIn('**unknown**',reference)
        self.assertIn('item list or playlist read-back',reference)
        self.assertIn('positionally',reference)

if __name__ == "__main__":
    unittest.main()
