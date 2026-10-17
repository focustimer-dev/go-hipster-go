# Spotify (planned)

**Status:** documentation/scaffold only; no authenticated client is bundled.

The official [Spotify Web API](https://developer.spotify.com/documentation/web-api) supports [creating playlists](https://developer.spotify.com/documentation/web-api/reference/create-playlist) and [adding playlist items](https://developer.spotify.com/documentation/web-api/reference/add-items-to-playlist) after appropriate user OAuth authorization and applicable app access.

- Resolve exact recording to a `spotify:track:...` URI; verify artist/title/version before accepting.
- Obtain playlist-write permissions appropriate to public/private visibility.
- Create the playlist with agreed privacy; append items in the curated order; confirm additions using provider responses.
- Consider app quotas/access mode, markets, local availability, duplicate semantics and API changes before shipping.
- Do not use a Spotify playlist URL as evidence that all requested tracks matched: return individual match statuses.

This repository does not include OAuth application registration, credentials, or a completed API client.
