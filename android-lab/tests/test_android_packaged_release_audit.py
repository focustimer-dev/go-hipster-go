"""Synthetic ZIP and aapt fixtures for the compiled Android release audit."""
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "audit_android_release_package",
    ROOT / "scripts/audit_android_release_package.py")
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class PackagedReleaseAuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def write_archive(self, name, *, bundle=False, links=True, lib=False, manifest=True):
        path = self.root / name
        prefix = "base/" if bundle else ""
        html = "ready: " + (
            audit.POLICY_URL + " and " + audit.SUPPORT_URL if links else "missing"
        )
        with zipfile.ZipFile(path, "w") as z:
            z.writestr(prefix + "assets/site/index.html", html)
            if manifest:
                z.writestr(prefix + ("manifest/AndroidManifest.xml" if bundle else "AndroidManifest.xml"),
                           b"compiled manifest")
            if lib:
                z.writestr(prefix + "lib/arm64-v8a/libexample.so", b"\x7fELF")
        return path

    def test_production_apk_qa_and_aab_require_embedded_legal_urls(self):
        for name, is_bundle in [
            ("production.apk", False), ("qa.apk", False), ("production.aab", True)
        ]:
            with self.subTest(name=name):
                result = audit.inspect_archive(
                    self.write_archive(name, bundle=is_bundle), is_bundle=is_bundle
                )
                self.assertTrue(result["privacy_url_present"])
                self.assertTrue(result["support_url_present"])
                self.assertEqual(result["bundled_native_libraries"], [])
                self.assertGreater(result["bytes"], 0)

    def test_rejects_any_bundled_native_library_until_16kb_review(self):
        for is_bundle in (False, True):
            name = "native.aab" if is_bundle else "native.apk"
            with self.assertRaisesRegex(audit.PackageAuditError, "16 KB"):
                audit.inspect_archive(
                    self.write_archive(name, bundle=is_bundle, lib=True),
                    is_bundle=is_bundle,
                )

    def test_missing_legal_link_or_manifest_fails_closed(self):
        for is_bundle in (False, True):
            with self.assertRaisesRegex(audit.PackageAuditError, "missing legal links"):
                audit.inspect_archive(
                    self.write_archive(
                        "badlinks.aab" if is_bundle else "badlinks.apk",
                        bundle=is_bundle, links=False
                    ), is_bundle=is_bundle
                )
            with self.assertRaisesRegex(audit.PackageAuditError, "manifest"):
                audit.inspect_archive(
                    self.write_archive(
                        "nomanifest.aab" if is_bundle else "nomanifest.apk",
                        bundle=is_bundle, manifest=False
                    ), is_bundle=is_bundle
                )

    def test_merged_permission_parsing_and_identity(self):
        permissions = (
            "package: work.samelling.hipstergo\n"
            "uses-permission: name='android.permission.INTERNET'\n"
        )
        badging = (
            "package: name='work.samelling.hipstergo' versionCode='100000'\n"
            "targetSdkVersion:'36'\n"
        )
        with patch.object(audit.subprocess, "check_output",
                          side_effect=[permissions, badging]):
            actual = audit.inspect_apk_identity(
                Path("/fake/aapt"), Path("/fake/release.apk"),
                "work.samelling.hipstergo"
            )
        self.assertEqual(actual["merged_permissions"], ["android.permission.INTERNET"])
        self.assertEqual(actual["target_sdk"], 36)

    def test_new_permissions_target_sdk_or_package_fail_closed(self):
        badging = "package: name='work.samelling.hipstergo'\ntargetSdkVersion:'36'\n"
        new_permission = (
            "uses-permission: name='android.permission.INTERNET'\n"
            "uses-permission: name='android.permission.READ_CONTACTS'\n"
        )
        with patch.object(audit.subprocess, "check_output",
                          side_effect=[new_permission, badging]):
            with self.assertRaisesRegex(audit.PackageAuditError, "permissions changed"):
                audit.inspect_apk_identity(
                    Path("/fake/aapt"), Path("/fake/app.apk"),
                    "work.samelling.hipstergo"
                )
        for bad in ("package: name='wrong'\ntargetSdkVersion:'36'\n",
                    "package: name='work.samelling.hipstergo'\ntargetSdkVersion:'35'\n"):
            with patch.object(audit.subprocess, "check_output",
                              side_effect=[
                                  "uses-permission: name='android.permission.INTERNET'\n",
                                  bad,
                              ]):
                with self.assertRaises(audit.PackageAuditError):
                    audit.inspect_apk_identity(
                        Path("/fake/aapt"), Path("/fake/app.apk"),
                        "work.samelling.hipstergo"
                    )


if __name__ == "__main__":
    unittest.main()
