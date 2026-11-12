# PR 5 — Release qualification evidence and host checks

**Candidate:** Go, Hipster, Go! after PR #251; still version **3.11.5** until the qualification gate.  
**Target if approved:** 3.11.6.  
**Baseline:** published `gemini-skill-v3.11.5` at `625941ab`.  
**Boundary:** no release tags/assets, no `release/skill-prod` promotion, no app deployment, no playlist writes without a separate user instruction.

## What is measurable offline

The **Validate skill** workflow runs the normal schema, local-reference, distribution-mirror, test and ZIP checks on Python 3.10, 3.12 and 3.13, followed by `python scripts/qualify_skill_release.py --check`.

That last script produces uncommitted local-only `dist/skill-release-qualification.json` and `dist/skill-release-qualification.md` with actual source/ZIP byte counts, candidate ZIP SHA-256 hashes and archive integrity checks. The **baseline ZIP figures are published GitHub release asset metadata**; they are not claimed to reproduce the historical ZIP exactly. Full-file reference-size comparisons are illustrative routing footprints, not real request latencies or token counts. Do not call a character count a token count.

The following must remain true: canonical and mirror SKILL files match; all manifest versions agree; all four archives contain expected runtime files and stable timestamps, without Python caches or the long development-only acceptance corpus; Gemini remains script-free; generated Gemini URLs target the frozen `release/skill-prod` reference and never moving `main`. The public release workflow remains manual-only.

## Host comparison protocol (not yet executed)

Use separate clean conversations with **explicitly verified installed versions**, identical briefs and comparable catalog/research access. The baseline is the published 3.11.5 installation. A local branch candidate must be loaded explicitly, never assumed from the currently installed public skill. Avoid changing playlists or real user accounts during evaluation; use `text only` unless a separate authorized publishing test has been approved.

Score each criterion **0 = fails**, **1 = partial/provisional**, **2 = passes**, or **N/T = not tested**. Capture the actual prompt, host, skill version, tools/reference files observed (where exposed), source evidence, actual tracks and any unresolved factual claims. Different track choices are normal; do not force a song-by-song match or call unsupported tracks verified.

| Scenario | Controlled prompt / action | Pass criterion | Offline coverage | Live result |
| --- | --- | --- | --- | --- |
| Ordinary GO | `go weird mid, text only, exactly 12 tracks, no exceptions` | Verified 12 real recordings, distinct credited leads, coherent surprising arc and credible musical hooks | Curation, publishing boundary, package tests | N/T |
| Single-region | `go funky hard, Regional exploration: Central America. Skip rough recordings. Text only. Exactly 12 tracks, no exceptions.` | Actual scene connections; correct source, recording-quality and HARD route | Regional inventory, GO HARD, quality references | N/T |
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

**Current evaluation state:** automated preparation only; all live host and music-quality cells deliberately remain N/T.
