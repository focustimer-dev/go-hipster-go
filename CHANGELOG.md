## Crate Atlas gesture and North America specificity

- Two-finger pinch and drag to navigate the atlas, plus trackpad wheel pan/pinch; normal one-finger page scroll untouched. Suppress incidental map taps after gestures and preserve Whole World reset.
- Replace generic North America and joint Mexico–Central America listening presets with separate US West/East, Canada West/East, Mexico and Central America territories. Geo-boundaries approximate; no country false attribution.
- Migrate old saved broad selections to the new detailed IDs, preserve the existing browser key, and assert gesture/country/prompt consistency in the Node regression harness.

## Crate Atlas map framing (Impeccable QA)

- Tighten North America, South America and Africa continent view boxes after live-browser inspection. Preserve original world view and tap geography.
- Enlarge the focused map viewport, particularly on phones, without extra controls or dependencies; update interaction regression expectations.

## Jukebox Crate Atlas — Cartographer's Desk refinement

- Replace hand-drawn, rectangle-clipped hit regions with geographic country polygons rendered directly as local, offline-capable SVG; continent click-to-zoom and precisely bounded country selection.
- Add selected-region passport ink stamps and an optional whole-continent selection action, preserving the original paper record-store aesthetic, empty-anywhere default, prompt generation and region storage semantics.
- Preserve keyboard access through labeled region controls and reduced-motion map navigation; no new service integrations or generated skill ZIP updates.

## v3.6.3 PWA Crate Atlas enhancement

- Add a collapsed, tactile Mercator world map with six continent paint shortcuts and twenty selectable music-research territories. Colored land regions synchronize with accessible text chips; selections persist locally and steer, rather than constrain, the next GO prompt.
- Default remains unselected (anywhere); no playlist import, account connection, data entry, geographic quotas or new skill release required.

## Release hygiene (v3.6.3, October 22, 2026)

- Retired four duplicate `hipster-music-generator-*.zip` release aliases; only the canonical `go-hipster-go-*.zip` platform packages remain.
- Packaging removes stale local alias outputs, CI checks for exactly four ZIPs, and release automation deletes only the four old-named assets from the active release. Historical releases remain untouched. No skill behavior or music taxonomy changes.

# 3.6.3 — Gemini setup source and Jukebox tone refinements

- Gemini Task-mode setup points to the published Gemini-specific five-file Skill ZIP and GitHub's generated Gemini knowledge mirror, not the multi-platform root skill.
- Explicit version in generated Gemini Skill frontmatter, optional PWA mood angles and track uniqueness / provider count reconciliation in Gemini instructions.
- Replace Setup tab's quotation with the exact Manager, Emeritus line and add regression tests; retain the existing musical scene maps, visual aesthetic and publishing pathways.

# 3.6.2 — Gemini architectural cleanup

- Give Gemini one authoritative native YouTube Music default with explicit-service and approved-setup overrides, and one publish-first GO flow.
- Generate the five-file Gemini skill from selected canonical musical sections; remove unrelated Claude/ChatGPT/Spotify-default/CLI instructions and broken escapes without deleting the full original skill.
- Preserve the complete global-scenes and sonic-taxonomy references. Prune host-specific Gemini examples and verification history, rebuild Gemini Gem knowledge from the filtered source, and add ZIP regression tests.

# 3.6.1 — Shorter GO, deeper Criminal machinery

- Keep Criminal regional research, Patois nuance and song-level theme verification in the installed skill references, not in the copied PWA prompt. Rotate seven Criminal story angles.
- Thin GO prompts across all moods to current session choices (mood, narrative angle, perceived tempo, search lens, spark, service). Keep freshness, sequencing, DeBarge and publishing policy in the skill.
- Preserve Apple Music playlist-widget handoff and honest saved-status reporting; update regression tests, mirrored plugin files and the generated ChatGPT/Gemini knowledge bundles.
- Refresh installed skills after deployment: changing GitHub or the static PWA does not update a previously uploaded/installed skill.

# 3.6.0 — Mood and category discovery

Expanded mood interpretations, category research routes, audible-mechanism taxonomy and full-pool cue rotation. Preserved service routing, criminal verification, five-file Gemini packaging and the DeBarge exception.

## 3.5.7 — GO is the complete product again

