# Go, Hipster, Go! — 3.11.5 Skill Optimization Baseline

**Purpose:** Frozen starting measurements for the five-stage optimization plan in [skill-optimization-plan.md](skill-optimization-plan.md). This is a *measurement record*, not a claim of measured host performance.

**Baseline source:** GitHub tag [`gemini-skill-v3.11.5`](https://github.com/focustimer-dev/go-hipster-go/tree/gemini-skill-v3.11.5), commit `625941ab0e931230554393035df6b4b851783298`.  
**Snapshot date:** 2026-11-11 (America/New_York).  
**Measurement method:** UTF-8 byte counts and whitespace-separated word counts of the tagged GitHub source files. No live Gemini/ChatGPT retrieval telemetry is available in this baseline.

## Entry and research file sizes

| Source at tag 3.11.5 | UTF-8 bytes | Approx. whitespace-separated words |
| --- | ---: | ---: |
| `SKILL.md` | 54,578 | 7,687 |
| `adapters/gemini/SKILL.md` | 6,816 | 852 |
| `references/reference-index.md` | 4,891 | 668 |
| `references/global-scenes.md` | 31,310 | 3,555 |
| `references/sonic-taxonomy.md` | 10,653 | 1,462 |
| `references/verification.md` | 4,704 | 674 |
| `references/regional-atlas.md` | 11,193 | 1,475 |
| `references/go-hard.md` | 6,750 | 968 |
| `references/regions/us-south.md` | 2,299 | 305 |
| `references/regions/central-america.md` | 9,159 | 1,235 |
| `references/regions/central-america-additions.md` | 12,908 | 1,692 |
| `references/regional-review.md` | 5,330 | 658 |
| `references/curation-examples.md` | 12,977 | 1,881 |

Word counts are **not token counts**. Non-ASCII UTF-8 characters explain differences between byte and character counts.

## Published ZIP assets (unchanged during Stage 0)

| Asset in GitHub release `gemini-skill-v3.11.5` | Bytes |
| --- | ---: |
| ChatGPT plugin ZIP | 242,009 |
| Claude plugin ZIP | 239,639 |
| Claude skill ZIP | 236,252 |
| Gemini Apps skill ZIP | 196,447 |

The release was published at 2026-11-12 01:03 UTC. Those values are downloaded-asset metadata, not rebuilt sizes.

## Reference-loading baseline

Under the original `reference-index.md`, ordinary GO is instructed to consult the sonic taxonomy, global-scenes catalog, and verification. Regional requests additionally require the atlas and selected regional files, plus matching additions/review guidance. GO HARD loads its protocol conditionally; de-cheese should dispatch directly to the audit, not the GO discovery process.

**Potential avoidable work (not observed network or token usage):**

- `global-scenes.md`: **31,310 bytes / 3,555 words**. It currently appears in the ordinary GO reference-routing instructions even when explicit regions are provided.
- `reference-index.md`: **4,891 bytes / 668 words**, representing a possible extra Gemini routing lookup when the host cannot plan downstream reads directly.
- Baseline regional files include recurring policy text; PR 2 will inventory exact repeated sections and preserve region-specific exceptions before removing anything.
- Supplementary additions include repeated “Unreviewed; check semantic overlap...” warnings. PR 2 will validate exact frequency and keep any individually meaningful relationship notes.

These numbers are *opportunity upper bounds per full-file read*, not guaranteed savings per user request. Files may be cached, selectively fetched, or already available in the conversation.

## Test and evaluation method

- **Automated:** Python unit tests, skill CLI checks, synced generated distributions, ZIP structure, and link integrity. Treat any failing test as a blocker unless a confirmed unrelated/flaky issue is recorded.
- **Musical:** compare constrained briefs without requiring identical tracklists. Score regional legitimacy, real recording identity, novelty, sequencing, mood/tempo compliance, and editorial voice.
- **Publishing:** confirm exact-track writer capability before writing; differentiate saved playlists from text-only recommendations and approximate provider-generated results.
- **Release safety:** no automatic `main` pushes create or overwrite public GitHub release assets; online Gemini links use manually promoted `release/skill-prod` references.
- **Performance:** record actual host retrieval calls or elapsed time *only when instrumented*. Otherwise report a file-size or routing estimate explicitly as an estimate.

## Outcomes to fill as changes land

| Metric | Baseline | After optimization | Evidence |
| --- | --- | --- | --- |
| Canonical entry UTF-8 bytes | 54,578 | Pending | |
| Gemini online entry UTF-8 bytes | 6,816 | Pending | |
| Global-scenes loaded for region-locked GO | Instructed by baseline index | Pending | |
| Regional repeated policy bytes/words | Inventory in PR 2 | Pending | |
| Actual reference retrieval calls | Unmeasured | Unmeasured | |
| Live playlist-quality comparison | Unmeasured | Pending review | |
| Four packaged ZIP sizes | Listed above | Pending | |
| Build and test matrix | Baseline validation in source PRs; re-run in each stage | Pending | |

## Known limitations

The published 3.11.5 release tag is immutable in our process, but the original online Gemini adapter linked to `main` in nested references. The new `release/skill-prod` branch and generated online instructions correct this **for newly loaded instructions**. Existing installed copies that hardcode `main` cannot be retroactively rewritten. That is an adoption caveat, not a reason to mutate the 3.11.5 tag.

This baseline does not authorize publishing, redeploying, merging a future PR, creating playlists, or promoting the production reference branch.
