"""Check the default-go publishing contract without pretending to test live Spotify or YouTube Music."""
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class DefaultGoBehaviorTests(unittest.TestCase):
    def test_go_means_publish(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        for term in ['"go" means curate + publish by default',
                     'exactly one connected, authorized writer',
                     'ask once',
                     'go, text only',
                     'nothing was published',
                     'host prevents activation']:
            self.assertIn(term.lower(),skill.lower())

    def test_setup_supports_automatic_writer(self):
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        self.assertIn('sole writable service',setup)
        self.assertIn('attempt to publish',setup)
        self.assertIn('OAuth',setup)

    def test_manual_regression_matrix(self):
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        for term in ['Spotify only authorized writer',
                     'YouTube Music only authorized writer',
                     'Two writable services', 'search/play only',
                     'go, text only']:
            self.assertIn(term,cases)

    def test_missing_writer_preserves_tracks_and_recovers_with_both_plugins(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        self.assertIn("Do not re-curate",skill)
        self.assertIn("connected",setup)
        self.assertIn("Both Hipster Music Generator and Spotify selected",cases)
        self.assertIn("don't silently re-curate",cases)

    def test_distribution_synced_and_debarge_intact(self):
        self.assertEqual((ROOT/"SKILL.md").read_bytes(),
                         (ROOT/"skills/hipster-music-generator/SKILL.md").read_bytes())
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        self.assertIn('roll uniformly from 1 to 100; on **1**',skill)
        self.assertIn('exactly **25 consecutive entries**',skill)
        self.assertIn('DeBarge — "Rhythm of the Night"',skill)

if __name__ == "__main__":
    unittest.main()
