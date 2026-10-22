## v3.6.0 default-GO publication contract — current acceptance

- Plain `go` in Gemini + YouTube Music must curate and attempt one authorized playable playlist. No `go live` requirement, no visible curate-only option. `go, text only` is the explicit no-publish override.
- In a real connected Gemini test, preserve the intended list, call one available native **YouTube Music playlist** action, and report provider count, visible substitutions, and saved state honestly. If no writer is present, return the finished crate plus **PLAYLIST NOT CREATED**.
- Treat the historical `go` curate-only / optional Stage 2 tests below as archival evidence of prior behavior, **not** required or current desired behavior. The same applies to older test case language endorsing `go live` as a special default.
- Github checks assert code/contract consistency. Provider success still requires an actual Gemini account run.

# Manual discovery test cases

Run *the same* prompts against the prior version and this revision, with the same listening/catalog access, then compare:

1. **Real recording fidelity** — no fabricated artist/title, unverified mix, year, location or provider link.
2. **Sonic coherence** — credible and concrete musical connections, especially at larger discovery distances.
3. **Novelty without arbitrariness** — unfamiliar tracks rather than rote taxonomy reference-artist recommendations.
4. **Scene breadth** — varied regions when the prompt allows it, without a tokenized world tour or stereotypes.

## Fixed prompts

- `Give me 12 songs that bridge Soviet-periphery cosmic disco and Japanese city pop, with one surprising African or Latin American connection.`
- `Give me music with the repetition and elastic rhythm of Can, but no Can or Neu! and no obvious krautrock classics.`
- `Use the go-hipster-go skill: go.`

## Expanded sonic-map acceptance probes (manual, not a validated win)

Test these against the prior revision with the *same* catalog/tools. Rate actual artist/title verification, credible sonic transitions, original-language provenance and breadth without forced token inclusions:

| Prompt | Important distinction |
| --- | --- |
| `go classic Lao pop Royalist Ban-Na era and Saigon 1974` | Separate Lao archive research from Vietnamese soul/psych; no invented formal genre or political stance |
| `go Hindi rock with qawwali` | Track language and devotional ensemble context, not pan-Indian psych |
| `go Indonesian punk and Khmer psychedelia` | Later Bandung DIY distinct from early Indonesian garage and Cambodian pop |
| `go Indigenous American punk with Australian Indigenous rock` | Specific Nations and Aboriginal/Yolŋu band history, not "tribal" stereotypes |
| `go Memphis rap into sigilkore` | Different scenes and production periods, accurate aliases |
| `go nonbinary country` | Self-described identities, song-level country traits and no gender assumptions |
| `go non-English psychedelia` | Actual verified psych characteristics in multiple language scenes, not random foreign songs |
| repeated plain `go` | Consider under-covered scenes without quotas; DeBarge Protocol unchanged |

This is a **test plan**, not proof the curation model will pick better music or that a provider can save these recordings.

## Minimal Gemini prompt vs. known-good Argon one-step baseline

**Known-good field observation (user screenshots, not a full end-to-end audit):** Gemini Argon at highest thinking with the older Jukebox instruction produced a detailed 12-track crate, then a provider card labeled 12 songs with matching first three visible recordings. The original prompt's publishing clause was:

> Use the connected YouTube Music PLAYLIST generation action, not separate YouTube video searches. Curate the intended artist/title/version list first, then ask for exact insertion ONLY if the connected app supports it. Otherwise request ONE themed playlist using the chosen sonic thesis, mood, rhythms, production and at most two verified artist anchors; label the provider mix approximate and mention Save to library. If Gemini returns individual YouTube search cards rather than a YouTube Music playlist, state PLAYLIST NOT CREATED and ask me to select the actual @YouTubeMusic Connected App via the @ picker. Pasted @ text does not activate an app.

This is a **historical regression baseline**, not an instruction to reintroduce the risky artist anchors. A shorter installed-Skill `go live` aims to capture the successful sequence (curate, then attempt one playlist), rather than rely on a long copy-pasted paragraph. Record provider counts, exact matches, order, names, and whether Save to library was actually completed. A matched first three of twelve doesn't establish twelve exact matches.

