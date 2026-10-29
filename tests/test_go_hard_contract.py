"""Contract checks for opt-in Go Hard launcher and distributed skill policy."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class GoHardContract(unittest.TestCase):
    def test_skill_distribution_has_shared_policy(self):
        canonical = read("SKILL.md")
        self.assertEqual(canonical, read("skills/go-hipster-go/SKILL.md"))
        for path in (
            "adapters/chatgpt/CHATGPT_KNOWLEDGE.md",
            "adapters/gemini/GEM_KNOWLEDGE.md",
            "adapters/gemini/references/workflow.md",
        ):
            content = read(path)
            self.assertIn("### Go Hard — optional Deep Crate Protocol", content)
            self.assertIn("Default **OFF**:", content)
            self.assertIn("references/go-hard.md", content)

    def test_deferred_depth_reference_is_bundled(self):
        reference = read("references/go-hard.md")
        self.assertEqual(reference, read("skills/go-hipster-go/references/go-hard.md"))
        self.assertIn("36–50 plausible recording leads", reference)
        self.assertIn("up to three distinct orders", reference)
        self.assertIn("one targeted bridge-track search", reference)
        self.assertIn("at most two targeted revision rounds", reference)
        self.assertIn("never pretend to have listened", reference)
        self.assertIn("16–20 survivors", reference)
        self.assertIn("one defensible carryover", reference)
        self.assertIn("one purposeful change", reference)
        for path in ("adapters/chatgpt/CHATGPT_KNOWLEDGE.md", "adapters/gemini/GEM_KNOWLEDGE.md"):
            self.assertIn("# BEGIN SOURCE: references/go-hard.md", read(path))

    def test_normal_go_path_is_conditional(self):
        script = read("launcher/assets/app.js")
        self.assertIn("let goHard=false;", script)
        self.assertIn('+(goHard?" hard":"")', script)
        self.assertIn('if(goHard)parts.push("Curation mode: GO HARD.', script)
        self.assertIn("Deep Crate Protocol.", script)
        self.assertIn("Cover art: yes. Use the skill\\u0027s cover-art workflow.", script)
        self.assertNotIn("multiple competing sequences, critical worst-handoff", script)
        self.assertNotIn("Later reissue date", script)
        self.assertIn('goHard=params.get("hard")==="1"', script)
        self.assertIn('if(goHard)u.searchParams.set("hard","1");else u.searchParams.delete("hard");', script)
        self.assertIn("goHard=!goHard;copiedPrompt=null;renderLaunch();", script)
        self.assertIn('hard.setAttribute("aria-pressed",String(goHard))', script)
        self.assertIn('+(goHard?" · deep crate":"")', script)

    def test_cover_art_policy_is_in_skill_distributions(self):
        for path in ("SKILL.md", "skills/go-hipster-go/SKILL.md",
                     "adapters/chatgpt/CHATGPT_KNOWLEDGE.md",
                     "adapters/gemini/GEM_KNOWLEDGE.md",
                     "adapters/gemini/references/workflow.md"):
            policy = read(path)
            self.assertIn("### Optional cover art — after curation", policy, path)
            self.assertIn("verified original year and local scene", policy, path)
            self.assertIn("never claim a cover was applied without provider confirmation", policy, path)

    def test_mobile_ui_reuses_existing_primitive(self):
        html = read("launcher/index.html")
        css = read("launcher/assets/hipster.css")
        self.assertRegex(html, r'id="goHard" aria-pressed="false"')
        self.assertIn('class="shuffle-pin cover-toggle" id="goHard"', html)
        self.assertIn('title="Deep Crate Protocol"', html)
        self.assertIn('<span class="option-label">TRY HARD</span>', html)
        self.assertIn('class="shuffle-pin cover-toggle" id="includeCover"', html)
        self.assertIn(".go-extras{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:0;", css)
        self.assertLess(html.index('id="includeCover"'), html.index('id="goButton"'))
        self.assertLess(html.index('id="goHard"'), html.index('id="goButton"'))
        self.assertIn('aria-describedby="hardOptionHelp"', html)
        self.assertIn("Deeper research &amp; sequencing", html)
        # Production routes serve Gig Poster markup, not launcher/index.html.
        live = read("launcher/editions/gig-poster/index.html")
        self.assertIn('class="go-extras" role="group"', live)
        self.assertIn('class="shuffle-pin cover-toggle" id="includeCover"', live)
        self.assertIn('class="shuffle-pin cover-toggle" id="goHard"', live)
        self.assertIn('title="Deep Crate Protocol"', live)
        self.assertIn('<span class="option-label">TRY HARD</span>', live)

    def test_user_requested_depth_is_bounded_and_verifiable(self):
        skill = read("SKILL.md")
        policy = read("references/go-hard.md")
        self.assertIn("the Deep Crate Protocol](references/go-hard.md)", skill)
        self.assertIn("36–50 plausible recording leads", policy)
        self.assertIn("up to three distinct orders", policy)
        self.assertIn("one targeted bridge-track search", policy)
        self.assertIn("never pretend to have listened", policy)
        self.assertIn("Ordinary `go` and all other requests keep the existing fast", policy)


if __name__ == "__main__":
    unittest.main()
