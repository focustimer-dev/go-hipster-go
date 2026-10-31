import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('bundle_lab', ROOT / 'scripts/bundle_android_lab.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class LabSnapshotTests(unittest.TestCase):
    def test_bundle_is_offline_and_preserves_launcher(self):
        def hashes():
            return {str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'launcher').rglob('*') if p.is_file()}
        before=hashes()
        with tempfile.TemporaryDirectory() as temp:
            dest=module.bundle(Path(temp)/'site')
            self.assertEqual((dest/'index.html').read_bytes(),(ROOT/'launcher/editions/gig-poster/index.html').read_bytes())
            self.assertTrue((dest/'editions/gig-poster/assets/moods-neutral-approved-v1.webp').is_file())
            self.assertTrue((dest/'editions/gig-poster/assets/moods-selected-approved-v1.webp').is_file())
            script=(dest/'assets/app.js').read_text()
            self.assertIn('window.HipsterLab.go(ai,prompt)',script)
            self.assertIn('if(event.defaultPrevented||!window.HipsterLab)return',script)
        self.assertEqual(before,hashes())

if __name__ == '__main__': unittest.main()