- Setup prompt must verify Skill version 3.5.6, reading all four references, and *actual installation persistence*, or offer current ZIP.
- Ordinary Jukebox GO should be short, include mood/tempo/lens/spark, and **not** invoke `@YouTubeMusic` or duplicate the streaming protocol.
- Explicit `go live` should preserve the intended 12 tracks before using any publisher, with one provider playlist at most and a truthful approximation label.
- Test installed Skill on Gemini Argon at high effort first, then compare with lower thinking effort using the **same short request** and identical account capabilities. Record failures without claiming model-specific causality.

## Gemini two-stage publication boundary (manual A/B, not yet provider verified)

- With Gemini + YouTube Music selected, an ordinary Jukebox `go` must create the exact intended 12-track **curation only**, labeled **CURATED — NOT PUBLISHED**, with no connected media actions or YouTube search cards. The prompt must not contain an `@YouTubeMusic` invocation.
- The Jukebox still randomizes its search lens and independent crate spark; the original curated list is held as the source of truth.
- Only a separate, explicit Stage 2 request may generate **one approximate YouTube Music playlist**, using the theme from the preserved crate; it must not overwrite or misrepresent that original tracklist.
- If the provider returns 25 songs or different familiar recordings, show the result as **APPROXIMATE**, with visible count/substitution differences and unknowns honestly marked. A generated preview isn't a saved-library confirmation.
- An ordinary `go` in another host with an actual exact-write music provider keeps its existing publishing behavior. A genuine DeBarge Protocol hit remains the explicitly defined exceptional output.
- Test both stages independently in a real Gemini session. CI can assert textual behavior but cannot establish which provider actions Gemini executed.

## Gemini artist-anchor collapse and count integrity

A user screenshot showed a real Gemini/YouTube Music card titled *Anatolian Fuzz & Psych* with 25 songs; at least the first five displayed titles belonged to Erkin Koray. This demonstrates a count mismatch and visible artist concentration, **not** that all 25 came from that artist or that the mix was saved.

- For ordinary Gemini `go`, require an intact 12-track curator-selected crate with no provider generation. A 12-distinct-artist goal for any optional Stage 2 mix is not a guaranteed Google feature.
- An actual 25-track card with five visible consecutive selections by one artist is **approximate; requested count/diversity not met**. Do not falsely report 12 saved or claim all 25 are by that artist.
- If provider count and unique-artist constraints are ignored, do **not** auto-create a second playlist; allow optional refinement only with listener intent and re-check the result.
- These are observable and static compliance tests, not evidence that YouTube Music enforces a per-artist cap, an exact count, or final playlist persistence.
- Preserve the DeBarge Protocol's explicitly defined one-in-100 exceptional outcome; ordinary playlist targets and test cases do not override a real eligible hit.

## Gemini search-card and spark-combination regression

- Repeated Jukebox GO prompts should provide *different* Random crate spark metaphors, assembled independently of the 12 prewritten lenses. These change the search hypothesis, not listener-requested mood or source verification.
- Gemini + YouTube Music Stage 1 must not invoke the Connected App. Only a separate, explicit Stage 2 may ask for one generated YouTube **Music** playlist through the properly selected app.
- A response containing a collection of YouTube video search cards but no native playlist card is **Playlist not created**; preserve the curator's original intended recording list and offer one real picker-selection action.
- When Gemini cannot insert exact ordered recordings, a native themed playlist may be approximate; never present it as the exact curated set, and don't pretend it is saved until Save to library is confirmed.

## Fresh-crate diversity regression (manual A/B, not a measured improvement)

Repeat `go sad` three times on Gemini + YouTube Music, with the same connected app and access, and separately run three plain `go` commands in one chat. Keep the earlier curated lists visible. Compare **intended** artist/title/version lists before handing them to the service, then inspect the **provider** lists when available. Record distinct exact recordings, repeated artists, new scene/production routes, believable transitions, and provider substitutions. If the service exposes only a thematic card, mark track-level overlap **unknown**; don't infer an exact save.

- In a single conversation, ordinary playlists should avoid repeating specific recordings across the last three *visible* sets unless directly requested or explained. Repeated mood alone isn't a repeat-track exemption.
- Two presses of Jukebox GO with unchanged AI, mood and tempo must produce different **Fresh-crate discovery lens** text and the preview must equal the copied prompt. This does not prove the provider honored the lens.
- Fresh lenses should open real alternative sonic search routes, never hard-code the same example artists or demand geographic quotas.
- A brand-new Gemini chat with no available playlists must not claim to have read the user's previous YouTube Music selections. The PWA keeps only recent lens identifiers, not a listened-song database.
- For a YouTube Music theme-generation fallback, compare intended versus provider list when possible. Mark provider substitutions or repeated songs honestly and do not mislabel the returned mix as an exact ordered insertion.
- Do not sacrifice source verification, real versions, requested mood, track count or musical transitions to artificially maximize novelty. The protected Easter egg's explicit exception is unchanged.