- Plain `go` now curates and attempts to create one playable playlist across supported services, including Gemini + YouTube Music; `go live` is only a backwards-compatible alias.
- Remove the Gemini Jukebox Curate only checkbox and special mode routing. The copied prompt simply requests one playlist, leaving detailed behavior in the installed Skill.
- Preserve the intended ordered list if Google's provider makes an approximate mix; disclose mismatches, Save to library uncertainty and publishing failure. Explicit `go, text only` remains available to developers and power users.
- Synchronize canonical/mirrored Skill, Gemini app ZIP renderer and Gem steering; reset the short GO prompt and revise current acceptance tests and installation version to 3.5.7.

## PWA Gemini GO live default (post-v3.5.6)

- Restore `go live` as Gemini + YouTube Music's Jukebox GO default: curate first, then attempt one authorized provider playlist.
- Add a compact **Curate only** checkbox and `?mode=curate` override; update receipt and copy feedback to match the selected mode.
- Keep existing Skill steering, mood/tempo choices, random discovery, and non-Gemini routes unchanged. The Gemini Skill ZIP remains v3.5.6.
- Provider result still requires real-world verification; a returned thematic mix is not proof of exact insertion or Save to library.

## 3.5.6 — Move the long Gemini GO prompt into installed steering

- A Gemini + YouTube Music Jukebox GO now sends only skill invocation and current mood/tempo/discovery seed, not repeated publishing instructions.
- Keep default `go` curate-only and introduce explicit `go live` for a one-step Argon-style curated-first publishing experiment; preserve exact intended tracklist before the provider's approximate mix.
- Store verification, count/order honesty, and playback handoff rules in the canonical Skill and Gemini package. Add known-good long-prompt manual A/B case without promoting unverified success.
- The Gemini installation prompt verifies latest main Skill v3.5.6, all four references, and real persistent install. If unsupported, present the official ZIP upload rather than reporting that reading GitHub equals installation.
- Regression tests cover Gemini's concise GO prompt, setup version check, source bundle and no change to other hosts' normal publishing paths. Real Gemini model comparisons remain to be tested.

## 3.5.5 — Exact crate first; Gemini publication opt-in

- Switch Gemini + YouTube Music plain GO to **Stage 1 curation only** with ordered, verified tracks and a clear **CURATED — NOT PUBLISHED** label. Do not invoke Google's thematic generator, video search or Connected App as part of ordinary GO.
- Make **Stage 2 approximate YouTube Music generation** an explicit, separate user request. Preserve the original tracklist; show substitutions and count differences where observable, and separate playlist card from Save to library.
- Remove the automatic provider invocation from Jukebox Gemini GO. Keep random discovery lenses, creative sparks, mood, tempo, non-Gemini publishing, and protected DeBarge behavior.
- Update Gemini native ZIP renderer, Gem fallback instructions, manuals, regression cases and package snapshots. Google native routing and item fidelity still require live user-visible tests.

## 3.5.4 — Avoid artist-radio collapse in Gemini playlists

- Request one twelve-song Gemini/YouTube Music playlist with twelve distinct lead artists, seeded by sonic qualities and cross-scene traits rather than named reference artists by default.
- Treat exact count and artist diversity as requests, never guaranteed provider controls; report provider cards that expand to twenty-five tracks or concentrate on one performer as mismatched approximations.
- Prevent silent second-playlist retries and retain truthful created/saved versus intended distinctions.
- Add Jukebox prompt, contract and Gemini mobile smoke tests based on an observed 25-song artist-heavy card. Native Gemini performance remains to be confirmed on the user's account.

## 3.5.3 — Gemini playlist handoff and randomized crate sparks

- GO now combines a fresh discovery lens with an independent three-part creative phrase assembled from 1,000 combinations; avoid the previous three phrases locally. These are metaphorical music research cues, not artist/genre requirements.
- Correct the documented Gemini Connected App name to @YouTubeMusic and explicitly request **one playlist**, not one ordinary YouTube search result per candidate track.
- Keep original curated recordings distinct from the actual YouTube Music theme-generated playlist; if only video cards are returned, report that no playlist was created. Pasting a literal @-mention doesn't activate an app.
- Preserve the existing sonic taxonomy, DeBarge protocol, moods, tempos, verification, and non-persistent listening history.
- Add prompt regressions and Gemini manual acceptance tests; actual provider success must still be checked in Gemini.

