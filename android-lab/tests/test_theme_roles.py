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
        self.assertEqual(set(atlas_def),{"liberi","bosque","usiku","kingston","detroit","addis","polish","beirut","michoacan"})
        self.assertEqual(set(mood_def),set(atlas_def))
        atlas_required={
            "paper","land","ocean","ink","selected","route",
            "routeOpacity","routeWidth","routeDash","backdrop","field",
            "graticule","graticuleOpacity","oceanStroke","oceanStrokeOpacity",
        }
        mood_required={
            "neutralPaper","neutralInk","selectedPaper","selectedInk",
            "desireHeart",
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

    def test_michoacan_dark_surface_and_paper_pairs(self):
        raw=source("android-lab/web/theme-tokens.css")
        body=re.search(r":root\[data-pwa-theme=michoacan\]\{([^}]*)\}",raw,re.S).group(1)
        values=dict(re.findall(r"(--lab-[a-z-]+):\s*(#[0-9a-f]{6})\s*;",body))
        for bg,fg in (("surface","ink"),("panel","on-panel"),("rail","on-rail"),
                      ("action","on-action"),("field","on-field"),("ticket-stock","ticket-ink"),
                      ("go","go-ink"),("highlight","on-highlight")):
            self.assertGreaterEqual(contrast(values["--lab-ui-"+bg],values["--lab-ui-"+fg]),4.5,bg)
        self.assertGreaterEqual(contrast("#d1ad91","#49232b"),4.5)
        self.assertGreaterEqual(contrast("#e5b653","#24191b"),4.5)
        # Actual source art is luminance-transferred, not inverted or replaced.
        pwa=source("launcher/assets/pwa-workspace.js")
        for name in ("pwaMichoacanNeutral","pwaMichoacanSelected"):
            self.assertIn('id="'+name+'"',pwa)
        self.assertIn('feComponentTransfer',pwa)
        self.assertIn('--lab-mood-selected-edge:#49232b',raw)

    def test_michoacan_android_preferences_and_empty_crate_use_theme_ink(self):
        css=source("android-lab/web/workspace.css")
        tokens=source("android-lab/web/theme-tokens.css")
        self.assertIn("--lab-theme-selected-bg:var(--lab-ui-go);--lab-theme-selected-ink:var(--lab-ui-go-ink)",css)
        self.assertNotIn(":root[data-pwa-theme=michoacan] body.gig-poster.lab-workspace #labCrateEmpty",css)
        for role in ("--lab-ui-primary-bg:var(--lab-ui-go)",
                     "--lab-ui-primary-ink:var(--lab-ui-go-ink)",
                     "--lab-ui-primary-rule:var(--lab-ui-go)",
                     "--lab-theme-selected-bg:var(--lab-ui-go)",
                     "--lab-theme-selected-ink:var(--lab-ui-go-ink)"):
            self.assertIn(role,tokens)
        self.assertIn("background:var(--lab-ui-primary-bg);\n color:var(--lab-ui-primary-ink);",css)
        # Keep the existing tested Michoacán burgundy/gold pair; no new color.
        self.assertGreaterEqual(contrast("#24191b","#e5b653"),4.5)
        self.assertIn("--lab-ui-go:#24191b;--lab-ui-go-ink:#e5b653;",tokens)

    def test_shared_android_control_tokens_cover_all_themed_profiles(self):
        tokens=source("android-lab/web/theme-tokens.css")
        css=source("android-lab/web/workspace.css")
        print_css=source("android-lab/web/theme-print.css")
        # Eight distinct palettes share role names. The ninth, Libéri,
        # intentionally retains its historically locked fallback palette.
        self.assertIn(":root:is([data-pwa-theme=bosque],[data-pwa-theme=usiku],[data-ghg-theme-profile=print]){",tokens)
        required=(
            "--lab-ui-link-ink","--lab-ui-link-rule",
            "--lab-ui-primary-bg","--lab-ui-primary-ink","--lab-ui-primary-rule",
            "--lab-ui-secondary-ink","--lab-ui-secondary-rule",
            "--lab-ui-handoff-ready-bg","--lab-ui-handoff-ready-ink","--lab-ui-handoff-ready-rule",
            "--lab-ui-disabled-ink","--lab-ui-disabled-rule",
            "--lab-ui-status-ink","--lab-ui-muted-ink",
            "--lab-ui-receipt-title-ink","--lab-ui-receipt-meta-ink",
            "--lab-ui-receipt-accent-ink",
            "--lab-ui-trail-label-ink","--lab-ui-trail-mark-ink",
            "--lab-theme-selected-bg","--lab-theme-selected-ink",
        )
        for role in required:
            self.assertIn(role+":",tokens,role+" missing from shared palette bridge")
        for role in ("--lab-ui-link-ink","--lab-ui-primary-bg","--lab-ui-secondary-ink",
                     "--lab-ui-status-ink","--lab-ui-disabled-ink",
                     "--lab-ui-receipt-meta-ink","--lab-ui-trail-mark-ink"):
            self.assertIn("var("+role,css)
        for role in ("--lab-ui-primary-bg","--lab-ui-receipt-accent-ink",
                     "--lab-ui-receipt-title-ink","--lab-theme-selected-bg"):
            self.assertIn("var("+role,print_css)
        # Every original palette remains defined independently; these
        # component aliases may not smuggle hardcoded Libéri into print skins.
        for theme in ("bosque","usiku","kingston","detroit","addis","polish","beirut","michoacan"):
            self.assertIn(":root[data-pwa-theme="+theme+"]",tokens)
        inspiration=css.split("#labAddInspiration {",1)[1].split("/* Three compact projection keys",1)[0]
        # Strip CSS variable fallbacks: an intentional Libéri default is
        # fine, but no raw historical #103135 may survive outside var().
        without_fallback=re.sub(r"var\([^)]*\)","",inspiration)
        self.assertNotIn("#103135",without_fallback)
        self.assertNotIn("#dfb045",without_fallback)
        self.assertIn("var(--lab-ui-link-ink,#103135)",inspiration)
        self.assertIn("var(--lab-ui-focus,#103135)",inspiration)
        self.assertNotIn(":root[data-pwa-theme=michoacan] body.gig-poster.lab-workspace #labCrateEmpty",css)

    def test_079_semantic_hierarchy_role_contrast_all_eight_palettes(self):
        """Small accent type, secondary copy and functional borders remain AA."""
        raw=source("android-lab/web/theme-tokens.css")
        css=source("android-lab/web/workspace.css")
        theme_css=source("android-lab/web/theme-print.css")
        self.assertIn("--lab-ui-accent-text:color-mix(in srgb,var(--lab-print-active-ink,var(--lab-ui-focus)) 75%,var(--lab-ui-ink))",raw)
        self.assertIn("--lab-ui-muted-ink:color-mix(in srgb,var(--lab-ui-ink) 83%,var(--lab-ui-surface))",raw)
        self.assertIn("--lab-ui-disabled-ink:color-mix(in srgb,var(--lab-ui-ink) 78%,var(--lab-ui-surface))",raw)
        self.assertIn("--lab-ui-secondary-rule:var(--lab-ui-control-outline)",raw)
        self.assertIn("--lab-ui-receipt-accent-ink:var(--lab-ui-accent-text)",raw)
        self.assertIn("--lab-ui-trail-label-ink:var(--lab-ui-muted-ink)",raw)
        self.assertIn("--lab-ui-trail-mark-ink:var(--lab-ui-accent-text)",raw)
        def blend(a,b,share):
            return "#"+"".join(f"{round(int(a[i:i+2],16)*share+int(b[i:i+2],16)*(1-share)):02x}" for i in (1,3,5))
        palettes={}
        for name,body in re.findall(r":root\[data-pwa-theme=([a-z]+)\]\{([^}]*)\}",raw,re.S):
            values=dict(re.findall(r"(--lab-[a-z-]+):\s*(#[0-9a-f]{6})\s*;",body))
            if "--lab-ui-surface" in values:
                palettes[name]=values
        self.assertEqual(set(palettes),{"bosque","usiku","kingston","detroit","addis","polish","beirut","michoacan"})
        for theme,v in palettes.items():
            paper=v["--lab-ui-surface"]
            ink=v["--lab-ui-ink"]
            active=v.get("--lab-print-active-ink",v["--lab-ui-focus"])
            accent=blend(active,ink,.75)
            muted=blend(ink,paper,.83)
            disabled=blend(ink,paper,.78)
            for role,color in (("accent",accent),("muted",muted),("disabled",disabled)):
                self.assertGreaterEqual(contrast(paper,color),4.5,theme+" "+role)
            self.assertGreaterEqual(contrast(paper,v["--lab-ui-control-outline"]),3,
                                    theme+" functional outline")
        for needle in ("--lab-ui-receipt-accent-ink","--lab-ui-receipt-meta-ink",
                       "--lab-ui-disabled-ink","--lab-ui-link-ink","--lab-ui-trail-mark-ink"):
            self.assertIn("var("+needle,css)
        self.assertIn("color:var(--lab-ui-receipt-accent-ink)",theme_css)
        self.assertNotIn(":root[data-pwa-theme=michoacan] body.gig-poster.lab-workspace #labCrateEmpty",css)

    def test_kingston_android_theme_contrast_safe(self):
        js=source("android-lab/web/theme.js")
        roles=source("android-lab/web/theme-tokens.css")
        css=source("android-lab/web/theme-print.css")
        bundle=source("scripts/bundle_android_lab.py")
        self.assertIn("const PILOTS=['kingston','detroit','addis','polish','beirut','michoacan']",js)
        self.assertIn("THEMES=['liberi','bosque','usiku','kingston','detroit','addis','polish','beirut','michoacan']",js)
        self.assertNotIn("PILOTS.includes(next)&&persist",js)
        self.assertIn("PILOTS.includes(preview)?preview:saved()",js)
        self.assertIn("data-lab-print-style",bundle)
        self.assertIn("android-lab/web/theme-print.css",bundle)
        self.assertIn('data-lab-theme="kingston"',source("android-lab/web/workspace.html"))
        self.assertIn(":root[data-pwa-theme=kingston]",roles)
        self.assertIn(":root[data-ghg-theme-profile=print]",css)
        for role in ("--lab-ui-surface:#e3d9c2", "--lab-ui-action:#304743",
                     "--lab-ui-go:#385e5a", "--lab-ui-highlight:#7bb0aa",
                     "--lab-ui-on-highlight:#263f3e"):
            self.assertIn(role,roles)
        for role in ("--lab-atlas-ocean","--lab-atlas-land","--lab-atlas-field",
                     "--lab-mood-selected-paper","--lab-mood-neutral-ink"):
            self.assertIn("var("+role,css)
        for paper,ink in (("#e3d9c2","#263f3e"),("#d2c3a6","#244643"),
                          ("#efe4cb","#385e5a"),("#efe4cb","#304743"),
                          ("#eee4cf","#263f3e")):
            self.assertGreaterEqual(contrast(paper,ink),4.5)
        # Two ink jobs must be separately authored for EVERY print palette.
        # Active brick is allowed for small marks but also meets AA if used
        # as printed type on our current cream substrate.
        self.assertIn("--lab-print-stamp:#59817c",roles)
        self.assertIn("--lab-print-active-ink:#9b3a2b",roles)
        self.assertGreaterEqual(contrast("#9b3a2b","#e3d9c2"),4.5)
        for token in ("--lab-print-stamp","--lab-print-active-ink"):
            self.assertIn("var("+token,css)
        for intent in ("mood:not([data-mood=funky])[aria-pressed=true]",
                       ".lab-atlas-modes button[aria-pressed=true]",
                       ".shuffle-pins .shuffle-pin[aria-pressed=true]",
                       ".go-options .go-extras .cover-toggle[aria-pressed=true]"):
            self.assertIn(intent,css)
        self.assertNotIn("data-pwa-theme=kingston",css)
        # Print themes must never flatten the Funk selected portrait or
        # repaint its original lasers. Other cast preserves sprite shading.
        self.assertIn("mood:not([data-mood=funky])[aria-pressed=true]",css)
        self.assertIn("--funk-selected-paper:#311333",source("android-lab/web/workspace.css"))
        self.assertIn("background-color:#6e225c",source("android-lab/web/workspace.css"))
        self.assertIn("background-image:url('/assets/funk-selected-engraved.webp')!important",source("android-lab/web/workspace.css"))
        self.assertIn("hue-rotate(23deg) saturate(1.24)",source("android-lab/web/workspace.css"))
        self.assertNotIn("hue-rotate(170deg)",css)
        self.assertNotIn("moods-selected-ink-v2.webp",css)
        self.assertNotIn("mask-image:url('/editions/gig-poster/assets/moods-neutral-ink-v2.webp')",css)

    def test_every_print_theme_has_an_independent_accessible_ink_pair(self):
        """Future print themes may choose colors, not skip semantic roles."""
        raw=source("android-lab/web/theme-tokens.css")
        profiles=re.findall(r":root\[data-pwa-theme=([a-z-]+)\]\{([^}]*)\}",raw,re.S)
        print_profiles=[]
        for name,body in profiles:
            if "--lab-print-stamp:" not in body and "--lab-print-active-ink:" not in body:
                continue
            print_profiles.append(name)
            values=dict(re.findall(r"(--lab-[a-z-]+):\s*(#[0-9a-f]{6})\s*;",body))
            mandatory={
                "--lab-print-stamp","--lab-print-active-ink",
                "--lab-ui-surface","--lab-ui-ink","--lab-ui-rule",
                "--lab-ui-go","--lab-ui-on-action",
                "--lab-ui-highlight","--lab-ui-on-highlight",
            }
            self.assertTrue(mandatory.issubset(values),name+" missing print ink roles")
            for bg,fg in (
                ("--lab-ui-surface","--lab-ui-ink"),
                ("--lab-ui-go","--lab-ui-on-action"),
                ("--lab-ui-highlight","--lab-ui-on-highlight"),
            ):
                self.assertGreaterEqual(contrast(values[bg],values[fg]),4.5,
                    name+" foreground on "+bg)
            for ink in ("--lab-print-active-ink","--lab-print-stamp"):
                self.assertGreaterEqual(contrast(values["--lab-ui-surface"],values[ink]),3,
                    name+" graphical ink contrast: "+ink)
        self.assertIn("kingston",print_profiles)
        css=source("android-lab/web/theme-print.css")
        manual=source("android-lab/web/manual-guide-theme.css")
        self.assertNotRegex(css,r"data-pwa-theme=(kingston|detroit|addis|polish|beirut|michoacan)")
        for role in ("--lab-print-active-ink","--lab-print-stamp"):
            self.assertIn("var("+role,css)
        self.assertIn("var(--lab-print-active-ink)",manual)

    def test_second_print_theme_is_token_only(self):
        js=source("android-lab/web/theme.js")
        tokens=source("android-lab/web/theme-tokens.css")
        css=source("android-lab/web/theme-print.css")
        manual=source("android-lab/web/manual-guide.html")
        self.assertIn("const PILOTS=['kingston','detroit','addis','polish','beirut','michoacan']",js)
        self.assertIn(":root[data-pwa-theme=detroit]",tokens)
        self.assertIn("kingston|detroit|addis|polish|beirut|michoacan",manual)
        self.assertIn('data-lab-theme="detroit"',source("android-lab/web/workspace.html"))
        self.assertNotIn("data-pwa-theme=detroit",css)
        self.assertIn("var(--lab-print-substrate-texture,none)",css)
        self.assertIn("var(--lab-print-stamp-border-style,double)",css)
        for stock,ink in (("#e7e5db","#171717"),("#d0d0bd","#171717"),
                          ("#f1f0e7","#171717"),("#d5e644","#171717"),
                          ("#f0efe8","#171717")):
            self.assertGreaterEqual(contrast(stock,ink),4.5)
        # Highlighter ink is a graphical selection mark on paper;
        # both neon inks also remain legible as strong marks on toner.
        self.assertGreaterEqual(contrast("#f0efe8","#f50093"),3)
        self.assertGreaterEqual(contrast("#171717","#f50093"),4.5)
        self.assertGreaterEqual(contrast("#171717","#d5e644"),4.5)
        self.assertIn("--lab-print-active-ink:#f50093",tokens)
        self.assertIn("--lab-print-control-ink:#f50093",tokens)
        self.assertIn("--lab-print-stamp:#555555",tokens)
        self.assertIn("var(--lab-print-control-ink,var(--lab-ui-ink))",css)

    def test_print_mood_engraving_is_mood_palette_driven(self):
        js=source("android-lab/web/theme.js")
        css=source("android-lab/web/theme-print.css")
        tokens=source("android-lab/web/theme-tokens.css")
        self.assertIn("themeMoodNeutralEngraving",js)
        self.assertIn("themeMoodSelectedEngraving",js)
        self.assertIn("'neutralInk','neutralPaper'",js)
        self.assertIn("'selectedInk','selectedPaper'",js)
        self.assertIn("String(paper[i]-ink[i])",js)
        self.assertIn("filter:url(#themeMoodNeutralEngraving)!important",css)
        self.assertIn("filter:url(#themeMoodSelectedEngraving)!important",css)
        self.assertIn("var(--lab-mood-selected-edge,var(--lab-print-active-ink))",css)
        self.assertIn("--lab-mood-selected-edge:#171717",tokens)
        self.assertIn("selectedPaper:'#f50093',selectedInk:'#171717'",js)
        self.assertIn(":not([data-mood=funky])",css)
        self.assertGreaterEqual(contrast("#f50093","#171717"),4.5)

    def test_print_profile_reuses_canonical_jukebox_and_funk(self):
        css=source("android-lab/web/theme-print.css")
        workspace=source("android-lab/web/workspace.css")
        selector=":root:is([data-pwa-theme=bosque],[data-pwa-theme=usiku],[data-ghg-theme-profile=print])"
        self.assertGreaterEqual(workspace.count(selector),35)
        self.assertIn("font:400 1.3rem/1.15 Poster,sans-serif",workspace)
        self.assertIn("font:400 1rem/1.45 Arial,Helvetica,sans-serif",workspace)
        self.assertIn("background-color:#6e225c",source("android-lab/web/workspace.css"))
        self.assertIn("linear-gradient(145deg,#311333,#722269 66%,#a52d78)",workspace)
        self.assertIn("box-shadow:inset 0 0 0 2px #f2c84e",workspace)
        self.assertIn("background-image:url('/assets/funk-selected-engraved.webp')!important",source("android-lab/web/workspace.css"))
        self.assertIn("hue-rotate(23deg) saturate(1.24)",source("android-lab/web/workspace.css"))
        self.assertIn("opacity:.82",workspace)
        self.assertNotIn("--funk-selected-paper:color-mix(in srgb,#e03fd8 22%,#f4efdf)",css)

    def test_funk_neutral_follows_theme_selected_is_invariant(self):
        js=source("android-lab/web/theme.js")
        print_css=source("android-lab/web/theme-print.css")
        app=source("android-lab/web/workspace.css")
        self.assertNotIn("funkPaper",js)
        self.assertNotIn("funkInk",js)
        self.assertIn(".mood[aria-pressed=false]",print_css)
        self.assertIn("themeMoodNeutralEngraving",print_css)
        self.assertIn("mood[data-mood=funky][aria-pressed=true]",app)
        self.assertIn("background-color:#6e225c!important",app)
        self.assertIn("opacity:.82!important",app)
        self.assertIn("background-image:url('/assets/funk-selected-engraved.webp')!important",app)
        self.assertNotIn("filter:brightness(0)",app[app.index("/* Neutral Funk follows each theme"):])
        self.assertNotIn("funkHighlighterEngraving",js)
        self.assertIn("background-size:100% 100%!important",app)
        self.assertIn("filter:none!important",app)
        baked=source("scripts/bake_funk_selected.py")
        self.assertIn("CELL_BOX = (1024, 512, 1536, 1024)",baked)
        self.assertIn("baked.putalpha(alpha)",baked)
        self.assertNotRegex(print_css,r"data-pwa-theme=(addis|polish|beirut|michoacan)")

    def test_print_palettes_are_selectable_and_complete(self):
        js=source("android-lab/web/theme.js")
        roles=source("android-lab/web/theme-tokens.css")
        html=source("android-lab/web/workspace.html")
        guide=source("android-lab/web/manual-guide.html")
        for name in ("kingston","detroit","addis","polish","beirut","michoacan"):
            self.assertIn('data-lab-theme="'+name+'"',html)
            self.assertIn("data-pwa-theme="+name,roles)
        self.assertIn("kingston|detroit|addis|polish|beirut|michoacan",guide)
        self.assertIn("const PILOTS=['kingston','detroit','addis','polish','beirut','michoacan']",js)

    def test_print_tempo_thumb_consumes_only_active_ink(self):
        css=source("android-lab/web/theme-print.css")
        for pseudo in ("::-webkit-slider-thumb","::-moz-range-thumb"):
            self.assertIn(".tempo-control:not([data-tempo=any]) #tempoSlider"+pseudo,css)
        self.assertIn("background:var(--lab-print-active-ink)",css)
        self.assertIn("border:2px solid var(--lab-ui-surface)",css)
        self.assertIn("box-shadow:0 0 0 1px var(--lab-ui-ink)",css)
        self.assertNotIn("data-pwa-theme=addis",css)
        self.assertNotIn("data-pwa-theme=polish",css)
        self.assertNotIn("data-pwa-theme=beirut",css)
        source_css=source("launcher/editions/gig-poster/edition.css")
        self.assertIn(".tempo-control[data-tempo=any] #tempoSlider::-webkit-slider-thumb{opacity:0}",source_css)
        self.assertIn(".tempo-control[data-tempo=any] #tempoSlider::-moz-range-thumb{opacity:0}",source_css)

    def test_native_request_dialogs_consume_semantic_theme_tokens(self):
        js=source("android-lab/web/theme.js")
        activity=source("android-lab/app/src/main/java/work/samelling/hipstergo/lab/LabActivity.java")
        native=source("android-lab/app/src/main/java/work/samelling/hipstergo/lab/NativeDialogPalette.java")
        for role in ("--lab-ui-panel","--lab-ui-on-panel","--lab-ui-field",
                     "--lab-ui-on-field","--lab-ui-rule","--lab-print-active-ink"):
            self.assertIn(role,js)
        self.assertIn("syncNativeDialogPalette();",js)
        self.assertIn("setDialogPalette(theme,surface,ink,accent,field,fieldInk,rule)",js)
        self.assertIn("@JavascriptInterface public void setDialogPalette(",activity)
        self.assertIn("if(!THEMES.contains(theme))return;",native)
        self.assertIn("contrast(s,i)<4.5",native)
        self.assertIn("contrast(f,fi)<4.5",native)
        self.assertIn("window.setBackgroundDrawable(paper)",native)
        self.assertIn("input.setTextColor(fieldInk)",native)
        for name in ("SavedRequests.java","SharedInspiration.java","SkillUpdates.java"):
            java=source("android-lab/app/src/main/java/work/samelling/hipstergo/lab/"+name)
            self.assertIn("NativeDialogPalette dialogs",java)
            self.assertIn("dialogs.show(",java)
        self.assertIn('dialogs.show(new AlertDialog.Builder(activity).setTitle("Save this request")',
                      source("android-lab/app/src/main/java/work/samelling/hipstergo/lab/SavedRequests.java"))

    def test_hero_and_compass_use_the_shared_atlas_palette(self):
        hero=source("launcher/editions/gig-poster/index.html")
        builder=source("scripts/build_gig_poster.py")
        poster=source("launcher/editions/gig-poster/edition.css")
        pwa=source("launcher/assets/pwa-themes.css")
        android=source("android-lab/web/workspace.css")
        print_css=source("android-lab/web/theme-print.css")
        self.assertIn('<span class="poster-line">PROBLEM</span>',hero)
        self.assertNotIn('<span class="poster-line">PROBLEM.</span>',hero)
        self.assertIn('<span class="poster-line">PROBLEM</span>',builder)
        self.assertIn('<span class="poster-bird" aria-hidden="true"></span>',hero)
        self.assertIn('bird-globe.webp',poster)
        self.assertIn('-webkit-mask:url(',poster)
        self.assertIn('background-color:var(--poster-bird-ink,var(--ink))',poster)
        self.assertIn('--poster-bird-ink:var(--lab-print-stamp)',print_css)
        self.assertIn('--chart-selected-ink:var(--lab-atlas-selected)',android)
        self.assertIn('fill:var(--lab-atlas-selected)',android)
        for part in ('north','hub','crown'):
            self.assertIn('chart-rose-'+part+'{fill:var(--chart-selected-ink',poster)
            self.assertIn('.chart-rose-'+part,pwa)

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