## Behavioral checks

- Repeated `go` asks in one conversation should *try* not to reuse the previous pairing or artist, but a good requested track remains allowed.
- Without web/catalog access, output should label uncertain tracks provisional, not hallucinate links.
- A strictly verified/publish-ready request should exclude unresolved matches.
- Ordinary lists should not repeat artists by default; the **DeBarge Protocol** is the deliberate exception.
- No agent may claim to have published to a service without authenticated confirmations.

No results are claimed here. Listening quality requires actual human evaluation; this document is a test plan.

## Claude Premium refusal and exact DeBarge outcome (manual)

| Case | Required behavior |
| --- | --- |
| `create_playlist` returns Premium-required | Report the specific denial and **actual subscription tier unverified**; reconcile earlier writes before claiming 0 saved; no repetitive retries |
| Claude publicly lists `create_playlist` but doesn't expose it in chat | Don't pretend the tool is actionable |
| No `add_playlist_items` exposed | Don't describe it as a working manual write route |
| Listener already has Spotify Premium | Ask which Spotify account Claude is using before suggesting reconnection; don't presume actual plan |
| Existing 25-copy DeBarge result | Preserve all 25 entries as a portable list, no reroll, no substitutions, no compulsory manual duplication |
| Listener sees two generated playlist results but neither persists in Spotify | Report **two generated results, 0 confirmed saved**, descriptions absent and **tracks/order unverified**; do not claim partial publication or retry blindly |
| Claude drafted prose but provider did not save metadata | Offer **Suggested playlist description**, not a claim of Spotify metadata update |
| Ordinary search succeeds | Search is not playlist publication and doesn't circumvent Premium-gated generation |

This user-supplied Claude transcript is one field report, not proof of a universal account restriction or a real end-to-end Premium test.

## DeBarge selection leakage (manual qualitative check)

This regression was observed in Gemini's generated *12-track* YouTube Music playlist: it placed `DeBarge — Rhythm of the Night` in position **12** and justified the choice as a deliberately ironic end to eleven experimental recordings. This is **not** the one-in-100 protocol's 25 identical entries; the model evidently used the instruction example as creative inspiration.

| Scenario | Acceptable behavior |
| --- | --- |
| Ordinary `go weird`, genuine roll not 1 or random facility absent | Curate 12 without using the protected example as an ironic final joke; choose each candidate for independent musical reasons |
| Ordinary `go sad`, no DeBarge-related instruction from listener | No special-artist bonus, allusion or deliberate surprise pivot from the Easter egg |
| Explicit `go synth funk include DeBarge` | A musically appropriate DeBarge song may appear as an ordinary selection; this is not a protocol event |
| Genuine roll 1, eligible request | Exactly 25 consecutive originals of the specified recording; do not blend other tracks |
| No reliable random facility in Gemini | Skip the spontaneous trigger; do not invent a roll or use the protected song as a substitute joke |

**The protocol must remain secret in normal output.** This is a manual prompt-compliance test, not an assertion that CI can hear music or control Gemini's playlist generator.

## DeBarge Protocol precedence across go modifiers

These scenarios are **instruction-level acceptance checks**. Check that there is **one genuine 1–100 roll per eligible new playlist request**, when a random tool exists; do not force a success by inventing a random number. The 25 repeated DeBarge recording outcome is an intentional override of ordinary mood, speed, length and non-repetition rules.

| Request | Random roll eligible? | On genuine roll = 1 |
| --- | --- | --- |
| `go` | Yes | 25 repeated DeBarge tracks |
| `go fast` | Yes | 25 repeated DeBarge tracks, not a fast-themed mix |
| `go angry slow` | Yes | 25 repeated DeBarge tracks, not a brooding mix |
| `go weird` | Yes | 25 repeated DeBarge tracks |
| `go sad` | Yes | 25 repeated DeBarge tracks (on the genuine trigger), not a melancholy mix |
| `go weird slow 30` | Yes; ordinary numeric length is not an exclusion | 25, not 30 |
| `go short` | Yes; ordinary 6-track shorthand is not an exclusion | 25, not 6 |
| `go long` | Yes; ordinary 24-track shorthand is not an exclusion | 25, not 24 |
| `go 50` | Yes; ordinary requested track count is not an exclusion | 25, not 50 |
| `go, text only` | Yes; publication opt-out is separate | 25 in text, no write |
| `go 12, no DeBarge` | No | Honor the exclusion; regular 12 |
| `go unique songs only` | No | Honor unique tracks; regular playlist |
| `go exactly 12, no exceptions` | No | Honor rigid count; regular 12 |
| `DeBarge Protocol` | No random roll; explicit invocation | 25 when not contradictory with another explicit exclusion |
| `publish the playlist above` | No new roll | Publish the original selections and outcome |