## 3.5.2 — Fresh-crate discovery and repeat controls

- Rotate twelve sound-led discovery lenses at the Jukebox GO action; exclude recently used browser lenses and retain a deterministic fallback.
- Check exact artist/title/version overlap across up to three accessible prior playlists in the curation skill without inventing cross-session history.
- Distinguish curator-chosen tracks from Gemini/YouTube Music thematic substitutions. Keep mood, musical cohesion and the original taxonomy.
- Add offline prompt/route regression checks and manual cross-service A/B cases. Improvement in real Gemini playlists still requires user-visible listening tests.

## 3.5.0 — Go, Hipster, Go! identity migration

## 3.5.1 — Rename cleanup

- Use the renamed repository in metadata, setup prompts, manuals and download links.
- Preserve the selected music service when changing AI in the Jukebox and Manual.
- Refresh portable packages and migration instructions; retain legacy ZIP aliases.

- Rename playlist-curation skill and plugin identity to `go-hipster-go`.
- Preserve existing music taxonomy, DeBarge Protocol and PWA installation paths.
- Package under the new name and include compatibility ZIP filenames for existing download links.
- Existing installed plugins and skills remain snapshots; replacement is required to adopt the new identifier.
- GitHub repository rename is a separate Settings action.

# Changelog

## 3.4.0 — Expand the musical scene horizon

- Add research-backed leads and documented guardrails for pre-1975 Lao and Saigon music, Hindi rock, qawwali, Indigenous North American/Australian guitar scenes, Memphis cassette rap, distinct internet sigilkore, Indonesian punk/hardcore, Khmer and other non-English psychedelia, and nonbinary country.
- Keep distinct timelines, Nations, traditions and artist identities separate; the listener's Lao "Royalist/Ban-Na" terminology is not presented as a verified historical genre.
- Broaden open-ended `go` discovery without quotas or sonic stereotypes; add source links and manual scene-specific acceptance prompts.
- No change to the DeBarge lottery, Spotify-first setup, platform publishing logic, or track-level verification requirements. These are candidate leads, **not a live listening win**.


## 3.3.5 — Spotify-first, zero-interview setup

- Default listening and publishing preferences to Spotify without a required service-selection question; keep `setup change ...` for explicit overrides.
- Check live writer availability separately from provider preference; never silently publish to a different service just because Spotify cannot write on the current host.
- Document that Gemini's regular Spotify connector supports search/play, not playlist creation; offer an explicit YouTube Music change for Gemini playlist generation and clarify separate library saving.
- Add listener-reported successful Meta Muse + Spotify flow to the manual platform checks without claiming universal account access or exact track/order fidelity.
- Preserve four-axis taxonomy, playlist voice, length defaults, DeBarge behavior and streaming authorization safeguards.

## 3.3.4 — Distinguish generated previews from saved playlists

- Correct Claude field evidence: two playlist results were displayed but **did not save to Spotify**; report 0 confirmed saved rather than partial publication.
- Keep generated previews, durable saved playlist objects, and exact item/order verification separate. Premium is required for personalized prompt-generated playlists via Claude, but does not guarantee exact duplicate insertion.
- Preserve the DeBarge selection and all prior music curation behavior.

## 3.3.3 — Reconcile creations before reporting a total failure

- Initial field report described two displayed playlist results without descriptions; later user clarification established neither was saved. See 3.3.4 for corrected saved-state guidance.
- Introduce stage-by-stage publication reconciliation, separating playlist creation, contents, metadata, provider denials, and uncertain results. Never create a third playlist before resolving previous attempts.
- Preserve DeBarge odds, original 25-entry sequence and one-roll-per-new-playlist behavior.


## 3.3.2 — Spotify refusal is not an invitation to invent tools

- Differentiate Premium-gated prompt-generated Spotify playlists from exact ordered-track editing in Claude.
- Preserve 25-entry DeBarge selections and report 0 saved when the official Spotify connector refuses publication; never reroll or force mobile manual duplication.
- Avoid making claims about actual account subscription or suggesting unavailable `add_playlist_items` tools; add a field-report regression matrix.
- DeBarge probability and special result unchanged.


