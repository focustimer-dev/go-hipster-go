"""Guard direct Gemini routing and conditional global discovery without host access."""
import re
import unittest
from pathlib import Path

from scripts.build_gemini_app_skill import REFERENCES, modular_files

ROOT = Path(__file__).resolve().parents[1]
RAW = "https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/release/skill-prod/"
EXCEPTIONS = {
    "US Midwest & Great Lakes": "us-midwest",
    "US South & Gulf": "us-south",
    "Atlantic & Western Europe": "atlantic-europe",
    "Middle East & Caucasus": "middle-east",
    "Central & Southern Africa": "central-southern-africa",
}
SUPPLEMENTS = {
    "oceania": ("oceania-additions.md",),
    "central-america": ("central-america-additions.md",),
    "central-southern-africa": ("central-africa-additions.md", "southern-africa-additions.md"),
}


class ReferenceRoutingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index = (ROOT / "references/reference-index.md").read_text(encoding="utf-8")
        cls.atlas = (ROOT / "references/regional-atlas.md").read_text(encoding="utf-8")
        cls.canonical = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        cls.bundle = modular_files(cls.canonical)
        cls.online = modular_files(cls.canonical, online=True)

    def test_core_and_regional_global_loading_are_distinct(self):
        core = self.index.split("## Every new ordinary GO", 1)[1].split("## Global scenes", 1)[0]
        self.assertIn("sonic-taxonomy.md", core)
        self.assertIn("verification.md", core)
        self.assertNotIn("global-scenes.md", core)
        self.assertIn("global-scenes.md", self.index)
        self.assertIn("do not preload", self.index)
        self.assertIn("candidate research is thin", self.index)
        self.assertIn("never relax the selected geography", self.index)
        self.assertIn("matching region files", self.canonical)
        self.assertIn("not routinely for region-locked", self.canonical)

    def test_all_atlas_region_labels_have_correct_direct_paths(self):
        rows = re.findall(
            r"^\| `([a-z][a-z0-9-]+)` \| ([^|]+) \| \[([^]]+)\]\(regions/([^)]+\.md)\) \|$",
            self.atlas, re.M
        )
        self.assertEqual(len(rows), 27)
        direct = self.bundle["SKILL.md"]
        self.assertIn("lowercase hyphenation except", direct)
        for label, expected, _, filename in rows:
            with self.subTest(label=label):
                # Static dispatch specification: default normalization + exceptions.
                derived = EXCEPTIONS.get(label.strip(), label.strip().lower().replace(" ", "-"))
                self.assertEqual(derived, expected)
                self.assertEqual(filename, f"{expected}.md")
                self.assertIn(f"references/regions/{filename}", REFERENCES)
                self.assertTrue((ROOT / "references/regions" / filename).is_file())
                if label.strip() in EXCEPTIONS:
                    self.assertIn(f"{label.strip()}=`{expected}`", direct)

    def test_supplements_and_modes_are_unambiguous(self):
        entry = self.bundle["SKILL.md"]
        for region, files in SUPPLEMENTS.items():
            self.assertIn(f"`{region}`", entry)
            for name in files:
                self.assertIn(f"references/regions/{name}", entry)
                self.assertIn(f"references/regions/{name}", REFERENCES)
        self.assertIn("regional-review.md", entry)
        self.assertIn("opt-in only", entry)
        for file in ("go-hard.md", "funky.md", "desire-triumphant.md",
                     "recording-quality.md", "cover-art.md", "global-scenes.md"):
            self.assertIn(f"references/{file}", entry)
        self.assertIn("De-cheese is read-only audit", entry)
        self.assertIn("Publish finalizes the current crate", entry)
        self.assertIn("Batch relevant files when supported", entry)

    def test_gemini_entry_can_route_without_index_middleman(self):
        entry = self.bundle["SKILL.md"]
        workflow = self.bundle["references/workflow.md"]
        self.assertLess(len(entry), 6500)
        self.assertIn("Direct GO routing (no index hop)", entry)
        self.assertIn("index](references/reference-index.md)", entry)
        self.assertNotIn("Follow the [reference index]", entry)
        self.assertIn("## Creative cue and count safeguards", workflow)
        self.assertIn("## Gemini setup", workflow)
        self.assertIn("## Intent and activation", workflow)
        self.assertIn("Pre-publish deduplication", workflow)
        self.assertIn("Setup does not publish", workflow)
        self.assertIn("references/reference-index.md", REFERENCES)
        self.assertIn("references/global-scenes.md", REFERENCES)

    def test_online_routes_use_frozen_production_files(self):
        entry = self.online["SKILL.md"]
        self.assertIn(RAW + "references/sonic-taxonomy.md", entry)
        self.assertIn(RAW + "references/verification.md", entry)
        self.assertIn(RAW + "references/regional-atlas.md", entry)
        self.assertIn(RAW + "adapters/gemini/references/workflow.md", entry)
        self.assertNotIn("focustimer-dev/go-hipster-go/main/", entry)
        self.assertEqual(entry, (ROOT / "adapters/gemini/SKILL.md").read_text(encoding="utf-8"))
        self.assertEqual(
            self.online["references/workflow.md"],
            (ROOT / "adapters/gemini/references/workflow.md").read_text(encoding="utf-8")
        )


if __name__ == "__main__":
    unittest.main()
