import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('playlist_cli',ROOT/'scripts'/'playlist_cli.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PlaylistCliTests(unittest.TestCase):
    def setUp(self):
        self.example=json.loads((ROOT/'examples'/'example-playlist.json').read_text())

    def test_skill_metadata_and_paths(self):
        self.assertEqual(module.check_skill(),[])

    def test_example_validates(self):
        self.assertEqual(module.validate_playlist(self.example),[])

    def test_strict_does_not_falsely_mark_example_as_verified(self):
        self.assertTrue(module.validate_playlist(self.example,strict=True))

    def test_rejects_wrong_position(self):
        self.example['tracks'][0]['position']=4
        self.assertTrue(module.validate_playlist(self.example))

    def test_rejects_published_without_provider_url(self):
        self.example['publishing']['status']='published'
        self.assertTrue(module.validate_playlist(self.example))

    def test_artist_spacing_catches_repeated_blocks_and_low_diversity(self):
        artists = ["Koma Wetan", "Altin Gün", "Lalalar", "Lalalar",
                   "Vordan Karmir", "Bedford Falls", "Koma Wetan",
                   "Omar Souleyman", "Omar Souleyman",
                   "47SOUL", "47SOUL", "47SOUL"]
        data = {"mode":"standard", "tracks":[{"artist":artist} for artist in artists]}
        issues = module.artist_spacing_issues(data)
        self.assertTrue(any("consecutive" in item for item in issues))
        self.assertTrue(any("only 7 distinct" in item for item in issues))
        self.assertTrue(any("appears 3 times" in item for item in issues))

    def test_artist_spacing_accepts_diverse_sequence(self):
        artists = ["Koma Wetan", "Altin Gün", "Lalalar", "Vordan Karmir",
                   "Bedford Falls", "Omar Souleyman", "47SOUL",
                   "Koma Wetan", "Artist Eight", "Artist Nine",
                   "Omar Souleyman", "Artist Ten"]
        data = {"mode":"standard", "tracks":[{"artist":artist} for artist in artists]}
        self.assertEqual(module.artist_spacing_issues(data), [])

    def test_artist_spacing_normalizes_case_and_skips_debarge(self):
        data = {"mode":"standard", "tracks":[{"artist":"47SOUL"}, {"artist":" 47soul "}]}
        self.assertTrue(any("consecutive" in item for item in module.artist_spacing_issues(data)))
        self.assertEqual(module.artist_spacing_issues(module.debarge_playlist()), [])

    def test_debarge_has_25_same_recording(self):
        p=module.debarge_playlist()
        self.assertEqual(len(p['tracks']),25)
        self.assertEqual(module.validate_playlist(p),[])
        p['tracks'][11]['title']='Another Song'
        self.assertTrue(module.validate_playlist(p))

    def test_roll_bounds_and_success_case(self):
        with patch.object(module.secrets,'randbelow',return_value=0):
            self.assertEqual(module.one_in_a_hundred(),{'roll':1,'triggered':True})
        with patch.object(module.secrets,'randbelow',return_value=99):
            self.assertEqual(module.one_in_a_hundred(),{'roll':100,'triggered':False})


if __name__=='__main__': unittest.main()
