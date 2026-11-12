# PR 5 — Release qualification evidence and host checks

**Candidate:** Go, Hipster, Go! after PR #251; still version **3.11.5** until the qualification gate.  
**Target if approved:** 3.11.6.  
**Baseline:** published `gemini-skill-v3.11.5` at `625941ab`.  
**Boundary:** no release tags/assets, no `release/skill-prod` promotion, no app deployment, no playlist writes without a separate user instruction.

## What is measurable offline

The **Validate skill** workflow runs the normal schema, local-reference, distribution-mirror, test and ZIP checks on Python 3.10, 3.12 and 3.13, followed by `python scripts/qualify_skill_release.py --check`.

That last script produces uncommitted local-only `dist/skill-release-qualification.json` and `dist/skill-release-qualification.md` with actual source/ZIP byte counts, candidate ZIP SHA-256 hashes and archive integrity checks. The **baseline ZIP figures are published GitHub release asset metadata**; they are not claimed to reproduce the historical ZIP exactly. Full-file reference-size comparisons are illustrative routing footprints, not real request latencies or token counts. Do not call a character count a token count.

The following must remain true: canonical and mirror SKILL files match; all manifest versions agree; all four archives contain expected runtime files and stable timestamps, without Python caches or the long development-only acceptance corpus; Gemini remains script-free; generated Gemini URLs target the frozen `release/skill-prod` reference and never moving `main`. The public release workflow remains manual-only.

## First candidate qualification — observed results (2026-11-12)

The latest PR 5 CI run at `e72a5431772942a6f2615d1048ea7f1bc0309dc8` passed on Python **3.10, 3.12 and 3.13**, with **187 unit/contract tests per job**, including public support/privacy links and a basic secret-signature check, and the offline qualification report green. [PR run](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43213737198) and [push run](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43213730200).

| Distribution | Published 3.11.5 asset bytes | Current candidate ZIP bytes | Difference |
| --- | ---: | ---: | ---: |
| ChatGPT plugin | 242,009 | 206,222 | −35,787 (−14.8%) |
| Claude plugin | 239,639 | 203,852 | −35,787 (−14.9%) |
| Claude skill | 236,252 | 200,262 | −35,990 (−15.2%) |
| Gemini Apps skill | 196,447 | 179,488 | −16,959 (−8.6%) |

