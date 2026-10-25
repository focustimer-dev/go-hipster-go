"""Offline checks for live-release mismatch detection; never access the network."""
from pathlib import Path
import shutil
import subprocess
import unittest

class LiveReleaseSmokeTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node is required')
    def test_mismatch_detection(self):
        result = subprocess.run(['node', '--test', 'tests/live_release_smoke.test.mjs'], cwd=Path(__file__).resolve().parents[1], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
