"""Fast no-device guardrails for the unsigned production RC build."""
from pathlib import Path
import json
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "android-production/app"
LAB = ROOT / "android-lab/app"
ANDROID = "{http://schemas.android.com/apk/res/android}"


class AndroidProductionContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from bundle_android_production import prepare
        prepare()

    def test_production_app_id_and_version_are_distinct_from_lab(self):
        prod = (APP / "build.gradle").read_text()
        lab = (LAB / "build.gradle").read_text()
        self.assertIn("applicationId 'work.samelling.hipstergo'", prod)
        self.assertIn("applicationId 'work.samelling.hipstergo.lab'", lab)
        self.assertIn("versionName '1.0.0-rc.1'", prod)

    def test_manifest_native_app_label_and_explicit_exported_components(self):
        root = ET.fromstring((APP / "src/main/AndroidManifest.xml").read_text())
        app = root.find("application")
        self.assertEqual(app.get(ANDROID + "label"), "Go, Hipster, Go!")
        activities = app.findall("activity")
        self.assertIn("work.samelling.hipstergo.lab.LabActivity",
                      [x.get(ANDROID + "name") for x in activities])
        for component in activities + app.findall("receiver"):
            self.assertIn(component.get(ANDROID + "exported"), ("true", "false"))
        self.assertEqual(app.get(ANDROID + "allowBackup"), "false")

    def test_shortcuts_target_production_package_and_scheme(self):
        xml = ET.fromstring((APP / "build/production-res/xml/shortcuts.xml").read_text())
        intents = [x.find("intent") for x in xml.findall("shortcut")]
        self.assertEqual(len(intents), 2)
        for intent in intents:
            self.assertEqual(intent.get(ANDROID + "targetPackage"),
                             "work.samelling.hipstergo")
            self.assertEqual(intent.get(ANDROID + "targetClass"),
                             "work.samelling.hipstergo.lab.LabActivity")
            self.assertTrue(intent.get(ANDROID + "data").startswith("hipstergo://"))

    def test_production_copy_and_version_are_clean(self):
        page = (APP / "src/main/assets/site/index.html").read_text()
        manual = (APP / "src/main/assets/site/manual-guide.html").read_text()
        js = (APP / "src/main/assets/site/assets/app.js").read_text()
        self.assertIn("GO, HIPSTER, GO! ·", page)
        self.assertIn("1.0.0-rc.1", page)
        self.assertIn("Verify version 3.11.7", manual)
        self.assertIn("Verify version 3.11.7", js)
        self.assertNotIn("Verify version 3.11.5", js)
        self.assertNotIn("Verify version 3.11.1", manual)
        for surface in (page, manual, js):
            self.assertNotIn("releases/latest/download/go-hipster-go-", surface)
        release = "releases/download/gemini-skill-v3.11.7/"
        self.assertIn(release + "go-hipster-go-gemini-app-skill.zip", manual)
        self.assertIn(release + "go-hipster-go-gemini-app-skill.zip", js)
        self.assertIn("gemini-skill-v3.11.7/adapters/gemini/SKILL.md", manual)
        self.assertIn("gemini-skill-v3.11.7/adapters/gemini/SKILL.md", js)
        self.assertNotIn("ANDROID LAB", page)
        self.assertNotIn("Hipster GO Lab", page)
        self.assertNotIn("Lab Preferences", manual)
        self.assertNotIn("LAB → GEMINI", manual)
        self.assertNotIn("mark.textContent='LAB'", js)
        self.assertIn("mark.hidden=true", js)
        self.assertNotIn("Share a song link to Lab,", js)
        self.assertNotIn("Lab opens its website.", js)

    def test_rc_embeds_shared_theme_surprise_and_routing_contract(self):
        """The installable RC must include the same approved mechanics as Lab."""
        site = APP / "src/main/assets/site"
        page = (site / "index.html").read_text()
        theme = (site / "assets/lab-themes.js").read_text()
        css = (site / "assets/lab-workspace.css").read_text()
        colors = (site / "assets/lab-theme-tokens.css").read_text()
        app_js = (site / "assets/app.js").read_text()
        native = (LAB / "src/main/java/work/samelling/hipstergo/lab/LabActivity.java").read_text()

        # ElectricStars is present, but legitimately locked until the native draw.
        self.assertIn('data-lab-theme="electricstars"', page)
        self.assertIn("function electricStarsUnlocked()", theme)
        self.assertIn("if(next==='electricstars'&&!electricStarsUnlocked())return false;", theme)
        self.assertIn('surpriseUnlocked()', native)
        self.assertIn('rollSurprise()', native)
        self.assertIn("function labPrepareSurprise()", app_js)
        self.assertIn("window.HipsterLab.rollSurprise()", app_js)
        self.assertIn("--lab-mood-neutral-paper:#be74cd;", colors)
        self.assertIn("--lab-mood-neutral-ink:#372b68;", colors)

        # The RC and Lab use the same route ownership and curve-mood policy.
        self.assertIn('function curveOwnsMoods()', app_js)
        self.assertIn('if(curveOwnsMoods())mood="go";', app_js)
        prompt_export = app_js.split("function goPrompt(", 1)[1].split("const crateRegions", 1)[0]
        self.assertNotIn("Discovery route:", prompt_export)

        # Saving a local appearance preference is not a permanent privacy banner.
        self.assertIn('id="labThemeStatus" class="lab-theme-status" role="status" aria-live="polite"></p>', page)
        self.assertNotIn("Saved separately on this device.", page)
        self.assertIn(".lab-theme-status:empty{display:none}", css)
        self.assertIn("status.textContent='Appearance saved.';", theme)
        self.assertIn("Device storage unavailable.", theme)
        self.assertIn("PRIVACY POLICY", page)
        self.assertIn("java.srcDirs = ['../../android-lab/app/src/main/java']",
                      (APP / "build.gradle").read_text())

    def test_production_widget_picker_label_is_not_lab(self):
        prod = (APP / "build/production-res/values/strings.xml").read_text()
        lab = (LAB / "src/main/res/values/strings.xml").read_text()
        qa = (APP / "src/qa/res/values/strings.xml").read_text()
        self.assertIn('name="chaos_roll_widget_name">Chaos Roll</string>', prod)
        self.assertNotIn("Chaos Roll (Lab)", prod)
        self.assertIn('name="chaos_roll_widget_name">Chaos Roll (Lab)', lab)
        self.assertIn('name="chaos_roll_widget_name">Chaos Roll RC', qa)
        for path in (
            APP / "src/main/AndroidManifest.xml",
            LAB / "src/main/AndroidManifest.xml",
        ):
            root = ET.fromstring(path.read_text())
            receiver = root.find("application").find("receiver")
            self.assertEqual(receiver.get(ANDROID + "label"),
                             "@string/chaos_roll_widget_name")

    def test_native_code_checks_package_aware_shortcuts_and_widget_intent(self):
        java = (LAB / "src/main/java/work/samelling/hipstergo/lab")
        activity = (java / "LabActivity.java").read_text()
        provider = (java / "ChaosRollWidgetProvider.java").read_text()
        self.assertIn("getPackageName().endsWith", activity)
        self.assertIn('"hipstergo"', activity)
        self.assertIn('context.getPackageName() + ".CHAOS_ROLL"', provider)
        self.assertNotIn('"work.samelling.hipstergo.lab.CHAOS_ROLL"', provider)

    def test_same_chaos_roll_contract_and_artwork(self):
        assets = APP / "src/main/assets"
        config = json.loads((assets / "chaos-roll-config.json").read_text())
        self.assertEqual(len(config["moods"]), 8)
        self.assertEqual(len(config["routes"]), 24)
        self.assertNotIn("antarctica", [x["id"] for x in config["regions"]])
        for name in ("record", "cassette"):
            self.assertTrue((APP / "build/production-res/drawable-nodpi"
                             / ("widget_chaos_" + name + ".webp")).is_file())


if __name__ == "__main__":
    unittest.main()
