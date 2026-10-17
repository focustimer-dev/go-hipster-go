# Changelog

## 3.1.9 — The Insufferable Record-Store Clerk

- Give Hipster Music Generator an overtly self-important, passive-aggressive and snarky comic voice across introductions, track transitions, feedback and endings.
- Keep track-specific sonic explanations, trustworthy artist/title/version claims and technical publish reports first; on errors give clear status before the customary jab.
- Sarcasm targets the curator's own ego, stale algorithms and playlist clichés—not real musical cultures or vulnerable listeners. Honor `less snark`.
- Extend style examples, ChatGPT/Gemini instructions and tone regression checks without changing sonic taxonomy, routing, go modifiers or the DeBarge Protocol.
- No claim that textual CI can measure whether the joke lands; user listening feedback remains essential.

## 3.1.8 — DeBarge across every go modifier

- Fixed an eligibility conflict introduced with `go short`, `go long` and numeric track-count modifiers: **ordinary length requests no longer accidentally disable** the one-in-100 Easter egg.
- On a genuine single-roll success, 25 repeated original recordings override all normal mood, speed, short/long and numeric count goals.
- Explicit no-DeBarge, unique-song, or unambiguously non-overridable length constraints still prevent a surprise; no second roll on publishing retries.
- Added manual acceptance matrix and contract tests. Randomness remains contingent on an actual reliable random tool, and streaming provider duplicate support remains unverified.

## 3.1.7 — Expressive go modifiers and length controls

- Added orthogonal mood/speed instructions: `go fast`, `go angry`, `go chill`, `go slow`, `go weird`, plus combinations and natural-language mood requests.
- Keep the full four-axis taxonomy; modifiers change sonic properties, not force genre quotas or invented BPM data.
- Preserve default 12 tracks and introduce explicit `go short` (6), `go long` (24) and numeric requested lengths, with 50 as a soft quality target rather than hard/schema limit.
- Require clear reporting when providers or hosts produce fewer items than requested; no silent truncation.
- Added manual cross-host mood/length acceptance cases and structural tests; live fidelity and maximum host throughput remain unverified.
- DeBarge odds, trigger and 25-entry outcome unchanged.

## 3.1.6 — Publishing-first routing experiment

- Move the connected-service publishing preflight ahead of the seven-step music-curation workflow for `go`; do not create an empty test playlist.
- Make Spotify/YouTube Music playlist creation prominent in skill activation metadata and plugin discovery text.
- Curate service-playable real recordings **after** checking accessible write capabilities; retain complete taxonomy and verification requirements.
- Keep the two-plugin Spotify success case as a manual A/B control. No claim that host-controlled automatic activation is fixed.
- Preserve the DeBarge Protocol unchanged.

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
