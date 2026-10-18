#!/usr/bin/env python3
"""Reproducible *structural* NWW pilot evaluation; no streaming or audio claims."""
from __future__ import annotations
import collections
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = Path(__file__).with_name("entries.json")
BASELINE_FILES = (
    ROOT / "SKILL.md",
    ROOT / "references/sonic-taxonomy.md",
    ROOT / "references/global-scenes.md",
)

# Exact-phrase probe only. A missing match does NOT imply a missing musical concept.
PHRASES = {
    "tape_montage": ("tape manipulation", "tape editing", "tape loops", "sound collage"),
    "found_sound": ("found sound", "field recording"),
    "spatial_acoustics": ("spatial acoustics", "acoustic resonance"),
    "chance_scores": ("chance score", "indeterminacy"),
    "extended_voice": ("extended vocal", "vocal technique"),
    "electronics": ("synthesizer", "synths", "electronics"),
    "nonmetric_improv": ("nonmetric improvisation", "free improvisation"),
    "collective_improv": ("collective improvisation", "ensemble improvisation"),
    "extended_instrument": ("extended technique", "prepared instruments"),
    "chamber_counterpoint": ("chamber counterpoint", "chamber rock", "counterpoint"),
    "irregular_pulse": ("odd meter", "irregular meter", "polyrhythm"),
    "repetition_drone": ("drone", "repetition", "hypnotic"),
    "noise_texture": ("noise", "distortion", "fuzz"),
    "performance_art": ("performance art", "fluxus"),
    "speech_collage": ("sound poetry", "speech collage"),
    "studio_manipulation": ("studio manipulation", "tape saturation", "studio treatment"),
}


def normalize(value: str) -> str:
    deaccent = unicodedata.normalize("NFKD", value).casefold()
    return " " + re.sub(r"[^a-z0-9]+", " ", "".join(
        char for char in deaccent if not unicodedata.combining(char)
    )).strip() + " "


def evaluate() -> dict:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    entries = data["entries"]
    baseline = normalize("\n".join(p.read_text(encoding="utf-8") for p in BASELINE_FILES))
    counts = dict(sorted(collections.Counter(e["family"] for e in entries).items()))
    methods = collections.defaultdict(set)
    for entry in entries:
        for method in entry["methods"]:
            methods[method].add(entry["family"])
    artist_hits = [e["name"] for e in entries if normalize(e["name"]) in baseline]
    phrase_hits = {
        method: next((phrase for phrase in alternatives
                      if normalize(phrase) in baseline), None)
        for method, alternatives in PHRASES.items()
    }
    regional_concentration = sum(
        e["regional_context"] in {"France", "UK", "USA"} for e in entries
    )
    return {
        "sample_size": len(entries),
        "family_counts": counts,
        "distinct_method_labels": len(methods),
        "cross_family_method_labels": sorted(m for m, f in methods.items() if len(f) >= 2),
        "cross_family_method_count": sum(len(f) >= 2 for f in methods.values()),
        "sampled_artist_names_already_in_baseline": artist_hits,
        "sampled_artist_names_not_in_baseline": len(entries) - len(artist_hits),
        "exact_phrase_matches": {k: v for k, v in phrase_hits.items() if v is not None},
        "exact_phrase_missing": sorted(k for k, v in phrase_hits.items() if v is None),
        "baseline_concentration_france_uk_usa_exact": regional_concentration,
        "candidate_recordings_verified": sum(e["recording_verified"] is True for e in entries),
        "limits": [
            "Method assignments are provisional hypotheses, not independently heard recordings.",
            "Lexical phrase coverage is not semantic concept coverage or playlist-quality improvement.",
            "Six-per-family stratification is intentional; this is NOT a random sample of 291 entries.",
            "Wikipedia annotations are secondary source membership evidence, not sleeve scans.",
            "A music-provider write, track identity and listening judgment have NOT been tested.",
        ],
    }


if __name__ == "__main__":
    print(json.dumps(evaluate(), indent=2, ensure_ascii=False))
