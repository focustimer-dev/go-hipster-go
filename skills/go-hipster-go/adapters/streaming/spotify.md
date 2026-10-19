# Spotify (planned)

**Status:** documentation/scaffold only; no authenticated client is bundled.

The official [Spotify Web API](https://developer.spotify.com/documentation/web-api) supports [creating playlists](https://developer.spotify.com/documentation/web-api/reference/create-playlist) and [adding playlist items](https://developer.spotify.com/documentation/web-api/reference/add-items-to-playlist) after appropriate user OAuth authorization and applicable app access.

- Resolve exact recording to a `spotify:track:...` URI; verify artist/title/version before accepting.
- Obtain playlist-write permissions appropriate to public/private visibility.
- Create the playlist with agreed privacy; append items in the curated order; confirm additions using provider responses.
- Consider app quotas/access mode, markets, local availability, duplicate semantics and API changes before shipping.
- Do not use a Spotify playlist URL as evidence that all requested tracks matched: return individual match statuses.

This repository does not include OAuth application registration, credentials, or a completed API client.

## Claude's first-party Spotify connector (separate from this planned API adapter)

Spotify's [April 2026 Claude announcement](https://newsroom.spotify.com/2026-04-23/claude-integration/) supports discovery for Free and Premium, but personalized prompt-generated playlists require **Spotify Premium**. The [Claude connector listing](https://claude.com/connectors/spotify) advertises `create_playlist`, `search`, `fetch_tracks` and playback/library actions, **not** `add_playlist_items`. This does not prove a particular tool is exposed in a given conversation or that `create_playlist` supports exact ordered recording/duplicate insertion.

On a Premium-required provider denial, report **the refused operation**, reconcile any earlier successful or listener-observed playlist creations before stating a saved count, and treat **subscription status as unverified** unless independently checked; do not invent write methods or falsely diagnose a disconnected account. Preserve an already-chosen DeBarge 25-entry result without rerolling. See [Claude integration guidance](../claude/README.md#spotify-denied-playlist-creation-premium-gate-versus-exact-25-track-editing).
