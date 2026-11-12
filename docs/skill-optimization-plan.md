# Go, Hipster, Go! — Skill Optimization & Publication Readiness Tracker

**Status:** Stages 0 through PR 5 engineering work merged; public 3.11.6 release gate remains open (no publication authorized)  
**Target release:** 3.11.6 (maintenance/polish)  
**Baseline release:** 3.11.5 (reconfirm on PR 1)  
**Repository:** focustimer-dev/go-hipster-go  
**Last reviewed:** 2026-11-12  
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
| PR 4 | Consolidate canonical instructions + lean public packaging | Medium | [x] Complete — PR #251, merged `3f169c4` |
| PR 5 | Qualification infrastructure and private candidate review (no public release) | Engineering merge | [x] PR #252 merged as `3c2f2a9d`; offline green and rc.3 listener signal provisional; public 3.11.6 host/release gate separate |

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
- [x] PR 4 clarified host-specific setup precedence: ChatGPT/Claude Spotify preference versus Gemini's YouTube Music default; explicit listener choices remain authoritative.
- [x] PR 4 redirected the runtime evaluation link to `references/evaluation-smoke.md` before removing the mirrored development-only corpus; full source tests remain in repository `tests/`.

This audit does not establish measured host latency, live music quality, or publishing capability and does not approve release, branch promotion, or app deployment.

## PR 4 — Canonical instruction and package cleanup

**Intent:** Reduce repeated operational instructions and ship only runtime-useful resources.

**Preflight:** See [PR 4 runtime package inventory](skill-pr4-package-audit.md). Setup precedence, packaging, compact discovery/DeBarge dispatch and the Claude recovery reference have been aligned. The linked 54 KB acceptance corpus remains in repository tests, not in runtime ZIPs. The PR 4 offline exit gate passed; live host/playlist comparisons belong to PR 5.

- [x] Retained DeBarge eligibility, genuine single roll, exact 25 repeated entries, rigid-count/Antarctica exclusions and non-trigger isolation in one core section; Count fidelity now references it without repeating the rule. Added scoped structural regression coverage.
- [x] Consolidated seed semantics, optional discovery lenses, mood angles and candidate-pool freshness into shorter coherent paragraphs; preserved explicit regional/tempo/mood precedence and Criminal story-evidence requirements.
- [x] Kept GO HARD as a compact conditional dispatch and shortened Antarctica's canonical dispatch while preserving every opt-in, shuffle, global-selection and DeBarge exclusion; its full reference remains unchanged.
- [x] Clarified the standalone ChatGPT/Claude Spotify setup boundary versus Gemini's generated YouTube Music default; all setup commands remain first-class and explicit listener choices override defaults.
- [x] Shortened canonical GO source and moved Claude/Spotify error and saved-state troubleshooting into the mirrored, packaged `references/claude-spotify-recovery.md` reached through a short host-specific dispatch. Other important standalone skill contracts remain in canonical instructions.
- [x] Remove the mirrored 54 KB development acceptance corpus from ChatGPT/Claude runtime ZIPs after redirecting the canonical runtime link to `references/evaluation-smoke.md`; preserve the full test corpus in repository `tests/`.
- [x] Updated ChatGPT/Claude/Gemini ZIP generators, manifests, knowledge mirrors and tests together; all four archives pass deterministic hash-rebuild checks.
- [x] Replaced the obsolete mirrored full-test-corpus equality check with package/reference-presence assertions, added a section-scoped central DeBarge check and verified recovery details in their actual on-demand source. Retained strict negative/eligibility test guards where relaxing them could hide regressions.

