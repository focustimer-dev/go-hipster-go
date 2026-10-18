#!/usr/bin/env python3
"""Small, openly hand-curated shadow bridge smoke test; NO model or listening A/B."""
from __future__ import annotations

import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
RAW=HERE / "bridge-cases.json"
WEAK_METHODS={"fixed_media_composition", "extended_voice"}


def compare():
    data=json.loads(RAW.read_text(encoding="utf-8"))
    summary=[]
    for case in data["cases"]:
        left=data["sources"][case["left"]]
        right=data["sources"][case["right"]]
        common=set(left["methods"]) & set(right["methods"])
        # Raw method-only joins everything that shares *any* provisional tag.
        naive=bool(common)
        # Source type and function matter, not just membership or genre tags.
        if case["left"]=="ono" or case["right"]=="ono":
            # Known source is a score/instruction, not a verified audio track.
            decision="reject_recording_type"
        elif len(common)>1:
            if left["music_context"].split("/")[0]==right["music_context"].split("/")[0]:
                decision="baseline_already_sufficient"
            else:
                decision="conditional_bridge"
        elif "rhythmic_loop_reconstruction" in common:
            decision="conditional_bridge"
        elif "fixed_media_composition" in common:
            # Carrier alone is weak; *how* recordings become music matters.
            l_roles=set(left["roles"])
            r_roles=set(right["roles"])
            if "sound_as_material" in l_roles and "beat_as_material" in r_roles:
                decision="conditional_bridge"
            else:
                decision="reject_weak_bridge"
        else:
            decision="reject_weak_bridge"
        summary.append({
            "id":case["id"],
            "kind":case["kind"],
            "shared_methods":sorted(common),
            "method_overlap_links":naive,
            "function_aware_decision":decision,
            "reviewer_decision":case["verdict"],
            "decision_matches_curated_review":decision==case["verdict"]
        })
    return {
        "pairs_reviewed":len(summary),
        "naive_method_overlap_links":sum(x["method_overlap_links"] for x in summary),
        "naive_overlap_false_edges_in_curated_controls":sum(
            x["method_overlap_links"] for x in summary
            if x["kind"]=="negative_control"),
        "function_aware_conditional_bridges":sum(
            x["function_aware_decision"]=="conditional_bridge" for x in summary),
        "function_aware_false_edges_in_curated_controls":sum(
            x["function_aware_decision"]=="conditional_bridge" and
            x["kind"]=="negative_control" for x in summary),
        "reviewer_agreement_hand_selected":sum(x["decision_matches_curated_review"] for x in summary),
        "cases":summary,
        "limitations":[
            "Both rules and cases were hand-designed; comparison is a regression fixture, NOT a blind A/B test.",
            "Method names were assigned from source descriptions, without audio feature extraction.",
            "Cases do not prove sequence fit, full track identity, streaming availability or user preference.",
            "Function-aware decision='conditional_bridge' means eligible for listening and catalog verification, not playlist-ready.",
            "Do not use the explicit artist exceptions as a production ranking rule. The general insight is typed, purpose-aware relationships."
        ]
    }


if __name__=="__main__":
    print(json.dumps(compare(),indent=2,ensure_ascii=False))
