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
