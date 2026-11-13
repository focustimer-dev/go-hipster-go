"""Offline Gate 2 reporting tests. No provider API, credentials or playlist writes."""
import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from scripts.playlist_cli import publication_status_report, debarge_playlist, validate_playlist

ROOT = Path(__file__).resolve().parents[1]


def evidence(count=12):
    return {"requested_count": count, "curated_count": count}


def created(e):
    e["created"] = {"source": "provider_response", "reference": "real-provider-playlist-id"}
    return e


def saved(e):
    created(e)
    e["saved"] = {"source": "library_readback", "reference": "real-library-playlist-id"}
    return e


def exact_position(i, ref=None):
    return {
        "position": i,
        "result": "exact",
        "source": "provider_readback",
        "reference": ref or f"provider-track-{i}",
        "recording_verified": True,
    }


class PublicationReportTests(unittest.TestCase):
    def test_all_six_outcomes_have_distinct_labels(self):
        cases = [
            (dict(evidence(), text_only=True), "curated_text_only"),
            (evidence(), "not_created"),
            (created(evidence()), "created_save_required"),
            (saved(evidence()), "published_items_unverified"),
            (dict(saved(evidence()), provider_count=12,
                  positions=[exact_position(i) for i in range(1, 13)]), "published_exact"),
            (dict(saved(evidence()), provider_count=12,
                  positions=[*([exact_position(i) for i in range(1, 12)]),
                             {"position": 12, "result": "wrong_version",
                              "source": "provider_readback", "reference": "observed-track-id",
                              "note": "Provider returned live performance"}]),
             "published_approximate"),
        ]
        self.assertEqual(len(set(expected for _, expected in cases)), 6)
        for payload, expected in cases:
            with self.subTest(expected=expected):
                result = publication_status_report(payload)
                self.assertEqual(result["status"], expected)
                self.assertTrue(result["label"])

    def test_eight_of_twelve_preview_never_proves_eight_only_or_exact(self):
        payload = saved(evidence())
        payload["positions"] = [exact_position(i) for i in range(1, 9)]
        result = publication_status_report(payload)
        self.assertEqual(result["status"], "published_items_unverified")
        self.assertIsNone(result["counts"]["provider_total"])
        self.assertEqual(result["counts"]["confirmed_exact_positions"], 8)
        self.assertEqual(result["unreviewed_positions"], [9, 10, 11, 12])

    def test_count_mismatch_is_observed_not_inferred(self):
        payload = saved(evidence())
        payload["provider_count"] = 25
        outcome = publication_status_report(payload)
        self.assertEqual(outcome["status"], "published_approximate")
        self.assertIn("Requested 12; provider confirms 25",
                      outcome["observed_differences"][0]["note"])
        self.assertEqual(len(outcome["unreviewed_positions"]), 12)
        payload["provider_count"] = None
        self.assertEqual(publication_status_report(payload)["status"],
                         "published_items_unverified")

    def test_link_or_card_without_save_never_counts_as_published(self):
        payload = evidence()
        payload["created"] = {"source": "playlist_card", "reference": "onscreen-preview"}
        self.assertEqual(publication_status_report(payload)["status"],
                         "created_save_required")

    def test_verified_positions_cannot_self_certify_without_identity_or_readback(self):
        payload = saved(evidence())
        payload["provider_count"] = 12
        payload["positions"] = [exact_position(i) for i in range(1, 13)]
        payload["positions"][0].pop("recording_verified")
        with self.assertRaisesRegex(ValueError, "recording identity"):
            publication_status_report(payload)
        payload["positions"][0]["recording_verified"] = True
        payload["positions"][0]["source"] = "guess"
        with self.assertRaisesRegex(ValueError, "evidence source"):
            publication_status_report(payload)

    def test_no_unauthorized_write_can_hide_in_text_only(self):
        for bad in ({"created": {"source": "playlist_card", "reference": "card"}},
                    {"saved": {"source": "provider_save", "reference": "saved-id"}},
                    {"provider_count": 12}):
            with self.subTest(bad=bad):
                with self.assertRaises(ValueError):
                    publication_status_report(dict(evidence(), text_only=True, **bad))

    def test_missing_or_conflicting_evidence_fails_closed(self):
        base = saved(evidence())
        base["positions"] = [exact_position(1), exact_position(1)]
        with self.assertRaisesRegex(ValueError, "unique integers"):
            publication_status_report(base)
        bad = saved(evidence())
        bad["provider_count"] = 0
        bad["positions"] = [exact_position(1)]
        with self.assertRaisesRegex(ValueError, "exceed"):
            publication_status_report(bad)
        bad = saved(evidence())
        bad["saved"]["reference"] = ""
        with self.assertRaisesRegex(ValueError, "reference"):
            publication_status_report(bad)
        bad = saved(evidence())
        bad["requested_count"] = True
        with self.assertRaisesRegex(ValueError, "positive integer"):
            publication_status_report(bad)

    def test_debarge_preserves_all_25_duplicate_positions(self):
        original = debarge_playlist()
        self.assertEqual(validate_playlist(original), [])
        payload = saved(evidence(25))
        payload["provider_count"] = 25
        # All 25 are the SAME exact recording, but 25 positional confirmations.
        payload["positions"] = [exact_position(i, "same-debarge-recording-id")
                                for i in range(1, 26)]
        result = publication_status_report(payload)
        self.assertEqual(result["status"], "published_exact")
        self.assertEqual(result["counts"]["confirmed_exact_positions"], 25)

    def test_legacy_v10_stays_bytewise_semantically_compatible(self):
        schema = json.loads((ROOT / "schemas/playlist.schema.json").read_text())
        self.assertEqual(schema["properties"]["format_version"]["const"], "1.0")
        self.assertEqual(set(schema["properties"]["publishing"]["properties"]["status"]["enum"]),
                         {"not_attempted", "dry_run", "published", "failed"})
        original = (ROOT / "examples/example-playlist.json").read_text()
        data = json.loads(original)
        self.assertEqual(validate_playlist(data), [])
        self.assertEqual(json.loads(json.dumps(data)), data)
        incompatible = copy.deepcopy(data)
        incompatible["publishing"]["status"] = "published_exact"
        self.assertTrue(validate_playlist(incompatible))
        incompatible = copy.deepcopy(data)
        incompatible["publishing"]["provider_total"] = 12
        self.assertTrue(validate_playlist(incompatible))

    def test_readonly_cli_status_report(self):
        payload = dict(saved(evidence()), provider_count=12,
                       positions=[exact_position(i) for i in range(1, 13)])
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "evidence.json"
            source = json.dumps(payload)
            path.write_text(source, encoding="utf-8")
            proc = subprocess.run(
                [sys.executable, str(ROOT / "scripts/playlist_cli.py"), "status-report", str(path)],
                capture_output=True, text=True, check=False,
            )
            self.assertEqual(proc.returncode, 0, proc.stderr)
            self.assertEqual(json.loads(proc.stdout)["status"], "published_exact")
            self.assertEqual(path.read_text(encoding="utf-8"), source)


if __name__ == "__main__":
    unittest.main()
