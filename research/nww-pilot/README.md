# Nurse with Wound list — experimental-lineages distillation pilot

**State: RESEARCH-ONLY · NO production ranking, no playlist writes, no new publishing integration.**

## Round 2: the useful connection experiment

**[Read the source-grounded bridge review](bridge-review.md)** · [Eight documented pair cases](bridge-cases.json) · [Function-aware smoke test](review_bridges.py)

We compared three cross-genre candidate bridges, one baseline-sufficient pair, and four rejection controls using source-supported recording/work descriptions. **Raw technique overlap connected 6 of 8 pairs, including 2 of 4 intentionally inappropriate near-neighbors.** A role/recording-type gate preserved 3 conditional candidates, recognized the baseline control, and rejected all four hand-selected negatives.

**Interpretation:** meaningful *method/function* distinctions are missing from the flat genre/sonic-term vocabulary. The evidence supports a small shadow reasoning layer, **not** an artist-ranking boost or an independently validated music-quality lift. This fixture was purpose-built, not blinded, and no listening or Spotify catalog check has occurred.

## Question and conclusion

Can the [Nurse with Wound list](https://en.wikipedia.org/wiki/Nurse_with_Wound_list) improve **method/era/sonic relationship vocabulary** without skewing Hipster Music Generator's international discovery toward a Euro-American experimental-rock collector canon?

**Pilot outcome:** *promising as a controlled technique dictionary*, **not a listening-quality win**. The list adds useful connections across genre boundaries, but it cannot verify individual recordings or improve recommendations merely by supplying 36 artist names. **Do not add an NWW membership boost or inject every artist into the production curation shortlist.** The next experiment should score the same playlists with and without a lightweight *method-only* lookup.

## Data and provenance

- `entries.json` is a deliberately **balanced, nonrandom 36-name pilot** (6 representative artists each across 6 analytical families); it does not pretend to cover all **291** entries.
- Membership and some relationships come from [Wikipedia's annotated transcription](https://en.wikipedia.org/wiki/Nurse_with_Wound_list), a secondary account. The original 1979/1980 insert was **not separately authenticated**. See also [the Audion guide](https://www.ultimathulerecords.com/nwwlist.html): attribution of original record-specific influences is itself uncertain. NWW list membership is **not track verification**.
- Each artist has **3 provisional technique hypotheses**, a broad regional research label, explicitly unknown streaming status, and **no** provider ID, invented record title, numeric rating, or claims of personal audio listening.
- The six families here are for *stratification*, not exclusive genre classes: electroacoustic, free improvisation, Rock in Opposition, psych/drone/zeuhl, art-punk/studio and sound poetry/performance art. Some assignments are debatable and must be checked against actual recordings before use.
- Frozen pre-pilot baseline: main commit `ec71756e10c92d75d5001dec2712888391598739` (v3.4.0), with **SKILL.md + sonic-taxonomy.md + global-scenes.md**. The script measures the current checkout against these paths; the displayed numbers below refer to this frozen commit.

## Reproducible structural comparison

Run `python research/nww-pilot/evaluate.py` to regenerate the structural metrics. These are **lexical and graph-connectivity proxies, not an A/B listener outcome**.

| Metric | v3.4.0 compared with 36-entry pilot | Meaning |
| --- | ---: | --- |
| Distinct provisional technique labels | **16** | Useful candidate vocabulary; not sound-level verification |
| Techniques linking 2+ of 6 families | **14** | Cross-family candidate bridges, not demonstrated playlist transitions |
| Artist names absent from core references | **36 / 36** | The pilot can diversify names, but absence is not proof of musical utility |
| Technique concepts without exact synonym-phrase match | **11 / 16** | Potentially underdeveloped vocabulary; existing prose could still express these ideas |
| Recording identities / provider matches independently checked | **0 / 36** | Blocks direct production use |
| Artist regional labels exactly France, UK or USA | **24 / 36** | Even a stratified sample exposes the NWW canon's geographic concentration |

The 16 techniques include `tape_montage`, `found_sound`, `spatial_acoustics`, `chance_scores`, `extended_voice`, `electronics`, `nonmetric_improv`, `collective_improv`, `extended_instrument`, `chamber_counterpoint`, `irregular_pulse`, `repetition_drone`, `noise_texture`, `performance_art`, `speech_collage` and `studio_manipulation`. Existing text already recognizes tape effects, synthesis, repetitive form, distortion and studio treatment. **We should enrich methods, not pretend those familiar effects were newly invented.**

## Proposed ablation prompts — NOT yet a listening test

| Prompt / control | Baseline hypothesis | Experimental *technique-only* hypothesis | Required judgment |
| --- | --- | --- | --- |
| Repetition in qawwali vs avant-rock | Current map knows qawwali and repetition | `extended_voice`, `irregular_pulse` may suggest an interesting **structural**, not historical, transition to Magma or Art Bears | Do not erase devotional purpose; compare only a verified recording |
| Taped Memphis rap vs musique concrète | Current map knows Memphis tape grit and tape effects | `tape_montage` / `found_sound` may explain a particular edit-based connection | Check actual cuts, samples and recording credits |
| Contemporary sigilkore vs experimental post-punk | Current map knows bitcrushing and noise | `studio_manipulation`, `noise_texture` can link digital cut-ups with This Heat/Chrome in principle | Distinguish analog and digital eras; no asserted direct influence |
| Sound-poetry as a bridge to experimental vocals | Current map describes vocal phrases, rarely vocal technique | `extended_voice` / `speech_collage` permit specific comparisons | Verify excerpt identity and actual vocal behavior |
| **Negative control:** pre-1975 Lao love song → any sound art on list | Nothing requires this pairing | NWW membership alone gives **no audible justification** | **Reject** an invented bridge unless specific tracks warrant it |
| **Negative control:** Indonesian punk → French chamber rock | Different production/histories | DIY outsider status alone is **not** a shared musical method | **Reject** if the only argument is geographic rarity or weirdness |

These are candidate explanations, **not generated or published example playlists**. A real A/B run requires the same prompts, same connected catalogs, real artist/title/version resolution, listening critique and a blinded comparison.

## Safeguards / promotion gates

1. **No NWW inclusion bonus** and no auto-picked NWW bands. Source-list membership has zero rank impact. Keep the pilot separate from `SKILL.md` and the four canonical references.
2. Treat family/method links as hypotheses. Only promote techniques after checking at least two recordings across different families, including one non-NWW artist when feasible.
3. Verify representative recordings and alternate artist aliases, label/remaster credits and playable provider IDs *before* adding actual track candidates.
4. On the same six test prompts, measure baseline vs experimental exact recording validity, defensible audible explanation, overuse of NWW artists, global/era diversity, provider-match success and listener preference; keep the two negative controls.
5. Reject or narrow the change if European avant-garde artists begin dominating unstructured `go`, or if novelty improves only because the program keeps reciting familiar NWW artist names.
6. Promote at most a **small method glossary / relationship map** in a future separate change after a defensible human-reviewed win. Reuse techniques across genres, decades, and regions. Never overwrite existing scene histories or force political/identity/religious categories into sonic tags.

## Run locally

```sh
python research/nww-pilot/evaluate.py
python -m unittest discover -s tests -v
```

No streaming account, external network, audio player or personal data is used by the structural evaluation. The pilot deliberately preserves the production skill and its DeBarge Protocol unchanged.
