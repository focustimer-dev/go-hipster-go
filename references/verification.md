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

## When a later failure contradicts an earlier creation

**A failure returned after one or more writes is not proof of zero published.** A host may create multiple playlist objects, then fail to populate every item, set description metadata, verify contents, or complete another Premium-gated attempt. Separate these outcomes:

| Stage | Record |
| --- | --- |
| Create | Each provider-confirmed or **listener-observed** playlist separately; its URL/ID if known |
| Populate | Actual item count and exact song/version/order, or **unverified** |
| Metadata | Name/description saved, missing, or unknown |
| Later failure | Exact action and error; do not reinterpret it as a rollback |
| Reconciliation | Created assets, intended/requested list, partial mismatches, remaining unknowns |

**Real Claude field report:** The listener saw **two new playlists, both missing their descriptions**, after Claude ultimately claimed "0 published" on a Premium-related error. That last statement is inconsistent with the user-observed creations. At this point the two playlist titles/links, actual tracks, duplicates and ordering are **not yet verified**. Don't invent those details or delete/recreate anything. Use read-only provider access if available, or request the two existing links/screenshots. A Spotify Web API description field doesn't establish that Claude's connector can set it; otherwise label any text as **Suggested playlist description (not saved)**. Preserve the original DeBarge roll and all 25 requested positions without rerolling.

## After a service reports playlist creation

Keep the original ordered selections intact for comparison. If a streaming app offers a returned item list or playlist read-back, line up entries by **position, artist, title, and requested version**; compare repeated tracks positionally rather than collapsing duplicates. State requested count, confirmed added count, exact matches, substitutions, omissions, and order changes **only to the extent supported by provider data**. A remix, live version, cover, or ambiguous title is not an exact match merely because it plays. If a provider returns only a playlist URL or acknowledgement, do **not** claim item-level matches; say the saved sequence still needs a check. Report unknown results as **unknown**, not missing or confirmed. Never silently substitute an alternate version; ask when the alternative materially affects the user's intent.
