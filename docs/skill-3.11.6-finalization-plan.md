# Go, Hipster, Go! — 3.11.6 finalization implementation plan

**Status:** Gates 0–2 merged. Gate 3 found two concrete Gemini host artifacts and is implementing the narrow PR C correction. Actual host acceptance remains Gate 4; public 3.11.6 release is not approved.  
**Owner/source of truth:** this checklist; record results here after each gate.  
**Created:** 2026-11-12. **Target:** maintenance release 3.11.6.  
**Starting point:** PR #252 (`3c2f2a9d`) and documentation closeout PR #253 (`777891be`) merged into `main`. Public skill and `release/skill-prod` remain at 3.11.5. Private Lab rc.3 is an experimental snapshot, not the public release.

[Current qualification evidence](skill-release-qualification-3.11.6.md) · [post-3.11.5 triage](skill-post-3.11.5-review-triage.md) · [earlier optimization tracker](skill-optimization-plan.md)

## Working contract: smallest change that resolves an observed failure

- **One concern per PR; sequential merges.** Run existing `Validate skill` (Python 3.10, 3.12, 3.13) on every PR. Only rerun extra/manual checks for the behavior changed. Require a green **final head**, a reviewed diff, and an independently reversible squash merge.
- **Edit the canonical source and generators first.** Rebuild ChatGPT/Claude/Gemini mirrors using `scripts/build_agent_packages.py`; never patch generated knowledge files alone. Keep 920 regional source entries and provenance fingerprints intact.
- **Do not regress:** exact real recordings, unique credited leads, credible sonic notes, ordinary-GO one-pass performance, GO HARD independent research paths, source-specific recording/edition honesty, two-mood/tempo curves, non-Latin credits, recording-quality exclusions, refresh, De-cheese, Antarctica opt-in, the genuine single-roll DeBarge exception, or the record-shop voice.
- **No false publication:** explicit `text only` never writes; no provider or capability inferred from a typed app mention; no silent service switch, theme substitution, duplicate save, reroll, or claimed track-level readback from a card preview.
- **No growth for its own sake:** no depth dial, F0–F3 quotas, artist blacklist, forced country/decade/label mix, date-based rotation, universal extra candidate pass, wide host-policy extraction, or new Jukebox controls. Provider-specific preflight only when a real writer/search interface supports it.
- **Release isolation:** all implementation PRs target `main`; do not touch `release/skill-prod`, public plugin, release assets, Android, PWA, or streaming accounts without a separately explicit release/test authorization. CI must not deploy or publish on push/PR.

## Ordered execution — no skipping gates

| Gate | Deliverable | Audit / proof needed | Exit |
| --- | --- | --- | --- |
| **0. Freeze and inventory** | Read-only contract map and baseline | Capture `main`, `release/skill-prod` and 3.11.5 tag SHAs; inspect all actual host instruction paths, old schema clients/fixtures, current CI/release triggers and known N/T scores | Exact file/test list, contradictions and rollback snapshot recorded before editing |
| **1. PR A — Gemini publishing contract** | Resolve exact-track versus thematic-generation conflict | Cross-host instruction diff, no ChatGPT composer text in Gemini, no auto thematic fallback, `Publish` works on existing URI only, no unauthorized write | One canonical default and consistent runtime mirrors; focused tests + full CI green |
| **2. PR B — result states + compatibility** | Unify evidence-based user status and counts without breaking playlist 1.0 | JSON Schema ↔ CLI validator ↔ fixture parity; six outcome fixtures; count/order/version reconciliation; legacy 1.0 roundtrip | Old artifacts still validate; new statuses never overclaim |
| **3. PR C — narrow host/mobile audit** | Only evidenced fixes for host routing, output readability, matching and count retention | Android-size manual render; non-Latin layout; 12-slot and DeBarge cases; service-specific lookup only if available; no unnecessary network work | No material curation/latency regression; tests document each actual fix |
| **4. Candidate acceptance** | One frozen candidate and reviewable evidence report | Final CI/ZIP/security/reference audit; limited fresh-host QA; source/listening spot checks; explicit N/T and release risks | Release blockers resolved or explicitly left as blockers—never relabeled pass |
| **5. PR D — version/release preparation** | Synchronize 3.11.6 manifests, builder and qualification tests; reproducible archives | Candidate-to-tag SHA, four ZIP SHA-256 hashes, frozen-baseline comparison, production-link and release-trigger audit | Versioned candidate is ready to *ask for* publication approval; no publication |
| **6. Explicit release gate** | Approval-gated production promotion and distribution | Confirm approved SHA/rollback ref; promote stable reference branch; verify raw URLs; manual new-version GitHub release; artifact/host smoke checks | Public release verified, or stop and roll back via a separately authorized change |

