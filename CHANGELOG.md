# Changelog

## 3.1.5 — Preserve curated playlist when app routing fails

- Record the observed ChatGPT Android limitation: a `go` with the curator alone did not expose Spotify's write action, while explicit dual-plugin selection saved a 12-track playlist.
- When writer activation fails, retain the exact ordered playlist and instruct the user how to publish it in a follow-up with the provider selected—without re-curating or rerolling any Easter egg.
- Distinguish a connected account from a writing tool missing in the current conversation. Automatic cross-plugin activation remains **unverified and not guaranteed**.
- Maintain the DeBarge trigger, odds, and 25-entry special behavior unchanged.

## Unreleased — One-command streaming handoff

- Make `go` request an automatically saved playlist through an accessible, authorized music writer, when one is available.
- Choose the sole writable provider automatically, prefer a grounded service preference, and ask once only if multiple choices remain.
- Preserve host routing limitations, account permissions, privacy, and approvals; don't promise automatic access to other skills.
- Add `go, text only` opt-out and clear no-publisher fallback.
- Add manual Spotify/ChatGPT and YouTube Music/Gemini routing tests; actual host orchestration remains unverified.
- DeBarge Protocol unchanged.

## Unreleased — Listening-quality iteration (experimental)

- For open-ended `go`, select among two or three musically credible concepts rather than jumping to the first regional pairing.
- Require track-specific sonic reasons and honest uncertainty when recordings could not be heard or independently described.
- Accept lightweight numbered feedback, using only a playlist actually available in the conversation.
- Request post-publish reconciliation of intended versus provider-confirmed tracks, mixes, and order; unknown remains unknown.
- Added manual ChatGPT/Spotify and Gemini/YouTube Music regression cases. Provider fidelity and musical superiority are **not yet established**.
- Preserved the DeBarge Protocol's random trigger, exact recording and 25-entry behavior without change; made the public-facing README allusion less explicit.

## 3.1.0 — Portable plugin packaging and discovery setup

- Added portable `plugin.json`, installed curation skill, and onboarding skill.
- Added capability-aware checks for accessible streaming app tools and actual playlist-writing authorization.
- Kept publication optional: missing or search-only integrations fall back to text and portable JSON.
- Added Plugin Creator instructions; legacy ChatGPT Project instructions remain a fallback.
- Added offline plugin structure tests. Actual ChatGPT installation and music-account integrations still require live testing.

## Unreleased — ChatGPT Project adapter

- Added phone-friendly ChatGPT Project instructions and one-file knowledge bundle.
- Added reproducible bundle generator, freshness tests, and manual in-Project smoke tests.
- Kept GitHub as the canonical skill source; no claim of native ChatGPT installation or streaming publication.

## 3.0.0 — 2026-10-16

- Consolidated original and v2 music taxonomy into an Agent Skills-style repository.
- Kept expanded international scene references and sonic-first discovery distance.
- Preserved late-Motown-adjacent camp and the true 1-in-100 DeBarge Protocol.
- Scoped prior-playlist repetition limits to a practical preference instead of a session-wide hard ban.
- Added standardized playlist JSON contract, offline validation and tests.
- Added transparent, **not-yet-implemented** streaming adapter guides for YouTube, Spotify and Apple Music.
- Added cross-agent installation guide and public repository workflow.
