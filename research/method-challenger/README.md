# Method/role challenger — A/B/C/D shadow smoke test

**Research only. Nothing here changes the production skill, packages, or music provider.** No Spotify calls, music playback or playlist publishing occur.

## Why this experiment exists

The user preferred the original four-axis **go sad** playlist to the prior method-first alternative in a blind Spotify listening comparison. A separate 9-of-12-preserved hybrid Playlist C was enthusiastically received. That supports a narrow hypothesis: **a challenger might improve candidate variety or the order of songs while leaving the existing curator in control**. These prior reactions are not statistically representative and are *not* measurements from the synthetic test below.

The repository currently holds *agent instructions*, not an executable universe-scale playlist solver. **A in this experiment is a simplified baseline proxy, not a run of the production Agent Skill.** The purpose of this Python fixture is to catch implementation mistakes, accidental incentives to ignore mood, and over-eager changes before the real blind listening trial.

## Arms and stimuli

| Arm | What happens to the same baseline sequence | Hard budget |
| --- | --- | --- |
| A | Simplified four-axis baseline proxy, fit/familiarity-ranked | 12 tracks |
| B | A plus catalog-agnostic discovery/variety substitutions | At most **2 track replacements** |
| C | A plus local transition tightening | At most **3 position swaps**, exactly the same recordings |
| D | A plus B's replacements and C's position swaps | At most 2 replacements + 3 swaps |

Three prompts: `go sad`, `go angry`, and `go`. Five preregistered independent selection seeds: `1,2,3,4,5`, giving **60 synthetic 12-item playlist outputs** total. Each mood draws from the **same fixed 96-item artificial catalog** across all four arms, with neutral IDs and abstract scenes (`scene-0` ... `scene-7`) to avoid building artist/country stereotypes into the algorithm.

**These are not 60 actual music playlists.** The candidates are fabricated feature vectors, have no real artist/title/Spotify identity, and cannot be listened to. Their aim is code-level stress testing, not evaluation of songs or cultural coverage.

## Input contract: not a list of approved artists

The challenger sees `id`, `artist` (used only to avoid repeats), `scene`, `era`, `mood_fit`, `familiarity`, `novelty`, `energy`, `operation`, `role`, and `texture`.

In actual deployment, these features would have to come from *verified recording/catalog evidence*, and unknown fields must not be invented. The engine knows **no artist names, no genre pairs, no NWW-list membership, and no national/ethnic presets**. It is not a recommender until real candidates and confidence are supplied.

## Measures / guardrails

- **Variety**: distinct abstract scenes within each 12-item set, and distinct track IDs across five separate runs. More scenes is a proxy for coverage, not a music-quality signal. Avoid diversity quotas.
- **Transition fit**: heuristic shared musical operation, role and texture adjusted for energy jumps. This is a **synthetic adjacency proxy**, not human-perceived flow. Its ingredients are exactly what arm C optimizes, so a higher number is not independent proof.
- **Mood**: average fictional `mood_fit`. A B substitution may lower this by no more than 0.025 per replacement (0.05 total); candidates below 0.70 are excluded. Zero changes is allowed.
- **No deception**: same 12 unique artists, 12 positions, no mystery scores presented as catalog facts, no forced “global tour,” no NWW bonus, and no playlist writer calls.
- **Ablation**: C can only rearrange the baseline; D can only rearrange B's output. This isolates discovery and ordering contributions.

## Reproduce

```sh
python research/method-challenger/shadow.py
python -m unittest discover -s tests -v
```

The first command emits the detailed JSON table of A/B/C/D means for all three prompts. GitHub CI executes the tests on Python 3.10, 3.12 and 3.13; the test logs also print a `SHADOW_CHALLENGER_RESULTS=` summary. Runtime test results should be copied into this report *after* the run; do not pre-populate numbers or call a source-incomplete fixture an accuracy score.

## Promotion threshold: real music, held out from this fixture

1. Leave the actual four-axis Agent Skill unchanged until real catalog-backed candidates are available. For each of the three prompts, run A/B/C/D with same writer/candidate evidence; use actual Spotify tracks and playback-ready anonymous labels.
2. Judge the **full 12-track experience** by blind listener preference, transition skips, replayability, and whether the emotional theme survives. Count distinct recordings and cross-scene coherence, but avoid inventing numeric audiometric scores.
3. Require *at least two separate user-preferred examples beyond the original Playlist C*, covering more than one mood, with no major factual/recording regression. This is a preliminary human decision gate, not a claim of statistical significance.
4. Promote **only an optional challenger pass**, with zero-change abstention, at most two replacements and three swaps by default. Do not create a permanent artist list, NWW preference, or rewrite the taxonomy.

## Status

Pending current-turn CI execution and result review. Machine metrics are **self-evaluated engineering controls**. The next missing evidence is real candidate features, Spotify identity verification, and blind listening on the three prompts.