### Gate 0 — snapshot and conflict audit (no feature PR)

- [x] Record the pre-PR-A `main`, `release/skill-prod` and `gemini-skill-v3.11.5` SHAs; preserve prior production SHA and the four release-reported ZIP metadata/digests. See [Gate 0 audit](skill-3.11.6-gate0-contract-audit.md).
- [x] Map canonical, Gemini entry/Gem/workflow, setup, publishing and verification paths, schema/CLI, release tests and historical host cases in the [Gate 0 audit](skill-3.11.6-gate0-contract-audit.md).
- [x] Identify known **repository** consumers of playlist schema 1.0; external consumers are **N/T**, not assumed absent. Gate 2 must retain 1.0 behavior and avoid a silent breaking migration.
- [x] Inspect `.github/workflows/ci.yml`: validation and ephemeral PR artifact only; release workflow is manual, approval-boolean gated, main-only and refuses existing tags. No release action invoked.
- **Gate output:** a brief file/contract matrix in PR A; no blanket refactor or repeated baseline measurement.

### Gate 1 — PR A: exact first, approximation only by explicit choice

- [ ] Make the **exact ordered crate** authoritative. On ordinary Gemini GO use an authorized writer that accepts individual tracks/versions; pass the complete intended list once on the first creation attempt. If only broad theme generation exists, return the verified list and `PLAYLIST NOT CREATED — exact-track publishing unavailable`.
- [ ] Permit thematic approximation **only as a separately informed explicit listener choice**, not a silent fallback or an interpretation of ordinary GO. Label it approximate and keep the exact intended list for comparison.
- [ ] Reconcile setup, canonical, Gemini entry/workflow, publisher follow-up and illustrative examples. Preserve the existing `Publish` → actual save action for the **same** provider-created playlist; no duplicate create or inferred save.
- [ ] Add smallest cross-document test fixtures: exact-capable; theme-only; missing writer; explicit approximate opt-in; text-only; save action unavailable/failure; eight-visible-of-twelve preview = unseen items **unknown**, not omitted.
- **Audit before merge:** generated files synced, host-specific guidance not leaked, no new service write during tests, full CI green, no change to artistic discovery or DeBarge. **Stop** on ambiguous user authorization or mismatch between host instructions.

### Gate 2 — PR B: statuses and schema without legacy breakage

Use one internal, evidence-gated vocabulary, mapped to simple listener text:

| New outcome | Visible meaning / required proof |
| --- | --- |
| `curated_text_only` | CURATED — NOT PUBLISHED; explicitly opted out |
| `not_created` | PLAYLIST NOT CREATED; absent/failed writer and reason |
| `created_save_required` | CREATED — SAVE REQUIRED; a card/object exists but save not confirmed |
| `published_items_unverified` | SAVED — ITEMS UNVERIFIED; save confirmation, insufficient item/order readback |
| `published_exact` | PUBLISHED — EXACT; verified requested count, positional artist/title/version and order |
| `published_approximate` | PUBLISHED — APPROXIMATE; confirmed result with observed mismatch(es) itemized |

