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
            stripped=stripped.replace('<p><a href="/atlas-lab.html">TRY MAPLIBRE GLOBE</a></p>','')
            self.assertTrue((dest/'assets/maplibre/maplibre-gl.js').stat().st_size>500000)
            self.assertIn('const geography=',(dest/'atlas-lab.html').read_text())
            start=stripped.index('<nav class="lab-rail"')
            end=stripped.index('<div class="site">',start)
            stripped=stripped[:start]+stripped[end:]
            self.assertEqual(stripped,(ROOT/'launcher/editions/gig-poster/index.html').read_text())
            for asset in ('moods-neutral-ink-v2.webp','moods-selected-ink-v2.webp','anton.woff','stock.webp'):
                path=Path('editions/gig-poster/assets')/asset
                self.assertEqual((dest/path).read_bytes(),(ROOT/'launcher'/path).read_bytes())
            self.assertFalse((dest/'editions/gig-poster/assets/moods-neutral-approved-v1.webp').exists())
            self.assertFalse((dest/'editions/gig-poster/assets/moods-selected-approved-v1.webp').exists())
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

class RuntimeAssetTests(unittest.TestCase):
    def test_declared_assets_cover_local_resources(self):
        import json
        from html.parser import HTMLParser
        from urllib.parse import urljoin,urlparse
        root=ROOT/'launcher'
        assets=set(json.loads((ROOT/'android-lab/web/runtime-assets.json').read_text()))
        self.assertLess(sum((root/name).stat().st_size for name in assets),13000000)
        class Links(HTMLParser):
            def __init__(self):super().__init__();self.refs=[]
            def handle_starttag(self,tag,attrs):
                self.refs += [v for k,v in attrs if k in ('href','src','data-src') and v]
        for name in assets:
            p=root/name
            refs=[]
            if p.suffix in ('.html','.svg'):
                parser=Links();parser.feed(p.read_text());refs+=parser.refs
            if p.suffix=='.css':refs+=re.findall(r'''url\(["']?([^\s)'";]+)''',p.read_text())
            for ref in refs:
                parsed=urlparse(ref)
                if parsed.scheme or ref.startswith('#'):continue
                target=urlparse(urljoin('/'+name,ref)).path.lstrip('/')
                if target.endswith('/'):target+='index.html'
                # Navigation anchors are checked by workflow tests; assets must exist offline.
                if Path(target).suffix in ('.css','.js','.png','.webp','.svg','.woff','.webmanifest'):
                    self.assertIn(target,assets,(name,ref))

    def test_portrait_runtime_pixels_match_locked_sources(self):
        from PIL import Image
        for stem in ('desire-neutral-v1','desire-selected-v1','triumph-neutral-v1','triumph-selected-v1'):
            base=ROOT/'launcher/editions/gig-poster/assets'/stem
            original=Image.open(base.with_suffix('.png')).convert('RGBA')
            runtime=Image.open(base.with_suffix('.webp')).convert('RGBA')
            self.assertEqual(original.size,runtime.size)
            self.assertEqual(original.tobytes(),runtime.tobytes(),stem)

    def test_missing_extension_slot_fails_build(self):
        original=Path.read_text
        def read(path,*args,**kwargs):
            content=original(path,*args,**kwargs)
            return content.replace('/* PLATFORM_COPY */','') if path.name=='app.js' else content
        with tempfile.TemporaryDirectory() as temp,patch.object(Path,'read_text',read):
            with self.assertRaisesRegex(ValueError,'COPY'):module.bundle(Path(temp)/'site')
