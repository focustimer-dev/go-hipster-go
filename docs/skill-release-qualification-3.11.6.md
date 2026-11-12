# PR 5 — Release qualification evidence and host checks

**Candidate:** Go, Hipster, Go! after PR #251; still version **3.11.5** until the qualification gate.  
**Target if approved:** 3.11.6.  
**Baseline:** published `gemini-skill-v3.11.5` at `625941ab`.  
**Boundary:** no release tags/assets, no `release/skill-prod` promotion, no app deployment, no playlist writes without a separate user instruction.

## What is measurable offline

The **Validate skill** workflow runs the normal schema, local-reference, distribution-mirror, test and ZIP checks on Python 3.10, 3.12 and 3.13, followed by `python scripts/qualify_skill_release.py --check`.

That last script produces uncommitted local-only `dist/skill-release-qualification.json` and `dist/skill-release-qualification.md` with actual source/ZIP byte counts, candidate ZIP SHA-256 hashes and archive integrity checks. The **baseline ZIP figures are published GitHub release asset metadata**; they are not claimed to reproduce the historical ZIP exactly. Full-file reference-size comparisons are illustrative routing footprints, not real request latencies or token counts. Do not call a character count a token count.

The following must remain true: canonical and mirror SKILL files match; all manifest versions agree; all four archives contain expected runtime files and stable timestamps, without Python caches or the long development-only acceptance corpus; Gemini remains script-free; generated Gemini URLs target the frozen `release/skill-prod` reference and never moving `main`. The public release workflow remains manual-only.

## Candidate qualification — latest offline results (2026-11-12)

The latest discovery-source candidate CI run at `5dc040eada03cfbe35107f977a173dc3399cf3e4` passed on Python **3.10, 3.12 and 3.13**, with **193 unit/contract tests per job**, including five focused discovery-exploration assertions, generated package sync, support/privacy links and a basic secret-signature check, and the offline qualification report green. [PR run](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43251042327) and [push run](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43251029347).

| Distribution | Published 3.11.5 asset bytes | Current candidate ZIP bytes | Difference |
| --- | ---: | ---: | ---: |
| ChatGPT plugin | 242,009 | 207,064 | −34,945 (−14.4%) |
| Claude plugin | 239,639 | 204,694 | −34,945 (−14.6%) |
| Claude skill | 236,252 | 201,104 | −35,148 (−14.9%) |
| Gemini Apps skill | 196,447 | 180,456 | −15,991 (−8.1%) |

