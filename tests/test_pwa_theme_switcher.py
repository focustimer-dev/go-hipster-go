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
