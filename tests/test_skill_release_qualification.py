"""Offline release-qualification reporting; not a live music or provider test."""
import json
import tempfile
import unittest
from pathlib import Path

from scripts.qualify_skill_release import (
    BASELINE_SHA, BASELINE_TAG, PUBLISHED_3115_ZIP_BYTES,
    inspect, render_markdown,
)

ROOT = Path(__file__).resolve().parents[1]


class ReleaseQualificationTests(unittest.TestCase):
    def test_frozen_baseline_metadata_and_version_consistency(self):
        self.assertEqual(BASELINE_TAG, "gemini-skill-v3.11.5")
        self.assertEqual(BASELINE_SHA, "625941ab0e931230554393035df6b4b851783298")
        self.assertEqual(len(PUBLISHED_3115_ZIP_BYTES), 4)
        result = inspect()
        self.assertEqual(result["status"], "offline_checks_passed", result["errors"])
        self.assertEqual(set(result["versions"].values()), {"3.11.5"})
        self.assertEqual(set(result["packages"]), set(PUBLISHED_3115_ZIP_BYTES))
        self.assertEqual(result["live_host_tests"], "not_performed")
        self.assertEqual(result["music_quality_comparison"], "not_performed")
        self.assertEqual(result["publication"], "not_authorized_or_attempted")

    def test_archive_report_distinguishes_published_asset_metadata(self):
        report = inspect()
        for name, entry in report["packages"].items():
            self.assertEqual(entry["published_3_11_5_asset_bytes"],
                             PUBLISHED_3115_ZIP_BYTES[name])
            self.assertGreater(entry["measured_candidate_bytes"], 0)
            self.assertEqual(len(entry["sha256"]), 64)
            self.assertGreater(entry["member_count"], 3)
        text = render_markdown(report)
        self.assertIn("Published 3.11.5 asset metadata", text)
        self.assertIn("no live host, catalog or music-quality measurements", text)
        self.assertIn("Separate approval obtained", text)
        self.assertNotIn("- [x] Live ChatGPT", text)

    def test_missing_archives_are_blockers_not_false_passes(self):
        with tempfile.TemporaryDirectory() as folder:
            result = inspect(dist=Path(folder))
        self.assertEqual(result["status"], "offline_checks_failed")
        self.assertEqual(result["packages"], {})
        for archive in PUBLISHED_3115_ZIP_BYTES:
            self.assertIn("Missing locally built archive " + archive, result["errors"])

    def test_regional_reference_difference_is_labeled_illustrative(self):
        report = inspect()
        row = report["illustrative_regional_core_full_file_bytes"]
        self.assertLess(row["candidate_direct_route_subset"],
                        row["baseline_reference_index_included"])
        self.assertIn("Illustrative only", row["note"])
        self.assertIn("host fetch observations", row["note"])


if __name__ == "__main__":
    unittest.main()
