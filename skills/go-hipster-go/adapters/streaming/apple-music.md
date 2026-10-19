# Apple Music (planned)

**Status:** documentation/scaffold only; no authenticated client is bundled.

The official [Apple Music API](https://developer.apple.com/documentation/applemusicapi/) supports [creating a user's library playlist](https://developer.apple.com/documentation/applemusicapi/create-a-new-library-playlist) and [adding tracks](https://developer.apple.com/documentation/applemusicapi/add-tracks-to-a-library-playlist), subject to user authorization and service availability.

- Requires Apple developer authorization/token and a **Music User Token** for user-library operations; see [user authentication](https://developer.apple.com/documentation/applemusicapi/user-authentication-for-musickit).
- Search within the appropriate storefront; compare artist/title/version before accepting a catalog/library ID.
- Confirm region availability, playlist privacy, and order/duplicates in integration testing.
- Create and populate only after explicit approval, then check provider responses.

Do not publish API keys, private keys, developer tokens or music user tokens in GitHub, issues, logs or examples.
