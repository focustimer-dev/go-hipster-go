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
            for theme_asset in (
                '<script src="/assets/lab-themes.js"></script>',
                '<link rel="stylesheet" href="/assets/lab-theme-tokens.css" data-lab-palette-style media="not all">',
                '<link rel="stylesheet" href="/assets/pwa-themes.css" data-lab-palette-style media="not all">',
                '<link rel="stylesheet" href="/assets/pwa-atlas-themes.css" data-lab-palette-style media="not all">',
                '<link rel="stylesheet" href="/assets/lab-theme-print.css" data-lab-print-style media="not all">',
                '<script>for(const link of document.querySelectorAll("link[data-lab-palette-style]"))link.media=document.documentElement.dataset.pwaTheme==="liberi"?"not all":"all";</script>',
                '<script>for(const link of document.querySelectorAll("link[data-lab-print-style]"))link.media=document.documentElement.dataset.ghgThemeProfile==="print"?"all":"not all";</script>'
            ):
                self.assertIn(theme_asset,stripped)
                stripped=stripped.replace(theme_asset,'')
            stripped=stripped.replace('<p><a href="/atlas-lab.html">TRY MAPLIBRE GLOBE</a></p>','')
            stripped=re.sub(r'<script type="application/json" id="labGlobeGeography">.*?</script>','',stripped,flags=re.S)
            stripped=stripped.replace('<script defer src="/assets/maplibre/maplibre-gl.js"></script><script defer src="/assets/cahill-keyes-vendor.js"></script><link rel="stylesheet" href="/assets/maplibre/maplibre-gl.css">','')
            self.assertEqual((dest/'assets/lab-theme-tokens.css').read_text(),
                             (ROOT/'android-lab/web/theme-tokens.css').read_text())
            self.assertEqual((dest/'assets/lab-theme-print.css').read_text(),
                             (ROOT/'android-lab/web/theme-print.css').read_text())
            self.assertTrue((dest/'assets/maplibre/maplibre-gl.js').stat().st_size>500000)
            self.assertTrue((dest/'assets/cahill-keyes-vendor.js').stat().st_size>30000)
            self.assertIn('const geography=',(dest/'atlas-lab.html').read_text())
            start=stripped.index('<nav class="lab-rail"')
            end=stripped.index('<div class="site">',start)
            stripped=stripped[:start]+stripped[end:]
            # Android ships a smaller WebP chart instead of the unchanged PNG master.
            self.assertIn('atlas-engraved-details.webp',stripped)
            self.assertNotIn('atlas-engraved-details.png',stripped)
            stripped=stripped.replace('atlas-engraved-details.webp','atlas-engraved-details.png')
            self.assertEqual(stripped,(ROOT/'launcher/editions/gig-poster/index.html').read_text())
            from PIL import Image
            for name in ('desire-neutral-v1.webp','desire-selected-v1.webp',
                         'triumph-neutral-v1.webp','triumph-selected-v1.webp'):
                original=ROOT/'launcher/editions/gig-poster/assets'/name
                packaged=dest/'editions/gig-poster/assets'/name
                self.assertLess(packaged.stat().st_size,original.stat().st_size)
                with Image.open(original) as original_image, Image.open(packaged) as packaged_image:
                    self.assertEqual(original_image.size,packaged_image.size)
                    self.assertEqual(original_image.convert('RGBA').getchannel('A').tobytes(),
                                     packaged_image.convert('RGBA').getchannel('A').tobytes())
            self.assertFalse((dest/'editions/gig-poster/assets/atlas-engraved-details.png').exists())
            self.assertTrue((dest/'editions/gig-poster/assets/atlas-engraved-details.webp').exists())

            for asset in ('moods-neutral-ink-v2.webp','moods-selected-ink-v2.webp','anton.woff','stock.webp'):
                path=Path('editions/gig-poster/assets')/asset
                self.assertEqual((dest/path).read_bytes(),(ROOT/'launcher'/path).read_bytes())
            self.assertFalse((dest/'editions/gig-poster/assets/moods-neutral-approved-v1.webp').exists())
            self.assertFalse((dest/'editions/gig-poster/assets/moods-selected-approved-v1.webp').exists())
            # The retired standalone Funk frame is no longer a request path.
            self.assertFalse((dest/'editions/gig-poster/assets/the-funk.webp').exists())
            self.assertNotIn('the-funk.webp',(dest/'assets/hipster.css').read_text())
            # Locked plate has exact source alpha; no SVG filter needed at render time.
            from PIL import Image
            path=ROOT/'launcher/editions/gig-poster/assets/moods-selected-ink-v2.webp'
            with Image.open(path) as sheet:
                selected=sheet.convert('RGBA').crop((1024,512,1536,1024))
            baked_path=dest/'assets/funk-selected-engraved.webp'
            self.assertTrue(baked_path.is_file())
            self.assertLess(baked_path.stat().st_size,170000)
            with Image.open(baked_path) as image:
                baked=image.convert('RGBA')
            self.assertEqual(baked.size,(512,512))
            self.assertEqual(baked.getchannel('A').tobytes(),selected.getchannel('A').tobytes())
            self.assertEqual(baked.getpixel((256,200))[:3],(203,225,23))
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
        self.assertLess(sum((root/name).stat().st_size for name in assets),12000000)
        self.assertNotIn('editions/gig-poster/assets/the-funk.webp',assets)
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

    def test_polar_coastlines_keep_high_latitudes_and_region_splits(self):
        import json
        spec = importlib.util.spec_from_file_location('maplibre_bundle', ROOT / 'scripts/bundle_maplibre_lab.py')
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        regions = [('GRL','northern-europe'),('CAN','canada-west'),('CAN','canada-east'),('RUS','eastern-europe'),('RUS','northern-asia'),('NOR','northern-europe'),('ATA','antarctica')]
        features = [{'id':i,'properties':{'country':country,'region':region},'geometry':{}} for i,(country,region) in enumerate(regions)]
        restored = builder.complete_polar_coastlines(features)
        self.assertEqual([f['id'] for f in restored], list(range(len(regions))))
        def points(feature):
            return [point for polygon in feature['geometry']['coordinates'] for ring in polygon for point in ring]
        by_region = {f['properties']['region']:f for f in restored}
        greenland = next(f for f in restored if f['properties']['country']=='GRL')
        self.assertGreater(max(p[1] for p in points(greenland)),83.5)
        self.assertGreater(max(p[1] for p in points(by_region['canada-east'])),82)
        self.assertGreater(max(p[1] for p in points(by_region['northern-asia'])),80)
        self.assertLessEqual(max(p[0] for p in points(by_region['canada-west'])),-95)
        self.assertGreaterEqual(min(p[0] for p in points(by_region['canada-east'])),-95)
        self.assertLessEqual(max(p[0] for p in points(by_region['eastern-europe'])),60)
        self.assertGreaterEqual(min(p[0] for p in points(by_region['northern-asia'])),60)
        self.assertLessEqual(min(p[1] for p in points(by_region['antarctica'])),-89.9)
        for feature in restored:
            for polygon in feature['geometry']['coordinates']:
                for ring in polygon:
                    self.assertGreaterEqual(len(ring),4)
                    self.assertEqual(ring[0],ring[-1])
