"""Static checks only: do not claim actual Claude/Gemini installation was exercised."""
import json
import subprocess
import sys
import unittest
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]


class PortableAgentTests(unittest.TestCase):
    def test_claude_manifest_and_marketplace(self):
        meta = json.loads((ROOT / ".claude-plugin/plugin.json").read_text())
        marketplace = json.loads((ROOT / ".claude-plugin/marketplace.json").read_text())
        self.assertEqual(meta["name"], "hipster-music-generator")
        self.assertEqual(marketplace["plugins"][0]["name"], meta["name"])
        self.assertEqual(marketplace["plugins"][0]["source"]["repo"], "focustimer-dev/hipster-music-generator")

    def test_gemini_extension(self):
        meta = json.loads((ROOT / "gemini-extension.json").read_text())
        self.assertEqual(meta["name"], "hipster-music-generator")
        self.assertTrue((ROOT / "skills/hipster-music-generator/SKILL.md").exists())
        self.assertTrue((ROOT / "skills/setup/SKILL.md").exists())

    def test_bundle_synced(self):
        subprocess.run([sys.executable, "scripts/build_agent_packages.py", "--check"],
                       check=True, cwd=ROOT, capture_output=True, text=True)

    def test_upload_zips(self):
        subprocess.run([sys.executable, "scripts/build_agent_packages.py", "--zip"],
                       check=True, cwd=ROOT, capture_output=True, text=True)
        with ZipFile(ROOT / "dist/hipster-music-generator-claude-skill.zip") as z:
            names = z.namelist()
            self.assertIn("hipster-music-generator/SKILL.md", names)
            self.assertIn("hipster-music-generator/references/global-scenes.md", names)
            self.assertIn("hipster-music-generator/scripts/playlist_cli.py", names)
            self.assertIn("hipster-music-generator/adapters/README.md", names)
            self.assertIn("hipster-music-generator/tests/discovery-cases.md", names)
        with ZipFile(ROOT / "dist/hipster-music-generator-claude-plugin.zip") as z:
            self.assertIn(".claude-plugin/plugin.json", z.namelist())
            self.assertIn("skills/setup/SKILL.md", z.namelist())
            self.assertIn("skills/hipster-music-generator/references/global-scenes.md", z.namelist())

    def test_guardrails_survive(self):
        s=(ROOT/"skills/hipster-music-generator/SKILL.md").read_text()
        for needle in ("DeBarge Protocol","25 consecutive","streaming","references/global-scenes.md"):
            self.assertIn(needle,s)

if __name__ == "__main__":
    unittest.main()
