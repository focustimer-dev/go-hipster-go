# PR 4 — Skill Runtime Package Inventory

**State:** Offline PR 4 checks passed; PR #251 still requires review/merge.  
**Version:** 3.11.5 unchanged.

## Ownership and host boundaries

- Canonical instructions: `SKILL.md`; portable copy: `skills/go-hipster-go/SKILL.md` (must be byte-identical).
- ChatGPT/Claude setup entry: `skills/setup/SKILL.md`; default Spotify is a preference, never proof of a writer.
- Gemini's generated entry/workflow is a distinct host adapter with a YouTube Music default; explicit destination and approved preferences override defaults.
- Research and source integrity: 920 regional entries and all original research sources retained. `reference-index.md` is a fallback; region-locked GO does not routinely preload `global-scenes.md`.

## Portable archive consumers

| Archive | Included | Next decision |
| --- | --- | --- |
| ChatGPT plugin | plugin manifest, icons, GO skill, setup skill and mirrored skill resources | Audit runtime link closure before trimming |
| Claude plugin | Claude manifest, GO skill, setup skill and mirrored skill resources | Preserve both onboarding entrypoints |
| Claude skill | GO skill and mirrored resources | Preserve valid relative Markdown links |
| Gemini Apps skill | Generated short entry, workflow and explicitly enumerated references | Leave generated artifacts and reference routing synchronized |

## Retained links, not disposable debris

- `tests/discovery-cases.md` stays in the source repository for complete regression and historical cases. Runtime `SKILL.md` now links to the short mirrored `references/evaluation-smoke.md`; the 54 KB corpus no longer appears in ChatGPT/Claude skill packages.
- `scripts/playlist_cli.py` and `schemas/playlist.schema.json` are referenced by the canonical runtime for portable validation and a genuine random roll where a Python host exists.
- This link migration was applied to the canonical skill, mirror, ChatGPT knowledge, package generators and tests together. Full reference access remains available in the repository; user runtime packages include the short in-skill guide.

## Implemented first increment

- Portable ChatGPT and Claude archives use sorted source traversal, explicit fixed ZIP timestamps/permissions and deterministic compression. Gemini's ZIP uses the same stable member rules. A bytewise rebuild check covers all four artifacts. Local `__pycache__` and `.pyc` artifacts are never included.
- Replaced the mirrored 54 KB development test corpus with a short runtime reference. This reduces package source weight without deleting the actual development corpus. Actual compressed ZIP byte savings still require final measured comparison in PR 5.
- ZIP membership/metadata tests check safety and repeatability; The Gemini builder now uses the same deterministic member metadata; an automated test rebuilds all four ZIPs twice and compares hashes.

## PR 4 completed implementation

- [x] Consolidated DeBarge count dispatch and repeated seed/lens/mood-angle policy at the canonical source; synchronized generated distribution mirrors and kept exact roll/exclusion semantics.
- [x] Kept GO HARD conditional, shortened Antarctica without losing opt-in exclusions, and clarified standalone Spotify versus Gemini YouTube Music setup defaults.
- [x] Shortened canonical source by 3,041 bytes and moved detailed Claude Spotify recovery into a mirrored on-demand reference. The complete ChatGPT Project knowledge snapshot is intentionally concatenated, not on-demand.
- [x] Remove the mirrored development acceptance corpus after redirecting its runtime link to a compact reference; verify the rest of the ZIP resources for any other non-runtime material.
- [x] Synchronized generated distributions and package checks; Validate skill passed on Python 3.10/3.12/3.13, including four deterministic ZIP double-build checks and package/link integrity.

No release, deployment, reference-branch promotion or music-service write is authorized by this inventory.

## Verified source-size movement before PR 5

| Source | `main` before PR 4 | PR #251 draft | Interpretation |
| --- | ---: | ---: | --- |
| Canonical `SKILL.md` | 54,742 bytes | 51,701 bytes | 3,041 bytes smaller; detailed Claude recovery moved on demand |
| Gemini `GEM_KNOWLEDGE.md` | 403,177 bytes | 401,120 bytes | 2,057 bytes smaller |
| ChatGPT `CHATGPT_KNOWLEDGE.md` | 417,529 bytes | 418,304 bytes | 775 bytes larger because full Project snapshot embeds new recovery source |
| Gemini online `SKILL.md` | 7,284 bytes | 7,284 bytes | Size unchanged; the portable entry retains the tested 6.5 KB cap |

These are repository UTF-8 source byte sizes, not tokens or host-fetch measurements. No Android/PWA deployment, skill publication, production promotion or playlist creation occurred.
