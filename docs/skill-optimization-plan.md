# Go, Hipster, Go! — Skill Optimization & Publication Readiness Tracker

**Status:** Planning — not yet implemented  
**Target release:** 3.11.6 (maintenance/polish)  
**Baseline release:** 3.11.5 (reconfirm on PR 1)  
**Repository:** focustimer-dev/go-hipster-go  
**Last reviewed:** 2026-11-11  
**Tracking convention:** Check a box only when the linked evidence exists. Each PR gets its own checklist and exit gate.

> **Purpose:** Make the ChatGPT, Gemini, and Claude skill distributions smaller, faster to load, easier to maintain, and safer to publish **without changing what makes the playlists good**.

## Operating rules

- [ ] Keep changes limited to the skill, references, generators, tests, and packaging. Android/PWA UX and production app code are out of scope.
- [ ] Preserve the record-store-clerk character, musical quality, discovery coverage, regional safeguards, unique-lead-artist policy, mood/tempo-curve behavior, GO HARD, DeBarge, refresh, and de-cheese.
- [ ] Preserve actual provider authorization and verification boundaries; never describe a curated list as a saved playlist without service confirmation.
- [ ] Preserve every unique research lead, cultural qualification, stable regional identifier, and source URL. Removing *duplicate boilerplate* is allowed; removing distinctive source material is not.
- [ ] Implement the five PRs **sequentially**, each independently reviewable and reversible. No combining unrelated changes to bypass a failing gate.
- [ ] Keep version 3.11.5 during PRs 1–4; update to 3.11.6 only in the final release PR.
- [ ] Never intentionally deploy Android/PWA or publish a public skill release as part of an optimization PR. Before merging, inspect the relevant workflow triggers for side effects.
- [ ] Preserve the 3.11.5 GitHub release and existing ZIP assets. Disable auto-publishing to that release before any skill/reference code changes on `main`.
- [ ] Prefer evidence-backed performance improvements over arbitrary token/ZIP-size goals.

## Stage 0 — Release safeguards (must be complete before PR 1)

