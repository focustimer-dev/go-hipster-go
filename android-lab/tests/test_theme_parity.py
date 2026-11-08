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
        # The legacy SVG fallback has no MapLibre; keep its fast path free
        # from an observer waiting for a map that cannot initialize.
        self.assertIn("get('atlas')==='legacy'",js)

    def test_native_and_browser_share_exact_one_theme_css(self):
        build=(ROOT/'scripts/bundle_android_lab.py').read_text()
        for file in ('launcher/assets/pwa-themes.css','launcher/assets/pwa-atlas-themes.css'):
            self.assertIn(file,build)
        self.assertIn('android-lab/web/theme.js',build)
        self.assertIn('android-lab/web/theme-tokens.css',build)
        manual=(ROOT/'android-lab/web/manual-guide.html').read_text()
        self.assertIn('/assets/lab-theme-tokens.css',manual)
        self.assertIn('<script src="/assets/lab-themes.js"></script>',build)
        self.assertIn('<link rel="stylesheet" href="/assets/pwa-themes.css" data-lab-palette-style media="not all">',build)
        self.assertIn('document.documentElement.dataset.pwaTheme===',build)
        self.assertIn("link.media=next==='liberi'?'not all':'all'",(ROOT/'android-lab/web/theme.js').read_text())

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
        self.assertIn(':root[data-pwa-theme=usiku] .crate-action .deck-key svg',css)
        self.assertIn('color:var(--lab-ui-on-action);',css)
        self.assertIn('--lab-ui-on-action:#f5f0e6;', (ROOT/'android-lab/web/theme-tokens.css').read_text())
        self.assertIn('background:linear-gradient(180deg,#925b39 0%,#7e4c30',css)

    def test_android_primary_action_and_usiku_vignette_material(self):
        css=(ROOT/'android-lab/web/workspace.css').read_text()
        palette=(ROOT/'launcher/assets/pwa-themes.css').read_text()
        self.assertIn("--racing-yellow:#e5cf42",palette)
        roles=(ROOT/'android-lab/web/theme-tokens.css').read_text()
        self.assertIn('--lab-ui-highlight:#e5cf42',roles)
        self.assertIn('--lab-ui-go:#7e4c30',roles)
        self.assertIn('--lab-action-yellow:var(--lab-ui-highlight)',css)
        self.assertIn('background:var(--lab-ui-go);',css)
        self.assertIn('border-top:2px solid var(--lab-action-yellow);',css)
        self.assertIn('font-size:clamp(1.5rem,6cqw,2.65rem);',css)
        self.assertIn('background:var(--lab-action-yellow);',css)
        self.assertIn('color:var(--lab-action-ink);',css)
        for shade in ('--usiku-neutral-center','--usiku-neutral-stock',
                      '--usiku-neutral-mid','--usiku-neutral-edge'):
            self.assertIn(shade+':',palette)
        for shade in ('--usiku-neutral-mid','--usiku-neutral-edge'):
            self.assertIn('var('+shade+',',css)
        self.assertIn('background-image:radial-gradient(ellipse farthest-corner',css)
        self.assertIn('background:transparent;',css)
        self.assertIn('body.gig-poster.lab-workspace[data-page=launch] .receipt-heading',css)
        self.assertIn('.receipt-heading .lab-save-button',css)
        # PWA remains on its twice-weekly cycle, not an accidental CSS edit.
        self.assertIn('body.gig-poster.lab-workspace[data-page=launch]',css)

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
        self.assertIn("'line-width':1.2",native)
        self.assertIn("'line-opacity':.88",native)
        self.assertIn("'line-dasharray':[3,2.6]",native)
        self.assertIn('opacity:.88,width:1.7,dash:[3,2.6]',browser)
        self.assertIn("'line-width':THEMED_ROUTE_PAINT.width",browser)
        self.assertIn('stroke-width:1.8;stroke-opacity:.9;',css)
        self.assertIn('stroke-dasharray:4 4;',css)
        android=(ROOT/'android-lab/web/workspace.css').read_text()
        self.assertIn('body.gig-poster.lab-workspace #labAtlasCahill .lab-cahill-routes path',android)
        self.assertIn('stroke-width:1.2;',android)
        self.assertIn('border:1px solid var(--usiku-leather,#b77b4d)',android)

    def test_keyes_underlay_and_soft_bosque_water_edge(self):
        css=(ROOT/'android-lab/web/workspace.css').read_text()
        globe=(ROOT/'android-lab/web/globe.js').read_text()
        native=(ROOT/'android-lab/web/theme.js').read_text()
        browser=(ROOT/'launcher/assets/pwa-atlas-bridge.js').read_text()
        themes=(ROOT/'launcher/assets/pwa-atlas-themes.css').read_text()
        self.assertIn('#labAtlasGlobe.lab-cahill-active > .maplibregl-canvas-container',css)
        self.assertIn('visibility:hidden!important',css)
        self.assertNotIn("id:'robinson-outline'",globe)
        self.assertNotIn("setLayoutProperty('robinson-outline'",globe)
        for code in (native,browser):
            self.assertIn("bosque:{ocean:'#e8e9df'",code)
            self.assertIn("bosque:{paper:'#004225',ocean:'#e8e9df'",code)
            self.assertNotIn("'robinson-outline'",code)
        self.assertIn('--atlas-water:#e8e9df',themes)
        self.assertIn('fill:#e8e9df;stroke:#003018;',themes)

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
