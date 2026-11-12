# 3.11.6 Gate 0 — baseline and contract inventory

**Snapshot:** 2026-11-12, before implementation PR A. This is a source/repository audit, **not** a live Gemini, catalog, write or installation test. The plan of record is [skill-3.11.6-finalization-plan.md](skill-3.11.6-finalization-plan.md).

## Immutable reference and rollback evidence

| Reference | Observed commit SHA | Role |
| --- | --- | --- |
| `main` before PR A | `75d241eaf0f3d94cf1de63fcf7b3cd25432ce7f2` | Development starting point; moves as PRs merge |
| `release/skill-prod` | `41a3d17a4f0c9b2809d3a9077ed950cbc4d044f1` | Current production raw-reference branch; do **not** update during engineering |
| `gemini-skill-v3.11.5` | `625941ab0e931230554393035df6b4b851783298` | Tagged, published fallback baseline |

The 3.11.5 release was published 2026-11-12 01:03:47 UTC. GitHub currently reports these four assets; digests are **release-reported SHA-256**, not independently downloaded-and-recomputed hashes:

| Asset | Bytes | Reported SHA-256 |
| --- | ---: | --- |
| `go-hipster-go-chatgpt-plugin.zip` | 242009 | `6cbc285a28372c8a5077103e1afbb0bd729694372f2d92cf5275d26e4ec012e3` |
| `go-hipster-go-claude-plugin.zip` | 239639 | `aa4eedccc040cec2ca15774f1150e040f4b48e07a7a8d8fd7045f2dfb97fa973` |
| `go-hipster-go-claude-skill.zip` | 236252 | `ad7280cd9e14f698057c0434b77e8f205a2b7dc93fb6ead93a26bf81a15c05e6` |
| `go-hipster-go-gemini-app-skill.zip` | 196447 | `1ea47e57b57c3eb0fa5397228645bd623996b7592ba770f4704661e3df32ddb8` |

