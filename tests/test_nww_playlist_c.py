"""A-vs-C shadow playlist controls; structural evidence only, no listening claim."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "research/nww-pilot"


class PlaylistCTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ab = json.loads((RESEARCH / "competing-playlists.json").read_text(encoding="utf-8"))
        cls.c = json.loads((RESEARCH / "playlist-c.json").read_text(encoding="utf-8"))

    def test_keeps_nine_recordings_and_changes_three_positions(self):
        original = self.ab["playlist_a"]["ordered_keys"]
        new = self.c["comparison"]["ordered_keys"]
        self.assertEqual(len(original), 12)
        self.assertEqual(len(new), 12)
        self.assertEqual(len(set(new)), 12)
        self.assertEqual(sum(a == b for a, b in zip(original, new)), 9)
        self.assertEqual([i + 1 for i, (a, b) in enumerate(zip(original, new)) if a != b], [4, 7, 12])
        self.assertEqual([x["position"] for x in self.c["changes"]], [4, 7, 12])
        self.assertEqual(self.c["control_metrics"]["identical_recordings"], 9)

    def test_artist_diversity_and_nww_count_are_held(self):
        old_tracks = self.ab["tracks"]
        new_tracks = self.c["recordings"]
        old = self.ab["playlist_a"]["ordered_keys"]
        new = self.c["comparison"]["ordered_keys"]
        self.assertEqual(len({old_tracks[k]["artist"] for k in old}), 12)
        self.assertEqual(len({new_tracks[k]["artist"] for k in new}), 12)
        self.assertEqual(sum(bool(old_tracks[k]["nww"]) for k in old), 2)
        self.assertEqual(sum(bool(new_tracks[k]["nww"]) for k in new), 2)
        self.assertFalse(self.c["comparison"]["allow_nww_inclusion_bonus"])

    def test_each_change_has_evidence_and_reasoning(self):
        for item in self.c["changes"]:
            for k in ("material", "operation", "role"):
                self.assertTrue(item["mechanism"][k])
            self.assertGreaterEqual(len(item["evidence_urls"]), 2)
            self.assertTrue(all(url.startswith("https://") for url in item["evidence_urls"]))
            self.assertTrue(item["risk"])
            self.assertIn("unheard", item["status"].lower()) if item["position"] != 12 else self.assertIn("listening untested", item["status"].lower())
        for key in self.c["comparison"]["ordered_keys"]:
            self.assertIn(key, self.c["recordings"])
            self.assertTrue(self.c["recordings"][key]["source"].startswith("https://"))

    def test_research_only(self):
        self.assertIn("NOT Spotify-published", self.c["status"])
        self.assertIn("no actual listening A/B", self.c["status"])
        self.assertNotIn("playlist-c.json", (ROOT / "SKILL.md").read_text(encoding="utf-8"))
        report = (RESEARCH / "playlist-c.md").read_text(encoding="utf-8")
        self.assertIn("do not promote", report.lower())
        self.assertIn("human listening", report.lower())


if __name__ == "__main__":
    unittest.main()
