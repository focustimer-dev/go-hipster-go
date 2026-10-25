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
        self.assertEqual(meta["name"], "go-hipster-go")
        self.assertEqual(marketplace["plugins"][0]["name"], meta["name"])
        self.assertEqual(marketplace["plugins"][0]["source"]["repo"], "focustimer-dev/go-hipster-go")

    def test_gemini_extension(self):
        meta = json.loads((ROOT / "gemini-extension.json").read_text())
        self.assertEqual(meta["name"], "go-hipster-go")
        self.assertTrue((ROOT / "skills/go-hipster-go/SKILL.md").exists())
        self.assertTrue((ROOT / "skills/setup/SKILL.md").exists())

    def test_bundle_synced(self):
        subprocess.run([sys.executable, "scripts/build_agent_packages.py", "--check"],
                       check=True, cwd=ROOT, capture_output=True, text=True)

    def test_upload_zips(self):
        subprocess.run([sys.executable, "scripts/build_agent_packages.py", "--zip"],
                       check=True, cwd=ROOT, capture_output=True, text=True)
        with ZipFile(ROOT / "dist/go-hipster-go-claude-skill.zip") as z:
            names = z.namelist()
            self.assertIn("go-hipster-go/SKILL.md", names)
            self.assertIn("go-hipster-go/references/global-scenes.md", names)
            self.assertIn("go-hipster-go/scripts/playlist_cli.py", names)
            self.assertIn("go-hipster-go/adapters/README.md", names)
            self.assertIn("go-hipster-go/tests/discovery-cases.md", names)
        with ZipFile(ROOT / "dist/go-hipster-go-claude-plugin.zip") as z:
            self.assertIn(".claude-plugin/plugin.json", z.namelist())
            self.assertIn("skills/setup/SKILL.md", z.namelist())
            self.assertIn("skills/go-hipster-go/references/global-scenes.md", z.namelist())

    def test_chatgpt_plugin_zip_contains_renamed_skill(self):
        import json
        import subprocess
        import sys
        from zipfile import ZipFile
        subprocess.run([sys.executable, "scripts/build_agent_packages.py", "--zip"],
                       cwd=ROOT, capture_output=True, check=True)
        with ZipFile(ROOT / "dist/go-hipster-go-chatgpt-plugin.zip") as z:
            assert json.loads(z.read("plugin.json"))["name"] == "go-hipster-go"
            assert "skills/go-hipster-go/SKILL.md" in z.namelist()
            assert "skills/setup/SKILL.md" in z.namelist()
        self.assertEqual(
            {p.name for p in (ROOT / "dist").glob("*.zip")},
            {"go-hipster-go-gemini-app-skill.zip", "go-hipster-go-claude-skill.zip", "go-hipster-go-claude-plugin.zip", "go-hipster-go-chatgpt-plugin.zip"}
        )

    def test_gemini_app_upload_zip(self):
        import re
        subprocess.run([sys.executable, "scripts/build_agent_packages.py", "--zip"],
                       check=True, cwd=ROOT, capture_output=True, text=True)
        archive = ROOT / "dist/go-hipster-go-gemini-app-skill.zip"
        with ZipFile(archive) as z:
            names = set(z.namelist())
            self.assertEqual(names, set(__import__("scripts.build_gemini_app_skill", fromlist=["REFERENCES"]).REFERENCES) | {
                "SKILL.md",
                "references/workflow.md",
                "references/global-scenes.md",
                "references/sonic-taxonomy.md",
                "references/curation-examples.md",
                "references/verification.md",
            })
            entry = z.read("SKILL.md").decode("utf-8")
            self.assertLess(len(entry), 6500)
            self.assertIn("references/workflow.md", entry)
            text = entry + z.read("references/workflow.md").decode("utf-8")
            self.assertTrue(text.startswith("---\nname: go-hipster-go\n"))
            self.assertIn("passive-aggressive record-store clerk", text[:700])
            self.assertIn("## The personality is mandatory in Gemini", text[:1300])
            self.assertIn("two or three varied little jabs", text[:1800])
            self.assertIn("If YouTube Music returns", text[:2000])
            self.assertIn("## Voice: the Insufferable Record-Store Clerk", text)
            self.assertIn("## Gemini-native playlist creation", text)
            self.assertIn("@YouTubeMusic", text)
            self.assertIn("Save to library", text)
            self.assertNotIn("composer", text.lower())
            self.assertNotIn("selecting both Go, Hipster, Go!", text)
            self.assertIn("no code execution", text.lower())
            self.assertIn("DeBarge Protocol", text)
            self.assertIn("25 consecutive", text)
            self.assertNotIn("scripts/", text)
            self.assertNotIn("python ", text.lower())
            self.assertIn("Gemini default", text)
            self.assertIn("version: 3.7.2", text.split("---", 2)[1])
            self.assertIn("## Creative cue and count safeguards", text)
            self.assertIn("optional subplot", text)
            self.assertIn("Pre-publish deduplication", text)
            from scripts.build_gemini_app_skill import render
            full = render((ROOT / "SKILL.md").read_text())
            self.assertIn(full[full.index("## Intent and activation"):], text)
            online = (ROOT / "adapters/gemini/SKILL.md").read_text()
            self.assertNotIn("](references/", online)
            self.assertIn("raw.githubusercontent.com", online)

            self.assertIn("## Gemini setup", text)
            self.assertIn("## Resource routing", text)
            self.assertNotIn("Spotify is the default service", text)
            self.assertNotIn("Spotify by default", text)
            self.assertNotIn("add_playlist_items", text)
            self.assertNotIn("Apple Music handoff", text)
            self.assertNotIn("--strict", text)
            self.assertNotIn(r"\n\n##", text)
            self.assertLess(len(text), 35000)
            self.assertIn("| Flat or generic | Actually on brand |", text)
            self.assertEqual(text.count("## Gemini-native playlist creation"), 1)
            v = z.read("references/verification.md").decode("utf-8")
            self.assertIn("Criminal mood: verify the song", v)
            self.assertNotIn("Real Claude field report", v)
            self.assertNotIn("verification.status", v)
            self.assertNotIn("--strict", v)
            examples = z.read("references/curation-examples.md").decode("utf-8")
            self.assertIn("Zamrock guitar fuzz", examples)
            self.assertNotIn("## Host-aware recovery", examples)
            self.assertEqual(z.read("references/global-scenes.md"),
                             (ROOT / "references/global-scenes.md").read_bytes())
            self.assertEqual(z.read("references/sonic-taxonomy.md"),
                             (ROOT / "references/sonic-taxonomy.md").read_bytes())
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
        url = "https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip"
        readme=(ROOT/"README.md").read_text(encoding="utf-8")
        gem=(ROOT/"adapters/gemini/README.md").read_text(encoding="utf-8")
        workflow=(ROOT/".github/workflows/publish-gemini-skill.yml").read_text(encoding="utf-8")
        self.assertIn(url, readme)
        self.assertIn(url, gem)
        self.assertIn("Download the Gemini skill — no terminal required", gem)
        self.assertIn("gh release create", workflow)
        self.assertIn("gh release upload", workflow)
        self.assertIn("gh release delete-asset", workflow)
        self.assertNotIn("dist/hipster-music-generator-", workflow)

    def test_claude_and_muse_onboarding_assets(self):
        root=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        desc=next(s[len("description: "):] for s in root.splitlines()
                  if s.startswith("description: "))
        self.assertLessEqual(len(desc), 200)
        claude=(ROOT/"adapters/claude/README.md").read_text(encoding="utf-8")
        muse=(ROOT/"adapters/muse/README.md").read_text(encoding="utf-8")
        readme=(ROOT/"README.md").read_text(encoding="utf-8")
        workflow=(ROOT/".github/workflows/publish-gemini-skill.yml").read_text(encoding="utf-8")
        for filename in ("go-hipster-go-claude-skill.zip",
                         "go-hipster-go-claude-plugin.zip"):
            self.assertIn(filename, claude)
            self.assertIn(filename, readme)
            self.assertIn(filename, workflow)
        self.assertIn("Customize → Skills", claude)
        self.assertIn("Spotify Premium", claude)
        self.assertIn("descriptions sound like a corporate brochure",claude)
        self.assertIn("Suggested playlist description",claude)
        self.assertIn("Do not change the song selection or order",claude)
        self.assertIn("create_playlist", claude)
        # Regression: Claude recommended a valid Skill ZIP to a user on the
        # Plugin uploader. The installer must be identified before choosing.
        self.assertIn("Do not recommend either archive until you have identified", claude)
        self.assertIn("Customize → Plugins → Upload a plugin", claude)
        self.assertIn("Customize → Skills → Upload a skill", claude)
        self.assertIn("ask one short question", claude)
        self.assertIn("not a mistake by the listener", claude)
        self.assertIn("Before suggesting a ZIP, identify my", readme)
        self.assertIn(".claude-plugin/plugin.json", readme)
        self.assertIn("adapters/claude/README.md", readme)
        self.assertIn("Never interchange the two archives", readme)

        self.assertIn("Which Claude screen are you on?", claude)
        self.assertIn("Customize → Plugins → Upload a plugin", claude)
        self.assertIn(".claude-plugin/plugin.json", claude)
        self.assertIn("the skill-only ZIP fails plugin validation", readme)
        self.assertIn("Muse Code — separate developer route", muse)
        self.assertIn("muse skills install", muse)
        self.assertIn("not proof", muse)
        self.assertIn("spotify-meta-muse-agent", muse)
        self.assertIn("gh release upload", workflow)

    def test_guardrails_survive(self):
        s=(ROOT/"skills/go-hipster-go/SKILL.md").read_text()
        for needle in ("DeBarge Protocol","25 consecutive","streaming","references/global-scenes.md"):
            self.assertIn(needle,s)

if __name__ == "__main__":
    unittest.main()
