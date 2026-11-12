# Verification and playlist matching

## Distinguish three kinds of certainty

1. **Recording exists**: a credible artist/title pairing (and exact version, if relevant) is supported by an artist/label page, release track listing, catalog, or legitimate listing.
2. **Recording is available on a service**: an actual playable catalog result from that service was found. A search-engine hit does not prove it is playable.
3. **Recording has been added**: an authenticated provider response confirms a playlist item. A tool request or guessed URL does not prove publication.

Use `verification.status` on each entry: `verified` with a source URL, or `unverified` with the uncertainty stated in `verification.note`. Track references must not be guessed. For publishing, require a resolved provider ID and user authorization; verify artist/title/version before linking the match.

## Match checklist

- Exact artist credit, title, featured artists, spelling/transliteration variants
- Original versus cover, live, edit, remaster, demo, remix, extended 12-inch
- Confirm **original single/EP/album provenance** separately from the compilation, expanded-edition bonus track or later reissue containing it; don't label a bonus cut as part of the original LP. Keep recording identity distinct from the best available transfer and avoid uncertain dates.
- Actual service URL and provider ID, not a general artist page or a generic search result
- Country/scene provenance separately from a broad stylistic guess
- Explicit handling when the exact track or mix is unavailable; a reissue name or “Remastered” badge alone does not verify a clean transfer for Skip rough recordings

A partial or unverified discovery playlist is fine if openly labeled; a **strictly verified** or **publish-ready** playlist must not silently include unresolved candidates. The validator's `--strict` flag checks minimum verification metadata, not factual truth; independent listening/catalog validation is still needed.

## Criminal mood: verify the song's actual story

For each Criminal pick, require **song-specific** lyrics or credible song-level scholarship, liner notes or reporting explicitly establishing a criminal act, smuggling, fugitives, a criminal network or another crime-centered narrative. Genre-level scholarship is for finding leads, never evidence that *this song* concerns crime. A threatening beat, artist reputation, imprisonment alone, neighborhood or gunman-named riddim does not qualify. Do **not** invent lyrics, translations or plot details; when the evidence or language interpretation is uncertain, skip that entry in a strictly verified Criminal crate. Briefly explain the documented criminal subject in English and vary perspectives (bravado, witness, remorse, betrayal and consequence) only when supported by that song's evidence.

## When a later failure contradicts an earlier creation

**A failure returned after one or more writes is not proof of zero published.** A host may create multiple playlist objects, then fail to populate every item, set description metadata, verify contents, or complete another Premium-gated attempt. Separate these outcomes:

| Stage | Record |
| --- | --- |
| Create | Each provider-confirmed or **listener-observed** playlist separately; its URL/ID if known |
| Populate | Actual item count and exact song/version/order, or **unverified** |
| Metadata | Name/description saved, missing, or unknown |
| Later failure | Exact action and error; do not reinterpret it as a rollback |
| Reconciliation | Generated previews versus confirmed saved assets, intended/requested list, partial mismatches, remaining unknowns |

## After a service reports playlist creation

Keep the original ordered selections intact for comparison. If a streaming app offers a returned item list or playlist read-back, line up entries by **position, artist, title, and requested version**; compare repeated tracks positionally rather than collapsing duplicates. State requested count, confirmed added count, exact matches, substitutions, omissions, and order changes **only to the extent supported by provider data**. A remix, live version, cover, or ambiguous title is not an exact match merely because it plays. If a provider returns only a playlist URL or acknowledgement, do **not** claim item-level matches; say the saved sequence still needs a check. Reconcile earlier durable saves before reporting “0 published.” If the user confirms previews never persisted, report zero confirmed saves separately from preview count. Report unknown results as **unknown**, not missing or confirmed. Never silently substitute an alternate version; ask when the alternative materially affects the user's intent.

## Publication outcome reconciliation — format 1.0 remains unchanged

These labels describe **evidence**, not optimistic estimates or a provider's marketing
copy. Use them for the listener-facing status after an authorized publishing action:

| Internal status | Listener-facing label | Required proof |
| --- | --- | --- |
| \`curated_text_only\` | CURATED — NOT PUBLISHED | Explicit text-only request, no provider write |
| \`not_created\` | PLAYLIST NOT CREATED | No provider-confirmed playlist object |
| \`created_save_required\` | CREATED — SAVE REQUIRED | Actual created object/card, no confirmed library save |
| \`published_items_unverified\` | SAVED — ITEMS UNVERIFIED | Confirmed library save; insufficient full item/order/edition readback |
| \`published_exact\` | PUBLISHED — EXACT | Confirmed saved playlist, confirmed full provider count, every requested recording/version and position independently verified |
| \`published_approximate\` | PUBLISHED — APPROXIMATE | Confirmed save with an observed count, version, substitution, order or curation mismatch; describe each observed difference |

**Do not write these six values into playlist JSON format 1.0.** Its
\`publishing.status\` remains exactly \`not_attempted\`, \`dry_run\`, \`published\`,
or \`failed\`. The read-only reconciler in \`scripts/playlist_cli.py\` produces a
*separate* report, not a schema 1.1 migration. A historical format-1.0
\`published\` value with a playlist URL does **not** prove \`published_exact\`.

Reconcile with a separate evidence JSON via
\`python scripts/playlist_cli.py status-report evidence.json\`. It accepts
\`requested_count\`, \`curated_count\`, optional \`text_only\`,
\`created: {source, reference}\`, \`saved: {source, reference}\`,
\`provider_count\` (confirmed **full playlist total**, or null/omitted), and
\`positions: [{position, result, source, reference, recording_verified, note}]\`.
A created card is not a save. A save confirmation does not verify its items.
\`result: "exact"\` requires \`recording_verified: true\` based on independently
checked artist/title/version/recording identity, not an unexamined title match.
Mismatch values are \`substituted\`, \`wrong_version\`, \`wrong_order\`, and
\`missing\`, each with a factual \`note\`.

The caller must acquire authentic tool/library evidence; this offline function
cannot prove that a claimed source/reference is genuine. It rejects structural
contradictions and never contacts or writes to a provider. Keep positional
evidence separate even when the same recording occurs at multiple positions,
including all 25 DeBarge Protocol positions. Do not auto-deduplicate.

**Partial preview example:** if 8 of 12 requested entries are visible, report
eight observed positions and \`provider_count: null\` until the full provider
list is actually known. Positions 9–12 remain **unreviewed**, not missing.
\`provider_count: 8\` is appropriate *only* after confirming that the actual
complete provider playlist contains eight tracks. A link-only acknowledgement
cannot establish per-position matches, and unknown is never zero.

## Optional cover art

Only on `Cover art: yes` or an explicit sleeve request: after the final playlist and title are fixed, follow the full [period-authentic regional sleeve policy](cover-art.md). Artwork is optional and is never evidence of a historical release or an upload to a music service.
