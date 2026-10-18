#!/usr/bin/env python3
"""Catalog-agnostic challenger smoke experiment; synthetic inputs, NO listening claims.

The existing Agent Skill is not a runnable recommender. This script only tests
the proposed selection and sequencing machinery on reproducible fictional records.
"""
from __future__ import annotations

import json
import random
import statistics
from dataclasses import dataclass
from itertools import combinations

PROMPTS = ("go sad", "go angry", "go")
ARMS = ("A", "B", "C", "D")
LENGTH = 12
# No named musicians or regions: these are synthetic IDs, NOT music assertions.
OPERATIONS = ("refrain", "loop", "dialogue", "drone", "improvise", "montage", "pulse", "harmonic_turn")
ROLES = ("build", "release", "tension", "reflect", "drive", "linger")
TEXTURES = ("grain", "dry", "warm", "bright", "distorted", "spacious")


@dataclass(frozen=True)
class Candidate:
    id: str
    artist: str
    scene: str
    era: int
    mood_fit: float
    familiarity: float
    novelty: float
    energy: int
    operation: str
    role: str
    texture: str


def catalog(prompt: str) -> tuple[Candidate, ...]:
    """One fixed 96-item open-input-like catalog per mood, avoiding identity bias."""
    if prompt not in PROMPTS:
        raise ValueError("unknown fixture prompt")
    rng = random.Random(712 + PROMPTS.index(prompt) * 29)
    records = []
    for i in range(96):
        scene = "scene-" + str(i % 8)  # abstract, not geography or cultural claims
        records.append(Candidate(
            id=f"{PROMPTS.index(prompt)}-{i:03d}",
            artist=f"artist-{i:03d}",
            scene=scene,
            era=i % 6,
            mood_fit=round(0.55 + rng.random() * 0.45, 4),
            familiarity=round((0.70 + rng.random() * 0.30)
                              if i % 8 in (0, 1) else rng.random() * 0.60, 4),
            novelty=round(rng.random(), 4),
            energy=rng.randrange(5),
            operation=OPERATIONS[(i // 3 + rng.randrange(3)) % len(OPERATIONS)],
            role=ROLES[(i // 5 + rng.randrange(4)) % len(ROLES)],
            texture=TEXTURES[rng.randrange(len(TEXTURES))],
        ))
    return tuple(records)


def pair_strength(a: Candidate, b: Candidate) -> float:
    """Transition *proxy*, not a measure of perceived sonic harmony."""
    return (
        (0.48 if a.operation == b.operation else 0.0)
        + (0.36 if a.role == b.role else 0.0)
        + (0.16 if a.texture == b.texture else 0.0)
        - 0.055 * abs(a.energy - b.energy)
    )


def stats(seq: tuple[Candidate, ...]) -> dict:
    pairs = list(zip(seq, seq[1:]))
    return {
        "scenes": len({x.scene for x in seq}),
        "eras": len({x.era for x in seq}),
        "fit": statistics.mean(x.mood_fit for x in seq),
        "novelty": statistics.mean(x.novelty for x in seq),
        "transition": statistics.mean(pair_strength(a, b) for a, b in pairs),
        "cross_scene_method_bridges": sum(
            a.scene != b.scene and
            (a.operation == b.operation or a.role == b.role)
            for a, b in pairs
        ),
        "artists": len({x.artist for x in seq}),
    }


def baseline(pool: tuple[Candidate, ...], seed: int) -> tuple[Candidate, ...]:
    """Explicit simplified four-axis PROXY; not a live execution of SKILL.md."""
    rng = random.Random(29471 + seed)
    ranked = sorted(
        (x for x in pool if x.mood_fit >= 0.70),
        key=lambda x: (
            0.52 * x.mood_fit + 0.48 * x.familiarity + 0.12 * rng.random()
        ),
        reverse=True,
    )
    return tuple(ranked[:LENGTH])


def score_variety(seq: tuple[Candidate, ...]) -> float:
    s = stats(seq)
    return 2.2 * s["scenes"] + 0.5 * s["eras"] + 0.30 * s["novelty"]


def diversify(
    seq: tuple[Candidate, ...], pool: tuple[Candidate, ...], max_changes: int = 2
) -> tuple[Candidate, ...]:
    """Small greedy substitutions, retaining mood and transition guardrails."""
    current = seq
    for _ in range(max_changes):
        old = stats(current)
        best = current
        best_gain = 0.0
        used = {x.id for x in current}
        for incoming in pool:
            if incoming.id in used or incoming.mood_fit < 0.70:
                continue
            for i in range(LENGTH):
                proposal = current[:i] + (incoming,) + current[i + 1:]
                s = stats(proposal)
                if s["fit"] < old["fit"] - 0.025:
                    continue
                if s["transition"] < old["transition"] - 0.070:
                    continue
                gain = score_variety(proposal) - score_variety(current)
                if gain > best_gain + 1e-9:
                    best, best_gain = proposal, gain
        if best is current:
            break
        current = best
    return current


def resequence(seq: tuple[Candidate, ...], max_swaps: int = 3) -> tuple[Candidate, ...]:
    """Greedy pairwise-order swaps (same tracks), accepting only strict gains."""
    current = seq
    for _ in range(max_swaps):
        best, best_gain = current, 0.0
        old = stats(current)["transition"]
        for i, j in combinations(range(LENGTH), 2):
            tmp = list(current)
            tmp[i], tmp[j] = tmp[j], tmp[i]
            proposed = tuple(tmp)
            gain = stats(proposed)["transition"] - old
            if gain > best_gain + 1e-9:
                best, best_gain = proposed, gain
        if best is current:
            break
        current = best
    return current


def treatments(pool: tuple[Candidate, ...], seed: int) -> dict:
    a = baseline(pool, seed)
    b = diversify(a, pool)
    c = resequence(a)
    d = resequence(b)
    return {"A": a, "B": b, "C": c, "D": d}


def evaluate(seeds: tuple[int, ...] = (1, 2, 3, 4, 5)) -> dict:
    output = {"limitations": [
        "Synthetic records; no real Spotify/catalog, audio, preference, or listener measurement.",
        "A is a simplified proxy selection, not an actual production-agent execution.",
        "In-sample improvements to scenes and adjacency are objectives of the algorithms, not independent quality validation.",
        "No NWW artist or fixed cross-genre pair bonus exists.",
        "The engine is a research-only challenger; it does not edit the Agent Skill."
    ], "prompt_results": {}}
    for prompt in PROMPTS:
        pool = catalog(prompt)
        trials = {arm: [] for arm in ARMS}
        tracksets = {arm: set() for arm in ARMS}
        for seed in seeds:
            for arm, sequence in treatments(pool, seed).items():
                if len(sequence) != LENGTH or len({x.id for x in sequence}) != LENGTH:
                    raise AssertionError("Invalid track count / duplicates")
                trials[arm].append(stats(sequence))
                tracksets[arm].update(x.id for x in sequence)
        output["prompt_results"][prompt] = {
            arm: {
                "mean_scenes": round(statistics.mean(x["scenes"] for x in trials[arm]), 3),
                "mean_transition_proxy": round(statistics.mean(x["transition"] for x in trials[arm]), 3),
                "mean_mood_fit": round(statistics.mean(x["fit"] for x in trials[arm]), 3),
                "mean_cross_scene_bridges": round(
                    statistics.mean(x["cross_scene_method_bridges"] for x in trials[arm]), 3
                ),
                "distinct_tracks_across_repeats": len(tracksets[arm]),
            } for arm in ARMS
        }
    return output


if __name__ == "__main__":
    print(json.dumps(evaluate(), indent=2, sort_keys=True))
