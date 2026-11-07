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
        # The radial stock is the approved light-center/dark-edge vignette.
        self.assertIn("#34885e 0%,var(--usiku-neutral-stock) 34%,#145c3b 68%,var(--usiku-neutral-edge) 100%", css)
        # Only real portrait ink pixels receive a restrained deep-green fill.
        self.assertIn("--usiku-neutral-ink:#0f5638", css)
        self.assertIn("mask-image:url('/editions/gig-poster/assets/moods-neutral-ink-v2.webp')", css)
        self.assertIn("mask-position:var(--mood-position)", css)
        self.assertIn("filter:url(#referenceInk) brightness(0)", css)
        self.assertIn("filter:url(#alphaInk) brightness(0)", css)
        # No replacement sprite or selected treatment should be introduced.
        self.assertNotIn("photo-negative or brightened portrait ink", css)

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
