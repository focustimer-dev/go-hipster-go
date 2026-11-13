"""Static RC9 package and isolation checks. Not live curation evidence."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from scripts.build_gate4_chatgpt_rc9_candidate import (
    BANKS, NAME, POLICY, REQUIRED, ROOT, VERSION, build_candidate,
)

DUMMY_SHA = "b" * 40


class UnifiedDiscoveryCandidateTests(unittest.TestCase):
    def test_reproducible_and_non_mutating(self):
        base = ROOT / "dist/go-hipster-go-chatgpt-plugin.zip"
        before = hashlib.sha256(base.read_bytes()).digest()
        with tempfile.TemporaryDirectory() as folder:
            p1, p2 = (Path(folder) / filename for filename in ("one.zip", "two.zip"))
            build_candidate(DUMMY_SHA, p1)
            build_candidate(DUMMY_SHA, p2)
            self.assertEqual(hashlib.sha256(p1.read_bytes()).digest(),
                             hashlib.sha256(p2.read_bytes()).digest())
            self.assertEqual(before, hashlib.sha256(base.read_bytes()).digest())
            with ZipFile(base) as original, ZipFile(p1) as z:
                self.assertIsNone(z.testzip())
                names = z.namelist()
                self.assertEqual(len(names), len(set(names)))
                self.assertIn(".codex-plugin/plugin.json", names)
                manifest = json.loads(z.read("plugin.json"))
                codex = json.loads(z.read(".codex-plugin/plugin.json"))
                for item in (manifest, codex):
                    self.assertEqual(item["name"], NAME)
                    self.assertEqual(item["version"], VERSION)
                skill = z.read(f"skills/{NAME}/SKILL.md").decode()
                self.assertIn(f"name: {NAME}", skill)
                self.assertIn(f'  version: "{VERSION}"', skill)
                self.assertIn(f"source commit {DUMMY_SHA}", skill)
                self.assertIn(POLICY, skill)
                self.assertEqual(skill.count("Unified discovery checkpoint"), 1)
                self.assertNotIn("rc.8 compound-association seed checkpoint", skill)
                for path in REQUIRED:
                    renamed = f"skills/{NAME}/{path}"
                    self.assertIn(renamed, names)
                    self.assertEqual(z.read(renamed),
                                     original.read("skills/go-hipster-go/" + path))
                for path in BANKS:
                    self.assertEqual(z.read(f"skills/{NAME}/{path}"),
                                     (ROOT / path).read_bytes())
                self.assertIn("skills/setup/SKILL.md", names)
                self.assertEqual(z.read("skills/setup/SKILL.md"),
                                 original.read("skills/setup/SKILL.md"))

    def test_precedence_and_no_fake_capabilities_are_explicit(self):
        for token in (
            "c1:", "GO HARD", "text-only/no-publish", "Inspiration:",
            "Discovery route: v1/Rxx", "regional-atlas.md",
            "discovery-routes.md", "global-scenes.md",
            "ordinary GO remains single-pass", "mood-tension",
            "not uniform", "Do not preload", "research pass, random tool",
        ):
            self.assertIn(token.lower(), POLICY.lower())

    def test_production_is_still_3115_and_unmodified(self):
        skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn('  version: "3.11.5"', skill)
        self.assertNotIn("Unified discovery checkpoint", skill)
        for path in ("plugin.json", ".claude-plugin/plugin.json",
                     "gemini-extension.json"):
            with self.subTest(path=path):
                self.assertEqual(json.loads((ROOT / path).read_text())["version"],
                                 "3.11.5")

    def test_reject_overwrite_and_bad_version(self):
        base = ROOT / "dist/go-hipster-go-chatgpt-plugin.zip"
        with self.assertRaisesRegex(ValueError, "overwrite"):
            build_candidate(DUMMY_SHA, base)
        with self.assertRaisesRegex(ValueError, "full commit SHA"):
            build_candidate("invalid", Path("unused.zip"))


if __name__ == "__main__":
    unittest.main()
