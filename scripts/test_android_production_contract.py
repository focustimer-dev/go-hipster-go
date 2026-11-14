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
        self.assertNotIn("ANDROID LAB", page)
        self.assertNotIn("Hipster GO Lab", page)
        self.assertNotIn("Lab Preferences", manual)
        self.assertNotIn("LAB → GEMINI", manual)
        self.assertNotIn("mark.textContent='LAB'", js)
        self.assertIn("mark.hidden=true", js)
        self.assertNotIn("Share a song link to Lab,", js)
        self.assertNotIn("Lab opens its website.", js)

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
