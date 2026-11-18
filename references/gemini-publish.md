# Gemini exact-track publishing

Check the connected provider's supported actions and authorization. Keep the current verified crate intact and preserve visibility. If exact-track creation is unavailable, return the curated crate and explain the limitation. On Publish, check for an existing result first.

**Create the exact playlist.** Supply only the personal-playlist intent, the curated title, the requested number of tracks and the corresponding verified recording links in their intended order. The number of recording links must match the requested count: **12 by default**, or the listener's explicitly requested count. Omit any separate list of track titles **entirely**, including an empty or null list. In Gemini's reported tests, supplying recording links together with a separate title list caused an intended 12-track playlist to expand to 17–21 tracks through additional matches. Never fill the difference with duplicates or replace an exact-track request with a thematic mix.

Keep the **exact, unmodified playlist link returned by creation** for subsequent saving. Do not reconstruct it from an identifier or substitute a search result. An intermediate queue or playback link is not proof of library persistence.

**Save the existing playlist.** Supply only the personal-playlist intent, that same unmodified playlist link, the curated title and the description containing the sonic introduction and complete numbered TRACKLIST / LINER NOTES. Omit the list of individual recording links **entirely**, including an empty or null list. Gemini reported that including that list during saving produced an empty result without a confirmed library save. Reuse the existing playlist rather than attempting creation again.

Reconcile count, positions, editions and library persistence using [verification](references/verification.md). Use the original provider link on follow-up. Avoid automatic retries and duplicate creation. If the full description cannot be retained, provide remaining liner notes in copy-ready text. Offer the supported manual save step where available. Report whether requested artwork was applied.
