# Gate 4C — ChatGPT rc.4 ordinary-GO repeatability: discovery regression reproduced

**Observed:** 2026-11-12. The listener supplied a second complete ChatGPT output titled *The Bassist Has the Keys — Mid-Tempo Mutant Funk from the US & UK*. Requested in a separate fresh ChatGPT QA context with the same text-only, strict-12, no-publish `go weird mid` brief. Previous result: [The Meter Is Running](skill-3.11.6-gate4-chatgpt-ordinary-qa.md). Cross-host contrast: [Gemini *Clockwork & Stray Voltage*](skill-3.11.6-gate4-gemini-ordinary-qa.md).

**Test package:** Private `go-hipster-go-gate4`, `3.11.6-rc.4`, verified independently in Plugin Creator; same frozen source provenance `3f383f4ea1d91ba288b6d04de248e4904e76a809`. The listener pasted the response, not an action/reference-read trace from the generating chat. A command to load the skill and a private plugin installation are not proof of which reference files were consulted *during* that output.

## Twelve recordings as supplied

| # | Artist — title | Initial release period or audit note |
| ---: | --- | --- |
| 1 | Pylon — Cool | Original 1979/1980 single (A-side of Cool / Dub); same artist, different recording vs Gate 4A |
| 2 | Delta 5 — Mind Your Own Business | 1979 original single; **exact repeat** of Gate 4A |
| 3 | The Slits — Typical Girls | 1979 original song; **exact repeat** of Gate 4A |
| 4 | ESG — UFO | 1981 original single/EP; exact repeat from first rc.2 ordinary GO, same artist/different song from Gate 4A |
| 5 | Liquid Liquid — Cavern | 1983 original *Optimo* EP; **exact repeat** of Gate 4A |
| 6 | A Certain Ratio — Shack Up | 1980 ACR cover of Banbarra; exact repeat from first rc.2 run, same artist/different track from Gate 4A |
| 7 | 23 Skidoo — Coup | 1984 original single; exact repeat from first rc.2 run; original Aswad horn collaboration documented in [prior audit](skill-pr5-rc2-ordinary-go-audit.md) |
| 8 | Pigbag — Sunny Day | **1981-10-28** original release, according to [band's own timeline](https://www.pigbag.com/timeline/) and [discography](https://www.pigbag.com/discography/) |
| 9 | Maximum Joy — Stretch | 1981 original single; exact repeat from first rc.2 run. 7-inch vs 12-inch length differs |
| 10 | Rip Rig + Panic — You're My Kind of Climate | Original 1982 Virgin single; [release chronology](https://en.wikipedia.org/wiki/You%27re_My_Kind_of_Climate) |
| 11 | Lizzy Mercier Descloux — Fire | 1979 *Press Color* original, Arthur Brown cover; exact repeat from first rc.2 run |
| 12 | Konk — Your Life (12-inch version) | **1984**, documented original [Sleeping Bag Records 12-inch](https://musicbrainz.org/release/9881b1ad-3ebe-4532-8b28-84bf5c292121/cover-art) and [UK 4th & B'way 12-inch](https://musicbrainz.org/release/dd7a7f91-02bb-463f-ac51-b30ecbe4b5d7/details). The request's unspecific “12-inch version” does **not** disambiguate Party Mix, album, dub, and other identified edits; exact provider match N/T |

All twelve artist/title pairings are recognizable genuine recordings, with independent source support or prior track-level audit for the repeated selections. The note on ESG's specific guitar harmonics and other microphone/instrument-level details has not been verified against audio; don't certify exact audible properties from artist/title metadata. No actual streaming master, BPM, live reference reads, or device rendering was verified.

## Repeatability and breadth arithmetic (exact normalized artist/title)

- **Count:** 12/12 entries and 12/12 unique credited lead artists, with no repetitions within the second playlist. Correct visible `CURATED — NOT PUBLISHED` status; service-action trace N/T.
- **Against the first rc.4 ChatGPT run:** **3 exact recordings repeat**: Delta 5 — Mind Your Own Business; The Slits — Typical Girls; Liquid Liquid — Cavern. **Six lead artists repeat** (Pylon, Delta 5, Slits, ESG, Liquid Liquid, A Certain Ratio), with three different songs within those returning artists.
- **Against the original rc.2 ordinary GO run:** **5 exact songs recur**: ESG — UFO; A Certain Ratio — Shack Up; 23 Skidoo — Coup; Maximum Joy — Stretch; Lizzy Mercier Descloux — Fire. These were catalog-checked in the [original rc.2 audit](skill-pr5-rc2-ordinary-go-audit.md).
- **Era:** all twelve originally issued **approximately 1979–1984**. This recreates a narrow six-year corridor in an open-ended brief, despite other unrelated sonic mechanisms being available. It is a coherent *US/UK mutant-funk thesis*, but that thesis itself has been picked repeatedly without listener constraints.
- **Scene:** post-punk funk, UK Bristol punk-jazz, NYC no-wave and neighboring early club music. A different playlist title, bass-led introduction and altered track order do not constitute genuinely new discovery directions.
- **Gemini QA comparison:** independently submitted Gemini rc.4 ordinary GO lists twelve real recordings with far greater geographic, stylistic and chronological breadth. Gemini's SKILL.md identity/version/source were subsequently user-confirmed and match QA package provenance. Its finer-grained liner-note accuracy remains provisional, and neither host's per-playlist file-reading trace is available.
- **Presentation:** user's pasted ChatGPT output contains recurring replacement glyphs (�) and citation-name stubs, with no visible numerical markers. Actual phone UI rendering is still N/T. This is consistent with the first ChatGPT paste, but copied text can misrepresent the original app formatting.

## Root-cause investigation — static facts versus unknown runtime

We **re-read the installed private QA plugin**, not merely the GitHub canonical source:

1. The installed `skills/go-hipster-go-gate4/SKILL.md` contains “Load before choosing a thesis” and routes ordinary/freeform GO via `references/reference-index.md`.
2. The installed `references/reference-index.md` requires `sonic-taxonomy.md` headings **including Freshness procedure** before choosing an ordinary-GO thesis, and calls for `global-scenes.md` on open-ended region-free GO.
3. The installed `references/sonic-taxonomy.md` contains the exact **three distinct sonic mechanisms or scene families** instruction and the corrective **reconsider a famous one-era shortlist** step.

**Finding:** The failure is **not** caused by absent QA files or missing canonical freshness policy. But this is not evidence that the ChatGPT generating sessions actually loaded the index, taxonomy, or global scenes in order, nor that they evaluated three alternatives. Do not attribute the failure to a proven tool-access bug or to the model ignoring a file that may never have been opened. The latest skill and acceptance tests currently validate **presence of instruction strings**, not actual live behavior.

A plausible, **not confirmed**, mechanism is that ChatGPT chooses the highly accessible late-1970s/early-1980s funk/post-punk cluster before its broader reference-guided route selection occurs, then writes an internally cohesive thesis around that starting point. The repeated artists across fresh lists are compatible with this heuristic, but cannot prove it. The model's lack of cross-chat memory is not a regression and should not be “fixed” by claiming access to prior playlists.

## Gate 4 scorecard and disposition

| Criterion | Gate 4C result |
| --- | --- |
| 12 tracks / 12 credited lead artists | **2/2 pass** |
| Artist/title authenticity at recording existence level | **2/2**, mix/edition N/T |
| Visible no-publish status | **2/2**, underlying write-trace N/T |
| Broad, independent discovery mechanisms | **0/2 — repeated blocking regression** |
| Written musical coherence | **2/2**, actual sound/tempo N/T |
| Cross-run freshness without available prior history | **0/2 on repeated original-era and scene corridor**; do not treat inaccessible prior songs as an enforceable dedupe list |
| Native mobile readability and source links | **1/2 provisional on paste**, original UI N/T |
| Reference file reads, catalog search trace, latency, provider save/readback | **N/T** |
| Claude live QA | **N/A by listener scope** |

**Decision: Keep 3.11.6 on Gate 4 release hold.** Two ChatGPT ordinary-GO examples now reproduce the same concentrated discovery route; Gemini demonstrates the shared policy can yield broader outputs in another host. There is **enough evidence to investigate one narrow ChatGPT-host discovery-routing intervention**, but not enough to edit the common sonic taxonomy or infer one single runtime cause.

**Next minimal diagnostic (no provider writes):** In a fresh isolated ChatGPT QA chat, ask it to **actually read** `SKILL.md`, `reference-index.md`, the **Freshness procedure** of `sonic-taxonomy.md`, and relevant `global-scenes.md` sections, reporting only which files were available/read and the three *abstract* sonic/scene families considered, **before** a text-only `go weird mid` generation. Then run the exact strict-12/no-publish prompt and compare the route choices. This is a deliberately primed **diagnostic**, not an unbiased ordinary-GO acceptance result. If forced reference use repairs diversity, improve the main ChatGPT instruction's early routing (not global lists or artist bans), build a disposable rc.5 and rerun a normal unprimed baseline. If it still collapses, investigate the general host curation behavior before changing skill text. Collect reference-read proof where the host exposes it; unsupported statements about reads are insufficient.

**Change-control:** Documentation audit only. No candidate skill instructions, public manifests, release tags, production refs, app, music-service libraries or installed plugins changed.
