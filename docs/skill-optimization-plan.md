# Go, Hipster, Go! — Skill Optimization & Publication Readiness Tracker

**Status:** Stage 0 and PRs 1–3 completed; PR 4 in progress  
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
| PR 1 | Baseline measurements + Gemini compatibility correction | Low | [x] Complete — PR #244 |
| PR 2 | Deduplicate shared regional research instructions | Low–medium | [x] Complete — PR #246 |
| PR 3 | Conditional reference loading + compact Gemini routing | Medium | [x] Complete — PR #248 |
| PR 4 | Consolidate canonical instructions + lean public packaging | Medium | [ ] In progress (setup/ZIP foundation) |
| PR 5 | Regression review, reproducible bundles, release 3.11.6 | Release gate | [ ] Not started |

A checked PR means **merged with evidence**, not merely opened or green in one CI job.

## PR 1 — Baselines & safe Gemini compatibility fix

**Intent:** Get reliable before/after measurements and remove one known execution-environment mismatch before refactoring references.

- [x] Confirmed default-branch starting SHA `a99705fe1d2a16215cd3433bb936bee11a928a29`; published tag `gemini-skill-v3.11.5` resolves to `625941ab0e931230554393035df6b4b851783298`. All reviewed skill/plugin version declarations remain at 3.11.5.
- [x] Recorded tagged entry/reference byte counts, whitespace-word counts, four published ZIP asset sizes, and documented reference routing in [the 3.11.5 baseline](skill-optimization-baseline-3.11.5.md). Actual host token counts, invocation latency, and retrieval calls remain explicitly **unmeasured**.
- [x] Reviewed workflow triggers. Public skill release workflow is now manual-only; Cloudflare deploys require explicit marker or manual dispatch; Android Lab can run non-deploy CI on main pushes.
- [x] Replaced executable-only `lint-sequence` wording **in generated Gemini workflow and knowledge bundle**, preserving canonical CLI checks in hosts that support them.
- [x] Added Gemini-render regression check for unsupported `lint-sequence` command; distribution synchronization awaits CI confirmation.
- [x] Validated [PR #244](https://github.com/focustimer-dev/go-hipster-go/pull/244) successfully on Python 3.10, 3.12, and 3.13, then merged as `dffaf69e67a854d9305e5b7bb36ceeaf179335d6`. The only observed Stage 0 failures were two obsolete tests expecting automatic releases; both were corrected before Stage 0 merged.

**Exit gate:** Build succeeds, all relevant automated tests pass or known pre-existing failures are recorded and adjudicated; no unrelated generated-file differences.

## PR 2 — Deduplicate regional material without losing evidence

**Intent:** Load a regional brief with less repeated text, while keeping all research data and provenance.

- [x] Inventoried 32 regional files: 24 baseline × 30 leads, four additions × 50 leads, plus four special guides. Recorded reproducible research-section fingerprints in `tests/test_regional_research_preservation.py`.
- [x] Retained the complete shared safeguards in `references/regional-atlas.md` and explicitly made them authoritative for all regional guides.
- [x] Replaced the identical 217-word block in 24 baseline files with a short atlas pointer; preserved unique regional boundary notes, including US East/West and separate Midwest/South guides.
- [x] Replaced 171 identical relationship-cell warnings across four additions tables with `Unreviewed`; preserved individually documented overlaps and defined the status once in the atlas.
- [x] Preservation tests confirm **920 imported source entries** remain addressable: 720 baseline + 200 additions. Frozen fingerprints also verify all 32 research/source sections (including Drive URLs) are unchanged.
- [x] Existing regional reference/link checks passed in `Validate skill` (Python 3.10, 3.12, 3.13). Research sections and source links match frozen fingerprints. Live external URL availability was not checked.
- [x] Added `tests/test_regional_research_preservation.py` for original research content, 920 stable IDs and centralized safeguard policy; the revised test passed all three Python CI jobs.

**Exit gate:** No lost research row, handle, link, boundary condition, or verified/unverified distinction; one- and multi-region regression cases pass.

**Measured cleanup:** Each generated ChatGPT/Gemini knowledge bundle went from 461,104 → 415,165 and 445,360 → 399,421 characters respectively (**45,939 characters removed per bundle**, ~10.0% and ~10.3%). These are text-length measurements, **not measured model tokens, latency, or host retrieval-call reductions**. Cross-platform package ZIP size will be measured in the final release stage.

## PR 3 — Load only the relevant references

**Intent:** Reduce unnecessary retrieval and initial context on real Jukebox prompts.

- [x] Updated `references/reference-index.md` and canonical `SKILL.md` so region-locked GO starts with taxonomy, verification, atlas and selected regions; `global-scenes.md` is conditional on open-ended/worldwide work, weak candidates or a genuinely needed cross-scene bridge.
- [x] Preserved `references/global-scenes.md` unchanged, including its US routes and their research links. No region-specific source file was deleted or altered in PR 3.
- [x] Generated a compact direct routing contract from `scripts/build_gemini_app_skill.py`, using the existing atlas labels and deterministic label→ID normalization with explicit exceptions. All 27 atlas IDs are covered by tests, without duplicating the 27-row map in the entry.
- [x] Direct Gemini routing names core workflow, taxonomy and verification; selected regions and additions; GO HARD, Antarctica, de-cheese, Publish, cover art, recording quality, Desire/Triumphant, funky and `c1:` curve; the full details remain in the workflow and references.
- [x] Kept `reference-index.md` packaged as a fallback; the Gemini entry no longer requires it before each new GO. Moved creative/setup detail into the always-loaded workflow to retain the 6.5 KB entry budget.
- [x] [PR #248](https://github.com/focustimer-dev/go-hipster-go/pull/248) passed `Validate skill` on Python 3.10, 3.12 and 3.13, including generated-file synchronization, portable ZIP/link checks, Gemini entry length <6.5 KB and all 27 region-label routing cases. Merge SHA `3a6330ea8b2497787eb7a5a1fa4439766cb575dc`.
- [x] Recorded *potential* eliminated reads: the original global-scenes file is 31,310 UTF-8 bytes / 3,555 words; an extra index lookup may also be avoided when direct routing is supported. These are **not measured** network fetches, token usage, elapsed time or one-turn batch performance. Live Gemini/ChatGPT observability is deferred to PR 5.

**Exit gate:** Correct policy loaded for every tested command, no missing references, fewer unnecessary bytes/tokens in fixed regional scenarios, and no significant discovery regression.

**PR 3 measurement note:** Gemini's generated online entry increased from approximately 6.9k to 7.3k characters because of embedded dispatch information; the **portable** entry remains below its tested 6.5 KB cap. The full global-scenes and index files are still packaged. The optimization is on-demand *selection*, not a reduction in total research or proof of fewer host retrieval turns.

## Post-PR 3 cohesion audit (pre-PR 4)

- [x] Cross-checked canonical GO, reference-index routing, 27 atlas IDs, generated Gemini direct dispatch, and the 3.11.5 production-link boundary. Existing PR 3 tests enforce static sync; live host loading remains unmeasured.
- [x] Corrected `adapters/chatgpt/SMOKE_TEST.md`: a normal six-track target does **not** suppress an eligible DeBarge random result; an explicitly rigid count does. Added a regression check and distinct manual scenario.
- [x] Restored chronological PR 2 → PR 3 ordering in this log.
- [ ] PR 4: clarify host-specific setup precedence. ChatGPT/Claude's Spotify preference and Gemini's documented YouTube Music default must not silently overwrite an explicit listener choice.
- [ ] PR 4: review runtime links before removing packaged evaluation fixtures. `SKILL.md` currently links to `tests/discovery-cases.md`; removing it without redirecting that link would break the bundle.

This audit does not establish measured host latency, live music quality, or publishing capability and does not approve release, branch promotion, or app deployment.

## PR 4 — Canonical instruction and package cleanup

**Intent:** Reduce repeated operational instructions and ship only runtime-useful resources.

**Preflight:** See [PR 4 runtime package inventory](skill-pr4-package-audit.md). Setup defaults and ZIP metadata are aligned; the linked 54 KB development acceptance corpus has been replaced in runtime ZIPs with `references/evaluation-smoke.md` while the full source corpus remains intact in the repository. Canonical rule consolidation and the PR 4 full exit gate remain outstanding.

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
| 2026-11-11 | PR 1 | [PR #244](https://github.com/focustimer-dev/go-hipster-go/pull/244) merged (`dffaf69e`); 3 Python CI jobs passed; baseline documented and Gemini script-only linter removed from generated policy. | Complete |
| 2026-11-11 | PR 2 | [PR #246](https://github.com/focustimer-dev/go-hipster-go/pull/246) merged as `122fb3a28453873c65f2599f2d9be48b23ecb2c3`. All 920 source entries and source-section fingerprints preserved; Python 3.10/3.12/3.13 CI passed. 45,939 fewer characters in each generated ChatGPT and Gemini knowledge bundle. No live curation/publishing test. | Complete |
| 2026-11-11 | PR 3 | [PR #248](https://github.com/focustimer-dev/go-hipster-go/pull/248) merged (`3a6330ea`), all three Python CI environments green; Gemini direct route and conditional global scenes verified statically, full research retained. Real host latency and musical quality not measured. | Complete |

## How we update this file

1. When beginning a PR, add the branch/PR link to its stage and record the baseline relevant to it.
2. Mark individual tasks `- [x]` only after verifying the result; do not check off planned or attempted tasks.
3. If a gate fails, leave its checkbox unchecked and log the blocker and smallest safe fix.
4. After a PR merges, mark its roadmap status complete and append its merge SHA and test evidence to the progress log.
5. Before release, check every acceptance condition, record the actual final version and artifacts, and explicitly note anything not verified live.

**Release constraint:** This plan's existence is not authorization to merge, deploy, publish a skill, tag a release, or create playlists.
