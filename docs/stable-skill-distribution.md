# Recommended stable skill distribution — single source of truth

**Source of truth:** [`config/stable-skill-release.json`](../config/stable-skill-release.json). Do not hand-edit version numbers and download URLs separately in app copy, README, setup prompts or platform guides.

## Recommended packages (published, not preview)

| Host / install type | Release archive |
|---|---|
| ChatGPT plugin | [go-hipster-go-chatgpt-plugin.zip](https://github.com/focustimer-dev/go-hipster-go/releases/download/gemini-skill-v3.11.6/go-hipster-go-chatgpt-plugin.zip) |
| Gemini Apps Skill | [go-hipster-go-gemini-app-skill.zip](https://github.com/focustimer-dev/go-hipster-go/releases/download/gemini-skill-v3.11.6/go-hipster-go-gemini-app-skill.zip) |
| Claude Skill | [go-hipster-go-claude-skill.zip](https://github.com/focustimer-dev/go-hipster-go/releases/download/gemini-skill-v3.11.6/go-hipster-go-claude-skill.zip) |
| Claude Plugin | [go-hipster-go-claude-plugin.zip](https://github.com/focustimer-dev/go-hipster-go/releases/download/gemini-skill-v3.11.6/go-hipster-go-claude-plugin.zip) |

**Current selection:** `3.11.6` (tag `gemini-skill-v3.11.6`, published 2026-11-13 UTC). GitHub release notes explicitly say this includes the unified RC9 checkpoint and recording-quality clarification. The exact source commit and SHA-256 digests for **each** archive are in the canonical JSON. A successful zip build from today's `main` is **not** proof that a prior published archive contains the same files: use its tag and digest.

**Installation:** reading a repository URL or a GitHub `SKILL.md` doesn't install a persistent skill. Gemini users should save/upload the complete version-matched Gemini Skill in the supported Gemini web Skills interface and verify it persists in a new conversation. ChatGPT and Claude use their respective platform-specific ZIP. The Android and PWA apps prepare prompts/links; they don't install a skill on another AI service.

**Version source and upgrade contract:**

- The promoted **stable** version is from this JSON, not the current `main` skill frontmatter, `releases/latest`, a private RC, a moving branch or a live model response.
- App and documentation mirrors are generated/checked by `python scripts/sync_stable_skill_links.py --write` and `python scripts/sync_stable_skill_links.py`. CI runs the check; source drift fails **both** the three-version skill matrix and Android production build.
- Prompts must say `Verify version <manifest.version>` and link to the immutable tag's **Gemini-specific entry skill**, not `main` or the generic root `SKILL.md`. A full Skill ZIP fallback uses that same tagged release. Claude and ChatGPT instructions and ZIP links use the same manifest.
- For a future release, qualify exact real-track selection/GO hard/12-slot curve, provenance and host-specific publishing first. Publish a **new** immutable tag with four expected archives; verify each asset digest and source revision from the GitHub release API. Only then edit the canonical JSON, run the synchronization script and all gates, and merge. Publishing an artifact does not silently promote it for the app.
- When source is merged, the **Android app** needs a rebuilt APK; the **public PWA** needs its normal independent deployment. A GitHub merge does not hot-update either installed Android resources or any previously installed Gemini/Claude skill.
- The native Gemini-update checker may independently show newer GitHub published non-prerelease packages; that is an **update candidate**, not evidence the user installed it. Its installed-version confirmation is self-reported. If its release channel or catalog policy changes, reconcile against this manifest rather than introducing a competing canonical link list.
- The published Gemini entry still points several runtime references at `release/skill-prod`. At the 3.11.6 audit, key workflow/taxonomy/verification/curve/publishing source blobs were identical to the tag. That branch is mutable: future releases should move runtime references to immutable versioned resources or enforce source-digest checks before publication. **Do not change the published 3.11.6 archive silently.**
- A newly upgraded Gemini model may ignore/read fewer skill files despite correct links. Treat that as a **separate execution regression**, tracked in [#291](https://github.com/focustimer-dev/go-hipster-go/issues/291). Correct distribution is necessary but not sufficient to prove obedience.

### Acceptance before shipping the corrected app

- [ ] `python scripts/sync_stable_skill_links.py` exits 0; CI skill/Android checks pass on the final head
- [ ] Manifest version, source commit, published tag and all four asset URLs/digests match the live GitHub release
- [ ] Native Jukebox and Manual both show 3.11.6 in setup checks; all downloads resolve to that tag
- [ ] No ZIP install link in active UI uses `releases/latest/download`; no setup prompt points Gemini's entry at mutable `main`
- [ ] Installed RC device shows the correct versioned setup text and preserves GO/prompt behavior
- [ ] Test against an actually saved Skill in Gemini web; do not interpret a link read as successful installation
- [ ] Explicit user review before any new stable promotion or public PWA/Play publication
