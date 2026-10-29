"""Reproducible PWA-input A/B fixture shape, not proof of audio quality."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/"research/pwa-ab-2026-10-29/fixture.json").read_text(encoding="utf-8"))

class PwaAbBenchmark(unittest.TestCase):
    def test_only_effort_changes(self):
        regular=DATA["prompts"]["regular"].splitlines()
        hard=DATA["prompts"]["hard"].splitlines()
        self.assertEqual(regular[1:],hard[2:])
        self.assertEqual(regular[0],"@go-hipster-go @Spotify go funky")
        self.assertEqual(hard[0],"@go-hipster-go @Spotify go funky hard")
        self.assertIn("Curation mode: GO HARD",hard[1])
        for phrase in ("West Africa, Northern Europe","interlocking ensemble parts",
                       "Mid-tempo","offbeats pulling against the downbeat",
                       "a voice half hidden inside the ensemble",
                       "a spacious pocket with displaced accents"):
            self.assertIn(phrase,"\\n".join(regular))

    def test_twelve_diverse_tracks_each_and_six_anchors(self):
        a=DATA["regular"]["ordered_keys"]
        b=DATA["try_hard"]["ordered_keys"]
        self.assertEqual((len(a),len(b)),(12,12))
        self.assertEqual(len(set(a)),12)
        self.assertEqual(len(set(b)),12)
        self.assertEqual(set(a)&set(b),set(DATA["shared_anchor_keys"]))
        self.assertEqual(len(DATA["shared_anchor_keys"]),6)
        for sequence in (a,b):
            artists=[DATA["tracks"][id]["artist"] for id in sequence]
            self.assertEqual(len(set(artists)),12)
            self.assertEqual({DATA["tracks"][id]["region"] for id in sequence},
                             {"West Africa","Northern Europe"})
        for track in DATA["tracks"].values():
            self.assertTrue(track["source_url"].startswith("https://"))
            self.assertTrue(track["artist"] and track["title"])

    def test_no_fake_playback_or_publication(self):
        self.assertFalse(DATA["evaluation"]["blind_listening_performed"])
        self.assertFalse(DATA["evaluation"]["spotify_writer_available_in_this_chat"])
        self.assertIsNone(DATA["evaluation"]["listener_scores"])
        self.assertIn("neither Spotify playlist created",DATA["status"])
        self.assertIn("NOT an independently executed",DATA["methodology"])
        self.assertFalse(DATA["evaluation"]["provider_saved_count_is_confirmation"])

if __name__=="__main__":
    unittest.main()
