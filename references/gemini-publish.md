# Gemini publishing follow-up

An explicit Publish request applies to the current curated playlist. Use the existing provider result and verified track order. Follow Gemini and YouTube Music permission and confirmation prompts. If there is no existing playlist, explain its status and use an exact-track creation option only when the user has authorized it and the provider supports it.

Use the supported YouTube Music save or edit action for the same playlist. Include the title and full description with the sonic introduction and all numbered liner notes where supported. Preserve visibility. If the provider limits description length, provide remaining notes in a copy-ready block.

If the playlist is already saved, verify its state and avoid duplicates. If the action is unavailable or fails, report the reason and offer the actual manual save step when available. Report saved status only with provider confirmation or readback. Identify any unresolved track order, substitutions or metadata persistence. Use only links returned by the provider. Follow the provider's supported cover-art controls and report whether artwork was actually applied.

## Gemini-specific playlist creation and saving (observed behavior)

These restrictions are based on Gemini's reported working YouTube Music handoff. They are not a universal YouTube Music API contract. First check that the connected service exposes authorized actions for an exact, ordered playlist. Follow the action's actual accepted inputs and the listener's permission prompts; never invent a capability or claim a write succeeded without evidence.

**Create the exact playlist.** Supply only the personal-playlist intent, the curated title, the requested number of tracks and the corresponding verified recording links in their intended order. The number of recording links must match the requested count: **12 by default**, or the listener's explicitly requested count. Omit any separate list of track titles **entirely**, including an empty or null list. In Gemini's reported tests, supplying recording links together with a separate title list caused an intended 12-track playlist to expand to 17–21 tracks through additional matches. Never fill the difference with duplicates or replace an exact-track request with a thematic mix.

Keep the **exact, unmodified playlist link returned by creation** for subsequent saving. Do not reconstruct it from an identifier or substitute a search result. An intermediate queue or playback link is not proof of library persistence.

**Save the existing playlist.** Supply only the personal-playlist intent, that same unmodified playlist link, the curated title and the description containing the sonic introduction and complete numbered TRACKLIST / LINER NOTES. Omit the list of individual recording links **entirely**, including an empty or null list. Gemini reported that including that list during saving produced an empty result without a confirmed library save. Reuse the existing playlist rather than attempting creation again.

**Verify the actual outcome.** An empty result, generated playlist card, queue identifier or library-looking identifier does not establish successful saving. Verify library persistence through provider confirmation or readback. Where available, check the count, recording identities, versions and order against the original curated list. If saving cannot be confirmed, report **SAVE UNCONFIRMED** and preserve the original link. If an actual save failure is observed, report **SAVE FAILED**. If library saving is confirmed but some positions remain hidden, report **SAVED — PARTIALLY VERIFIED** and mark those positions unverified. Claim exact publication only when all requested positions and their order have been verified.

Do not automatically retry a failed save, create a duplicate, re-curate or change recordings. A later Publish request must check the existing playlist's state first and reuse it. Never save a text-only request without subsequent explicit authorization.

## Partial preview versus full saved list

Google does not specify a universal eight-track preview limit. Treat hidden entries as unverified, not matched or missing. Compare the saved count, identities, versions and order where provider readback is available, and mark unseen positions **unverified**.

Never save a text-only crate without a later explicit request. Reuse the unmodified URI/URL from the existing provider result. No duplicates. Report SAVE TOOL UNAVAILABLE or SAVE FAILED according to the observed result. Offer the actual Save to library control when appropriate.

Include the complete TRACKLIST / LINER NOTES in the description where supported. Provide copy-ready metadata for anything the provider cannot retain. After saving, artwork can be applied through supported controls on music.youtube.com.
