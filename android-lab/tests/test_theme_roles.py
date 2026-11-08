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
