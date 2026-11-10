"""PWA browser-only theme switcher contract tests."""
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class PWAThemeTests(unittest.TestCase):
    def test_eight_named_preferences_and_stable_local_storage_key(self):
        js = (ROOT / "launcher/assets/pwa-workspace.js").read_text()
        self.assertIn("const THEMES=['liberi','bosque','usiku','kingston','detroit','addis','polish','beirut']", js)
        self.assertIn("const THEME_STORE='ghg-pwa-theme-v1'", js)
        for theme in ("liberi", "bosque", "usiku", "kingston", "detroit", "addis", "polish", "beirut"):
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

    def test_usiku_simple_ink_no_cream_assets(self):
        css = (ROOT / "launcher/assets/pwa-themes.css").read_text()
        self.assertIn("--usiku-neutral-ink:var(--lab-mood-neutral-ink,#063821)", css)
        self.assertIn("mask-image:url('/editions/gig-poster/assets/moods-neutral-ink-v2.webp')", css)
        self.assertIn("--usiku-neutral-center:#b77b4d", css)
        self.assertIn("--usiku-neutral-edge:#7e4c30", css)
        self.assertNotIn("usiku-neutral-two-ink-v1.webp", css)
        self.assertNotIn("rgba(240,200,161,.76)", css)

    def test_print_themes_match_approved_android_ui_tokens(self):
        canonical = (ROOT / "android-lab/web/theme-tokens.css").read_text()
        browser = (ROOT / "launcher/assets/pwa-themes.css").read_text()
        for theme in ("kingston", "detroit", "addis", "polish", "beirut"):
            start = canonical.index(":root[data-pwa-theme=" + theme + "]{")
            end = canonical.index("\n}", start) + 2
            self.assertIn(canonical[start:end], browser)
            self.assertIn(f":root[data-pwa-theme={theme}]", browser)
        self.assertIn("--lab-atlas-ocean", browser)
        self.assertIn("--lab-mood-selected-paper", browser)
        self.assertIn("@media(max-width:520px)", browser)

    def test_print_themes_work_in_three_projection_browser_atlas(self):
        bridge = (ROOT / "launcher/assets/pwa-atlas-bridge.js").read_text()
        for theme in ("kingston", "detroit", "addis", "polish", "beirut"):
            self.assertIn(theme + ":{ocean:", bridge)
            self.assertIn(theme + ":{paper:", bridge)
        self.assertIn("data-lab-print-style", bridge)
        self.assertIn("ghgThemeProfile", bridge)
        self.assertIn("applyBrowserTheme(theme)", bridge)

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
