# PR 5 — Discovery engine: exploration before verification (design and acceptance gate)

**Status:** design review only; no skill behavior or app UI changes yet.  
**Motivation:** Listener testing of 3.11.5 baseline vs private 3.11.6-rc.1 Lab, [Central America A/B](skill-pr5-central-america-funk-ab-comparison.md), found six repeated artist-recordings (half of the twelve) and 10/12 RC tracks sourced on two prominent reissue compilations; [Southern & Gulf Lab diagnostic](skill-pr5-south-gulf-funk-lab-diagnostic.md) showed far wider independent sources. These playlists were generated in distinct host sessions, so cross-session exclusion from inaccessible history could not be expected. Documentary overlap is evidence of a narrow resulting **selection pool**, not proof of an actual external search route or how many references the model read.

## Diagnosis and hypothesis

The core skill already instructs research beyond compilation tracks, three genuinely different musical discovery routes, the reference index for ordinary GO, selected region and supplementary references, and a GO HARD candidate funnel of roughly 36–50 initial leads / 16–20 finalists / 12 selected recordings. Thus adding more listener prompt fields or repeating these reminders does not address the gap.

**Hypothesis:** easy-to-verify tracks from established compilation tracklists may win before a truly varied candidate set is assembled. The research pathway is inadequately observable and the skill lacks automatic cross-session access to its prior output selections. This is an **exploration-versus-exploitation** issue, not yet a verified host reference-loading failure. Confirm using trace-capable host tools when available; otherwise report retrieval as **unknown**.

## Four components of a defensible correction

### 1. Enforce discovery coverage using *independent source pathways*, not final quotas

For GO HARD, build candidate hypotheses via a few **substantively different and compatible entry paths**:
- A scene/region entry from the selected required region files or curated reference index.
- Original-release catalogs, artist discographies, standalone singles/EPs/LPs, label releases and liner notes.
- Collaborators/arrangers/session personnel, local contemporaries, independent editorial/radio sources, secondary scenes.

If a compilation supplies credible leads, follow it outward to **other independent sources** before filling most of the shortlist. Retain any strong compilation-origin track that survives musical comparison. No fixed number of independent labels, compulsory unpopular songs, artificial country quotas, banned canon names or compilation ceiling. The correction acts at **candidate generation**, not the final 12-track filter. Ordinary GO keeps its one-pass budget.

### 1b. Vary the actual entry point across independent runs

The tested prompts included **no `Discovery route: v1/Rxx` or supplied previous playlist**. The repository's 24 route IDs, occasional PWA/APK route selection and "compare three routes internally" text do not ensure that an isolated skill-only host begins a second run in a **different** part of the catalog.

For runs without an explicit route, deliberately **evaluate independent compatible entry paths before committing to song names**, and use a different underexplored path when a recently visible crate already exhausted a familiar one. If the host exposes a genuine random facility, a private on-device Jukebox-generated route, or an authorized previous-crate history, use those facts to vary the starting branch. Do not fabricate randomness or silently pretend an isolated ChatGPT plugin can see earlier sessions. The **mechanism** must change candidate retrieval, not merely playlist title, order or stated "seed."

To audit this, the final 12 can be inspected for source concentration, and any genuine host search/file-read trace can be checked for *different starting paths*. Do not equate source-album origin with proof of the actual web search that produced the song.

### 2. Separate provenance, exact recording and clean playable transfer

Prefer establishing the **original single / album / EP recording identity** before copying metadata from a compilation; reissues remain valid and may provide the best evidence and best audio transfer. Do not assume a song was on the original LP simply because it appears as an expanded-reissue bonus (e.g. the Bar-Kays, 'Son of Shaft'). Treat release provenance, recording identity and preferred playable master as separate facts. `Skip rough recordings` requires actual transfer-specific evidence when available or an explicit unresolved status; "remastered"/named label alone is insufficient.

### 3. Review *exposure* rather than setting an arbitrary popularity ban