**PR 4 offline evidence:** [PR #251](https://github.com/focustimer-dev/go-hipster-go/pull/251) passed `Validate skill` on Python 3.10, 3.12 and 3.13 at final head `118ccd3719c113332d3e99128bdbd5aa6c097173` (push and PR runs) and merged to `main` as `3f169c4ea6e9a2a88d0db505e0cc84c157d2f99f`. Full portable package builds, reference/link checks, generated-file sync and deterministic two-build SHA-256 checks passed. No real host retrieval times, actual musical quality or music-service writes were measured.

**Observed source bytes (main before PR 4 → PR #251 draft):** canonical `SKILL.md` 54,742 → 51,701 (**−3,041**, 5.6%); Gemini `GEM_KNOWLEDGE.md` 403,177 → 401,120 (**−2,057**, 0.5%); full ChatGPT Project snapshot 417,529 → 418,304 (**+775**, 0.2%) because it includes the newly separated recovery reference. Gemini online entry remains 7,284 bytes. Actual compressed ZIP sizes await PR 5 reproducible release comparison; a smaller runtime source is not proof of lower host latency.

**Exit gate:** Commands, publishing, randomized exception, mood/tempo adherence, and source coverage remain correct. Generated package manifests and dependencies resolve.

## PR 5 — Release qualification & 3.11.6

**Intent:** Prove the optimized release is at least as reliable as the baseline, then prepare publication.

**PR 5 first gate (in progress):** [qualification protocol and live-host scorecard](skill-release-qualification-3.11.6.md), plus `scripts/qualify_skill_release.py` and its regression tests. Offline builds now report measured candidate ZIP sizes, SHA-256 hashes, version parity and release isolation, alongside published 3.11.5 **asset-metadata** comparisons. CI runs this measurement without any release/upload action. Live host/playlist quality checks remain **not tested**, and version stays **3.11.5** until later qualification.


- [x] PR 5 offline matrix passed on Python 3.10/3.12/3.13: **193 tests per job** including five discovery-source contract checks, package sync, playlist/schema validation, four reproducible ZIP builds, reference validation and local qualification report ([PR run 43251042327](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43251042327) and push run 43251029347 at source commit `5dc040ea`). **Recheck on the final head** after further changes; live host and listening tests remain separate gates.
- [ ] Run host-specific Gemini, ChatGPT, and Claude compatibility tests; distinguish offline package checks from live host validation.
- [ ] Compare representative musical cases *before vs. after*: ordinary GO, regional GO, multi-region GO, GO HARD, two moods, c1 curve, refresh, de-cheese, explicit Antarctica, rough-recording exclusion, transliteration, and publisher failure.
- [ ] Score qualitative cases for factual accuracy, regional fit, recording identity, originality, sequencing, voice, and constraint compliance. **Different track choices are allowed.**
- [ ] Verify the ChatGPT manifest, support and privacy links, onboarding, package icon/logo paths, and no secret/profile leakage.
- [ ] Synchronize version **3.11.6** in all canonical manifests and generated distributions.
- [ ] Generate a concise release report showing bytes, estimated tokens, reference loads, package sizes, test outcomes, remaining limitations, and linked PRs.
- [ ] Obtain release approval before any intentional public submission, distribution publication, tag, Android build, or PWA deployment.

**Exit gate:** All required checks pass, no material musical-quality regression, reproducible release bundles, explicit approval for publication.

**First observed ZIP measurements:** Published 3.11.5 release assets → PR 5 candidate: ChatGPT 242,009 → 206,222 bytes (−14.8%); Claude plugin 239,639 → 203,852 (−14.9%); Claude skill 236,252 → 200,262 (−15.2%); Gemini Apps 196,447 → 179,488 (−8.6%). Source and ZIP sizes are not token/host-latency measurements. See [qualification evidence](skill-release-qualification-3.11.6.md). Gemini reference production branch is unchanged.

**Post-review disposition (2026-11-12):** The 3.11.5 enhancement proposal was reconciled against the current candidate. Independent-source GO HARD exploration and ordinary-GO freshness are already addressed experimentally; no familiarity tiers, fixed compilation limits, date-only routing, depth dial or extra default research phase will be introduced. One concrete low-risk routing inconsistency (sonic taxonomy's global-scenes default) was corrected in merged PR #252. The remaining Gemini thematic-generation contradiction, publication-status/schema vocabulary, and host-specific/mobile assertions are **release-readiness follow-ups** rather than hidden claims of completion; inspect and resolve on an evidence-based release PR. PR #252 was merged as `3c2f2a9d` after successful CI; that qualification-code merge is distinct from public 3.11.6 approval.\n\n**PR 5 hold point:** No automatic version bump, GitHub Release, tag, distribution asset upload, `release/skill-prod` branch update, Android/PWA deployment, or streaming-service write. A green offline report does **not** satisfy the live host and musical-quality gates.

## Mandatory behavior regression matrix

| Scenario | Minimum acceptance check | Evidence |
| --- | --- | --- |
| Ordinary GO | Real coherent playlist; requested count; unique credited leads | Earlier rc.2 runs: 3/12 exact repeats and a 1978–84 canon lane. Listener's *The Floor Tilts at Walking Speed* (provisionally attributed to rc.3) has 12 distinct leads, no repeats against the prior two outputs, and a wider scene mix; version/read trace and playback still unverified. [Release scorecard](skill-release-qualification-3.11.6.md). |
| GO HARD | Deeper discovery, same constraints, no filler | [rc.2 Central America observed audit](skill-pr5-rc2-central-america-audit.md) documents **12/12 traceable tracks, 6 countries, 2/12 exact rc.1 overlaps** (previous A/B had 6/12) and **3/12** from one Soundway compilation. Qualitative discovery improvement, but version trace, audio, independent original issues and actual reference-file usage remain unverified. [Five static discovery tests](../tests/test_skill_discovery_exploration.py) passed; no release clearance. |
| Single-region GO | Correct regional provenance and verified recording-level fit | [Three-version Central America comparison](skill-pr5-rc2-central-america-audit.md) supports much broader **user-reported rc.2** selection: 6 countries, 3/12 from one Soundway release, 2 exact rc.1 repeats and none from 3.11.5. All 12 artist/title pairs sourced; edition originals, transfer cleanliness and actual sound still pending. [Southern/Gulf Lab-only diagnostic](skill-pr5-south-gulf-funk-lab-diagnostic.md) preserved for separate regional contrast. |
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
| ChatGPT plugin ZIP size | 242,009 B published asset | 206,222 B built candidate | −14.8%; published asset metadata vs fresh CI build |
| Gemini skill ZIP size | 196,447 B published asset | 179,488 B built candidate | −8.6%; not host retrieval |
| Claude skill/plugin ZIP sizes | 236,252 / 239,639 B published | 200,262 / 203,852 B candidate | −15.2% / −14.9% |
| Regional GO required files/bytes | Pending | Pending | |
| Open-ended GO required files/bytes | Pending | Pending | |
| GO HARD required files/bytes | Pending | Pending | |
| Reference-retrieval calls (where observable) | Pending | Pending | |
| Automated pass/fail count | Historical release not rerun | **194 Python tests per job, 3/3 CI green** at `b6b9ab78` | PR #252 discovery + ordinary freshness gate; rc.3 music N/T |
| Musical-quality review | Pending | Pending | |

## Progress log

| Date | Stage | Change / evidence | Status |
| --- | --- | --- | --- |
| 2026-11-12 | PR 5 engineering qualification merged | [PR #252](https://github.com/focustimer-dev/go-hipster-go/pull/252) green on Python 3.10/3.12/3.13 at final head; squash merge `3c2f2a9d7643c296c81da90a78b9f3a647185b3c`. Candidate freshness and verification changes landed; version remains 3.11.5, `release/skill-prod` and public plugin untouched. | Engineering phase complete; publication gate and live host checks not complete |\n| 2026-11-12 | New ordinary GO listener output and final proposal triage | *The Floor Tilts at Walking Speed*: 12 unique credited leads, zero exact repeats across two prior ordinary-GO outputs, much broader scene selection; provenance/version/read trace and playback N/T. Small taxonomy routing correction scoped to already-conditional global research. Outstanding publication-schema/host status alignment tracked for the release gate; not a reason to add depth controls or quotas. | Encouraging provisional rc.3 signal; release remains held |\n| 2026-11-12 | PR 5 private Lab rc.3 for ordinary GO | [Repeatability audit and test card](skill-pr5-rc2-ordinary-go-repeatability.md): single freshness-rule tweak and one regression test, all distributed skill mirrors updated, **194/194 tests per Python job** at [run 43280564958](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43280564958); [private Lab rc.3](https://chatgpt.com/plugins/plugins_6af5b52ee0288191978cf11e3e9ba92f) updated and verified. | Static green, live rc.3 outcome pending; production unchanged |
| 2026-11-12 | PR 5 ordinary GO repeatability / canon lane | [Second same-prompt audit](skill-pr5-rc2-ordinary-go-repeatability.md) found 3/12 repeated exact tracks, 4/12 repeated artists and the same 1978–84 post-punk/synth corridor. Updated **one existing taxonomy freshness step** and added **one static regression test**; no extra ordinary GO searches or Jukebox fields. | CI green for code commit; live rc.3 test pending, release held |
| 2026-11-12 | PR 5 rc.2 ordinary GO sample | [Sourced 12-track review](skill-pr5-rc2-ordinary-go-audit.md) for `go weird mid`: accurate credits/count, dry voice and coherent post-punk/electro arc; all recordings released 1979–84, too dependent on familiar scene landmarks for broad unprompted weird discovery. Producing-session version/file-read and audible tempos unverified. | Conditional content pass; no skill changes, release still held |
| 2026-11-12 | PR 5 rc.2 Central America observed playlist | [Complete 12-track audit](skill-pr5-rc2-central-america-audit.md): only 2/12 exact overlap with rc.1 (vs its prior 6/12 repeat baseline); Soundway collection reduced to 3/12; six countries and 12 traceable track identities. User did not supply generating-chat version readout; no transfer/audio or original single verification for Soundway trio. | Discovery gain documented; release held, ordinary GO still pending |
| 2026-11-12 | PR 5 discovery rc.2 test-ready | Three reference files strengthened without app/Jukebox fields; mirrors and knowledge bundles synchronized; [5 regression tests](../tests/test_skill_discovery_exploration.py) added. CI **193/193 tests per Python job** (3.10/3.12/3.13) at `5dc040ea`. [PRIVATE Lab 3.11.6-rc.2](https://chatgpt.com/plugins/plugins_6af5b52ee0288191978cf11e3e9ba92f) updated and package files verified; [identical-prompt test protocol](skill-pr5-rc2-discovery-test.md) ready. | Static green; live audition pending, release held |
| 2026-11-12 | PR 5 discovery-engine reframe | [Discovery engine plan](skill-pr5-discovery-engine-plan.md) treats reference files, original-release provenance, exposure scrutiny, multi-path exploration and cross-session repeat state as **skill responsibilities**, not fields the listener must enter. Real host retrieval still unmeasured; no speculative source-usage claims. | Design documented; behavior not yet changed |
| 2026-11-12 | PR 5 Gemini publish fidelity | [Gemini candidate contract](skill-release-qualification-3.11.6.md): exact ordered catalog spelling/version lookups, no theme-query substitution, preview-versus-save distinction, full-position audit only after authorized save, no duplicate/text-only write. 188 offline tests per Python version passed; live Gemini save remains N/T. | Offline green; live pending |
| 2026-11-12 | PR 5 Southern & Gulf Lab diagnostic | [Second 12-track sourced audit](skill-pr5-south-gulf-funk-lab-diagnostic.md): broader source paths than Central America Lab, 4/12 songs on one Soul Jazz compilation, one *Black Rock* expanded-bonus attribution issue. Tempo/clean transfers not heard; no same-region baseline. | Candidate-only conditional; release held |
| 2026-11-12 | PR 5 ChatGPT A/B | [A/B comparison](skill-pr5-central-america-funk-ab-comparison.md) now records listener's public 3.11.5 versus private Lab 3.11.6-rc.1 output with identical brief. Both 12 real recordings; new candidate broadens geography but relies on one Soundway compilation for 6/12 and two compilations for 10/12; transfer fidelity unverified. | Conditional; release held |
| 2026-11-12 | PR 5 ChatGPT one-output audit | [Central America Funk source audit](skill-pr5-central-america-funk-observed-audit.md): all 12 tracks found in catalog, one performer miscredit, high compilation concentration, possible skip-rough issue. Loaded skill version unavailable; not an A/B result. | Conditional; release held |
| 2026-11-12 | PR 4 merged | [PR #251](https://github.com/focustimer-dev/go-hipster-go/pull/251) passed all three Python CI jobs at latest head and merged as `3f169c4ea6e9a2a88d0db505e0cc84c157d2f99f`; no release/deployment. | Complete |
| 2026-11-12 | PR 5 initiated | Branched after PR 4; added offline ZIP/source measurement script, regression tests and controlled live-host qualification matrix. Version remains 3.11.5; live results N/T. | In progress |
| 2026-11-12 | PR 5 offline first gate | [Draft PR #252](https://github.com/focustimer-dev/go-hipster-go/pull/252) passed Python 3.10/3.12/3.13 (188 tests each) and local qualification report. Four candidate ZIPs measured vs preserved 3.11.5 asset metadata; real host tests remain N/T. | Offline passed; live pending |
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
