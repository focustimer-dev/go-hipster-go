"""Protect canonical RC9 discovery, bank packaging and mirror parity."""
from pathlib import Path
import json
import unittest

ROOT = Path(__file__).resolve().parents[1]
BANKS = ("references/seed-cues.json", "references/mood-spark-bank.json")
CHECKPOINT = "### Unified discovery checkpoint"

class CanonicalUnifiedDiscoveryTests(unittest.TestCase):
    def read(self, name):
        return (ROOT / name).read_text(encoding="utf-8")

    def test_single_checkpoint_and_host_mirrors(self):
        canonical = self.read("SKILL.md")
        self.assertEqual(canonical.count(CHECKPOINT), 1)
        self.assertEqual(self.read("skills/go-hipster-go/SKILL.md"), canonical)
        for marker in ("every `c1:` slot", "mandatory review/additions",
                       "explicit text-only/no-publish", "not uniform RNG"):
            self.assertIn(marker, canonical)
        self.assertNotIn("PRIVATE QA BUILD", canonical)
        for path in ("adapters/gemini/references/workflow.md",
                     "adapters/gemini/GEM_KNOWLEDGE.md",
                     "adapters/chatgpt/CHATGPT_KNOWLEDGE.md"):
            self.assertEqual(self.read(path).count(CHECKPOINT), 1)

    def test_banks_distributed_unchanged(self):
        for path in BANKS:
            raw = self.read(path)
            json.loads(raw)
            for base in ("skills/go-hipster-go/", "adapters/gemini/"):
                self.assertEqual(self.read(base + path), raw)
            for script in ("scripts/build_agent_packages.py",
                           "scripts/build_chatgpt_bundle.py",
                           "scripts/build_gemini_app_skill.py"):
                self.assertIn('"' + path + '"', self.read(script))
            for bundle in ("adapters/chatgpt/CHATGPT_KNOWLEDGE.md",
                           "adapters/gemini/GEM_KNOWLEDGE.md"):
                self.assertIn("# BEGIN SOURCE: " + path, self.read(bundle))
                self.assertIn("# END SOURCE: " + path, self.read(bundle))

    def test_version_and_scope_isolation(self):
        source = self.read("SKILL.md")
        self.assertIn('  version: "3.11.7"', source)
        self.assertNotIn("3.11.6-rc.9", source)
        self.assertIn("GO HARD retains", source)
        self.assertIn("song-specific Criminal narratives", source)

if __name__ == "__main__":
    unittest.main()
