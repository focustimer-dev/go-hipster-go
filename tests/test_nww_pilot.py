"""Research pilot invariants only. No live music or Spotify assertions."""
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PILOT = ROOT / "research/nww-pilot"


class NwwPilotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((PILOT / "entries.json").read_text(encoding="utf-8"))
        spec = importlib.util.spec_from_file_location("nww_eval", PILOT / "evaluate.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        cls.metrics = module.evaluate()

    def test_sample_is_balanced_and_not_production(self):
        rows = self.data["entries"]
        self.assertTrue(self.data["not_production"])
        self.assertEqual(len(rows), 36)
        self.assertEqual(len({e["name"] for e in rows}), 36)
        self.assertEqual(set(Counter(e["family"] for e in rows).values()), {6})
        self.assertEqual(len(self.data["families"]), 6)
        self.assertTrue(all(not e["recording_verified"] for e in rows))
        self.assertTrue(all(e["streaming_match"] == "unknown" for e in rows))
        self.assertTrue(all(e["tag_status"].startswith("hypothesis") for e in rows))
        self.assertTrue(all(e["membership_source"].startswith("https://en.wikipedia.org/")
                            for e in rows))

    def test_distillation_counts_reproduce(self):
        m = self.metrics
        self.assertEqual(m["distinct_method_labels"], 16)
        self.assertEqual(m["cross_family_method_count"], 14)
        self.assertEqual(len(m["exact_phrase_missing"]), 11)
        self.assertEqual(m["sampled_artist_names_not_in_baseline"], 36)
        self.assertEqual(m["baseline_concentration_france_uk_usa_exact"], 24)
        self.assertEqual(m["candidate_recordings_verified"], 0)

    def test_no_live_ranking_activation(self):
        doc = (PILOT / "README.md").read_text(encoding="utf-8")
        for term in ("research-only", "not a listening-quality win",
                     "negative controls", "No NWW inclusion bonus"):
            self.assertIn(term.lower(), doc.lower())
        skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertNotIn("research/nww-pilot", skill)


if __name__ == "__main__":
    unittest.main()
