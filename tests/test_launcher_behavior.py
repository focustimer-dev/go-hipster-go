"""Exercise the actual launcher script against clipboard and interaction contracts."""
import pathlib
import shutil
import subprocess
import unittest

class LauncherBehaviorTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node is required for camera tests')
    def test_robinson_camera_limits(self):
        root = pathlib.Path(__file__).resolve().parents[1]
        process = subprocess.run(['node', 'tests/fixtures/atlas_camera.cjs'], cwd=root, capture_output=True, text=True)
        self.assertEqual(process.returncode, 0, process.stdout + process.stderr)

    @unittest.skipUnless(shutil.which('node'), 'Node is required for launcher interaction tests')
    def test_copy_and_selection_contract(self):
        root = pathlib.Path(__file__).resolve().parents[1]
        process = subprocess.run(['node', 'tests/fixtures/launcher_behavior.cjs'], cwd=root, capture_output=True, text=True)
        self.assertEqual(process.returncode, 0, 'Launcher Node test failed:\\n' + process.stdout + '\\n' + process.stderr)
