"""Gate 3 host-packaging audit: static only; not a live Gemini/Claude/ChatGPT test."""
import unittest
from pathlib import Path
from scripts.build_gemini_app_skill import render_reference

ROOT = Path(__file__).resolve().parents[1]


class Gate3HostAudit(unittest.TestCase):
    def test_gemini_verification_is_script_free_and_preserves_evidence_states(self):
        source = (ROOT / "references/verification.md").read_text(encoding="utf-8")
        rendered = render_reference("references/verification.md", source)
        bundle = (ROOT / "adapters/gemini/GEM_KNOWLEDGE.md").read_text(encoding="utf-8")
        self.assertIn("python scripts/playlist_cli.py status-report", source)
        for content in (rendered, bundle):
            with self.subTest(length=len(content)):
                for required in ("CURATED — NOT PUBLISHED", "PUBLISHED — EXACT",
                                 "PUBLISHED — APPROXIMATE", "8 of 12", "25 DeBarge"):
                    self.assertIn(required, content)
                self.assertNotIn("python scripts/playlist_cli.py status-report", content)
                self.assertNotIn("status-report evidence.json", content)
        self.assertIn(rendered.strip(), bundle)

    def test_current_mobile_acceptance_supersedes_archived_two_stage_case(self):
        guide = (ROOT / "adapters/gemini/MOBILE_SMOKE_TEST.md").read_text(encoding="utf-8")
        active, historical = guide.split("## Historical Gemini field investigations", 1)
        for term in ("exact-first GO", "only a thematic-generation writer",
                     "PLAYLIST NOT CREATED", "12-track", "original-script",
                     "readable", "Publish", "N/T"):
            with self.subTest(term=term):
                self.assertIn(term, active)
        self.assertIn("not current 3.11.6 pass conditions", historical)
        self.assertIn("CURATED — NOT PUBLISHED", historical)

    def test_count_credit_and_no_silent_theme_contracts_still_present(self):
        skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        gem = (ROOT / "adapters/gemini/SKILL.md").read_text(encoding="utf-8")
        workflow = (ROOT / "adapters/gemini/references/workflow.md").read_text(encoding="utf-8")
        for term in ("**Display pattern:**", "**Count fidelity:**", "**Non-trigger isolation"):
            self.assertIn(term, skill)
        self.assertIn("**Count fidelity:**", workflow)
        self.assertIn("8 of 12", gem)
        self.assertIn("DO NOT call it as a fallback", gem)
        self.assertNotIn("ChatGPT plugin composer", gem)


if __name__ == "__main__":
    unittest.main()
