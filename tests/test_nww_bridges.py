"""Source-backed NWW bridge smoke fixtures, not a listening-quality test."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
HERE=ROOT/"research/nww-pilot"

class BridgeReviewTests(unittest.TestCase):
    def test_cases_have_evidence_and_controls(self):
        data=json.loads((HERE/"bridge-cases.json").read_text(encoding="utf-8"))
        self.assertEqual(len(data["cases"]),8)
        self.assertEqual(sum(x["kind"]=="candidate" for x in data["cases"]),3)
        self.assertEqual(sum(x["kind"]=="negative_control" for x in data["cases"]),4)
        self.assertEqual(sum(x["kind"]=="baseline_control" for x in data["cases"]),1)
        self.assertFalse(data["spotify_catalog_matches_verified"])
        self.assertFalse(data["reviewer_listening_performed"])
        for src in data["sources"].values():
            self.assertTrue(src["source"].startswith("https://"))
            self.assertTrue(src["documented"])
        self.assertTrue(all(x["verdict"] and x["limitations"] for x in data["cases"]))

    def test_method_only_false_positives_are_caught_by_role_gate(self):
        spec=importlib.util.spec_from_file_location("review_bridges",HERE/"review_bridges.py")
        module=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        result=module.compare()
        self.assertEqual(result["pairs_reviewed"],8)
        self.assertEqual(result["naive_method_overlap_links"],6)
        self.assertEqual(result["naive_overlap_false_edges_in_curated_controls"],2)
        self.assertEqual(result["function_aware_false_edges_in_curated_controls"],0)
        self.assertEqual(result["function_aware_conditional_bridges"],3)
        self.assertEqual(result["reviewer_agreement_hand_selected"],8)
        self.assertIn("NOT a blind A/B",result["limitations"][0])

    def test_remains_shadow_only(self):
        content=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        self.assertNotIn("research/nww-pilot",content)
        doc=(HERE/"bridge-review.md").read_text(encoding="utf-8")
        self.assertIn("No NWW artist boost",doc)
        self.assertIn("in-sample constructed counterexample",doc)

if __name__=="__main__":
    unittest.main()
