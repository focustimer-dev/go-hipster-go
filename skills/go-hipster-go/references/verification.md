# Verification and playlist matching

## Distinguish three kinds of certainty

1. **Recording exists**: a credible artist/title pairing (and exact version, if relevant) is supported by an artist/label page, release track listing, catalog, or legitimate listing.
2. **Recording is available on a service**: an actual playable catalog result from that service was found. A search-engine hit does not prove it is playable.
3. **Recording has been added**: an authenticated provider response confirms a playlist item. A tool request or guessed URL does not prove publication.

Use `verification.status` on each entry: `verified` with a source URL, or `unverified` with the uncertainty stated in `verification.note`. Track references must not be guessed. For publishing, require a resolved provider ID and user authorization; verify artist/title/version before linking the match.

## Match checklist

- Exact artist credit, title, featured artists, spelling/transliteration variants
- Original versus cover, live, edit, remaster, demo, remix, extended 12-inch
- Release/recording metadata when confidently sourced; avoid dates if uncertain
- Actual service URL and provider ID, not a general artist page or a generic search result
- Country/scene provenance separately from a broad stylistic guess
- Explicit handling when the exact track or mix is unavailable

A partial or unverified discovery playlist is fine if openly labeled; a **strictly verified** or **publish-ready** playlist must not silently include unresolved candidates. The validator's `--strict` flag checks minimum verification metadata, not factual truth; independent listening/catalog validation is still needed.

## Criminal mood: verify the song's actual story

For each Criminal pick, require **song-specific** lyrics or credible song-level scholarship, liner notes or reporting explicitly establishing a criminal act, smuggling, fugitives, a criminal network or another crime-centered narrative. Genre-level scholarship is for finding leads, never evidence that *this song* concerns crime. A threatening beat, artist reputation, imprisonment alone, neighborhood or gunman-named riddim does not qualify. Do **not** invent lyrics, translations or plot details; when the evidence or language interpretation is uncertain, skip that entry in a strictly verified Criminal crate. Briefly explain the documented criminal subject in English and vary perspectives (bravado, witness, remorse, betrayal and consequence) only when supported by that song's evidence.

## When a later failure contradicts an earlier creation

**A failure returned after one or more writes is not proof of zero published.** A host may create multiple playlist objects, then fail to populate every item, set description metadata, verify contents, or complete another Premium-gated attempt. Separate these outcomes:

| Stage | Record |
| --- | --- |
| Create | Each provider-confirmed or **listener-observed** playlist separately; its URL/ID if known |
| Populate | Actual item count and exact song/version/order, or **unverified** |
| Metadata | Name/description saved, missing, or unknown |
| Later failure | Exact action and error; do not reinterpret it as a rollback |
| Reconciliation | Generated previews versus confirmed saved assets, intended/requested list, partial mismatches, remaining unknowns |

**Real Claude field report, updated 2026-10-17:** The listener initially saw **two generated results with missing descriptions** during a Claude Spotify attempt, and later clarified **neither was saved** to Spotify. Thus **0 saved playlists are confirmed**; the two visible results were previews/generation, not verified durable library objects. A later Premium-related denial is consistent with that failure, but does not establish the listener's actual subscription tier. The precise generated song counts, duplicates and order remain unverified. Do not invent saved URLs or retrospectively claim partial publication. Preserve the original DeBarge roll and all 25 requested positions without rerolling; if a durable saved playlist is subsequently shown, reconcile it separately. A Spotify Web API description field doesn't establish that Claude's connector can set it; otherwise label any text as **Suggested playlist description (not saved)**.

## After a service reports playlist creation

Keep the original ordered selections intact for comparison. If a streaming app offers a returned item list or playlist read-back, line up entries by **position, artist, title, and requested version**; compare repeated tracks positionally rather than collapsing duplicates. State requested count, confirmed added count, exact matches, substitutions, omissions, and order changes **only to the extent supported by provider data**. A remix, live version, cover, or ambiguous title is not an exact match merely because it plays. If a provider returns only a playlist URL or acknowledgement, do **not** claim item-level matches; say the saved sequence still needs a check. Report unknown results as **unknown**, not missing or confirmed. Never silently substitute an alternate version; ask when the alternative materially affects the user's intent.

## Optional cover art

Only on `Cover art: yes` or an explicit sleeve request: **after** finishing the ordered playlist and title, generate **one square original album cover** that includes the **exact final playlist title**. Select a recording in the final crate as visual anchor; verify its **original release year and actual local scene** (not a reissue year). If evidence is incomplete, use an **explicitly approximate era or place** instead of inventing provenance. Reflect the *whole mix* symbolically using period/scene-aware typography, imagery and printing texture without copying an existing sleeve or leaning on cultural stereotypes. Use a host image tool if available; otherwise provide a ready-to-use image prompt. Briefly name the anchor track, year and place with any uncertainty. **Do not claim art was uploaded or applied** to a music service without its confirmation; generating an image does not save a cover. This optional workflow is skipped when not requested.
