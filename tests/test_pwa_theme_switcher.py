"""PWA browser-only theme switcher contract tests."""
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class PWAThemeTests(unittest.TestCase):
    def test_three_named_preferences_and_stable_local_storage_key(self):
        js = (ROOT / "launcher/assets/pwa-workspace.js").read_text()
        self.assertIn("const THEMES=['liberi','bosque','usiku']", js)
        self.assertIn("const THEME_STORE='ghg-pwa-theme-v1'", js)
        for theme in ("liberi", "bosque", "usiku"):
            self.assertIn(f'data-pwa-theme="{theme}"', js)
        self.assertIn('aria-labelledby="pwaThemeHeading"', js)
        self.assertIn("aria-pressed", js)
        self.assertIn("localStorage.setItem(THEME_STORE,theme)", js)
        self.assertIn("doc.documentElement.dataset.pwaTheme=theme", js)
        self.assertIn("Browser storage is unavailable", js)
        self.assertIn("if(!THEMES.includes(theme))return", js)

    def test_colorways_are_browser_only_and_liberi_is_untouched(self):
        css = (ROOT / "launcher/assets/pwa-themes.css").read_text()
        self.assertNotIn("html[data-pwa-theme=liberi]", css)
        for key in ("bosque", "usiku"):
            self.assertIn(f"html[data-pwa-theme={key}]", css)
        for value in ("#003018", "#004225", "#8c6239", "#f5f0e6", "#111111"):
            self.assertIn(value, css)
        self.assertIn(".pwa-theme-choice[aria-pressed=true]", css)
        self.assertIn("@media(forced-colors:active)", css)
        self.assertIn(".crate-map-zone[data-selected=true] path", css)

    def test_usiku_recolors_original_portrait_alpha_without_washing_out_cards(self):
        css = (ROOT / "launcher/assets/pwa-themes.css").read_text()
        # Warm saddle/cognac, LIGHTER at center and DARKER at corners.
        for ink in ("--usiku-neutral-center:#b77b4d", "--usiku-neutral-stock:#a86c43",
                    "--usiku-neutral-mid:#925b39", "--usiku-neutral-edge:#7e4c30"):
            self.assertIn(ink, css)
        self.assertIn("var(--usiku-neutral-center) 0%,var(--usiku-neutral-stock) 34%", css)
        self.assertIn("var(--usiku-neutral-mid) 68%,var(--usiku-neutral-edge) 100%", css)
        self.assertNotIn("#34885e 0%", css, "Do not reintroduce the all-green vignette")
        # Transparent two-ink art is generated from approved alpha, not a
        # CSS oval wash or flat-green original mask.
        self.assertIn("usiku-neutral-two-ink-v1.webp",css)
        self.assertIn("usiku-desire-neutral-two-ink-v1.webp",css)
        self.assertIn("usiku-triumph-neutral-two-ink-v1.webp",css)
        self.assertIn("-webkit-mask:none!important",css)
        self.assertNotIn("rgba(240,200,161,.76) 0%",css)
        self.assertNotIn("mask-image:url('/editions/gig-poster/assets/moods-neutral-ink-v2.webp')",css)
        builder=(ROOT / "scripts/build_usiku_two_ink.py").read_text()
        self.assertIn("moods-neutral-ink-v2.webp",builder)
        self.assertIn("SIX_SHA",builder)
        self.assertIn("CREAM=np.array((246,210,171)",builder)
        self.assertIn("FOREST=np.array((6,56,33)",builder)

    def test_worker_applies_theme_early_to_browser_jukebox_and_manual(self):
        worker = (ROOT / "cloudflare/worker.js").read_text()
        self.assertIn('"/setup/"', worker)
        self.assertIn('"/editions/gig-poster/setup/"', worker)
        self.assertIn("const served = (isPwaLaunch || isPwaManual)", worker)
        self.assertIn("ghg-pwa-theme-v1", worker)
        self.assertIn("pwa-themes.css", worker)
        self.assertIn("if (isPwaLaunch) el.append", worker)
        self.assertIn("new HTMLRewriter()", worker)


if __name__ == "__main__":
    unittest.main()
