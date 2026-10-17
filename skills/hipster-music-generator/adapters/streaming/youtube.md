# YouTube and YouTube Music (planned)

**Status:** documentation/scaffold only; no authenticated client is bundled.

The official **YouTube Data API v3** supports creating ordinary YouTube playlists and adding video IDs. This does **not** guarantee a specific song is categorized as a YouTube Music audio track or that playlists are identically represented in YouTube Music; test the user-visible behavior for the target account.

- [Playlists: insert](https://developers.google.com/youtube/v3/docs/playlists/insert) (`POST /youtube/v3/playlists`)
- [PlaylistItems: insert](https://developers.google.com/youtube/v3/docs/playlistItems/insert) (`POST /youtube/v3/playlistItems`)
- Both require suitable Google OAuth authorization. Google documents quota costs; search, playlist creation, and additions consume quota.

**Implementation path:** search the actual artist/song/version, present video candidate title/channel/duration and user-visible ambiguity, resolve `youtube_video_id`, obtain user OAuth, create playlist with explicitly chosen privacy, add ordered items, and confirm item responses. Respect region/rights restrictions, quota, and duplicate behavior.

**Unofficial YouTube Music clients** are not interchangeable with this official API. They may expose music-specific endpoints but use unsupported methods; if offered in the future, keep them optional and mark their maintenance/security risks clearly. Never invent `youtube_music:create` or assume it exists in the agent toolset.
