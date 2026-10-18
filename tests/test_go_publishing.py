"""Check the default-go publishing contract without pretending to test live Spotify or YouTube Music."""
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class DefaultGoBehaviorTests(unittest.TestCase):
    def test_go_means_publish(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        for term in ['"go" means curate + publish by default',
                     'Spotify by default',
                     'setup change YouTube Music',
                     'go, text only',
                     'nothing was published or saved',
                     'If no authorized writer was exposed']:
            self.assertIn(term.lower(),skill.lower())

    def test_setup_supports_automatic_writer(self):
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        self.assertIn('listener',setup)
        self.assertIn('publish',setup)
        self.assertIn('OAuth',setup)
        self.assertIn('session-only',setup)

    def test_manual_regression_matrix(self):
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        for term in ['Spotify only authorized writer',
                     'YouTube Music only authorized writer',
                     'Two writable services', 'search/play only',
                     'go, text only']:
            self.assertIn(term,cases)

    def test_missing_writer_preserves_tracks_and_recovers_with_both_plugins(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        self.assertIn("without re-curating or rerolling",skill)
        self.assertIn("connected",setup)
        self.assertIn("Both Hipster Music Generator and Spotify selected",cases)
        self.assertIn("don't silently re-curate",cases)

    def test_preflight_precedes_curation(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        self.assertLess(skill.index("## Default go: one-command playlist creation"),
                        skill.index("## Curate in seven steps"))
        self.assertIn("Preflight the actual writer first",skill)
        self.assertIn("do not create an empty test playlist",skill)
        self.assertIn("Only then curate, resolve and save",skill)
        preamble=skill.split("## Intent and activation")[0]
        self.assertIn("Spotify",preamble)
        self.assertIn("YouTube Music",preamble)

    def test_default_go_routing_discovery_text(self):
        import json
        manifest=json.loads((ROOT/"plugin.json").read_text(encoding="utf-8"))
        self.assertIn("Spotify",manifest["description"])
        self.assertIn("YouTube Music",manifest["description"])
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        self.assertIn("Check real capabilities",setup)
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        self.assertIn("A/B preflight trial",cases)

    def test_go_modifiers_and_length_contract(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        examples=(ROOT/"references/curation-examples.md").read_text(encoding="utf-8")
        scenarios=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        for term in ("go fast", "go angry", "go chill", "go slow", "go weird",
                     "go short", "go long", "go weird slow", "go chill fast"):
            self.assertIn(term,skill)
        for term in ("go 20", "go fast 20", "exactly N", "soft quality target",
                     "not a schema or platform maximum", "don't silently turn 12 into 6"):
            self.assertIn(term,skill)
        self.assertIn("go weird 30",examples)
        self.assertIn("go 51",scenarios)
        self.assertIn("go 12 tracks",scenarios)

    def test_debarge_protocol_eligible_across_modifiers_and_lengths(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        # Flags and ordinary counts do not turn off the 1:100 lottery.
        for term in ('go fast', 'go angry', 'go chill', 'go slow',
                     'go weird', 'go short', 'go long', 'go weird slow 30',
                     'numeric count', 'one roll total'):
            self.assertIn(term.lower(),skill.lower())
        for case in ('go short', 'go long', 'go weird slow 30', 'go 50',
                     'go, text only', 'no DeBarge', 'unique songs only',
                     'go exactly 12, no exceptions', 'publish the playlist above'):
            self.assertIn(case,cases)
        self.assertNotIn("Don't trigger the surprise when the user requires unique songs, forbids DeBarge, or specifies a rigid length",skill)
        self.assertIn('exactly **25 consecutive entries**',skill)
        self.assertIn('roll uniformly from 1 to 100; on **1**',skill)

    def test_sad_is_composable_and_not_a_tempo_setting(self):
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        examples=(ROOT/"references/curation-examples.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        readme=(ROOT/"README.md").read_text(encoding="utf-8")
        for phrase in ("go sad", "go sad fast", "go sad weird", "go sad chill",
                       "Sad does not mean slow", "not permission to mock genuine loss"):
            self.assertIn(phrase.lower(),skill.lower())
        for phrase in ("go sad", "go sad fast", "go sad weird"):
            self.assertIn(phrase,examples)
        for phrase in ("go sad", "go sad fast", "go sad weird 24"):
            self.assertIn(phrase,cases)
        self.assertIn("go sad",readme)
        self.assertIn("one-in-100",skill)

    def test_expanded_sonic_map_has_distinct_scenes_and_sources(self):
        scenes=(ROOT/"references/global-scenes.md").read_text(encoding="utf-8")
        examples=(ROOT/"references/curation-examples.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        for name in ("Classic Lao pop", "Pre-1975 Saigon sound",
                     "Hindi-language rock", "Qawwali", "Indigenous North American",
                     "Aboriginal Australian", "Memphis underground rap", "Sigilkore",
                     "Indonesian punk", "Non-English psychedelic", "Nonbinary country"):
            self.assertIn(name, scenes)
        for domain in ("arts.gov", "sublimefrequencies.com", "folkways.si.edu",
                       "1876band.com", "memphismusichalloffame.com",
                       "thejakartapost.com", "adeemtheartist.com"):
            self.assertIn(domain, scenes)
        self.assertIn("not an independently verified formal genre", scenes)
        self.assertIn("not a synonym for contemporary phonk or sigilkore", scenes)
        self.assertIn("never force a regional, religious, Indigenous or identity quota", scenes)
        self.assertIn("No cultural, language, identity or religious quotas", skill)
        for term in ("qawwali", "Memphis", "Indonesian punk", "nonbinary country"):
            self.assertIn(term.lower(), cases.lower())
            self.assertIn(term.lower(), examples.lower())
        self.assertEqual((ROOT/"references/global-scenes.md").read_bytes(),
                         (ROOT/"skills/hipster-music-generator/references/global-scenes.md").read_bytes())

    def test_distribution_synced_and_debarge_intact(self):
        self.assertEqual((ROOT/"SKILL.md").read_bytes(),
                         (ROOT/"skills/hipster-music-generator/SKILL.md").read_bytes())
        skill=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        self.assertIn('roll uniformly from 1 to 100; on **1**',skill)
        self.assertIn('exactly **25 consecutive entries**',skill)
        self.assertIn('DeBarge — "Rhythm of the Night"',skill)

if __name__ == "__main__":
    unittest.main()