- [x] Keep **schema/validator 1.0 behavior** and examples valid. If persisting the new states, add format 1.1 as a separate compatible path with tests; do not silently reinterpret old `published` or `youtube` fields. Separate display words from machine status.
- [x] Represent **requested, curated, provider-resolved and item-confirmed counts** separately where evidence exists. Missing/hidden positions are *unknown*, never automatically zero; report substitutions and version changes by position.
- [x] Verify the DeBarge 25-identical-entry exception and explicit strict 12-track requests independently; do not let deduplication or a count linter break either.
- [x] Synchronize `references/verification.md` and only the required host references; create table-driven success/failure/preview fixtures. Strictly forbid a verified-published state on link-only acknowledgments.
- **Audit before merge:** 1.0 regression fixtures, 1.1 positive/negative fixtures (if introduced), CLI/JSON Schema agreement, no host overclaim, full CI green. **Stop** if a known consumer breaks.


**Gate 2 disposition:** [PR #256](https://github.com/focustimer-dev/go-hipster-go/pull/256) passed the final-head [Validate skill run 43315184083](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43315184083) (Python 3.10 / 3.12 / 3.13) and was squash-merged as `77d1c101d9dfd4f1bd992dd5b839209198d6c22a`. Schema 1.0 and the validator's legacy statuses are unchanged; no 1.1 required. Native host publishing and item readback remain N/T until Gate 4.

### Gate 3 — PR C: scoped mobile/host and availability review

- [ ] Review one actual listener-facing example per ChatGPT, Gemini and Claude host on mobile-sized output: status first, concise title/description, clearly numbered tracks, legible original-script + romanization/qualified meaning, short notes; no tables required for listener output.
- [ ] Test that 12 requested tracks stay 12 throughout intended list and actual writer handoff; count provider-confirmed tracks only after readback. Never change to six silently.
- [ ] For publishing-enabled deep cuts with real search/catalog capability, use available exact artist/title/version matches during existing selection; retain **at most 1–2 already-researched alternates** only when needed. No new universal lookup on text-only GO, no automatic sound-alike/cover replacement, no invented API or mastering assessment.
- [ ] Check Gemini host text for ChatGPT-only composer controls; guard Spotify/Apple/Claude guidance from appearing in the wrong host. Remove generated whitespace artifacts only if the source generator causes a real issue.
- **Audit before merge:** small mobile smoke matrix + hard/ordinary/regional/refresh/curve/de-cheese/non-Latin/recording-quality regression checks; measured additional calls only where observable; 920-lead and four-package preservation checks; full CI green. If no behavioral defect is reproducible, **skip PR C** and record the audit alone.

### Gate 4 — candidate qualification, not an automatic release

- [ ] Freeze a candidate commit SHA; run the entire existing `Validate skill` matrix (Python 3.10/3.12/3.13), `python scripts/build_agent_packages.py --check` and `--zip`, `python scripts/playlist_cli.py check-skill`, fixture validation and `python scripts/qualify_skill_release.py --check`. Record outputs, not just a green badge.
- [ ] Audit four ZIP member manifests/hashes/reproducibility, support/privacy/docs links, secret signatures, generator/mirror consistency, full 920 research entries, exact version parity and branch-target stability. Keep initial 3.11.5 published assets untouched.
- [ ] Run **one version-confirmed fresh Lab ChatGPT** ordinary `go weird mid` (strict 12, text only), and one representative GO HARD regional sample or reuse a version-confirmed adequate sample. Compare with the two rc.2 canon-lane outputs and the provisional rc.3 output without declaring impossible cross-chat memory or invented audio listening.
- [ ] Run **one text-only, 12-track** candidate smoke on Gemini portable and Claude skill/plugin where host installation is genuinely available; record whether references loaded (actual trace or N/T), artist/track truth, voice, count, original-script credits and no provider writes. Do not confuse the production-linked Gemini online entry with an isolated candidate.
- [ ] Check a publishing writer's *read-only capabilities* first. A real save/create test requires a **separate explicit opt-in**; absent permission, mark live publication N/T and never claim it passed. If advertised exact publishing cannot be tested, **hold release qualification or explicitly narrow the proposed release claim**.
- [ ] Score critical invariants 0 fail / 1 provisional / 2 pass / N/T unavailable. Any factual fabrication, unauthorized write, silent replacement, material count regression, or new canonical concentration failure is a blocker. Audio quality, host fetch timing and readback remain N/T if not observed.
- **Exit artifact:** an evidence table linking prompt, host, declared skill version, candidate SHA, source spot-checks, CI run, failures, and disposition. No extra optimization loop unless a reproducible defect warrants one narrow patch.

### Gate 5 — PR D: version bump and release rehearsal

- [ ] Only after Gate 4 passes, bump **all** canonical/plugin/host version declarations to 3.11.6 and regenerate every archive. `tests/test_skill_release_qualification.py` currently explicitly expects 3.11.5: separate frozen *baseline* constants from the new *candidate* version rather than rewriting history.
- [ ] Verify the release workflow generates tag `gemini-skill-v3.11.6` from the approved `main` SHA; dry-review commands and filenames without executing a release or overwriting an existing tag.
- [ ] Run the final 3-Python CI matrix and reproducible four-ZIP SHA-256 comparison; inspect only expected version and generated-artifact changes in the final PR.
- **Exit:** final SHA, artifact inventory, regression scorecard, unresolved N/T, and explicit **go/no-go request**. A green build is necessary but not authorization.

### Gate 6 — publication, smoke and rollback (only after explicit approval)

- [ ] Capture prior `release/skill-prod` SHA and 3.11.5 release URLs. Promote only the **approved** audited candidate to the production reference branch; verify all production-linked raw URLs resolve to matching 3.11.6 content.
- [ ] On the approved `main` commit, manually run the existing GitHub release workflow with its required approval input for **a new** 3.11.6 release. Do not force-push, clobber prior assets or republish 3.11.5.
- [ ] Verify GitHub release tag target, all four asset names, sizes/hashes and installer links. Separately update submitted ChatGPT plugin and Gemini/Claude installations through their own provider workflows—GitHub publishing does not automatically update installed copies.
- [ ] Smoke-test loaded version, one text-only GO, and any user-authorized save path per host; record mismatches and partial results. Never create test playlists without opt-in.
- [ ] If critical regression appears, **stop distribution**, record affected SHA/version, use the captured prior production reference and known-good 3.11.5 installation as rollback options **with separate authorization**; keep immutable 3.11.6 release evidence rather than rewriting assets. Publish a corrective patch version instead of concealing the failure.
- **Done:** real installed-version and output evidence, no material regression, all publication receipts and links verified; update the tracker and close the release gate.

## Change-control record

| Stage | PR / SHA | CI and focused audit | Live host evidence | Result |
| --- | --- | --- | --- | --- |
| Plan | This document | Docs-only PR and normal CI; no runtime changes | N/A | [x] Written and committed; PR merge recorded by GitHub |
| Gate 0 | PR A audit: [contract snapshot](skill-3.11.6-gate0-contract-audit.md) | Sources, refs, four release assets and workflow boundaries inspected; external schema consumers N/T | No live host actions | [x] Inventory recorded; PR A CI required before merge |
| PR A | [PR #255](https://github.com/focustimer-dev/go-hipster-go/pull/255), squash `1af39382` | Gemini exact-first contract; Python 3.10/3.12/3.13 green | Live writer N/T; no saves | [x] Merged; production unchanged |
| PR B | [PR #256](https://github.com/focustimer-dev/go-hipster-go/pull/256), squash `77d1c101` | Six evidence-gated outcomes; 1.0 preserved; Python 3.10/3.12/3.13 and generated mirror CI green | Actual provider readback N/T; no writes | [x] Merged; 1.1 not needed |
| PR C (small correction required) | `fix/skill-3116-gate3-host-audit` | Gemini script-free verification, historical smoke-test clarity and focused regressions; CI pending | Live host and mobile output N/T | [ ] Final CI/diff |
| Candidate acceptance | — | — | — | [ ] |
| PR D | — | — | — | [ ] |
| Explicit publication | — | — | — | [ ] |

**Do not start the next implementation gate while the previous gate's blocking issues are unresolved.** Documentation-only progress and explicitly marked N/T results are acceptable; unverified results must not be promoted into a pass.
