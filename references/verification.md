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
