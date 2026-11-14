"""Keyless RC evidence data should be accurate, complete and non-secret."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "android_release_evidence", ROOT / "scripts/android_release_evidence.py")
evidence = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(evidence)


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / "android-production/app").mkdir(parents=True)
        (self.root / "android-production/app/build.gradle").write_text(
            "defaultConfig { versionCode 100000 versionName '1.0.0-rc.1' }")
        (self.root / "config").mkdir()
        (self.root / "config/stable-skill-release.json").write_text(
            json.dumps({"version": "3.11.6", "tag": "gemini-skill-v3.11.6"}))
        for index, (_, (relative, _, _)) in enumerate(evidence.FILES.items()):
            path = self.root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(bytes([index + 1]) * (index + 3))
        self.patcher = patch.object(evidence, "ROOT", self.root)
        self.patcher.start()
        self.addCleanup(self.patcher.stop)
        self.sha = "a" * 40
        self.cert = "b" * 64

    def test_includes_exact_three_files_hash_sizes_package_and_signing_lane(self):
        data = evidence.make_evidence(
            self.sha, "c" * 40, self.cert, when="2026-11-14T13:00:00Z")
        self.assertEqual(data["version_code"], 100000)
        self.assertEqual(data["stable_skill_version"], "3.11.6")
        self.assertFalse(data["production_signing_approved"])
        self.assertEqual(data["qa_certificate_sha256"], self.cert)
        self.assertEqual(set(data["artifacts"]), set(evidence.FILES))
        self.assertEqual(data["artifacts"]["qa_apk"]["package"],
                         "work.samelling.hipstergo.qa")
        for kind, item in data["artifacts"].items():
            self.assertEqual(item["sha256"], evidence.sha256(self.root / item["path"]))
            self.assertGreater(item["size_bytes"], 0)
            if kind.startswith("production"):
                self.assertEqual(item["signing"], "unsigned")
            else:
                self.assertEqual(item["signing"], "temporary_runner_debug")
        output = self.root / "evidence/release.json"
        evidence.write_evidence(output, data)
        self.assertEqual(json.loads(output.read_text()), data)

    def test_rejects_wrong_sha_or_empty_artifact(self):
        with self.assertRaises(ValueError):
            evidence.make_evidence("not-a-sha", "c" * 40, self.cert)
        with self.assertRaises(ValueError):
            evidence.make_evidence(self.sha, "c" * 40, "too-short")
        relative, _, _ = evidence.FILES["production_aab"]
        (self.root / relative).write_bytes(b"")
        with self.assertRaises(FileNotFoundError):
            evidence.make_evidence(self.sha, "c" * 40, self.cert)


if __name__ == "__main__":
    unittest.main()
