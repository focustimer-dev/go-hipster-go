# PR 5 — First Central America GO HARD A/B: published 3.11.5 versus private 3.11.6-rc.1

**Date:** 2026-11-12  
**Scenario:** `go funky hard`; Central America; Mid tempo; Skip rough recordings; exactly 12 tracks, no exceptions; text only; do not publish.  
**Baseline:** User explicitly identified their original “Horns on the Offbeat” playlist as produced with public 3.11.5 skill. [Previous sourced baseline audit](skill-pr5-central-america-funk-observed-audit.md).  
**Candidate:** User explicitly reported running the new **Go, Hipster, Go! Lab** 3.11.6-rc.1 and pasted “The Horns Can Wait.” Lab build packaging/source were validated separately, as documented in [qualification report](skill-release-qualification-3.11.6.md). Chat-session runtime/file trace not independently captured; no claim of verified in-session file fetches or Spotify publication.  
**Scope:** one output per build, same functional brief; source-level musical checks, not audio listening or statistically significant performance evidence.

## Candidate playlist — all 12 tracks

| # | Candidate credited performer — track | Provenance and precise source |
| --- | --- | --- |
| 1 | Ojo de Buey — La Vibración | Costa Rica; [artist Bandcamp](https://ojodebuey.bandcamp.com/album/sabor-en-un-tiempo-cruel), original 2011 album *Sabor en un tiempo cruel*, track 1 |
| 2 | The Harmonettes — Can't Go Halfway | Belize; [Numero Group, *Belize City Boil Up*](https://numerogroup.com/products/cult-cargo-belize-city-boil-up) |
| 3 | The Professionals — The Back Stabbers | Belize; [Numero Group, *Belize City Boil Up*](https://numerogroup.com/products/cult-cargo-belize-city-boil-up) |
| 4 | Dimensión Costeña — Sabroso Palo de Mayo | Nicaragua; [artist Bandcamp](https://dimensioncostena.bandcamp.com/album/dale-su-rondon), track 6; also issued on [Apple Music](https://music.apple.com/us/song/1677939184) |
| 5 | Los Mozambiques — Viva Tirado | Panama; [Soundway, *Panama!*, volume 1](https://soundsoftheuniverse.com/product/various-panama-latin-calypso-and-funk-on-the-isthmus-1965-75), track 13 |
| 6 | Victor Boa y Su Música — Soy Solo Para Ti | Panama; same Soundway *Panama!* volume 1, track 4 |
| 7 | Freddy y Sus Afro Latinos — Maltrato | Panama; same Soundway *Panama!* volume 1, track 5 |
| 8 | Bush y Sus Magníficos — Nana Nina | Panama; same Soundway *Panama!* volume 1, track 3 |
| 9 | Los Dinámicos Exciters featuring Ralph Weeks — Let Me Do My Thing | Panama; same Soundway *Panama!* volume 1, track 12 |
| 10 | Los Fabulosos Festivals — El Mensaje | Panama; same Soundway *Panama!* volume 1, track 8 (artist naming varies between “Festivals” and “Festivales”; check source release). [Soul Sides](https://soul-sides.com/2006/05/a-man-a-plan-panama.html) calls it lo-fi; transfer not auditioned |
| 11 | The Soul Creations — Funky Jive Part II | Belize; Numero Group *Belize City Boil Up* |
| 12 | Lord Rhaburn — Disco Connection | Belize; Numero Group *Belize City Boil Up* |

**Catalog status:** all 12 compositions/artist-track pairings traceable to artist releases or named reissues. This is **not** proof that every instrumental description, transfer, exact tempo or streaming version is correct. The candidate avoided the baseline's observed Umalali/Mérua performer miscredit only because it did **not** include that song; no general attribution-fix claim is justified.

## Source concentration and overlap

- **Candidate 10/12 from just two album tracklists**: six tracks (#5–10) from a **single** 2006 Soundway *Panama! Volume One* compilation; four (#2,3,11,12) from Numero's *Belize City Boil Up*. Only two artist album choices (#1 Ojo de Buey and #4 Dimensión Costeña) sit outside these two compilations.
- **Baseline 9/12 from three reissue compilations**, according to the earlier track-level source audit. Both lean on compilations, but candidate appears **more** concentrated, not less.
- **Exactly six retained recordings** from the baseline: Harmonettes — Can't Go Halfway; Professionals — The Back Stabbers; Los Dinámicos Exciters — Let Me Do My Thing; Los Fabulosos Festivals — El Mensaje; Soul Creations — Funky Jive Part II; Lord Rhaburn — Disco Connection. Six are new. Identical brief and familiar reissue sources naturally permit overlap, so this is a qualitative variety flag, not an unconditional de-duplication violation across separate sessions.
- **Geographical coverage** improved from three represented countries to **four**: Costa Rica, Nicaragua, Belize, Panama. Original included more Honduran/Garifuna voices; candidate has no Honduras. Do not force country quotas, which would undermine musical coherence.

## Side-by-side scorecard

| Dimension | Baseline 3.11.5 | Lab RC 3.11.6-rc.1 | Evidence / interpretation |
| --- | --- | --- | --- |
| Exact 12 tracks, text only, unpublished | Pass | Pass | 12 distinct printed slots each; neither claims a saved streaming playlist |
| Real track identities | Pass, with one documented credit error | Pass, on source checks | Candidate 12/12 matched artist/label track sources; no streaming ID checks |
| Regional authenticity | Pass | Pass | 3 countries vs 4, both grounded |
| GO HARD discovery breadth | Conditional | Conditional, arguably worse | Baseline 9 of 12 from three comps, candidate 10 of 12 from just two |
| Repeat/variety | Not applicable | 6 new and 6 overlaps | No instruction forbade independently generated overlap |
| Accurate recording-level credits | Known issue | No obvious matching issue found | Baseline Umalali project miscredit not reproduced; candidate not proved to fix that weakness |
| Midtempo and sonic transitions | N/T | N/T | Both are only described in writing, not independently auditioned |
| Skip-rough transfer fidelity | Unverified | Unverified, repeated concern | Both include *El Mensaje*, described as lo-fi in a documentary review |
| Voice/taste/personality | Strong | Strong | Short, witty, track-specific liner notes; subjective |
| Country diversity | 3 | 4 | Useful but not a substitute for musical depth |
| Citation presentation | Garbled upon copying | Garbled upon copying | Likely copied citation UI artifacts; don't modify skill solely on this evidence |

**Verdict:** **Mixed / conditional, HOLD 3.11.6 release**. The optimized private Lab **retains identity, constraints and basic song truthfulness**, supporting continued work on leaner source, but the evidence does **not** show better deep-crate exploration. GO HARD candidate construction appears to anchor to an obvious Soundway album tracklist, and the skip-rough warning persisted. One pair of user-pasted results is not a broad A/B performance guarantee.

## Smallest defensible follow-up

1. Preserve the lean instruction/ZIP architecture and all original research leads. Don't restore duplicated boilerplate to solve candidate quality.
2. Adjust **GO HARD candidate research breadth**, not final playlist quotas: after an authoritative compilation yields valid leads, continue at least one independent artist, scene, label, radio or discography pathway **when evidence and time permit**. A high concentration from one compilation should trigger a **review of alternate sources**; do not automatically ban compelling cohesive tracks or invent replacements.
3. Strengthen recording-level credit checks (album/project-versus-performer ambiguity) and check transfer evidence before promising `Skip rough recordings`. Where audio/transfer cannot be verified, explicitly say so rather than assert a clean master.
4. Add offline structural guard for these policies without writing brittle tests requiring specific songs, cities, labels or a numeric compilation ceiling.
5. Build **another isolated private candidate** after surgical changes, repeat the same prompt and ideally one contrasting region, plus review by listening. Record the new test build identity and exact commit.
6. Keep PR #252 **draft** and **unreleased**; no `3.11.6` tag, public plugin update, production branch promotion, Android/PWA deploy or playlist publication without a separate release decision.

Sources: artist Bandcamp and label tracklists above; [MusicBrainz tracklist for Soundway volume 1](https://musicbrainz.org/release/4f11820a-4dbf-4555-8323-8fca1d538f5c/disc/1), [Panama! original booklet](https://esperobook.com/wp-content/uploads/2020/09/PANAMA1__BOOKLET-1.pdf), [Numero tracklist](https://numerogroup.com/products/cult-cargo-belize-city-boil-up), [Soul Sides recording review](https://soul-sides.com/2006/05/a-man-a-plan-panama.html).
