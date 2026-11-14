"""Keyless Google Play preflight: static invariants, not a claim of policy approval.

Privacy claims and screenshots still require owner/device/provider verification.
"""
from pathlib import Path
import re
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "android-production/app"
NS = "{http://schemas.android.com/apk/res/android}"


class AndroidPlayReadiness(unittest.TestCase):
    def test_permissions_backup_exported_components(self):
        root = ET.fromstring((APP / "src/main/AndroidManifest.xml").read_text())
        permissions = [x.get(NS + "name") for x in root.findall("uses-permission")]
        self.assertEqual(permissions, ["android.permission.INTERNET"],
                         "Any new Android permission requires a new policy/Data safety audit")
        app = root.find("application")
        self.assertEqual(app.get(NS + "allowBackup"), "false")
        self.assertEqual(app.get(NS + "usesCleartextTraffic"), "false")
        self.assertEqual(app.get(NS + "label"), "Go, Hipster, Go!")
        components = app.findall("activity") + app.findall("receiver") + app.findall("service")
        exported = {x.get(NS + "name"): x.get(NS + "exported") for x in components}
        self.assertEqual(exported, {
            "work.samelling.hipstergo.lab.LabActivity": "true",
            "work.samelling.hipstergo.lab.ChaosRollActivity": "false",
            "work.samelling.hipstergo.lab.ChaosRollWidgetProvider": "true",
        })
        for x in components:
            self.assertIn(x.get(NS + "exported"), ("true", "false"))

    def test_keyless_release_configuration(self):
        gradle = (APP / "build.gradle").read_text()
        ci = (ROOT / ".github/workflows/android-production-rc.yml").read_text()
        self.assertIn("targetSdkVersion 36", gradle)
        self.assertIn("versionName '1.0.0-rc.1'", gradle)
        self.assertIn("applicationId 'work.samelling.hipstergo'", gradle)
        for forbidden in ("storePassword", "keyPassword", "keystoreFile", "signingConfigs {"):
            self.assertNotIn(forbidden, gradle,
                             "Production upload signer must wait for explicit M5 approval")
        release_block = gradle.split("release {", 1)[1].split("qa {", 1)[0]
        self.assertNotIn("signingConfig ", release_block,
                         "Play release must remain unsigned until M0/M5")
        self.assertIn("signingConfig signingConfigs.debug", gradle,
                      "Only the isolated QA package may use the temporary debug signer")
        self.assertIn("applicationIdSuffix '.qa'", gradle)
        self.assertIn("debuggable false", gradle)
        self.assertIn("app-release-unsigned.apk", ci)
        self.assertIn("bundleRelease", ci)
        self.assertIn("hipst" + "er-go-production-rc-unsigned", ci)
        for forbidden in ("apksigner sign", "play.google.com/upload", "google-github-actions/upload-cloud-storage"):
            self.assertNotIn(forbidden, ci)

    def test_qa_overlay_is_isolated_from_play_manifest(self):
        qa = ET.fromstring((APP / "src/qa/AndroidManifest.xml").read_text())
        self.assertEqual(qa.find("application").get(NS + "label"), "Go, Hipster, Go! RC")
        self.assertNotIn("Go, Hipster, Go! RC",
                         (APP / "src/main/AndroidManifest.xml").read_text())
        shortcuts = ET.fromstring((APP / "src/qa/res/xml/shortcuts.xml").read_text())
        intents = [x.find("intent") for x in shortcuts.findall("shortcut")]
        self.assertEqual(len(intents), 2)
        for intent in intents:
            self.assertEqual(intent.get(NS + "targetPackage"), "work.samelling.hipstergo.qa")
            self.assertEqual(intent.get(NS + "targetClass"),
                             "work.samelling.hipstergo.lab.LabActivity")
            self.assertTrue(intent.get(NS + "data").startswith("hipstergo://"))

    def test_android_privacy_policy_is_not_plugin_policy(self):
        plugin = (ROOT / "docs/privacy.md").read_text()
        draft = (ROOT / "docs/android-privacy-policy-draft.md").read_text()
        self.assertIn("plugin in ChatGPT", plugin)
        for expected in (
            "DRAFT, not published", "native Android app", "full link you supplied",
            "hipster-go.samelling.workers.dev/api/inspiration-preview",
            "GitHub release metadata", "automatically submit",
            "allowBackup=false", "Data safety", "gohipstergosupport@proton.me",
        ):
            self.assertIn(expected, draft)
        self.assertIn("public HTTPS", draft)
        self.assertIn("inside the Android app", draft)
        self.assertIn("Cloudflare Worker access logs/analytics", draft)

    def test_play_listing_does_not_overpromise_and_requirements_remain_open(self):
        doc = (ROOT / "docs/android-play-store-readiness.md").read_text()
        for expected in (
            "not** submitted", "developer", "does not stream songs",
            "or guarantee playlist publication",
            "policy", "12-slot", "nine themes",
            "widget", "1×1", "3×2", "Data safety",
            "Cloudflare", "internal testing", "first-party",
        ):
            self.assertIn(expected.lower(), doc.lower())
        self.assertRegex(doc, r"- \[ \] .*Privacy policy")
        self.assertRegex(doc, r"- \[ \] .*app entry")
        self.assertRegex(doc, r"- \[ \] .*approved")

    def test_network_disclosures_track_native_features(self):
        # Static inventory only; final Data safety truth also depends on deploy config and SDKs.
        link = (ROOT / "android-lab/app/src/main/java/work/samelling/hipstergo/lab/LinkPreview.java").read_text()
        updates = (ROOT / "android-lab/app/src/main/java/work/samelling/hipstergo/lab/SkillUpdates.java").read_text()
        disclosure = (ROOT / "docs/android-privacy-policy-draft.md").read_text()
        self.assertIn("/api/inspiration-preview?url=", link)
        self.assertIn("client.newCall", link)
        self.assertIn("api.github.com/repos/", updates)
        self.assertIn('prefs.getBoolean("skillAuto",true)', updates)
        self.assertIn("full link you supplied", disclosure)
        self.assertIn("automatic daily in-app checks", disclosure)
        self.assertIn("own** privacy terms", disclosure)


if __name__ == "__main__":
    unittest.main()