On GO HARD, make a familiar or heavily exposed selection **earn its slot**: explain the distinctive musical reason it survives and check at least one less obvious, verified alternative where access allows. A million documented streams/plays is a useful **listener-proposed review signal**, not a stable universal benchmark. Counts vary by service, upload, territory and date; absent stats remain unknown rather than fabricated; a great song is not disqualified simply for exceeding an arbitrary number. Avoid forcing inferior obscurities as filler.

### 4. Truthful reference loading and repeat awareness

The repository includes routing for `references/reference-index.md`, `references/sonic-taxonomy.md`, regional atlas, selected region source files and mandatory add-ons (Central America includes `central-america-additions.md` and `regional-review.md`), plus GO HARD and Funky policies. Packaging and generated-reference synchronization tests show files exist, **not that the live host read them**.

When the host exposes file-use actions or logs, test the actual required reads and research citations; do not invent read receipts. When not observable, log **N/T** and test source-grounded consequences, never assert "reference loaded." Lack of a critical file must be disclosed, never disguised as a completed deep pass.

Recent duplicate exclusion already applies to up to three **actually visible** playlists in `SKILL.md` and the taxonomy. Fresh isolated chats cannot see one another's crates. The APK/PWA currently rotates/remembers discovery cue IDs, **not full song histories**. Any cross-session avoidance needs an explicitly scoped, user-approved data route (e.g., on-device recent normalized recording IDs/artist-title list, privately passed via supported app integration), with clear retention, no public repository data and a graceful unknown-state fallback. A hidden prompt alone cannot conjure that memory.

## Practical test and acceptance plan

1. **Read-only retrieval audit first:** using one representative GO HARD prompt, check that required references are genuinely accessible in the installed Lab and that host traces, if exposed, show which files were read. Record unavailable telemetry as **unknown** rather than guessing.
2. **Candidate-source audit:** run the same brief with a *diagnostic* evaluation mode only when the host can provide actual source identifiers. Compare original-release evidence, artist/label source diversity, independent research routes, credits and the ability to avoid obvious candidates. Do not require public disclosure of private model reasoning, and do not accept a fabricated 36–50-lead "research diary" as proof.
3. **Small core edit:** prefer changing the existing `references/go-hard.md`, `references/sonic-taxonomy.md`, `references/verification.md` and `references/recording-quality.md` **minimally**. Avoid duplicating policies in Jukebox prompts, Gemini entry, canonical SKILL or Manual. Regenerate mirror/distribution files using the build scripts rather than leaving them divergent.
4. **Regression tests:** prove reference routes remain packaged/linked, no new ordinary-GO research loop, the source provenance/version distinction, correct handling of missing play counts, strict count and regional constraints, no text-only publishing, no made-up retrieval claims. Static tests prove contracts, not live song quality.
5. **Controlled musical evaluation:** two distinct regional briefs, with the same host version identified, and (where possible) two fresh candidate runs per brief to observe *within-version* repetition alongside the baseline. Compare unique tracks, verified sourcing, exposure, subjective flow and real quality. Seek a **meaningful improvement over the observed 6/12 repeat** on comparable runs without declaring a universal zero-repeat quota. Source-list concentration is descriptive; it is not equivalent to measured browsing behavior.
6. **Cross-session history, separate app decision:** Only after checking candidate exploration, choose whether local-only recent-track metadata earns its privacy, UX and integration complexity. Do not alter Android/PWA or public plugin preferences as part of this PR without explicit approval.

## Explicit non-goals

- Making users enter exclusions, a seed, `Discovery route`, `Sounds like`, or advanced `c1:` syntax for the skill to discover music.
- A strict one-million-play cutoff, mandatory unknown names, or fixed country/compilation ratios.
- Assuming original LP cuts sound better than clean reissues.
- Replacing well-sourced music with hallucinated rarities.
- Inflating ordinary GO latency, research calls, Jukebox form fields, or serialized reference data.
- Publishing playlists, releasing 3.11.6, updating public plugin or production reference, or deploying the Android/PWA app.

**Release verdict:** GO HARD candidate diversity and recording-version truth remain under qualification in [PR #252](https://github.com/focustimer-dev/go-hipster-go/pull/252). Keep the optimized lean base while validating discovery behavior with real evidence.
