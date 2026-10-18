"""Exercise the actual launcher script against clipboard and interaction contracts."""
import pathlib
import shutil
import subprocess
import unittest

class LauncherBehaviorTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node is required for launcher interaction tests')
    def test_copy_and_selection_contract(self):
        root = pathlib.Path(__file__).resolve().parents[1]
        subprocess.run(['node', 'tests/fixtures/launcher_behavior.cjs'], cwd=root, check=True, capture_output=True, text=True)
