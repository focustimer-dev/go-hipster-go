"""Guard shared palette and Android bundle without touching canonical art."""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]

class AndroidThemeParity(unittest.TestCase):
    def test_native_color_picker_and_early_paint(self):
        html=(ROOT/'android-lab/web/workspace.html').read_text()
        js=(ROOT/'android-lab/web/theme.js').read_text()
        self.assertIn('aria-labelledby="labThemeHeading"',html)
        for name in ('liberi','bosque','usiku'):
            self.assertIn('data-lab-theme="'+name+'"',html)
        self.assertIn("const KEY='ghg-lab-theme-v1'",js)
        self.assertIn('document.documentElement.dataset.pwaTheme=theme',js)
        self.assertIn('window.GHGAtlasPaintColors',js)
        self.assertIn('map.setPaintProperty',js)
        self.assertIn('background-color',js)
        self.assertIn('refreshButtons',js)

    def test_native_and_browser_share_exact_one_theme_css(self):
        build=(ROOT/'scripts/bundle_android_lab.py').read_text()
        for file in ('launcher/assets/pwa-themes.css','launcher/assets/pwa-atlas-themes.css'):
            self.assertIn(file,build)
        self.assertIn('android-lab/web/theme.js',build)
        self.assertIn('<script src="/assets/lab-themes.js"></script>',build)
        self.assertIn('<link rel="stylesheet" href="/assets/pwa-themes.css">',build)

    def test_native_manual_reuses_palettes_in_embedded_guide(self):
        manual=(ROOT/'android-lab/web/manual-guide.html').read_text()
        css=(ROOT/'android-lab/web/manual-guide-theme.css').read_text()
        build=(ROOT/'scripts/bundle_android_lab.py').read_text()
        js=(ROOT/'android-lab/web/theme.js').read_text()
        self.assertIn('lab-manual-themes.css',manual)
        self.assertIn('parent.document.documentElement.dataset.pwaTheme',manual)
        self.assertIn("manual-guide-theme.css",build)
        for name in ('bosque','usiku'):
            self.assertIn('data-pwa-theme='+name,css)
        self.assertIn('syncManualTheme',js)
        self.assertIn("addEventListener('load',syncManualTheme)",js)

    def test_navigable_routes_and_stable_animated_border_ink(self):
        tween=(ROOT/'android-lab/web/atlas-morph-vectors.js').read_text()
        fold=(ROOT/'android-lab/web/cahill-keyes-motion.js').read_text()
        native=(ROOT/'android-lab/web/theme.js').read_text()
        browser=(ROOT/'launcher/assets/pwa-atlas-bridge.js').read_text()
        css=(ROOT/'launcher/assets/pwa-atlas-themes.css').read_text()
        self.assertIn('context.strokeStyle=palette.ink',tween)
        self.assertNotIn('context.strokeStyle=palette.ocean',tween)
        self.assertIn('getComputedStyle(ocean)',fold)
        self.assertIn('getComputedStyle(path)',fold)
        self.assertIn("'line-width':1.7",native)
        self.assertIn("'line-opacity':.88",native)
        self.assertIn("'line-dasharray':[3,2.6]",native)
        self.assertIn('opacity:.88,width:1.7,dash:[3,2.6]',browser)
        self.assertIn("'line-width':THEMED_ROUTE_PAINT.width",browser)
        self.assertIn('stroke-width:1.8;stroke-opacity:.9;',css)
        self.assertIn('stroke-dasharray:4 4;',css)

    def test_keyes_underlay_and_robinson_perimeter(self):
        css=(ROOT/'android-lab/web/workspace.css').read_text()
        globe=(ROOT/'android-lab/web/globe.js').read_text()
        native=(ROOT/'android-lab/web/theme.js').read_text()
        browser=(ROOT/'launcher/assets/pwa-atlas-bridge.js').read_text()
        self.assertIn('#labAtlasGlobe.lab-cahill-active > .maplibregl-canvas-container',css)
        self.assertIn('visibility:hidden!important',css)
        self.assertIn("id:'robinson-outline'",globe)
        self.assertIn("setLayoutProperty('robinson-outline'",globe)
        self.assertIn("'robinson-outline':{'line-color':",native)
        self.assertIn("'robinson-outline':{'line-color':",browser)

    def test_three_projections_tween_without_liberi_color_flash(self):
        globe=(ROOT/'android-lab/web/atlas-morph-vectors.js').read_text()
        keyes=(ROOT/'android-lab/web/cahill-keyes-motion.js').read_text()
        pwa=(ROOT/'scripts/build_pwa_atlas_preview.py').read_text()
        self.assertIn('window.GHGAtlasPaintColors?.()',globe)
        self.assertIn("window.GHGAtlasPaintColors?.().theme||'liberi'",globe)
        self.assertIn('PAL=new Proxy',keyes)
        self.assertIn('PAL.backdrop',keyes)
        self.assertIn('getComputedStyle(item).fill',keyes)
        self.assertNotIn('theme_browser_tween_assets()',pwa)
        # Only recolor canonical paths, not geolocation, selections or map projection math.
        self.assertIn('bundle(DEST)',pwa)

if __name__=='__main__':
    unittest.main()
