# Gate 4A — ChatGPT rc.4 ordinary-GO output audit

**Date:** 2026-11-12. **User-supplied output:** *The Meter Is Running — Mid-Tempo Oddities from New York, Britain, Athens & Franco-Congolese Electro*. **Brief:** go weird mid; exactly 12 tracks; text only; do not publish.

**Host:** ChatGPT, user-confirmed private QA plugin [go-hipster-go-gate4 version 3.11.6-rc.4](https://chatgpt.com/plugins/plugins_6af644226744819181185374e8cd1341). Uploaded package and installed-plugin metadata were verified separately. Generating chat's actual reference-read/tool trace and original mobile screenshot were NOT inspected, so they remain N/T.

**Source:** Gate 4 CI tested PR merge SHA 3f383f4ea1d91ba288b6d04de248e4904e76a809; published private QA ZIP digest a0d2088eef997cb2c68e117085e3af70d8e973122bdaa140bfe6cdf15baf9f2d. Production remains 3.11.5.

**Disposition:** 12-track/count and prose success; **open-ended discovery freshness FAIL (0/2)**, candidate Gate 4 on hold awaiting controlled Gemini comparison. All twelve choices are historically grounded but first issued between approximately 1979–1983. The model returned to the same early post-punk/no-wave/punk-funk/dub canon that rc.2 showed, after the user-reported rc.3 broadened into less-connected scenes. No date or region restriction was in the brief.

## Track-by-track evidence

Years mean initial song releases, not available provider masters. Entries preserve the user's supplied order.

| # | Artist — title | Original-era source and factual limits |
|---:|---|---|
| 1 | ESG — Moody | 1981 original ESG EP; [Apple Music](https://music.apple.com/us/song/1667451150) |
| 2 | Liquid Liquid — Cavern | 1983 original Optimo EP, 99 Records; [MusicBrainz](https://musicbrainz.org/release/de044ab3-cb1e-4329-868a-d07968daa0b6) |
| 3 | Chandra — Concentration | 1980 Transportation; [Apple Music](https://music.apple.com/us/song/1603184942) |
| 4 | Delta 5 — Mind Your Own Business | 1979 original Rough Trade single; [Kill Rock Stars reissue history](https://killrockstars.com/collections/all-1/products/singles-and-sessions-1979-81) |
| 5 | Bush Tetras — Too Many Creeps | 1980 99 Records single; [Fact Magazine](https://www.factmag.com/2011/05/26/bush-tetras-too-many-creeps-new-7-edition/) |
| 6 | A Certain Ratio — Do the Du | 1979 BBC session; 1980 cassette/1981 single, different available editions; [chronology](https://jazzrocksoul.com/artists/a-certain-ratio/), [discography](https://facdisc.github.io/acr.html) |
| 7 | Pylon — Dub | Original Cool/Dub single around 1979–80, preceding Gyrate; [Apple Music](https://music.apple.com/us/album/cool-dub-single/1514703882) and [AllMusic](https://www.allmusic.com/album/gyrate-mw0000269896). Athens means Georgia, USA |
| 8 | The Slits — Typical Girls | 1979 Cut/7-inch; [original 7-inch credits](https://punkygibbon.co.uk/bands/s/slits_typical7.html). Meter-change liner note not independently verified |
| 9 | Y Pants — Favorite Sweater | 1980/81 99 Records Little Music EP; [Water Wing](https://waterwingrecords.bandcamp.com/album/y-pants-6-song-12-ep), [WFMU](https://ftp.wfmu.org/playlists/shows/40465) |
| 10 | Vivien Goldman — Launderette | Original 1981 Dirty Washing-era single; [1981 pressing detail](https://musicbase.net/launderette) |
| 11 | New Age Steppers — Fade Away | 1980 original single/1981 debut LP; [On-U artist](https://newagesteppers.bandcamp.com/track/fade-away). An Ari Up-led **cover of Junior Byles**, confirmed [On-U Sound](https://on-usound.com/nas-dna/) |
| 12 | Zazou Bikaye — M'Pasi Ya M'Pamba | 1983 Noir et Blanc, [original label Crammed Discs](https://www.crammed.be/index.php?id=37&rel_id=300). Collaborative Zazou/Bikaye/CY1 recording, exact digital transfer N/T |

All twelve artist/title pairs are identifiable real recordings; no obvious fabricated pairing was found. This does not authenticate exact edition or available streaming master, alleged sonic detail, source reads by the generating host or actual BPM.

## Failure mechanism and comparisons

- **Era and stylistic concentration:** twelve of twelve original recordings are ~1979–83, clustered around punk-funk/no-wave/post-punk/dub even though the task was wide-open weird/mid. At least **four choices originate in New York's 99 Records network**: ESG, Liquid Liquid, Bush Tetras, Y Pants; see [label discography](https://musicbrainz.org/label/be532593-be05-4745-9f90-d2c8206caf98). Goldman's work has a 99 Records connection too but is not included in the four-count.
- **Against first rc.2 ordinary GO:** zero exact track repeats; three artists also appeared (ESG, Liquid Liquid, A Certain Ratio), each with a different song. **Against second rc.2:** zero exact tracks or lead artists repeated. Source comparisons: [first audit](skill-pr5-rc2-ordinary-go-audit.md) and [second audit](skill-pr5-rc2-ordinary-go-repeatability.md). The 12-track dedup check is therefore ineffective at detecting canon concentration.
- **Against provisional rc.3 improvement:** listener's earlier *The Floor Tilts at Walking Speed* mixed Japanese, Brazilian, Colombian, Korean, Argentine and European scenes. rc.4 lost that dispersion despite inheriting the canonical freshness instruction. This observation does not prove the actual model reference read trace.
- **Editorial strengths:** sharp concise commentary, an effective Y Pants sweater → Goldman laundrette segue, sensible move into British experimental dub and Franco-Congolese electronic music. But musical flow was judged from *text*, not audio playback.
- **Presentation issue:** pasted result contains repeated replacement glyphs (�) and source-name stubs; it also lacks visible track numerals despite 12 lines. This is a pasted artifact, **not proof** of original Android UI rendering failure. Mark native mobile layout N/T pending screenshot or direct inspection.
- **Factual nuance:** New Age Steppers covered Junior Byles' Fade Away; the liner note does not mention that. Slits time-signature/metre assertion is unverified without score/audio. For publishing, A Certain Ratio's original session versus single and Zazou Bikaye's original versus remaster need explicit service match checks.

The existing [canonical freshness procedure](../references/sonic-taxonomy.md) already tells open-ended ordinary GO to consider three distinct sonic mechanisms/scene families **within the existing pass**, and to reconsider a shortlist crowded by one famous era/scene. The rc.4 observed output fails that *outcome*; we cannot yet conclude the skill was not loaded or the model skipped a file.

## Scorecard (0 fail / 1 provisional / 2 pass / N/T / N/A)

| Criterion | Result | Evidence boundary |
|---|---|---|
| Exactly 12 recordings and distinct leads | **2** | 12/12, no duplicate artist |
| Artist/title existence | **2** | 12 historical pairs traceable; exact masters unverified |
| Text-only output status | **2 on visible reply** | Correct CURATED — NOT PUBLISHED, no fabricated URL; provider activity trace N/T |
| Discovery breadth and novelty | **0 — Gate 4 blocker** | ~1979–83 only; 99 Records concentration and era recurrence |
| Musical fit, sequencing, tone | **1 for tempo, 2 for written coherence** | Text-only judgment; no auditory BPM or sound check |
| Source/edition and sonic assertion fidelity | **1 provisional** | Some details independently supported; mix/master and meter assertion N/T |
| Output presentation | **1 provisional** | Pasted stray glyphs/no numeric markers; original mobile UI N/T |
| Actual loaded references and host tool traces | **N/T** | User-confirmed plugin, no independently captured per-chat trace |
| Streaming publication/readback | **N/T — intentionally not requested** | No create/save test |
| Claude live acceptance | **N/A by user scope** | Excluded this round |

**Next step:** Obtain the verified **Gemini rc.4 QA** output for the **identical ordinary weird/mid, strict 12, text-only** prompt. Compare era, sonic mechanism, region, label concentration and citation readability. **Do not edit canonical discovery yet.** If both hosts reproduce the same era/scene collapse, implement one minimal change in the existing freshness path, synchronize references and retest. If only ChatGPT fails, investigate host-specific reference loading before making a shared policy change. Do not invent additional network calls, author quotas, artist bans or a broad optimization loop.

**No public version/tag, production branch, app, music account or already-installed skill was changed by this documentation audit.**