These are actual CI-built ZIP byte measurements compared with **published historical 3.11.5 release asset metadata** (not a bit-for-bit rebuilt historical archive). The GitHub [3.11.5 release](https://github.com/focustimer-dev/go-hipster-go/releases/tag/gemini-skill-v3.11.5) still points to commit `625941ab0e931230554393035df6b4b851783298`. The production-reference branch remains frozen at `41a3d17a4f0c9b2809d3a9077ed950cbc4d044f1`; PR 5 has not changed it. The source repository's [support](support.md), [privacy](privacy.md) and [terms](terms.md) files exist on `main`. Live hosting or real music-service access was **not** exercised.

The 3.11.5 candidate version is intentional for pre-release testing. A new `3.11.6` tag, distribution upload, production branch promotion, external host installation or playlist creation would require separate approval.

## Isolated ChatGPT RC experiment — created, not yet exercised

On **2026-11-12**, a private personal plugin **Go, Hipster, Go! Lab** (`go-hipster-go-lab`) was created as version **3.11.6-rc.1** for controlled ChatGPT comparison. This is a **test identity**, not a released version, and it does not change canonical manifests or move `release/skill-prod`.

- **Input:** the ChatGPT candidate ZIP assembled by the PR 5 CI workflow at source commit `d5e1092cf649936d87f759c8bbed2ed098e398dc`. The canonical skill blob matches the merged PR 4 source `2d5216500c6349dbb92b688c76f7b6bc6b00a4ca`.
- **Transformation:** only test identity/metadata, label, onboarding name and skill directory namespace were changed; full research references, operational contracts and curation rules were retained. Local packaged test archive has **60 files**, **206,720 bytes**, SHA-256 `4c99c5052dceef3a60209cc46373189c1d12618b3d8bc62284c4ca3cfb4fa48c`.
- **Verification:** the Plugin Creator returned a **PRIVATE** personal plugin and re-read manifest `name=go-hipster-go-lab`, `version=3.11.6-rc.1`, and the isolated `skills/go-hipster-go-lab/SKILL.md` with matching metadata. The private plugin identifier and private access URL are intentionally **not** checked into the public repository.
- **Not proven:** user installation/selection in a ChatGPT session, actual skill retrieval, playback, catalog verification, playlist quality, or a baseline-vs-candidate difference. The user must explicitly select the **Lab** plugin in a fresh session and ask it to report its skill version before generating the crate. The original `go-hipster-go` plugin remains the 3.11.5 baseline.
- **Test prompt:** `Use Go, Hipster, Go! Lab: go funky hard; Regional exploration: Central America; Tempo: Mid; Recording preference: Skip rough recordings; Exactly 12 tracks, no exceptions; Text only; Do not publish.` Use the same substantive instructions as the original baseline sample, retaining a fresh conversation and no publishing. Compare contents using the existing [sourced 3.11.5 baseline audit](skill-pr5-central-america-funk-observed-audit.md).

This private test plugin does not replace, upload to, or promote the public skill. It must not be counted as a completed musical A/B until the full candidate output and loaded identity are observed.

## Host comparison protocol (not yet executed)

Use separate clean conversations with **explicitly verified installed versions**, identical briefs and comparable catalog/research access. The baseline is the published 3.11.5 installation. A local branch candidate must be loaded explicitly, never assumed from the currently installed public skill. Avoid changing playlists or real user accounts during evaluation; use `text only` unless a separate authorized publishing test has been approved.

Score each criterion **0 = fails**, **1 = partial/provisional**, **2 = passes**, or **N/T = not tested**. Capture the actual prompt, host, skill version, tools/reference files observed (where exposed), source evidence, actual tracks and any unresolved factual claims. Different track choices are normal; do not force a song-by-song match or call unsupported tracks verified.

| Scenario | Controlled prompt / action | Pass criterion | Offline coverage | Live result |
| --- | --- | --- | --- | --- |
| Ordinary GO | `go weird mid, text only, exactly 12 tracks, no exceptions` | Verified 12 real recordings, distinct credited leads, coherent surprising arc and credible musical hooks | Curation, publishing boundary, package tests | N/T |
| Single-region | `go funky hard, Regional exploration: Central America. Skip rough recordings. Text only. Exactly 12 tracks, no exceptions.` | Actual scene connections; correct source, recording-quality and HARD route | Regional inventory, GO HARD, quality references | **One ChatGPT output observed; conditional, not A/B.** [Sourced audit](skill-pr5-central-america-funk-observed-audit.md): 12/12 real track candidates, 1 miscredited performer, 9/12 from 3 compilations, 1 skip-rough concern; loaded skill version unknown. |
| Multi-region | `go sad desire, Regional exploration: US West, Oceania. Tempo: Slow. Text only. Exactly 12 tracks, no exceptions.` | Both selected regions respected; smooth/intentional bridges, blended moods | Regional routing, combined mood tests | N/T |
| GO HARD | Compare same brief with `go hard` and without it (both text only) | Deeper candidate research and stronger sequencing without quotas, fabricated audio or forced fillers | GO HARD contract | N/T |
| Tempo/mood curve | `go text only, c1:-2wd-1012a210-1s-2-10` | 12 per-position mood/tempo targets and preserved order | Curve tests | N/T |
| Refresh | After a text-only crate, say `refresh` | Distinct real candidates, same constraints, no reordering disguised as new playlist | Refresh contracts | N/T |
| De-cheese | `de-cheese` with supplied test crate | Read-only review, evidence-weighted fixes, explicit approval before writes | De-cheese dispatch tests | N/T |
| Antarctica | `go antarctica, text only`, then separate unselected ordinary GO | Explicit thematic penguin songs only; never inferred as a geographical scene or added by default | Polar opt-in tests | N/T |
| Recording quality | `go funky; skip rough recordings; text only; exactly 12 tracks` | No low-quality archival substitution or unsupported recording-quality assurance | Recording preference tests | N/T |
| Non-Latin credits | `go East Asia, text only, exactly 12 tracks, no exceptions` | Original artist/title script + defensible romanization + qualified English title meaning | Transliteration contract | N/T |
| Missing publisher | Review a genuine host environment lacking write permission, **do not invent one** | Full crate delivered, truthful `NOT CREATED` status, no saved URL or duplicate retries | Adapter/verification boundary tests | N/T |
| DeBarge | `invoke the DeBarge Protocol explicitly, text only`; ordinary GO must not force a hit | Exactly 25 identical recordings on explicit protocol; one true eligible roll or no claim, no leakage on non-hit | Core DeBarge/smoke tests | N/T |

### Quality scoring and release criteria

For music cases score **recording existence/identity, regional legitimacy, musical distinctiveness, sequencing, mood/tempo obedience, source honesty, editor voice and constraint compliance**. Separate subjective feedback from verified facts. Compare baseline and candidate on the same source availability. If neither has real music evidence, mark **N/T**, not passed. Preserve exact count only where explicitly non-overridable; otherwise the genuine DeBarge Protocol retains its exception. No genuine random facility means no spontaneous roll.

A material regression in recording truthfulness, permission boundaries, regional fidelity, artist uniqueness, sequencing or DeBarge rules **blocks the release** even if every static test passes.

### Publication and operational gates

- [ ] Python matrix and ZIP/static report confirmed on PR 5's final head.
- [ ] ChatGPT package/onboarding tested in a real host session.
- [ ] Gemini portable/online reference dispatch tested with actual current host capabilities.
- [ ] Claude plugin/skill selection and Spotify recovery tested with actual current host capabilities.
- [ ] Baseline and candidate musical scores obtained; major regressions resolved or explicitly documented as blockers.
- [ ] 3.11.6 versions synchronized only after qualification.
- [ ] A separately authorized release decision made. **No release tag or asset, production-reference promotion or app deployment as part of this qualification PR.**

**Current evaluation state:** automated checks passed. One real ChatGPT playlist *output* has been examined by independent discography references, but the loaded skill version and reference/tool exposure are **unknown** and no controlled baseline-vs-candidate comparison was completed. [Full 12-track audit](skill-pr5-central-america-funk-observed-audit.md). All remaining live-host comparisons are N/T; candidate release qualification is **not passed**.
