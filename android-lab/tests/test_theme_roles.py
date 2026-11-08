"""Keep the Android and embedded Manual on one contrast-safe theme contract."""

from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[2]


def source(path):
    return (ROOT / path).read_text(encoding="utf-8")


def rgb(h):
    return [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]


def luminance(h):
    values = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in rgb(h)]
    return sum(v * w for v, w in zip(values, (.2126, .7152, .0722)))


def contrast(a, b):
    light, dark = sorted((luminance(a), luminance(b)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


class AndroidThemeRoles(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        raw = source("android-lab/web/theme-tokens.css")
        matches = re.findall(r":root\[data-pwa-theme=(bosque|usiku)\]\{([^}]*)\}", raw, re.S)
        cls.tokens = {
            theme: dict(re.findall(r"(--lab-ui-[a-z-]+):\s*(#[0-9a-f]{6})\s*;", body))
            for theme, body in matches
        }

    def test_both_themes_define_the_same_roles(self):
        self.assertEqual(set(self.tokens), {"bosque", "usiku"})
        roles = set(self.tokens["bosque"])
        self.assertEqual(roles, set(self.tokens["usiku"]))
        for role in (
            "--lab-ui-surface", "--lab-ui-ink", "--lab-ui-panel", "--lab-ui-on-panel",
            "--lab-ui-rail", "--lab-ui-on-rail", "--lab-ui-field", "--lab-ui-on-field",
            "--lab-ui-ticket-stock", "--lab-ui-ticket-ink", "--lab-ui-rule",
            "--lab-ui-action", "--lab-ui-on-action", "--lab-ui-go",
            "--lab-ui-highlight", "--lab-ui-on-highlight", "--lab-ui-focus",
            "--lab-ui-control-outline",
        ):
            self.assertIn(role, roles)
        self.assertNotIn("data-pwa-theme=liberi", source("android-lab/web/theme-tokens.css"))

    def test_text_pairings_meet_4_point_5_to_1(self):
        for theme, data in self.tokens.items():
            for bg, fg in (
                ("surface", "ink"),
                ("panel", "on-panel"),
                ("rail", "on-rail"),
                ("field", "on-field"),
                ("ticket-stock", "ticket-ink"),
                ("action", "on-action"),
                ("go", "on-action"),
                ("highlight", "on-highlight"),
            ):
                a, b = data["--lab-ui-" + bg], data["--lab-ui-" + fg]
                self.assertGreaterEqual(contrast(a, b), 4.5, f"{theme}: {fg} on {bg}")

    def test_bosque_go_matches_existing_action_green(self):
        bosque = self.tokens["bosque"]
        self.assertEqual(bosque["--lab-ui-go"], bosque["--lab-ui-action"])
        self.assertEqual(bosque["--lab-ui-go"], "#004225")
        app = source("android-lab/web/workspace.css")
        self.assertIn("background-image:none!important", app)
        self.assertIn(":root[data-pwa-theme=bosque] body.gig-poster.lab-workspace .lab-page", app)

    def test_usiku_go_uses_existing_saddle_material_not_new_green(self):
        usiku = self.tokens["usiku"]
        self.assertEqual(usiku["--lab-ui-go"], "#7e4c30")
        app = source("android-lab/web/workspace.css")
        self.assertIn("background-color:var(--lab-ui-go)", app)
        self.assertIn("var(--usiku-neutral-mid,#925b39)", app)
        self.assertIn("var(--usiku-neutral-edge,#7e4c30)", app)
        self.assertIn("#38261c 100%", app)
        self.assertIn("receipt is no longer", source("scripts/test_android_lab_themes.cjs"))
        self.assertGreaterEqual(contrast("#925b39", "#e5cf42"), 3)
        self.assertGreaterEqual(contrast("#925b39", "#f5f0e6"), 4.5)

    def test_usiku_manual_setup_print_and_tempo_vignette(self):
        manual = source("android-lab/web/manual-guide-theme.css")
        self.assertIn(":is(#setupSend,#setupSendChat) .receipt", manual)
        self.assertIn("color:var(--lab-ui-ticket-ink)!important", manual)
        self.assertIn("font:400 clamp(1.5rem,5.2vw,2rem)/1.14 Poster,sans-serif", manual)
        self.assertGreaterEqual(
            contrast(self.tokens["usiku"]["--lab-ui-ticket-stock"],
                     self.tokens["usiku"]["--lab-ui-ticket-ink"]), 4.5)
        app = source("android-lab/web/workspace.css")
        self.assertIn("#tempoSlider::-webkit-slider-thumb", app)
        self.assertIn("#tempoSlider::-moz-range-thumb", app)
        self.assertIn("radial-gradient(circle at 42% 38%,#b77b4d 0%,#925b39 48%,#7e4c30 100%)", app)

    def test_new_theme_requires_complete_atlas_and_portrait_palettes(self):
        """Every named skin supplies every paint role, not just UI hexes."""
        js=source("android-lab/web/theme.js")
        atlas=js.split("const ATLAS=Object.freeze({",1)[1].split("const MOODS=Object.freeze({",1)[0]
        moods=js.split("const MOODS=Object.freeze({",1)[1].split("const CSS_ATLAS_ROLES=",1)[0]
        pattern=r"\b([a-z]+):Object\.freeze\(\{(.*?)\n \}\)"
        atlas_def=dict(re.findall(pattern,atlas,re.S))
        mood_def=dict(re.findall(pattern,moods,re.S))
        self.assertEqual(set(atlas_def),{"liberi","bosque","usiku","kingston"})
        self.assertEqual(set(mood_def),set(atlas_def))
        # The pilot is intentionally not in Preferences or persisted selections.
        self.assertIn("THEMES=['liberi','bosque','usiku']",js)
        self.assertNotIn("'kingston']",js.split("const KEY=",1)[1].split(";",1)[0])
        ui=source("android-lab/web/theme-tokens.css")
        self.assertIn(":root[data-pwa-theme=kingston]",ui)
        for role in ("surface","ink","panel","rail","on-panel","on-rail",
                     "action","on-action","rule","field","on-field","focus",
                     "control-outline","ticket-stock","ticket-ink","go",
                     "highlight","on-highlight"):
            self.assertIn("--lab-ui-"+role+":",ui.split(":root[data-pwa-theme=kingston]",1)[1])

        atlas_required={
            "paper","land","ocean","ink","selected","route",
            "routeOpacity","routeWidth","routeDash","backdrop","field",
            "graticule","graticuleOpacity","oceanStroke","oceanStrokeOpacity",
        }
        mood_required={
            "neutralPaper","neutralInk","selectedPaper","selectedInk",
            "desireHeart","funkPaper","funkInk",
        }
        for theme in atlas_def:
            atlas_roles=set(re.findall(r"\b([a-zA-Z]+):",atlas_def[theme]))
            mood_roles=set(re.findall(r"\b([a-zA-Z]+):",mood_def[theme]))
            self.assertEqual(atlas_roles,atlas_required,theme+" Atlas roles")
            self.assertEqual(mood_roles,mood_required,theme+" portrait roles")
            for value in ("paper","ocean","land","ink","selected","route"):
                self.assertRegex(atlas_def[theme],r"\b"+value+r":'#[0-9a-f]{6}'")
            for value in ("neutralInk","selectedPaper","selectedInk"):
                self.assertRegex(mood_def[theme],r"\b"+value+r":'#[0-9a-f]{6}'")
        # Selection ink remains legible on the shared yellow pressing.
        self.assertGreaterEqual(contrast("#e5cf42","#003018"),4.5)
        self.assertIn("function applyThemeTokens()",js)
        self.assertIn("applyThemeTokens();requestPaint()",js)

    def test_app_and_iframe_load_the_same_source(self):
        bundle = source("scripts/bundle_android_lab.py")
        manual = source("android-lab/web/manual-guide.html")
        self.assertIn("android-lab/web/theme-tokens.css", bundle)
        self.assertIn("lab-theme-tokens.css", manual)
        self.assertIn("data-lab-palette-style media=\"not all\"", bundle)
        roles = source("android-lab/web/manual-guide-theme.css")
        for role in ("--lab-ui-panel", "--lab-ui-on-panel", "--lab-ui-action",
                     "--lab-ui-on-action", "--lab-ui-focus"):
            self.assertIn("var(" + role + ")", roles)

    def test_workspace_surfaces_consume_roles(self):
        app = source("android-lab/web/workspace.css")
        atlas = source("launcher/assets/pwa-atlas-themes.css")
        for role in ("--lab-ui-surface", "--lab-ui-on-panel", "--lab-ui-rule",
                     "--lab-ui-action", "--lab-ui-ticket-stock",
                     "--lab-ui-highlight", "--lab-ui-go", "--lab-ui-focus"):
            self.assertIn("var(" + role + ")", app + atlas)
        for css in (app, atlas):
            self.assertNotRegex(css, r"--lab-ui-[a-z-]+:\s*#[0-9a-f]{6}")
        self.assertIn("body.gig-poster.lab-workspace", atlas)
        self.assertNotIn("body.pwa-workspace", source("android-lab/web/theme-tokens.css"))


if __name__ == "__main__":
    unittest.main()
