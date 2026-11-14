"""Keyless Google Play preflight: static invariants, not a claim of policy approval.

Privacy claims and screenshots still require owner/device/provider verification.
"""
from pathlib import Path
import re
import json
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

    def test_store_listing_copy_is_versioned_and_meets_play_character_limits(self):
        manifest = json.loads((ROOT / "config/google-play-listing.en-US.json").read_text())
        self.assertEqual(manifest["schema_version"], 1)
        self.assertEqual(manifest["status"], "draft_owner_review_not_submitted")
        self.assertEqual(manifest["locale"], "en-US")
        store, limits = manifest["store"], manifest["limits"]
        self.assertEqual(limits, {
            "app_name": 30, "short_description": 80, "full_description": 4000
        })
        for field, limit in limits.items():
            value = store[field]
            self.assertIsInstance(value, str)
            self.assertGreater(len(value.strip()), 0)
            self.assertLessEqual(len(value), limit, field)
            self.assertNotIn("<", value, field)
            self.assertNotIn(">", value, field)
        self.assertEqual(store["app_name"], "Go, Hipster, Go!")
        self.assertEqual(store["privacy_policy_url"],
                         "https://hipster-go.samelling.workers.dev/privacy/")
        self.assertTrue((ROOT / "launcher/privacy/index.html").is_file())
        self.assertTrue((ROOT / "launcher/support/index.html").is_file())
        self.assertEqual(store["pricing"], "owner_decision_required")
        self.assertEqual(store["support_email"], "gohipstergosupport@proton.me")
        for claim in (
            "twelve-track", "tempo and mood curve", "nine visual themes",
            "Chaos Roll", "Your Crate", "does not itself stream music",
            "create and save playlists automatically",
            "external AI or music services",
        ):
            self.assertIn(claim.lower(), store["full_description"].lower())
        self.assertTrue(manifest["approval"])
        self.assertTrue(all(value is False for value in manifest["approval"].values()),
                        "Owner and Play approval must not be pre-certified in source")

    def test_play_requirements_and_unverified_data_flow_are_visible(self):
        doc = (ROOT / "docs/android-play-store-readiness.md").read_text()
        image = (ROOT / "docs/android-play-asset-shotlist.md").read_text()
        flow = (ROOT / "docs/android-play-data-safety-review.md").read_text()
        for expected in (
            "config/google-play-listing.en-US.json", "not Play-submission-ready",
            "does not stream songs or guarantee playlist publication",
            "12-slot", "nine themes", "widget",
            "Privacy", "Data safety", "Cloudflare", "first-party",
            "internal testing", "12 opted-in", "14 continuous days",
        ):
            self.assertIn(expected.lower(), doc.lower())
        self.assertRegex(doc, r"- \[ \] .*privacy")
        self.assertRegex(doc, r"- \[ \] .*approved")
        for expected in (
            "512 × 512", "1024 × 500", "1080 × 1920",
            "32-bit PNG", "24-bit PNG", "Minimum **2**",
            "source SHA",
        ):
            # The artwork plan must reflect exact Play image sizes, not placeholders.
            self.assertIn(expected.lower(), image.lower())
        for expected in (
            "Full user-submitted URL", "off-device", "GitHub API",
            "Logpush", "Data safety", "Cloudflare account",
            "not owner-approved", "retention",
        ):
            self.assertIn(expected.lower(), flow.lower())
        self.assertIn("DRAFT, not published",
                      (ROOT / "docs/android-privacy-policy-draft.md").read_text())
        self.assertIn("Unresolved before publication",
                      (ROOT / "docs/android-privacy-policy-draft.md").read_text())

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
