# Gemini publishing follow-up

An explicit Publish request applies to the current curated playlist. Use the existing provider result and verified track order. Follow Gemini and YouTube Music permission and confirmation prompts. If there is no existing playlist, explain its status and use an exact-track creation option only when the user has authorized it and the provider supports it.

Use the supported YouTube Music save or edit action for the same playlist. Include the title and full description with the sonic introduction and all numbered liner notes where supported. Preserve visibility. If the provider limits description length, provide remaining notes in a copy-ready block.

If the playlist is already saved, verify its state and avoid duplicates. If the action is unavailable or fails, report the reason and offer the actual manual save step when available. Report saved status only with provider confirmation or readback. Identify any unresolved track order, substitutions or metadata persistence. Use only links returned by the provider. Follow the provider's supported cover-art controls and report whether artwork was actually applied.

## Gemini-runtime YouTube Music tool parameter rules (observed)

These are Gemini-reported fixes for the connected `youtube_music:create` and `youtube_music:save` actions, **not** a universal YouTube Music API contract. Check that the actual connected tool exposes the action and accepted fields before calling it. Never invent unavailable tools, fields, recording URIs or successful writes.

**Create — exact ordered recordings.** After resolving the complete curated crate, pass **only** `media_intent_type`, `title`, `number_of_videos` and `video_uris` to `youtube_music:create`. The count must equal the number of verified ordered URIs (12 by default, or the explicitly requested count). **Omit `video_titles` entirely**—not even `null` or `[]`. Gemini observed that sending both titles and URIs made 12 requests expand into 17–21 entries through additional title matching. Do not use a thematic writer as a fallback.

Illustrative 12-track request (replace placeholders with actual verified URIs; never send placeholders):

```json
{
  "media_intent_type": "PERSONAL_PLAYLIST",
  "title": "<curated playlist title>",
  "number_of_videos": 12,
  "video_uris": [
    "<verified URI 01>", "<verified URI 02>", "<verified URI 03>",
    "<verified URI 04>", "<verified URI 05>", "<verified URI 06>",
    "<verified URI 07>", "<verified URI 08>", "<verified URI 09>",
    "<verified URI 10>", "<verified URI 11>", "<verified URI 12>"
  ]
}
```

Preserve the **unmodified** playlist/queue `uri` returned by create for a subsequent save; do not reconstruct it from IDs or use a newly searched URL. A `QP...` identifier is a reported intermediate form, not proof of persistence.

**Save — the existing result only.** Call `youtube_music:save` using **only** `media_intent_type`, `uri` (the exact URI returned by create), `title` and `description` with sonic introduction and full ordered TRACKLIST / LINER NOTES. **Omit `video_uris` entirely**—not even `null` or `[]`. Gemini observed that supplying `video_uris` to save returned `[]` and did not save the playlist.

```json
{
  "media_intent_type": "PERSONAL_PLAYLIST",
  "uri": "<exact uri from create result>",
  "title": "<curated playlist title>",
  "description": "<sonic introduction and full numbered TRACKLIST / LINER NOTES>"
}
```

**Verify rather than infer.** Do not interpret an empty `[]` save response, a `QP...` or `PL...` ID, or a preview card as confirmed saving. Check provider confirmation or actual library readback and available count, recording identity, version and order. If saving is unconfirmed, say **SAVE UNCONFIRMED** and keep the existing URI; if failure is observed, say **SAVE FAILED**. If saving is confirmed but some positions are not readable, disclose **SAVED — PARTIALLY VERIFIED**; claim exact publication only after the entire count and order have been verified. Do not call create again, auto-retry a failed save, change the tracks, or silently make a duplicate. On a subsequent Publish request, reuse the existing result and check its state first.

## Partial preview versus full saved list

Google does not specify a universal eight-track preview limit. Treat hidden entries as unverified, not matched or missing. Compare the saved count, identities, versions and order where provider readback is available, and mark unseen positions **unverified**.

Never save a text-only crate without a later explicit request. Reuse the unmodified URI/URL from the existing provider result. No duplicates. Report SAVE TOOL UNAVAILABLE or SAVE FAILED according to the observed result. Offer the actual Save to library control when appropriate.

Include the complete TRACKLIST / LINER NOTES in the description where supported. Provide copy-ready metadata for anything the provider cannot retain. After saving, artwork can be applied through supported controls on music.youtube.com.