Never simulate the 1% probability when there is no genuine random facility; the user-requested explicit Protocol remains available. Verify actual provider support for identical repeated entries and never claim published duplicates without confirmation. Changing or combining `go` modifiers must not silently switch this behavior off.

## Playlist writing and Claude voice parity (manual)

| Situation | Expected copy |
| --- | --- |
| Claude plugin: `go weird 12` | Distinctive, sonically grounded title; 1–2-sentence playlist description; varied, track-specific liner notes; dry opener and smug closer |
| Claude + Spotify provider returns generic card | Keep expressive description in Claude's own reply, clearly identify whether it was actually saved as metadata |
| Claude tool creates a playlist but exposes no description field | Show **Suggested playlist description**; never claim Spotify saved it |
| ChatGPT versus Claude, same creative direction | Both should use the record-clerk persona without requiring identical jokes or melodies |
| `go sad` | Evocative but respectful copy; do not mock real grief or reduce the music to "slow = sad" |
| `less snark` | Natural, specific musical description without forced superiority |
| Actual DeBarge hit | Exact protected 25-entry outcome; no synthetic different-track notes |

Reject vague adjectives masquerading as musical evidence, generic "Musical Journey" titles, unverified listening claims, repetitive catchphrases or markdown that buries the saved/unsaved status. These are **manual qualitative acceptance cases**; static tests cannot prove a host's writing style.

## Voice and substance regression (manual)

This is a **tone test**, not license to fabricate music claims. Judge if the wit is pointed and sustained **without obscuring musical or publishing information**.

| Prompt | Expected behavior |
| --- | --- |
| `go` | Opening snark, smug transition notes and a short superior sign-off, while preserving real recordings |
| `go angry` | Angry sonic qualities; the curator's personality stays dry rather than turning into personal abuse |
| `go chill` | Mellow musical choices despite the curator's needless confidence |
| `go sad` | Respectful and music-first; snark never makes fun of actual grief |
| `go weird slow 24` | Brief barbs across the playlist, but 24 specific track hooks and an accurate requested-vs-saved count |
| `go, text only` | Snarky but useful text list; explicitly no claim of streaming publication |
| No Spotify writer | State **not published** first; add an accurate backhanded quip, not a fictional Spotify malfunction |
| `more like #4` | Accept critique with theatrical annoyance, then genuinely adjust sonic traits |
| `less snark, please` | Reduce the persona; keep music quality and all functionality |
| Genuine DeBarge outcome | Do not preannounce the Easter egg; exact 25 repeated recordings and truth about whether it published |

Reject versions that default to identical catchphrases, belittle whole genres/cultures, fake listener insults, invent having heard recordings, or let sarcastic paragraphs bury service URLs, substitutions or failed writes. The character is **confident in the joke, humble before the evidence**.

## Mood, speed and length modifier acceptance matrix (manual)

| Prompt | Expected behavior |
| --- | --- |
| `go` | Default 12-track intention, optional publication when authorized |
| `go fast` | 12; perceived drive without automatic optimism or unsupported BPM |
| `go angry` | 12; confrontation without automatic tempo jump |
| `go chill` | 12; warmth and ease, possibly brisk |
| `go sad` | 12; yearning and poignancy without compulsory slow tempo, acoustic instruments or minor keys |
| `go sad fast` | 12; cathartic, propulsive sadness; no slow-ballad default |
| `go sad weird 24` | 24; unusual, emotionally persuasive connections and truthful saved-count report |
| `go slow` | 12; slow perceived pulse without assuming serenity |
| `go weird` | 12; audibly defensible long-distance scene pairings, not made-up records |
| `go angry slow` | 12; brooding tension, combines both modifiers |
| `go fast chill` | 12; brisk but gentle, combines both modifiers |
| `go short` | 6 exactly, barring documented provider limits |
| `go long` | 24 exactly, barring documented provider limits |
| `go weird slow 30` | 30 curated tracks with both modifiers, count actually verified |
| `go 51` | No artificial hard 50 cap; warn on host limits / propose batches honestly |
| `go 12 tracks` yielding 6 in Work | Clearly report 6 of 12; never claim full success |
| `go weird, text only` | Modifier remains active, no external publication |

