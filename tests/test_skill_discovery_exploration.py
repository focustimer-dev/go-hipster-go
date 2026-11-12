"""Offline contract checks for the small, source-diverse GO HARD discovery gate.

These tests verify shipped policy and routing, not live reference reads, real
play counts, listening, the number of model-considered candidates, or music taste.
"""
import unittest
from pathlib import Path

from scripts.build_gemini_app_skill import REFERENCES, modular_files

ROOT = Path(__file__).resolve().parents[1]


class DiscoveryExplorationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.hard = (ROOT / "references/go-hard.md").read_text(encoding="utf-8")
        cls.taxonomy = (ROOT / "references/sonic-taxonomy.md").read_text(encoding="utf-8")
        cls.verify = (ROOT / "references/verification.md").read_text(encoding="utf-8")
        cls.core = (ROOT / "SKILL.md").read_text(encoding="utf-8")

    def test_hard_explores_independent_paths_before_finalists(self):
        self.assertIn("Explore before verifying", self.hard)
        self.assertIn("at least two independent research paths", self.hard)
        self.assertIn("selected regional references", self.hard)
        self.assertIn("original singles/artist albums", self.hard)
        self.assertIn("two mirrors of one tracklist", self.hard)
        self.assertIn("rather than inventing finds", self.hard)
        self.assertIn("existing GO HARD budget", self.hard)
        self.assertIn("not final song/label quotas", self.hard)

    def test_popularity_is_review_only_not_a_blanket_ban(self):
        self.assertIn("a credible less familiar alternative", self.hard)
        self.assertIn("million-plus play count only when verifiable", self.hard)
        self.assertIn("review flag, never a ban", self.hard)
        self.assertIn("do not infer or invent play counts", self.hard)
        self.assertIn("unknown counts must stay unknown", self.taxonomy)

    def test_versions_and_clean_transfers_remain_separate(self):
        self.assertIn("original single/EP/album provenance", self.verify)
        self.assertIn("expanded-edition bonus track", self.verify)
        self.assertIn("original LP", self.verify)
        self.assertIn("best available transfer", self.verify)
        self.assertIn("does not verify a clean transfer", self.verify)

    def test_no_fake_memory_and_ordinary_go_remains_fast(self):
        self.assertIn("When history is unavailable", self.taxonomy)
        self.assertIn("change the actual research starting path", self.taxonomy)
        self.assertIn("without promising cross-session uniqueness", self.hard)
        self.assertIn("Default OFF", self.hard)
        self.assertIn("normal GO rule against extra music research", self.hard)
        self.assertIn("the installed skill owns verification", self.core.lower())
        self.assertIn("go, text only", self.core)

    def test_references_are_packaged_not_claimed_to_be_read_live(self):
        for relative in ("references/go-hard.md", "references/sonic-taxonomy.md",
                         "references/verification.md"):
            self.assertIn(relative, REFERENCES)
            self.assertEqual(
                (ROOT / relative).read_bytes(),
                (ROOT / "skills/go-hipster-go" / relative).read_bytes()
            )
        self.assertIn("go-hard.md", self.core)
        self.assertIn("central-america-additions.md",
                      (ROOT / "references/reference-index.md").read_text(encoding="utf-8"))
        generated = modular_files(self.core)
        self.assertIn("references/go-hard.md", generated)
        self.assertIn("references/sonic-taxonomy.md", REFERENCES)
        self.assertIn("references/verification.md", REFERENCES)


if __name__ == "__main__":
    unittest.main()
