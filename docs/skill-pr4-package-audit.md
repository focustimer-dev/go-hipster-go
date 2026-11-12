# PR 4 — Skill Runtime Package Inventory

**State:** Preflight plus safe removal of the repository-only test corpus; NOT a completed PR 4 exit gate.  
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

- Portable ChatGPT and Claude archives use sorted source traversal, explicit fixed ZIP timestamps/permissions and deterministic compression. Local `__pycache__` and `.pyc` artifacts are never included.
- Replaced the mirrored 54 KB development test corpus with a short runtime reference. This reduces package source weight without deleting the actual development corpus. Actual generated ZIP byte savings still require final measured comparison.
- ZIP membership/metadata tests check safety and repeatability; Gemini-specific generated ZIP behavior is left unchanged for separate examination.

## Remaining PR 4 work

- [ ] Consolidate DeBarge and discovery-policy repetitions at the canonical source and safely regenerate the mirrors.
- [ ] Shorten conditional GO HARD/Antarctica summaries and clarify the setup authority, without changing behavior.
- [ ] Make the ChatGPT canonical entry a concise dispatcher where safe.
- [x] Remove the mirrored development acceptance corpus after redirecting its runtime link to a compact reference; verify the rest of the ZIP resources for any other non-runtime material.
- [ ] Update generated distributions and package checks together; pass complete CI and behavior regressions.

No release, deployment, reference-branch promotion or music-service write is authorized by this inventory.
