# Streaming adapter contract (v3.0: design + examples, not live integrations)

A provider adapter SHOULD implement:

```text
capabilities() -> search_tracks, create_playlist, add_items, allows_duplicates, supported_region
search(query, artist, title, version?, region?) -> candidate provider IDs and metadata
resolve(track) -> exact match | ambiguous candidates | unavailable
preview(playlist, matches) -> match report, omissions, duplicates, privacy, anticipated API usage
publish(approved_preview, authorization) -> provider playlist ID/URL + per-item results
```

The common input is [`schemas/playlist.schema.json`](../schemas/playlist.schema.json). Keep provider identifiers **out of guessed track text**. Required protections:

1. Require service authentication, sufficient scopes, and explicit authorization to publish.
2. Search and compare **artist + title + version**, not just generic title keywords.
3. Surface ambiguous matches and omitted recordings before submitting writes.
4. Default to a private playlist where supported unless the user expressly selects public.
5. Publish only after the user's approved set is clear; confirm success from provider responses.
6. Handle retries without blindly appending duplicate records; check item-level status and idempotency where possible.
7. Log sanitized failures, never credentials, secrets, OAuth codes, or raw user tokens.
8. Keep explicit duplicate track entries for the DeBarge Protocol when supported, and report if a service refuses them.

No OAuth tokens, app secrets, integrations, or real catalog IDs are included in this public repository. The guides below describe possible official API routes, not already-implemented adapters.

- [YouTube / YouTube Music](streaming/youtube.md)
- [Spotify](streaming/spotify.md)
- [Apple Music](streaming/apple-music.md)

**Implementation recommendation:** start with provider-independent dry-run + match preview, then build one authenticated provider end to end with integration tests and consent flows. Spotify or YouTube may be the simplest first experiment depending on developer-account access and quotas; do not assume access without checking.
