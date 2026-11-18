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
            self.assertIn("go-hipster-go/references/evaluation-smoke.md", names)
            self.assertIn("go-hipster-go/references/claude-spotify-recovery.md", names)
            self.assertNotIn("go-hipster-go/tests/discovery-cases.md", names)
        with ZipFile(ROOT / "dist/go-hipster-go-claude-skill.zip") as z:
            self.assertEqual(len(z.namelist()), len(set(z.namelist())))
            self.assertTrue(all(i.date_time == (1980, 1, 1, 0, 0, 0) for i in z.infolist()))
            self.assertFalse(any("__pycache__" in n or n.endswith(".pyc") for n in z.namelist()))
        for archive in ("go-hipster-go-claude-plugin.zip", "go-hipster-go-chatgpt-plugin.zip"):
            with ZipFile(ROOT / "dist" / archive) as z:
                self.assertEqual(len(z.namelist()), len(set(z.namelist())))
                self.assertTrue(all(i.date_time == (1980, 1, 1, 0, 0, 0) for i in z.infolist()))
                self.assertFalse(any("__pycache__" in n or n.endswith(".pyc") for n in z.namelist()))
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
            assert "skills/go-hipster-go/references/evaluation-smoke.md" in z.namelist()
            assert "skills/go-hipster-go/references/claude-spotify-recovery.md" in z.namelist()
            assert "skills/go-hipster-go/tests/discovery-cases.md" not in z.namelist()
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
            self.assertEqual(len(names), len(z.namelist()))
            # Scan the actual installable reference, not only repository text.
            packaged_policy = z.read("references/gemini-publish.md").decode("utf-8")
            self.assertEqual(packaged_policy, (ROOT / "references/gemini-publish.md").read_text(encoding="utf-8"))
            for restricted in ("youtube_music:", "media_intent_type", "video_titles",
                               "number_of_videos", "video_uris", "PERSONAL_PLAYLIST",
                               "```json", "drive.google.com", "http://"):
                self.assertNotIn(restricted, packaged_policy)

            self.assertTrue(all(i.date_time == (1980, 1, 1, 0, 0, 0) for i in z.infolist()))
            self.assertEqual(names, set(__import__("scripts.build_gemini_app_skill", fromlist=["REFERENCES"]).REFERENCES) | {
                "SKILL.md",
                "references/workflow.md",
                "references/setup.md",
                "references/tempo-curve.md",
                "references/global-scenes.md",
                "references/sonic-taxonomy.md",
                "references/curation-examples.md",
                "references/verification.md",
            })
            entry = z.read("SKILL.md").decode("utf-8")
            self.assertLess(len(entry), 6500)
            self.assertIn("references/workflow.md", entry)
            self.assertIn("read [tempo curve](references/tempo-curve.md) before choosing tracks", entry)
            curve = z.read("references/tempo-curve.md").decode("utf-8")
            self.assertIn("c1:-2wd-1012a210-1s-2-10", curve)
            text = entry + z.read("references/workflow.md").decode("utf-8")
            self.assertTrue(text.startswith("---\nname: go-hipster-go\n"))
            self.assertIn("playfully theatrical, dry-witted record-store clerk", entry)
            self.assertIn("two or three asides into specific musical observations", text)
            self.assertIn("## Gemini-native playlist creation", text)
            self.assertIn("no code execution", text.lower())
            self.assertNotIn("DeBarge Protocol", text)
            self.assertNotIn("references/protocol-hit.md", names)
            self.assertNotIn("python ", text.lower())
            self.assertIn("Gemini default", text)
            self.assertIn("version: " + json.loads((ROOT / "plugin.json").read_text())["version"], entry)
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
            # The short Gemini entry stays capped at 6.5 KB; detailed policy is deferred.
            self.assertLess(len(z.read("SKILL.md")), 6500)
            self.assertNotIn("## Tempo and mood curve", text)
            quality = z.read("references/recording-quality.md").decode("utf-8")
            self.assertIn("Never silently relax", quality)
            self.assertIn("recording-quality.md", z.read("references/reference-index.md").decode("utf-8"))
            self.assertIn("The clipped guitar leaves enough room", text)
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
                             (ROOT / "adapters/gemini/templates/references/sonic-taxonomy.md").read_bytes())
            for link in re.findall(r"\]\(([^)]+)\)", text):
                if "://" not in link:
                    self.assertIn(link, names)

    def test_all_four_archives_reproduce_byte_for_byte(self):
        import hashlib
        def hashes():
            return {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                    for p in (ROOT / "dist").glob("go-hipster-go-*.zip")}
        cmd = [sys.executable, "scripts/build_agent_packages.py", "--zip"]
        subprocess.run(cmd, check=True, cwd=ROOT, capture_output=True, text=True)
        before = hashes()
        self.assertEqual(len(before), 4)
        subprocess.run(cmd, check=True, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(before, hashes())

    def test_gemini_render_avoids_unavailable_sequence_cli(self):
        from scripts.build_gemini_app_skill import render, modular_files
        canonical = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        rendered = render(canonical)
        online = modular_files(canonical, online=True)
        for policy in (rendered, online["references/workflow.md"]):
            self.assertNotIn("lint-sequence", policy)
            self.assertIn("Check the final count", policy)

    def test_gemini_clean_track_matching_and_partial_preview(self):
        canonical = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        entry = (ROOT / "adapters/gemini/SKILL.md").read_text(encoding="utf-8")
        knowledge = (ROOT / "adapters/gemini/GEM_KNOWLEDGE.md").read_text(encoding="utf-8")
        policy = (ROOT / "references/gemini-publish.md").read_text(encoding="utf-8")
        self.assertIn("one plain `Artist - Track Title` string per slot in order", canonical)
        self.assertIn("official artist/title spelling and diacritics", canonical)
        self.assertIn("not generic `(Remastered)` tags", canonical)
        self.assertIn("simplify accents or punctuation only after a particular match fails", canonical)
        self.assertIn("requested number of tracks", policy)
        self.assertIn("Partial preview example", knowledge)
        self.assertIn("no-write request", entry)

    def test_gemini_publish_follow_up_contract(self):
        from scripts.build_gemini_app_skill import render, REFERENCES
        entry = (ROOT / "adapters/gemini/SKILL.md").read_text()
        knowledge = (ROOT / "adapters/gemini/GEM_KNOWLEDGE.md").read_text()
        policy = (ROOT / "references/gemini-publish.md").read_text()
        gem = (ROOT / "adapters/gemini/GEM_INSTRUCTIONS.md").read_text()
        self.assertIn("references/gemini-publish.md", REFERENCES)
        self.assertIn("**Publish follow-up:**", entry)
        self.assertIn("raw.githubusercontent.com/focustimer-dev/go-hipster-go/release/skill-prod/references/gemini-publish.md", entry)
        self.assertIn("**Publish follow-up:**", render((ROOT / "SKILL.md").read_text()))
        self.assertEqual(knowledge.count("# BEGIN SOURCE: references/gemini-publish.md"), 1)
        self.assertIn("# Gemini exact-track publishing", knowledge)
        for needle in ("Save to library", "TRACKLIST / LINER NOTES", "existing playlist", "copy-ready text"):
            self.assertIn(needle, policy)
        self.assertIn("## Publish — finalize the existing playlist", gem)
        self.assertNotIn("**Publish follow-up:**", (ROOT / "SKILL.md").read_text())
        self.assertNotIn("**Publish follow-up:**", (ROOT / "adapters/claude/README.md").read_text())

    def test_gemini_package_uses_permission_aware_publishing(self):
        from scripts.build_gemini_app_skill import modular_files
        files = modular_files((ROOT / "SKILL.md").read_text())
        entry = files["SKILL.md"]
        policy = (ROOT / "references/gemini-publish.md").read_text(encoding="utf-8")
        self.assertIn("permission and confirmation", entry)
        self.assertIn("permission and confirmation", policy)
        self.assertIn("## Gemini-specific playlist creation and saving", policy)
        self.assertIn("**YouTube Music handoff:**", entry)
        for content in (entry, files["references/workflow.md"], policy):
            for marker in ("youtube_music:", "PERSONAL_PLAYLIST", "media_intent_type",
                           "video_titles", "number_of_videos", "video_uris", "```json"):
                with self.subTest(marker=marker):
                    self.assertNotIn(marker, content)

    def test_gemini_natural_language_handoff_rules_and_mirror(self):
        # Static policy guard; it cannot prove a real provider save.
        policy = (ROOT / "references/gemini-publish.md").read_text(encoding="utf-8")
        gem = (ROOT / "adapters/gemini/GEM_INSTRUCTIONS.md").read_text(encoding="utf-8")
        must_preserve = (
            "Supply only the personal-playlist intent, the curated title",
            "Omit any separate list of track titles",
            "12 by default", "17–21",
            "exact, unmodified playlist link returned by creation",
            "Supply only the personal-playlist intent, that same unmodified playlist link",
            "Omit the list of individual recording links",
            "library persistence", "failed save", "verification",
            "A text-only crate requires a later explicit request", "Reuse the existing playlist",
        )
        for phrase in must_preserve:
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, policy)
        for content in (policy, gem):
            for forbidden in ("youtube_music:", "media_intent_type", "video_titles",
                              "number_of_videos", "video_uris", "PERSONAL_PLAYLIST",
                              "```json", "drive.google.com", "http://"):
                with self.subTest(forbidden=forbidden):
                    self.assertNotIn(forbidden, content)
        knowledge = (ROOT / "adapters/gemini/GEM_KNOWLEDGE.md").read_text(encoding="utf-8")
        self.assertEqual(knowledge.count("# BEGIN SOURCE: references/gemini-publish.md"), 1)
        self.assertIn(policy.strip(), knowledge)

    def test_gemini_persona_and_refresh_instructions(self):
        script=(ROOT/"adapters/gemini/templates/SKILL.md").read_text(encoding="utf-8")
        gem=(ROOT/"adapters/gemini/GEM_INSTRUCTIONS.md").read_text(encoding="utf-8")
        guide=(ROOT/"adapters/gemini/README.md").read_text(encoding="utf-8")
        cases=(ROOT/"adapters/gemini/MOBILE_SMOKE_TEST.md").read_text(encoding="utf-8")
        self.assertIn("Editorial voice",script)
        self.assertIn("Gemini voice priority",gem)
        self.assertIn("Replace skill",guide)
        self.assertIn("go weird, 6 tracks, text only",guide)
        self.assertIn("Test V — preserve the clerk",cases)
        self.assertIn("Test E — no ChatGPT-style composer leakage",cases)
        self.assertIn("Gemini-specific publishing recovery",gem)
        self.assertIn("Save to library",guide)

    def test_gemini_zip_is_linked_and_release_manually_published(self):
        manifest=json.loads((ROOT/"config/stable-skill-release.json").read_text(encoding="utf-8"))
        url = manifest["artifacts"]["gemini_skill"]["url"]
        readme=(ROOT/"README.md").read_text(encoding="utf-8")
        gem=(ROOT/"adapters/gemini/README.md").read_text(encoding="utf-8")
        workflow=(ROOT/".github/workflows/publish-gemini-skill.yml").read_text(encoding="utf-8")
        self.assertIn(url, readme)
        self.assertIn(url, gem)
        self.assertIn("Download the Gemini skill — no terminal required", gem)
        self.assertIn("gh release create", workflow)
        self.assertNotIn("gh release upload", workflow)
        self.assertIn("workflow_dispatch:", workflow)
        self.assertIn("inputs.publish_approved", workflow)
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
        self.assertNotIn("gh release upload", workflow)
        self.assertIn("workflow_dispatch:", workflow)
        self.assertIn("inputs.publish_approved", workflow)

    def test_guardrails_survive(self):
        s=(ROOT/"skills/go-hipster-go/SKILL.md").read_text()
        for needle in ("DeBarge Protocol","25 consecutive","streaming","references/global-scenes.md"):
            self.assertIn(needle,s)

if __name__ == "__main__":
    unittest.main()