- [x] Confirm the published **3.11.5** release `gemini-skill-v3.11.5` exists and records baseline SHA `625941ab0e931230554393035df6b4b851783298`.
- [x] Create stable `release/skill-prod` branch from that baseline and rewrite its Gemini entry/workflow links to **its own branch**, not moving `main`. This is a publication reference target, not an automatically synchronized mirror.
- [x] Change `.github/workflows/publish-gemini-skill.yml` to **manual dispatch only**, approved-boolean gated on `main`, and refuse existing-release replacement rather than using `--clobber`.
- [x] Route generated Gemini online links to `release/skill-prod` and adjust generated online files in the development branch.
- [x] Add tests that forbid online `main` references and unattended GitHub release writes.
- [x] Successful CI/packaging validation of [PR #243](https://github.com/focustimer-dev/go-hipster-go/pull/243). The publishing workflow was not executed as a test.
- [x] Document the caveat: older, already-installed Gemini instructions that link to `main` will not update retroactively. The Android/PWA installer currently fetches the entry from `main`, which is acceptable after the new entry points to `release/skill-prod`.
- [x] Merged [PR #243](https://github.com/focustimer-dev/go-hipster-go/pull/243), squash SHA `a99705fe1d2a16215cd3433bb936bee11a928a29`. Keep `release/skill-prod` stationary until a separately approved promotion.

**Stage 0 exit gate:** Previously published version remains available; no skill merge can automatically write GitHub release assets; new Gemini online-reference links resolve to stable production content. The explicit release workflow still requires separate approval, and promotion of `release/skill-prod` is **not** included in normal development merges.

## Roadmap

| Stage | Deliverable | Risk | Status |
| --- | --- | --- | --- |
| Stage 0 | Protect GitHub release publishing and stable Gemini online refs | Low–medium | [x] Complete — PR #243 |
| PR 1 | Baseline measurements + Gemini compatibility correction | Low | [ ] In progress |
| PR 2 | Deduplicate shared regional research instructions | Low–medium | [ ] Not started |
| PR 3 | Conditional reference loading + compact Gemini routing | Medium | [ ] Not started |
| PR 4 | Consolidate canonical instructions + lean public packaging | Medium | [ ] Not started |
| PR 5 | Regression review, reproducible bundles, release 3.11.6 | Release gate | [ ] Not started |

A checked PR means **merged with evidence**, not merely opened or green in one CI job.

## PR 1 — Baselines & safe Gemini compatibility fix

**Intent:** Get reliable before/after measurements and remove one known execution-environment mismatch before refactoring references.

- [x] Confirmed default-branch starting SHA `a99705fe1d2a16215cd3433bb936bee11a928a29`; published tag `gemini-skill-v3.11.5` resolves to `625941ab0e931230554393035df6b4b851783298`. All reviewed skill/plugin version declarations remain at 3.11.5.
- [x] Recorded tagged entry/reference byte counts, whitespace-word counts, four published ZIP asset sizes, and documented reference routing in [the 3.11.5 baseline](skill-optimization-baseline-3.11.5.md). Actual host token counts, invocation latency, and retrieval calls remain explicitly **unmeasured**.
- [x] Reviewed workflow triggers. Public skill release workflow is now manual-only; Cloudflare deploys require explicit marker or manual dispatch; Android Lab can run non-deploy CI on main pushes.
- [x] Replaced executable-only `lint-sequence` wording **in generated Gemini workflow and knowledge bundle**, preserving canonical CLI checks in hosts that support them.
- [x] Added Gemini-render regression check for unsupported `lint-sequence` command; distribution synchronization awaits CI confirmation.
- [ ] Run baseline tests and log failures honestly; distinguish a real regression from unrelated or flaky checks.

**Exit gate:** Build succeeds, all relevant automated tests pass or known pre-existing failures are recorded and adjudicated; no unrelated generated-file differences.

## PR 2 — Deduplicate regional material without losing evidence

**Intent:** Load a regional brief with less repeated text, while keeping all research data and provenance.

- [ ] Inventory baseline region files and the four addition files. Capture original row counts, IDs, source URLs, boundary notes, and file hashes where useful.
- [ ] Promote their identical regional safeguard prose into one authoritative shared policy in `references/regional-atlas.md`.
- [ ] Replace each repeated block with a short, unambiguous pointer, **retaining unique local boundary notes in place** (especially US East/West/Midwest/South).
- [ ] Consolidate repeated `Unreviewed; check semantic overlap before treating as a distinct route.` table notes; preserve individual overlap/relationship findings.
- [ ] Confirm that all **920 imported source entries** (720 baseline plus 200 additions, including overlaps) remain addressable under their stable handles.
- [ ] Verify all citation/source URLs and regional cross-references still resolve.
- [ ] Update tests to assert source-entry preservation rather than exact duplicated prose.

**Exit gate:** No lost research row, handle, link, boundary condition, or verified/unverified distinction; one- and multi-region regression cases pass.

## PR 3 — Load only the relevant references

**Intent:** Reduce unnecessary retrieval and initial context on real Jukebox prompts.

- [ ] Update `references/reference-index.md`: `global-scenes.md` is for unstructured, worldwide, or otherwise broad exploration; region-locked GO starts with the selected region files and sonic taxonomy, adding global scenes only when cross-scene research or weak candidates justify it.
- [ ] Do **not** delete US discovery routes without verifying equivalent information and source links survive in regional files or an optional research reference.
- [ ] Generate a compact trigger-to-filename table in the Gemini entry `SKILL.md`, sourced from the canonical routing rules rather than maintained as an independent copy.
- [ ] Include core workflow, sonic taxonomy, verification, and exactly relevant region/mode files; route GO HARD, Antarctica, de-cheese, cover art, recording quality, desire/triumph, funky, and c1 curves correctly.
- [ ] Keep `reference-index.md` packaged for compatibility; do not require an extra index hop when direct file routing is available.
- [ ] Test both Gemini's online adapter and packaged ZIP. Confirm every generated reference path and its link rewrite works.
- [ ] Compare observable retrieval calls/turns when possible; do not promise one-batch fetches when the host cannot batch.

**Exit gate:** Correct policy loaded for every tested command, no missing references, fewer unnecessary bytes/tokens in fixed regional scenarios, and no significant discovery regression.

## PR 4 — Canonical instruction and package cleanup

**Intent:** Reduce repeated operational instructions and ship only runtime-useful resources.

- [ ] Consolidate DeBarge rules into one authoritative core section; retain eligibility, exact 25-track behavior, randomness, count exceptions, publication boundaries, and related tests.
- [ ] Collapse repeated seeds/lenses/mood-angle explanation into compact, non-quota discovery policy.
- [ ] Shorten GO HARD and Antarctica dispatch summaries while keeping their full conditional references and critical exclusions.
- [ ] Make setup's authoritative contract unambiguous between `SKILL.md` and `skills/setup/SKILL.md`; keep commands first-class.
- [ ] Make the main ChatGPT entry a concise dispatcher where practical; move detailed examples to on-demand references, not to inaccessible files.
- [ ] Remove *development-only* files from the ChatGPT publication ZIP after checking no runtime imports, relative references, or package consumers require them.
- [ ] Update `scripts/build_agent_packages.py` and other generators and package tests together. Preserve the Claude and Gemini deliverables.
- [ ] Replace brittle exact-phrase tests with semantic/structural assertions where feasible; do not remove guardrails just to make tests green.

**Exit gate:** Commands, publishing, randomized exception, mood/tempo adherence, and source coverage remain correct. Generated package manifests and dependencies resolve.

## PR 5 — Release qualification & 3.11.6

**Intent:** Prove the optimized release is at least as reliable as the baseline, then prepare publication.

- [ ] Run the full Python test suite plus schema/playlist checks, package synchronization checks, ZIP builds, link validation, and Git whitespace checks.
- [ ] Run host-specific Gemini, ChatGPT, and Claude compatibility tests; distinguish offline package checks from live host validation.
- [ ] Compare representative musical cases *before vs. after*: ordinary GO, regional GO, multi-region GO, GO HARD, two moods, c1 curve, refresh, de-cheese, explicit Antarctica, rough-recording exclusion, transliteration, and publisher failure.
- [ ] Score qualitative cases for factual accuracy, regional fit, recording identity, originality, sequencing, voice, and constraint compliance. **Different track choices are allowed.**
- [ ] Verify the ChatGPT manifest, support and privacy links, onboarding, package icon/logo paths, and no secret/profile leakage.
- [ ] Synchronize version **3.11.6** in all canonical manifests and generated distributions.
- [ ] Generate a concise release report showing bytes, estimated tokens, reference loads, package sizes, test outcomes, remaining limitations, and linked PRs.
- [ ] Obtain release approval before any intentional public submission, distribution publication, tag, Android build, or PWA deployment.

**Exit gate:** All required checks pass, no material musical-quality regression, reproducible release bundles, explicit approval for publication.

## Mandatory behavior regression matrix

| Scenario | Minimum acceptance check | Evidence |
| --- | --- | --- |
| Ordinary GO | Real coherent playlist; requested count; unique credited leads | Pending |
| GO HARD | Deeper discovery, same constraints, no filler | Pending |
| Single-region GO | Correct regional provenance and verified recording-level fit | Pending |
| Multi-region GO | Plausible musical bridges; no region leakage | Pending |
| Two moods / c1 | Blended mood or correct ordered per-slot tempo and mood targets | Pending |
| Refresh | New compatible crate without silent changes to old one | Pending |
| De-cheese | Read-only unless changes are approved | Pending |
| Antarctica | Explicit opt-in only; penguin thematic contract; no inferred region | Pending |
| Skip rough recordings | No silent recording-quality relaxation | Pending |
| Non-Latin credits | Verified original script, transliteration, and qualified meaning | Pending |
| Publication unavailable | Preserve curated list; no false saved-state claims | Pending |
| DeBarge | True single-roll semantics and all eligible/exclusion cases | Pending |

## Baseline and outcome measurements

Fill these from reproducible tests. “Estimated tokens” is not a measurement of actual host usage.

| Metric | Baseline (3.11.5) | After | Evidence / notes |
| --- | --- | --- | --- |
| Canonical `SKILL.md` bytes | ~54.6 KB (GitHub file size, remeasure) | Pending | |
| Gemini entry size | ~6.8 KB (online adapter, remeasure) | Pending | |
| ChatGPT plugin ZIP size | Pending | Pending | |
| Gemini skill ZIP size | Pending | Pending | |
| Claude skill/plugin ZIP sizes | Pending | Pending | |
| Regional GO required files/bytes | Pending | Pending | |
| Open-ended GO required files/bytes | Pending | Pending | |
| GO HARD required files/bytes | Pending | Pending | |
| Reference-retrieval calls (where observable) | Pending | Pending | |
| Automated pass/fail count | Pending | Pending | |
| Musical-quality review | Pending | Pending | |

## Progress log

| Date | Stage | Change / evidence | Status |
| --- | --- | --- | --- |
| 2026-11-11 | Plan | Created the tracked implementation plan from combined ChatGPT/Gemini audits; no implementation or release performed. | Planning |
| 2026-11-11 | Preflight | Confirmed `gemini-skill-v3.11.5` release and identified an automatic release-upload workflow on pushes to `main`; Stage 0 added. | Planning |
| 2026-11-11 | Stage 0 | [PR #243](https://github.com/focustimer-dev/go-hipster-go/pull/243) passed validation and merged (`a99705fe`); published 3.11.5 assets unchanged. | Complete |
| 2026-11-11 | PR 1 | Baseline measurements saved to `docs/skill-optimization-baseline-3.11.5.md`; Gemini portable sequence-lint correction and regression test written. | In progress |

## How we update this file

1. When beginning a PR, add the branch/PR link to its stage and record the baseline relevant to it.
2. Mark individual tasks `- [x]` only after verifying the result; do not check off planned or attempted tasks.
3. If a gate fails, leave its checkbox unchecked and log the blocker and smallest safe fix.
4. After a PR merges, mark its roadmap status complete and append its merge SHA and test evidence to the progress log.
5. Before release, check every acceptance condition, record the actual final version and artifacts, and explicitly note anything not verified live.

**Release constraint:** This plan's existence is not authorization to merge, deploy, publish a skill, tag a release, or create playlists.
