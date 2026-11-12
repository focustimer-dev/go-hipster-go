# PR 4 — Skill Runtime Package Inventory

**State:** Preflight inventory and deterministic archive-builder foundation; NOT a completed PR 4 exit gate.  
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

- `skills/go-hipster-go/tests/discovery-cases.md` is **still linked** from the runtime `SKILL.md` as evaluation guidance, and existing packaging tests require it. Do not remove it just because its directory is named `tests`.
- `scripts/playlist_cli.py` and `schemas/playlist.schema.json` are referenced by the canonical runtime for portable validation and a genuine random roll where a Python host exists.
- A future lean-package change must first relocate optional evaluation guidance or deliberately replace the runtime link, then change generators, mirrors, ZIP tests and generated knowledge together.

## Implemented first increment

- Portable ChatGPT and Claude archives use sorted source traversal, explicit fixed ZIP timestamps/permissions and deterministic compression. Local `__pycache__` and `.pyc` artifacts are never included.
- No legitimate runtime file was removed; there is no claimed material ZIP-size reduction yet.
- ZIP membership/metadata tests check safety and repeatability; Gemini-specific generated ZIP behavior is left unchanged for separate examination.

## Remaining PR 4 work

- [ ] Consolidate DeBarge and discovery-policy repetitions at the canonical source and safely regenerate the mirrors.
- [ ] Shorten conditional GO HARD/Antarctica summaries and clarify the setup authority, without changing behavior.
- [ ] Make the ChatGPT canonical entry a concise dispatcher where safe.
- [ ] Remove development-only packaged material **after** all relative runtime links are safely redirected.
- [ ] Update generated distributions and package checks together; pass complete CI and behavior regressions.

No release, deployment, reference-branch promotion or music-service write is authorized by this inventory.
