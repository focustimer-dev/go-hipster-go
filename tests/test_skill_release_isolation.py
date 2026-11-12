"""Regression checks: dev pushes must not mutate published skill distributions."""
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_gemini_app_skill import modular_files

PUBLIC_REF = "https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/release/skill-prod/"


class ReleaseIsolationTests(unittest.TestCase):
    def test_release_workflow_requires_manual_approval(self):
        workflow = (ROOT / ".github/workflows/publish-gemini-skill.yml").read_text(encoding="utf-8")
        events = workflow.split("\npermissions:", 1)[0]
        self.assertIn("\n  workflow_dispatch:", events)
        self.assertNotIn("\n  push:", events)
        self.assertIn("publish_approved:", events)
        self.assertIn("default: false", events)
        self.assertIn("github.ref == 'refs/heads/main' && inputs.publish_approved", workflow)
        self.assertNotIn("--clobber", workflow)
        self.assertIn("Refusing to overwrite previously published ZIP assets.", workflow)

    def test_online_references_never_point_to_development_main(self):
        canonical = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        online = modular_files(canonical, online=True)
        urls = []
        for name in ("SKILL.md", "references/workflow.md"):
            data = online[name]
            urls.extend(re.findall(r"https://raw\.githubusercontent\.com/focustimer-dev/go-hipster-go/[^)\s]+", data))
            self.assertNotIn("https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/main/", data)
            # Generated files must be synchronized with the canonical builder.
            generated = ROOT / "adapters/gemini" / name
            self.assertEqual(data, generated.read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(urls), 10)
        self.assertTrue(all(url.startswith(PUBLIC_REF) for url in urls), urls)

    def test_release_path_frozen_in_generator(self):
        generator = (ROOT / "scripts/build_gemini_app_skill.py").read_text(encoding="utf-8")
        self.assertIn(PUBLIC_REF, generator)
        self.assertNotIn('base = "https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/main/"', generator)


if __name__ == "__main__":
    unittest.main()
