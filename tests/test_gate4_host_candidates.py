"""Guard isolated Gate 4 packaging: never mutate the public candidate archives."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from scripts.build_gate4_host_candidates import VERSION, build_chatgpt, build_gemini

ROOT = Path(__file__).resolve().parents[1]
DUMMY_SHA = "a" * 40


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class IsolatedGate4CandidateTests(unittest.TestCase):
    def test_chatgpt_lab_build_is_isolated_deterministic_and_versioned(self):
        original = ROOT / "dist/go-hipster-go-chatgpt-plugin.zip"
        before = digest(original)
        with tempfile.TemporaryDirectory() as folder:
            p1 = Path(folder) / "candidate1.zip"
            p2 = Path(folder) / "candidate2.zip"
            build_chatgpt(DUMMY_SHA, p1)
            build_chatgpt(DUMMY_SHA, p2)
            self.assertEqual(digest(p1), digest(p2))
            with ZipFile(p1) as z:
                self.assertIsNone(z.testzip())
                names = z.namelist()
                self.assertEqual(len(names), len(set(names)))
                self.assertIn(".codex-plugin/plugin.json", names)
                self.assertIn("skills/go-hipster-go-gate4/SKILL.md", names)
                self.assertNotIn("skills/go-hipster-go/SKILL.md", names)
                manifest = json.loads(z.read("plugin.json"))
                codex = json.loads(z.read(".codex-plugin/plugin.json"))
                self.assertEqual(manifest["name"], codex["name"])
                self.assertEqual(manifest["name"], "go-hipster-go-gate4")
                self.assertEqual(manifest["version"], VERSION)
                self.assertEqual(codex["version"], VERSION)
                skill = z.read("skills/go-hipster-go-gate4/SKILL.md").decode("utf-8")
                self.assertIn("name: go-hipster-go-gate4", skill)
                self.assertIn('version: "' + VERSION + '"', skill)
                self.assertIn(DUMMY_SHA, skill)
                self.assertIn("text-only acceptance", skill)
                self.assertIn("DeBarge Protocol", skill)
                self.assertIn("references/verification.md", names[0] if not names else
                              "\n".join(names))
                self.assertIn("publication_status_report",
                              z.read("skills/go-hipster-go-gate4/scripts/playlist_cli.py").decode("utf-8"))
        self.assertEqual(digest(original), before)

    def test_gemini_qa_is_script_free_deterministic_and_versioned(self):
        original = ROOT / "dist/go-hipster-go-gemini-app-skill.zip"
        before = digest(original)
        with tempfile.TemporaryDirectory() as folder:
            p1 = Path(folder) / "gemini1.zip"
            p2 = Path(folder) / "gemini2.zip"
            build_gemini(DUMMY_SHA, p1)
            build_gemini(DUMMY_SHA, p2)
            self.assertEqual(digest(p1), digest(p2))
            with ZipFile(p1) as z:
                self.assertIsNone(z.testzip())
                names = z.namelist()
                self.assertEqual(len(names), len(set(names)))
                self.assertIn("SKILL.md", names)
                self.assertIn("references/verification.md", names)
                self.assertFalse(any(n.endswith((".py", ".json")) for n in names))
                skill = z.read("SKILL.md").decode("utf-8")
                self.assertIn("name: go-hipster-go-gate4", skill)
                self.assertIn("version: " + VERSION, skill)
                self.assertIn(DUMMY_SHA, skill)
                self.assertIn("DO NOT call it as a fallback", skill)
                verification = z.read("references/verification.md").decode("utf-8")
                self.assertIn("PUBLISHED — EXACT", verification)
                self.assertNotIn("python scripts/playlist_cli.py status-report", verification)
        self.assertEqual(digest(original), before)


if __name__ == "__main__":
    unittest.main()