## 3.3.1 — Make the liner notes worth reading

- Distinguish **playlist title**, **proposed streaming description**, and **track-specific liner notes** in the core skill rather than relying solely on a generic "be snarky" persona.
- Add concrete flat-versus-expressive examples, a succinct copywriting format, and manual Claude/ChatGPT quality-parity checks without inventing audio evidence.
- Clarify provider boundaries: a distinctive **Suggested playlist description** in chat does not mean Claude's Spotify connector saved that metadata.
- Add Claude-specific rewrite-in-place troubleshooting for already-curated playlists; do not re-curate, republish, or reroll DeBarge on a writing-only revision.
- Keep discovery taxonomy, mood modifiers, setup, publishing authorization and the protected DeBarge Protocol unchanged.


## 3.3.0 — The setup command

- Claude/Muse distribution follow-up: shorten the Agent Skills discovery description to Claude's 200-character guidance, publish Claude Skill and Plugin ZIPs alongside Gemini, and document consumer Muse versus Muse Code with native Spotify integrations and verified permission boundaries.
- Add first-class `setup`, `setup status`, `setup change ...` and `setup again` to the main skill and existing setup skill, with service discovery, listening/publishing preferences and clear defaults.
- Apply a listener-approved, actually accessible **Hipster Music Setup v1** profile to future `go` requests while rechecking live provider write capability.
- Keep persistence honest: use actual user-authorized host storage if supported, otherwise display a portable **session-only** profile; never leak personal preferences into public skill packages or claim persistent cross-chat memory.
- Separate Gemini's thematic YouTube Music generation / Save to library from exact recording insertion; never turn setup into a Spotify OAuth bypass.
- Add manual setup regression cases and cross-host instructions; keep curation taxonomy, voice and DeBarge Protocol unchanged.


## 3.2.4 — Gemini's YouTube Music routing is not ChatGPT's

- Remove the cross-host fallback that told Gemini users to select two plugins in a ChatGPT-style composer.
- Distinguish Gemini's `@YouTubeMusic` playlist generation, exact curated track insertion, and the **Save to library** step; disclose approximations rather than inventing exact results.
- Preserve original tracklists for a single Gemini-native recovery step, without re-curation or repeat DeBarge roll.
- Add Gemini-specific regression tests and setup guidance; music taxonomy, snark and DeBarge odds unchanged.


## 3.2.3 — Make Gemini's record clerk unmistakably insufferable

- Promote the arch, self-important persona to the beginning of canonical skill activation and the **generated Gemini Apps SKILL.md**, before streaming setup instructions.
- Require a dry opener, several track-specific witty asides, and a smug closing; factual music/provider status still takes precedence.
- Explain how to reload a GitHub-linked session or replace a saved Gemini skill using the whole five-file package; static tests and manual tone cases added.
- Preserve taxonomy, all `go` modes, DeBarge's original protected protocol and the publishing workflow.


## 3.2.2 — Go sad, obviously

- Add `go sad`: musically melancholy, wistful or heartbroken, but not synonymous with low tempo, minor keys, acoustic sound or ambient music.
- Support `go sad fast`, `go sad weird`, and `go sad chill` as natural combinations without changing the four-axis discovery method.
- Add examples, manual regression checks and README quick-start commands.
- Keep `go sad` eligible for the existing one-in-100 DeBarge Protocol; its trigger, odds and exact 25-track outcome remain unchanged.
- Preserve careful publishing verification and the snarky persona without mocking real grief.


## 3.2.0 — An extremely important logo, naturally

- Rebuild the reference crimson faceted five-point star as **real transparent, square SVG vector artwork** with clean negative-space cutouts.
- Add a simplified composer icon and a subtler, vinyl-etched signature logo, and reference both in the portable OpenAI plugin manifest for light and dark modes.
- Add a brand guide and regression tests for file references, square SVG dimensions, transparent backdrop, and correct naming.
- Keep all musical taxonomy, `go` flags, publishing behavior and DeBarge odds unchanged.


## 3.1.9 — The Insufferable Record-Store Clerk

- Give Go, Hipster, Go! an overtly self-important, passive-aggressive and snarky comic voice across introductions, track transitions, feedback and endings.
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
