# NWW distillation, round 2 — source-grounded bridge review

**Decision: partial promotion of the *idea*, not promotion of NWW artist preference.** Research-only shadow results; production `SKILL.md` and its four core references remain unchanged.

We went beyond raw artist counts to [eight documented works/performances](bridge-cases.json), including **three plausible cross-genre bridges, one already-covered control, and four rejection cases**. References come from artist labels, museums, an institutional composition catalog and a university archive, not from inferred tags alone.

## What the sources actually teach us

1. **Repetition has multiple *functions*.** [Nusrat Fateh Ali Khan's *Shahen Shah*](https://realworldrecords.com/releases/shahen-shah/) uses devotional text, call-and-response and ensemble intensification; [Magma's *Mëkanïk Dëstruktïẁ Kömmandöh*](https://www.magmamusic.org/en/discography/mekanik-destruktiw-kommandoh-2/) documents an ensemble-vocal, multi-movement crescendo. That's a potentially worthwhile *formal* bridge, **not** shared history, equivalent meaning or a guarantee that two specific excerpts transition well. A coarse `repetition` tag can't capture this.
2. **Studio transformation isn't simply 'recorded on tape'.** [Pierre Henry's *Variations pour une porte et un soupir*](https://resources.ircam.fr/en/work/variations-pour-une-porte-et-un-soupir) turns recorded objects and breath into composed material. [This Heat's '24 Track Loop' and subsequent 'Repeat'](https://lightintheattic.net/products/repeat-metal) reshape rhythmic recordings in a different experimental-rock context. Meanwhile [Luc Ferrari's *Presque Rien n°1*](https://lucferrari.bandcamp.com/track/presque-rien-n-1-1967-70) emphasizes minimally altered environmental observation. All involve recording technology; **their compositional operations differ**.
3. **Reconstruction of time joins unexpected genres.** The same This Heat source documents repeating drum material. [University of Houston's DJ Screw archives](https://txarchives.org/uhsc/finding_aids/00113.xml) describe turntable control of repeated words/phrases and slowed tempi; the archive also documents [the named *June 27th* tape](https://exhibits.lib.uh.edu/s/dj-screw-records/page/june-27th). The sonic bridge is *restructured rhythm*, not fictitious influence of Houston hip-hop by British art rock.
4. **The object type matters before publishing.** National Gallery Prague documents [Henri Chopin's 'Pêche de Nuit' audio-poetry recordings](https://www.ngprague.cz/en/event/163/poetry-passage-5-l-esprit-des-po-tes-officiels-et-crochus); MoMA documents [Yoko Ono's *Voice Piece for Soprano* as a performance instruction](https://www.moma.org/explore/inside_out/2010/07/14/from-a-whisper-to-a-scream-following-yoko-onos-instructions/). An art/performance-work identity is **not** proof that a standard audio recording exists in Spotify. This is a *resolution* gap, not just a genre gap.
5. **Semantic integrity must survive clever edits.** [Real World describes how edits to Nusrat's performance accidentally changed lyric meaning](https://realworldrecords.com/releases/mustt-mustt/); 'cut up some voices' is not a neutral aesthetic property in every tradition. Treat meaning, recording type and cultural context as constraints.

## Honest deterministic smoke-test result

`python research/nww-pilot/review_bridges.py` reads [bridge-cases.json](bridge-cases.json). The comparison is an **in-sample constructed counterexample**, not two generative agents curating playlists.

| Check | Raw shared-method labels | Typed role/recording gate |
| --- | ---: | ---: |
| Links suggested across 8 hand-picked pairs | 6 | 3 conditional bridges + 1 already-covered pair |
| False suggestions among 4 hand-picked negative controls | 2 | 0 |
| Label agreement with the same hand-picked fixture | Not an independent score | 8 of 8, by construction |

This identifies a **specific modeling failure**: sharing a generic tag can incorrectly connect Ferrari's largely observational fixed-media soundscape to This Heat's loop construction, or a recorded sound poem to a performance instruction. The stricter gate eliminates them **within these examples**. It's not evidence that the gate generalizes, or that the resulting playlists sound better.

## What actually changes in our understanding

**The genre tree is the wrong principal structure.** A recording should be able to express three independent dimensions:

- **Material:** What is audible / where does it originate? (`recorded_environment`, `percussion`, `text/voice`, `instrumental_ensemble`).
- **Operation:** What is *done to it*? (`observe/minimally edit`, `montage/transform`, `loop/reconstruct`, `collective improvise`, `call-and-response`, `gradually intensify`).
- **Musical role and constraint:** Why does the technique matter here? (`beat and bodily pulse`, `devotional refrain`, `narrative speech`, `sound as object`, `live performance score`). Some constraints veto a seemingly similar item.

Genre, era, place and microgenre remain contextual axes. A role-aware **method graph** can propose *possible* bridges through those axes without treating cultural identity, nationality, or NWW inclusion as a ranking feature.

## Next defensible experiment, not another taxonomy dump

1. Record 2–3 **independent examples per operation**, including outside-NWW recordings and at least one failed near-neighbor. Verify exact recording/edition and publisher or label evidence.
2. Use a shadow curator with `method → operation → musical role` reasoning versus the existing four-axis curator, without displaying source-list membership to the evaluator. Require the same catalog access and a *human listening evaluation* for transitions.
3. Track valid links, false bridges, executable/provider-resolved tracks, geographic concentration, and whether the listener actually favors the sequence. Penalize invented causal influence and collapsed cultural contexts.
4. Promote **only a short, general method/role reasoning rule** once it improves reviewed playlist recommendations. **No NWW artist boost** and no silent production taxonomy fork.

This is the sought insight: **better paths through musical structures**, not a longer canon of names. GitHub static tests only ensure the research stays reproducible and segregated; they are not Spotify or audio validation.
