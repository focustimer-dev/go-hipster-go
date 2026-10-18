"""Head-to-head research controls: structurally fair, not a live audio A/B."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"research/nww-pilot/competing-playlists.json"

class CompetingPlaylistTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data=json.loads(DATA.read_text(encoding="utf-8"))

    def test_twelve_each_and_six_common_anchors(self):
        d=self.data
        a=d["playlist_a"]["ordered_keys"]
        b=d["playlist_b"]["ordered_keys"]
        self.assertEqual(len(a),12)
        self.assertEqual(len(b),12)
        self.assertEqual(len(set(a)),12)
        self.assertEqual(len(set(b)),12)
        self.assertEqual(set(a)&set(b),set(d["shared_anchor_keys"]))
        self.assertEqual(len(d["shared_anchor_keys"]),6)
        self.assertEqual(len(set(a)|set(b)),18)
        for seq in (a,b):
            self.assertEqual(len({d["tracks"][k]["artist"] for k in seq}),12)
            for k in seq:
                self.assertTrue(d["tracks"][k]["source"].startswith("https://"))
                self.assertTrue(d["tracks"][k]["track"])

    def test_no_fake_publishing_or_inclusion_bonus(self):
        d=self.data
        self.assertEqual(d["status"],"comparison text only; not published")
        self.assertFalse("spotify_playlist_uri" in d)
        self.assertIn("no Nurse-with-Wound membership ranking boost",d["experimental_layer"])
        self.assertIn("not independently executed autonomous solvers",d["methodology"])
        a=sum(d["tracks"][k]["nww"] for k in d["playlist_a"]["ordered_keys"])
        b=sum(d["tracks"][k]["nww"] for k in d["playlist_b"]["ordered_keys"])
        self.assertEqual((a,b),(2,3))
        content=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        self.assertNotIn("competing-playlists.json",content)
        self.assertIn("blinded listening", " ".join(d["limitations"]))

if __name__=="__main__":
    unittest.main()
