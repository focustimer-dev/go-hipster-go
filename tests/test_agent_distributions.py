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

    def test_gemini_app_upload_zip(self):
        import re
        subprocess.run([sys.executable, "scripts/build_agent_packages.py", "--zip"],
                       check=True, cwd=ROOT, capture_output=True, text=True)
        archive = ROOT / "dist/hipster-music-generator-gemini-app-skill.zip"
        with ZipFile(archive) as z:
            names = set(z.namelist())
            self.assertEqual(names, {
                "SKILL.md",
                "references/global-scenes.md",
                "references/sonic-taxonomy.md",
                "references/curation-examples.md",
                "references/verification.md",
            })
            text = z.read("SKILL.md").decode("utf-8")
            self.assertTrue(text.startswith("---\nname: hipster-music-generator\n"))
            self.assertIn("passive-aggressive record-store clerk", text[:700])
            self.assertIn("## The personality is mandatory in Gemini", text[:1300])
            self.assertIn("two or three varied little jabs", text[:1800])
            self.assertIn("If YouTube Music returns", text[:2000])
            self.assertIn("## Voice: the Insufferable Record-Store Clerk", text)
            self.assertIn("## Gemini-native playlist creation", text)
            self.assertIn("@YouTubeMusic", text)
            self.assertIn("Save to library", text)
            self.assertNotIn("in the composer", text)
            self.assertNotIn("selecting both Hipster Music Generator", text)
            self.assertIn("no code execution", text.lower())
            self.assertIn("DeBarge Protocol", text)
            self.assertIn("25 consecutive", text)
            self.assertNotIn("scripts/", text)
            self.assertNotIn("python ", text.lower())
            for link in re.findall(r"\]\(([^)]+)\)", text):
                if "://" not in link:
                    self.assertIn(link, names)

    def test_gemini_persona_and_refresh_instructions(self):
        script=(ROOT/"scripts/build_gemini_app_skill.py").read_text(encoding="utf-8")
        gem=(ROOT/"adapters/gemini/GEM_INSTRUCTIONS.md").read_text(encoding="utf-8")
        guide=(ROOT/"adapters/gemini/README.md").read_text(encoding="utf-8")
        cases=(ROOT/"adapters/gemini/MOBILE_SMOKE_TEST.md").read_text(encoding="utf-8")
        self.assertIn("The personality is mandatory in Gemini",script)
        self.assertIn("Gemini voice priority",gem)
        self.assertIn("Replace skill",guide)
        self.assertIn("go weird, 6 tracks, text only",guide)
        self.assertIn("Test V — preserve the clerk",cases)
        self.assertIn("Test E — no ChatGPT-style composer leakage",cases)
        self.assertIn("Gemini-specific publishing recovery",gem)
        self.assertIn("Save to library",guide)

    def test_gemini_zip_is_linked_and_release_automated(self):
        url = "https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-gemini-app-skill.zip"
        readme=(ROOT/"README.md").read_text(encoding="utf-8")
        gem=(ROOT/"adapters/gemini/README.md").read_text(encoding="utf-8")
        workflow=(ROOT/".github/workflows/publish-gemini-skill.yml").read_text(encoding="utf-8")
        self.assertIn(url, readme)
        self.assertIn(url, gem)
        self.assertIn("Download the Gemini skill — no terminal required", gem)
        self.assertIn("gh release create", workflow)
        self.assertIn("gh release upload", workflow)

    def test_guardrails_survive(self):
        s=(ROOT/"skills/hipster-music-generator/SKILL.md").read_text()
        for needle in ("DeBarge Protocol","25 consecutive","streaming","references/global-scenes.md"):
            self.assertIn(needle,s)

if __name__ == "__main__":
    unittest.main()
