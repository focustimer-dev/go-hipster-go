import hashlib
import importlib.util
import tempfile
import unittest
import re
from unittest.mock import patch
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
            page=(dest/'index.html').read_text()
            version=re.search(r"versionName\s+'([^']+)'",(ROOT/'android-lab/app/build.gradle').read_text()).group(1)
            self.assertIn('<span id="labAppVersion">'+version+'</span>',page)
            self.assertNotIn('<!--LAB_APP_VERSION-->',page)
            stripped=page.replace('<link rel="stylesheet" href="/assets/lab-workspace.css">','')
            start=stripped.index('<nav class="lab-rail"')
            end=stripped.index('<div class="site">',start)
            stripped=stripped[:start]+stripped[end:]
            self.assertEqual(stripped,(ROOT/'launcher/editions/gig-poster/index.html').read_text())
            for asset in ('moods-neutral-ink-v2.webp','moods-selected-ink-v2.webp','anton.woff','stock.webp'):
                path=Path('editions/gig-poster/assets')/asset
                self.assertEqual((dest/path).read_bytes(),(ROOT/'launcher'/path).read_bytes())
            self.assertTrue((dest/'editions/gig-poster/assets/moods-neutral-approved-v1.webp').is_file())
            self.assertTrue((dest/'editions/gig-poster/assets/moods-selected-approved-v1.webp').is_file())
            script=(dest/'assets/app.js').read_text()
            self.assertIn('window.HipsterLab.go(ai,prompt)',script)
            self.assertIn('if(event.defaultPrevented||!window.HipsterLab)return',script)
        self.assertEqual(before,hashes())

    def test_manual_version_follows_build_metadata(self):
        original=Path.read_text
        def read(path,*args,**kwargs):
            text=original(path,*args,**kwargs)
            if path==ROOT/'android-lab/app/build.gradle':
                return re.sub(r"versionName\s+'[^']+'", "versionName '9.8.7'", text)
            return text
        with tempfile.TemporaryDirectory() as temp:
            with patch.object(Path,'read_text',read):
                dest=module.bundle(Path(temp)/'site')
            self.assertIn('<span id="labAppVersion">9.8.7</span>',(dest/'index.html').read_text())

if __name__ == '__main__': unittest.main()