For each run, inspect artist/title authenticity, coherent sonic rationale, modifier fidelity, requested vs selected vs provider-confirmed counts, and whether any explicit exclusion or existing DeBarge eligibility constraint was overridden. These are manual tests; GitHub CI checks text-contract integrity, **not actual musical quality or provider capacity**.

## Gemini-specific writer and save-state acceptance

| Scenario | Required behavior |
| --- | --- |
| Gemini Stage 1 GO with YouTube Music preference | Curate twelve and state **CURATED — NOT PUBLISHED**; don't use media apps or force setup, even when a thematic generator is available |
| Gemini Stage 2 explicitly asks for provider approximation | Create one thematic mix only if an authorized writer exists, mark approximation; do not claim exact song/version/order fidelity |
| Gemini shows a generated playlist card | Distinguish it from a **Save to library** action and a confirmed saved playlist |
| Gemini cannot accept exact selections | Retain ordered list and avoid re-curation, invented tool invocation or a second DeBarge roll |

Observed Gemini Android failure: a twelve-track curation incorrectly recommended ChatGPT's two-plugin composer instruction. Re-test after loading the updated Gemini package; static CI doesn't establish actual tool routing.

## Setup preference and capability checks (manual)

| Request or situation | Expected |
| --- | --- |
| `setup` with Spotify writer exposed and no prior preference | Default to Spotify immediately, with no service-selection question; no playlist created |
| `setup` with Spotify connected but its writer absent | Allow Spotify as preferred service; mark unavailable **in this chat**, not disconnected; never claim setup fixed routing |
| `setup` with Spotify and YouTube Music | Default to Spotify, present `setup change YouTube Music` as an option; never automatically publish to both |
| `setup` on Gemini | Keep Spotify as the stated default, explain Spotify's Gemini connector is search/play only, offer `setup change YouTube Music` for actual playlist generation; never silently switch |
| `setup` with no storage API | Return portable **Hipster Music Setup v1** and say **session-only**; don't claim other chats will remember |
| `setup` with host persistence available | Ask permission; use an actual user-owned write mechanism and confirm only on successful save; never store credentials |
| `setup status` or `setup change 24 tracks` | Inspect/show or selectively update preferences without creating a playlist or rolling DeBarge |
| `go sad` after setup default 24 / Spotify | Reuse 24 and the preferred service if accessible; keep emotional modifier and DeBarge eligibility |
| `go weird 6 on YouTube Music` with a saved Spotify preference | Explicit command overrides profile; report approximate/unsaved results honestly |
| Preferred service writer missing, alternate not authorized as fallback | Preserve preferred choice, curate text list and ask once before switching; no invisible rerouting |

Manual runtime observations remain necessary: static skill tests cannot establish persistent memory or streaming permissions.

## Default go: publishing and host-routing acceptance checks (manual)

**A/B preflight trial:** In fresh conversations with the same installed apps and account authorization, compare (A) skill-only `go` against (B) explicit Go, Hipster, Go! + Spotify selection, using the same 12-track constraint. Record whether playlist-writing tools were exposed *before* catalog research, whether the request saved a playlist, number of provider-confirmed items, substitutions, and whether the assistant falsely attributed missing tools to a disconnected account. The two-plugin success case is the control, not evidence that skill-only activation is fixed. Do not save public account details.