See [3.11.5 GitHub release](https://github.com/focustimer-dev/go-hipster-go/releases/tag/gemini-skill-v3.11.5). Both source `SKILL.md` and `plugin.json` still declare **3.11.5** on `main` before PR A, and the production skill also declares 3.11.5. Never confuse a merged source PR with an installed or distributed update.

## Actual contract ownership and change map

| Area | Authoritative source or owner | Mirrors / consumers | Gate 1 action |
| --- | --- | --- | --- |
| Ordinary GO, no-publish, exact recording matching | `SKILL.md`, including “Gemini + YouTube Music” and “Default go” sections | `skills/go-hipster-go/SKILL.md`; generated Gemini and ChatGPT/Claude packages | **Already exact-by-default**; do not change musical selection |
| Gemini small online entry and workflow | `scripts/build_gemini_app_skill.py` fed by `SKILL.md` | `adapters/gemini/SKILL.md`, `adapters/gemini/references/workflow.md`, `adapters/gemini/GEM_KNOWLEDGE.md`, portable Gemini ZIP | Generated entry already says themed-only writers must not be a default fallback; preserve generated parity |
| Gemini Gem/user-facing setup | `adapters/gemini/GEM_INSTRUCTIONS.md`, `adapters/gemini/README.md` (maintained prose) | Gem configuration, install and recovery | **Conflict**: thematic generator could appear to be acceptable on an ordinary GO; clarify exact-only default and explicit approximate opt-in |
| Cross-host/public setup | `skills/setup/SKILL.md`, `README.md`, `adapters/README.md` | ChatGPT/Claude setup and repository landing page | Setup describes thematic *capability*, which does not imply ordered writer; align public summary without changing Spotify host precedence |
| Gemini Publish follow-up | `references/gemini-publish.md` | Embedded in `GEM_KNOWLEDGE.md`; linked by Gemini entry and Gem instructions | Existing URI and actual `youtube_music:save` only; no second create, no invented save, no text-only write |
| Playlist export | `schemas/playlist.schema.json`, `scripts/playlist_cli.py` | `skills/go-hipster-go/{schemas,scripts}` plus examples/tests and archive consumers | **Gate 2, not Gate 1**; currently strict `format_version = 1.0`, status enum `not_attempted/dry_run/published/failed` |
| Candidate/package checks | `scripts/build_agent_packages.py`, `scripts/build_gemini_app_skill.py`, `scripts/qualify_skill_release.py` | `tests/test_agent_distributions.py`, `tests/test_skill_release_qualification.py`, `tests/test_go_publishing.py` | Every source edit must pass generated-mirror and ZIP checks |
| Live host/regression cases | `adapters/gemini/MOBILE_SMOKE_TEST.md`, `tests/discovery-cases.md`, `docs/skill-release-qualification-3.11.6.md` | Manual ChatGPT/Gemini/Claude smoke reports | Historical v3.5.5 two-stage scenarios are archival; do not treat them as current acceptance or live evidence |

**Known repository schema consumers:** CLI validator and exporter; JSON schema; example `examples/example-playlist.json`; unit tests and packaged copies. **External consumers of exported 1.0 JSON cannot be enumerated from repository search**. That is an explicit Gate 2 compatibility risk, **not** evidence that none exist: preserve 1.0 validation/roundtrip and avoid silently repurposing existing statuses or provider keys.

## Conflict findings and stop conditions

1. **Confirmed**: canonical `SKILL.md` requires actual ordered track input and says **do not** use a themed substitute; generated `adapters/gemini/SKILL.md` says the same. The Gem fallback and install README previously called provider thematic mixes “APPROXIMATE” without making their **separate opt-in** sufficiently clear. PR A fixes maintained documents and asserts the cross-document contract.
2. **Confirmed**: a Gemini playlist card or first 8 visible items of 12 is not proof of a complete saved list. Creation, save state, 12 requested positions, artist/version/order and description persistence are independent evidence claims. `Publish` must only target the known existing URI.
3. **Confirmed**: playlist schema 1.0 rejects unknown publishing fields and new status labels. Gate 2 must prove compatibility before any 1.1 persistence path.
4. **Scope boundary**: no `main`-to-production branch promotion, ZIP release, plugin submission, app deployment, library save, or playlist creation belongs to Gate 1.
5. **N/T**: exact available external schema consumers; native Gemini writer capabilities and real create/save/readback; live host load traces, actual audio, and current installed versions. These are not CI passes and must not be invented.

## CI, publishing triggers and rollback

- `.github/workflows/ci.yml` runs `Validate skill` on **push and pull_request**, with `contents: read` and a Python **3.10 / 3.12 / 3.13** matrix. It checks source/mirrors, creates temporary ZIPs and uploads a PR-only short-retention candidate artifact. It contains no external playlist or GitHub release publication.
- `.github/workflows/publish-gemini-skill.yml` uses **workflow_dispatch** only, requires the `publish_approved` boolean and the `main` branch, rejects an existing release tag, and targets the checked-out commit. It has `contents: write`; never trigger it before Gate 6 approval.
- `scripts/qualify_skill_release.py` pins baseline `gemini-skill-v3.11.5` and its tag SHA; `tests/test_skill_release_qualification.py` expects all current 3.11.5 versions. Gate 5 must distinguish immutable baseline constants from future candidate versions.
- Rollback reference for an authorized future deployment: recorded `release/skill-prod` SHA and immutable 3.11.5 release/tag/assets above. **Rollback is a separate authorized operation**, not an automatic response to a failed engineering PR.

## Gate 0 exit

[x] Exact baseline refs and release asset metadata captured.  
[x] Canonical, generated, Gem, setup, publishing and schema paths mapped.  
[x] Schema internal consumers and unknown external compatibility risk recorded.  
[x] Release versus CI automation and rollback boundaries inspected.  

**Disposition:** Gate 0 inventory complete for PR A; Gate 2's unknown external consumers remain a compatibility constraint. Gate 1 does not change schema, providers, playlists, production references or generated bundles. A green final-head CI run and focused diff review are still required before PR A merge.