These are actual CI-built ZIP byte measurements compared with **published historical 3.11.5 release asset metadata** (not a bit-for-bit rebuilt historical archive). The GitHub [3.11.5 release](https://github.com/focustimer-dev/go-hipster-go/releases/tag/gemini-skill-v3.11.5) still points to commit `625941ab0e931230554393035df6b4b851783298`. The production-reference branch remains frozen at `41a3d17a4f0c9b2809d3a9077ed950cbc4d044f1`; PR 5 has not changed it. The source repository's [support](support.md), [privacy](privacy.md) and [terms](terms.md) files exist on `main`. Live hosting or real music-service access was **not** exercised.

The 3.11.5 candidate version is intentional for pre-release testing. A new `3.11.6` tag, distribution upload, production branch promotion, external host installation or playlist creation would require separate approval.

## Isolated ChatGPT Lab RC1 — historical setup and completed A/B

On **2026-11-12**, a private personal plugin **Go, Hipster, Go! Lab** (`go-hipster-go-lab`) was created as version **3.11.6-rc.1** for controlled ChatGPT comparison. This is a **test identity**, not a released version, and it does not change canonical manifests or move `release/skill-prod`.

- **Input:** the ChatGPT candidate ZIP assembled by the PR 5 CI workflow at source commit `d5e1092cf649936d87f759c8bbed2ed098e398dc`. The canonical skill blob matches the merged PR 4 source `2d5216500c6349dbb92b688c76f7b6bc6b00a4ca`.
- **Transformation:** only test identity/metadata, label, onboarding name and skill directory namespace were changed; full research references, operational contracts and curation rules were retained. Local packaged test archive has **60 files**, **206,720 bytes**, SHA-256 `4c99c5052dceef3a60209cc46373189c1d12618b3d8bc62284c4ca3cfb4fa48c`.
- **Verification:** the Plugin Creator returned a **PRIVATE** personal plugin and re-read manifest `name=go-hipster-go-lab`, `version=3.11.6-rc.1`, and the isolated `skills/go-hipster-go-lab/SKILL.md` with matching metadata. The private plugin identifier and private access URL are intentionally **not** checked into the public repository.
- **Not proven:** user installation/selection in a ChatGPT session, actual skill retrieval, playback, catalog verification, playlist quality, or a baseline-vs-candidate difference. The user must explicitly select the **Lab** plugin in a fresh session and ask it to report its skill version before generating the crate. The original `go-hipster-go` plugin remains the 3.11.5 baseline.
- **Test prompt:** `Use Go, Hipster, Go! Lab: go funky hard; Regional exploration: Central America; Tempo: Mid; Recording preference: Skip rough recordings; Exactly 12 tracks, no exceptions; Text only; Do not publish.` Use the same substantive instructions as the original baseline sample, retaining a fresh conversation and no publishing. Compare contents using the existing [sourced 3.11.5 baseline audit](skill-pr5-central-america-funk-observed-audit.md).

This private plugin did not replace or promote the public skill. The listener subsequently supplied the full rc.1 Central America and Southern & Gulf outputs, reviewed below. The Lab has now been updated to private **rc.2**; the rc.1 details above remain historical for comparison.

## Gemini matching refinement — PR 5, offline verified

The Gemini-to-YouTube Music contract now keeps **clean ordered `Artist - Track Title` lookups**, official catalog spelling and diacritics, only essential mix/live/instrumental identifiers, and excludes release years, editorial annotations and generic `(Remastered)` suffixes. An altered spelling is a verified fallback only **after** a documented matching failure. Never substitute mood/genre-query generation for an exact requested track list. All these rules apply conditionally on an actually exposed exact-track playlist action, not an invented provider schema.

An initial Gemini playlist card **may show a partial preview**, including a listener-observed eight-of-twelve example. This is *not* a documented universal eight-item limit. [Google's official Gemini + YouTube Music help](https://support.google.com/gemini/answer/15237118) describes saving playlists via **Save to library** but does not specify how many items must appear in the initial preview. For a user-authorized GO or standalone `Publish`, preserve the existing playlist URI, use the actual save capability once when present, and audit all stored positions afterward if the full saved list is accessible. Mark unseen positions `unverified` rather than `missing` or `confirmed`; a save acknowledgment does not prove item fidelity. **No save for a text-only crate and no duplicate playlist.**

**Scope of proof:** Updated canonical policy, generated Gemini routing, on-demand Gemini Publish reference and one focused offline contract regression test. Python 3.10/3.12/3.13 completed **188 tests each**. No Gemini live create/save/readback was run here. This is a non-publishing candidate change; the public 3.11.5 and `release/skill-prod` references remain untouched.

## Private Lab rc.2 — source-diverse discovery candidate ready to test

The core discovery change follows the [discovery-engine plan](skill-pr5-discovery-engine-plan.md): GO HARD's **existing** candidate funnel now visits independent source paths before choosing finalists, looks back to original single/album recording identity, and makes widely exposed songs justify a slot against credible alternatives. It **does not** ban compilations, artists over a million plays or popular music, or create additional listener prompt fields, default research phases, source quotas or fake history. Five [new static regression tests](../tests/test_skill_discovery_exploration.py) protect these boundaries. Reference synchronization and four candidate package builds passed the full 193-test matrix.

**Installed private test version:** [Go, Hipster, Go! Lab](https://chatgpt.com/plugins/plugins_6af5b52ee0288191978cf11e3e9ba92f) — `go-hipster-go-lab` **3.11.6-rc.2**, updated from the source candidate at `5dc040eada03cfbe35107f977a173dc3399cf3e4`. The generated isolated archive has **60 files**, **207,672 bytes**, SHA-256 `a215c34982c20e87e9e39e5e8855d426a53996cf1f7fc293403f4ee3eb97abb5`. Plugin Creator confirmed a **PRIVATE** plugin release and independently returned the new Lab SKILL.md, GO HARD, taxonomy and verification reference text. **Host snapshot caveat:** The skill-read registry in this already-open conversation still returned the prior **rc.1** SKILL.md after the update, even though the plugin's current release and both root/nested manifests reported **rc.2**. Run rc.2 only in a **new chat with the Lab selected** and verify the shown version first; an existing conversation can remain on the old snapshot. None of these reads prove which musical reference files the new live ChatGPT session opened during curation.

[**Repeatable rc.2 test card**](skill-pr5-rc2-discovery-test.md): repeat the **exact same** Central America / GO HARD brief in a fresh Lab chat, confirming `3.11.6-rc.2` before starting, and run one ordinary `go weird mid` text-only regression. Compare real discography evidence, independently sourced selections, overlap, sequencing and honest recording-quality uncertainty with the 3.11.5 and rc.1 tracklists already recorded. **rc.2 Central America output supplied by listener and independently catalog-audited:** [12-track rc.2 audit](skill-pr5-rc2-central-america-audit.md) finds 12/12 traceable song identities, **6 countries**, **3/12 from one Soundway compilation**, **2/12 exact repeats of rc.1**, **0/12 exact repeats of published 3.11.5**. User-reported rc.2 label; the generating chat's version/read trace, audio/transfer and source-release originals for three historic tracks remain unverified. No playlist publication or production changes.

## Host comparison protocol (not yet executed)

Use separate clean conversations with **explicitly verified installed versions**, identical briefs and comparable catalog/research access. The baseline is the published 3.11.5 installation. A local branch candidate must be loaded explicitly, never assumed from the currently installed public skill. Avoid changing playlists or real user accounts during evaluation; use `text only` unless a separate authorized publishing test has been approved.

Score each criterion **0 = fails**, **1 = partial/provisional**, **2 = passes**, or **N/T = not tested**. Capture the actual prompt, host, skill version, tools/reference files observed (where exposed), source evidence, actual tracks and any unresolved factual claims. Different track choices are normal; do not force a song-by-song match or call unsupported tracks verified.

| Scenario | Controlled prompt / action | Pass criterion | Offline coverage | Live result |
| --- | --- | --- | --- | --- |
| Ordinary GO | `go weird mid, text only, exactly 12 tracks, no exceptions` | Verified 12 real recordings, distinct credited leads, coherent surprising arc and credible musical hooks | Curation, publishing boundary, package tests | **Two user-reported rc.2 outputs; conditional pass.** [First 12-track audit](skill-pr5-rc2-ordinary-go-audit.md) and [same-prompt repeatability audit](skill-pr5-rc2-ordinary-go-repeatability.md): 24 real artist–track slots, 3/12 exact song repeats, 4/12 artists repeated across independent samples, both constrained to 1978–84 without user era restriction. No writes; sound/latency/live-file reads N/T. One surgical freshness-policy change now being qualified separately. |
| Single-region | `go funky hard, Regional exploration: Central America. Skip rough recordings. Text only. Exactly 12 tracks, no exceptions.` | Actual scene connections; correct source, recording-quality and HARD route | Regional inventory, GO HARD, quality references | **Discovery variety improved in user-reported rc.2; conditional release hold.** [Three-output comparison and 12-track source audit](skill-pr5-rc2-central-america-audit.md): 6 countries; 3/12 drawn from one compilation, vs rc.1 10/12 across two; only 2 exact repeats from rc.1 vs rc.1's six from 3.11.5. Artist/title pairs traceable; exact producing skill snapshot, recording transfers, verified original singles and sonic sequencing remain untested. |
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

### Second GO HARD diagnostic — Southern & Gulf (private Lab, candidate only)

On 2026-11-12 the listener submitted the complete 12-track **"Leave Room for the Snare"** crate from the private 3.11.6-rc.1 Lab, with GO HARD, US South & Gulf, midtempo, skip rough, strict 12, text-only and no publishing. [Track-by-track sourced audit](skill-pr5-south-gulf-funk-lab-diagnostic.md).

**Observed:** 12/12 catalog-traceable song identities, 12 unique credited leads and broad Southern scenes. Four tracks share Soul Jazz's *New Orleans Funk* compilation, but the remaining eight come from other source paths; the Central America Lab had ten from two compilations. **One definite release-label ambiguity**: The Bar-Kays' *Son of Shaft* is a later *Black Rock* **expanded-edition bonus track**, not a cut from the original 1971 LP. Sonic midtempo, actual transfer quality and playback were not verified. This is **one candidate-only test**, not a same-region 3.11.5 A/B and not a measured candidate funnel. It supports preserving the optimized core while focusing corrective work on recording-version precision and provenance evidence instead of source quotas.

### Ordinary GO rc.2 — first listener-provided regression sample

On 2026-11-12 the listener supplied the complete **"Please Remain on the Dance Floor"** text-only `go weird mid` output from the Lab test sequence. [All 12 recordings and sourced evaluation](skill-pr5-rc2-ordinary-go-audit.md). **Passed** exact 12, unique lead credits, real recording identities, clear text-only boundary and distinctive dry writing. **Conditional** musical breadth: all twelve originally issued 1979–84, many central post-punk-funk/electronic canon records, and little unexplored musical distance beyond one cohesive lineage. Specific 12-inch/album/remix distinctions and a precise harmony-semitone claim remain unverified at playback level. No reliable timing or real reference-read evidence was supplied, so the ordinary fast-path performance itself remains **N/T**. Treat as **one user-reported rc.2 sample**, not proof of an installed version in the generating session.

**Second identical ordinary-GO run provided:** [*Please Hold for the Machine*](skill-pr5-rc2-ordinary-go-repeatability.md) produced 3/12 exact repeats and 4/12 repeated artists versus the earlier independent `go weird mid` run; both lists concentrated entirely in the late-1970s/early-1980s scene despite no era constraint. The skill's existing **Freshness procedure** now compares distinct audible mechanisms or scene families for open-ended ordinary GO and reconsiders a provisional canonical single-era lane before final selection. This is **one conditional check in the same single pass**, not new searches, quotas, mandatory input or the GO HARD funnel. Static test green; corrected behavior **not yet live-tested**. Overall release qualification remains **conditional/held**.

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

**Current evaluation state:** offline checks passed (193 per Python job). The listener supplied the original public 3.11.5 crate, the private rc.1 Central America crate, and a **user-reported rc.2** Central America crate; [rc.2 audit and three-sample comparison](skill-pr5-rc2-central-america-audit.md) show a strong reduction in compilation concentration and repeated exact tracks, with all twelve new candidates traceable to catalog sources. **Do not claim a proven skill-generated causal improvement** without live version/reference traces or additional runs. Sonic midtempo/sequence, transfer-quality exclusions, original singles for the vintage Soundway cuts and ordinary GO live behavior remain unverified. The [Southern & Gulf rc.1 diagnostic](skill-pr5-south-gulf-funk-lab-diagnostic.md) showed wider sources but one bonus-track edition issue. [Ordinary GO rc.2 diagnostic](skill-pr5-rc2-ordinary-go-audit.md) now shows real tracks, unique credits and voice intact but a canonical 1979–84 concentration; live latency/reference calls remain N/T. [Second ordinary-GO same-prompt audit](skill-pr5-rc2-ordinary-go-repeatability.md) confirms a recurring 1978–84 canon corridor (3 song repeats, 4 artist repeats across the two sets). A targeted **ordinary GO freshness correction** is now present in the candidate, pending a fresh Lab evaluation. Gemini and Claude live host checks are N/T; candidate release qualification is **not passed**.