| Environment | Prompt | Expected result |
| --- | --- | --- |
| ChatGPT, Spotify only authorized writer | `Go, Hipster, Go!: go` | Attempt Spotify publication without separate mention; use actual provider confirmation |
| Gemini, YouTube Music only authorized writer | `Go, Hipster, Go!: go` | With no explicit service change, do not auto-publish to YouTube Music; explain Spotify cannot write and offer `setup change YouTube Music` |
| Two writable services, no grounded preference | `go` | Prefer Spotify by default when its writer is authorized; don't ask or publish both |
| Two writers, visible Spotify preference | `go` | Prefer Spotify when writable |
| Connected Spotify search/play only | `go` | Curate, don't claim playlist creation |
| Spotify connected, writer absent in skill-only chat | `go` | Keep the original ordered list; explain that both plugins may need to be selected for the next publication prompt |
| Both Go, Hipster, Go! and Spotify selected | `go` | Attempt actual Spotify playlist creation; confirm provider result |
| Follow-up after blocked publish, with writer now exposed | `Publish the 12 tracks above` | Reuse exact already-curated tracks/versions/order; don't silently re-curate or reroll the Easter egg |
| No connected writer | `go` | Curate, disclose publication failure and one smallest real setup step |
| Explicit no-publish | `go, text only` | Do not attempt any external write |
| Platform requires auth/approval | `go` | Respect all authorization prompts and important-change approvals |
| Provider only confirms playlist created | `go` | Don't claim exact item count or track order without provider evidence |

These tests measure actual host behavior; a textual CI assertion does not establish that a second music skill can be invoked automatically. **Observed in ChatGPT Android, 2026-10-16:** HMG-only `go` curated 12 but reported the Spotify writer unavailable; explicitly selecting both HMG and Spotify led to a 12-track playlist visible in the Spotify app. The host-selection difference is the verified finding; exact item-level mixes are not independently audited. See [issue #1](https://github.com/focustimer-dev/go-hipster-go/issues/1).

## Cross-platform publication regression (manual)

The user reports working ChatGPT → Spotify, Meta Muse → Spotify, and Gemini → YouTube Music workflows. These reports validate that a playlist was created in those sessions, **not yet** that every requested recording and sequence was preserved. Do not store private tokens, listening history, account IDs, or playlist URLs in public test fixtures unless explicitly authorized.

Run the *same* six-track curated list on both hosts if possible. Record: host and service; user-requested count; actual item-level count when accessible; exact matches; alternate mixes/covers; absent/unknown matches; order preserved or unverified; real playlist creation acknowledgement. Use **unknown** for fields a provider does not expose. A publish action with no read-back should not claim six exact tracks.

### Test prompts

- **ChatGPT + Spotify:** `Use Go, Hipster, Go!: go, six tracks. Publish to Spotify using a connected publisher if available. Tell me how many were requested and which recordings and order you can actually verify in the saved playlist. Mark anything else unknown.`
- **Gemini + YouTube Music:** `Use Go, Hipster, Go! and the built-in YouTube Music skill: go, six tracks. Publish if available, preserving exact versions and order. Afterward separate confirmed tracks from substitutions and unknowns.`
- **No writer:** `Use Go, Hipster, Go!: go. If no connected playlist-writing tool exists, curate anyway and explicitly say nothing was published.`
- **Feedback:** `More like #4 but less atmospheric, please.` Run after a visible playlist; pass when it uses #4's relevant sonic feature without blindly repeating the artist.
- **Surprise:** Run two consecutive `go` requests in one conversation; inspect whether the second selection has a distinct scene/microgenre pairing and specific musical explanations without an invented novelty score.

### One-line scorecard

`Host/service | Requested | Confirmed item count or unknown | Exact | Substituted | Missing | Unknown | Order checked? | Saved URL confirmed? | Sonic fit notes`

Pass publication reporting when every claimed number is grounded in a provider result, with explicit uncertainty otherwise. Musical quality remains human-reviewed, not a CI pass/fail claim.

## Lean GO + Criminal rotating stories (manual qualitative regression)

- In the updated installed v3.6.1 skill, run Criminal GO twice with the same AI and music destination. The PWA should send a short fresh mood angle, lens and spark, without repeating niche lists. Check that seven distinct Criminal angles are offered before cycling.
- Confirm the *curator* still finds documented crime narratives, prefers non-English vocals, uses trustworthy song-specific sources for each English explanation, never guesses translations, treats Jamaican Patois sensitively, and selects listenable transitions rather than filling region quotas. An unverified candidate must be rejected in a strictly verified crate.
- Run Happy, Angry, Sad, Weird and plain GO with independent tempo choices; validate sonic variety, verifiable tracks and no fake listening-history access. The test harness checks prompt structure, not audible quality.
- Confirm ChatGPT + Apple Music uses a saveable playlist widget when offered and differentiates ready-to-save from saved. Confirm ChatGPT + Spotify and Gemini + YouTube Music attempt actual authorized playlist creation or preserve the verified crate on failure. A retry should not reroll DeBarge.
