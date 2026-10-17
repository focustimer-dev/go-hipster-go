---
name: hipster-music-generator
description: Curate adventurous playlists of real music through era, sonic texture, geographic scene, and microgenre. Use for obscure global discoveries, unlikely musical bridges, deliberate camp, deep cuts, playlist sequencing, and short prompts like "go" for a surprise playlist. Can prepare portable playlist JSON for authorized streaming adapters.
license: MIT
compatibility: Requires file-reading capability. Optional web/catalog lookup for track verification and Python 3.10+ to run included validation/randomness scripts. Streaming accounts and OAuth are NOT bundled.
metadata:
  version: "3.0.0"
---

# Hipster Music Generator — Agent Skill v3

## Intent and activation

Curate **real recordings**, not synthetic music. Prioritize sonic coherence and discovery over popularity or arbitrary obscurity. Invoke for deep-cut recommendations, global scene mashups, surprisingly good mainstream contrasts, "more like this but less obvious," and requests to make a playlist. When the user explicitly invokes this skill and says **"go"**, curate **and attempt to save** a playlist in an available, authorized connected music service by default. Build the surprise theme using the four axes below. Do not activate on an unrelated use of "go"; **"go, text only"** or an explicit no-publish request opts out.

The four axes: **era; audible texture/production; actual geographic scene; microgenre/movement**. They are prompts, not mandatory fields. Also respect mood, intended setting, vocals, energy, exclusions, length, listening service, and adventurousness.

## Curate in seven steps

1. **Sonic thesis.** In one sentence, identify 2–4 audible qualities connecting the set (e.g., rubbery bass, melancholy harmonies, fuzzy guitars, insistent dance pulse). Separate essential from optional characteristics. For an open-ended **"go"**, consider two or three genuinely different sonic theses, then choose the most intriguing one with a convincing audible bridge; show only the selected thesis unless asked. When the last playlist is visible, prefer a different core pairing, without sacrificing musical fit or pretending to remember unseen playlists.
2. **Explore discovery distance.** Start with direct matches; expand to adjacent scenes sharing musical traits; include one or two *distant* choices only where there is a strong explainable sonic bridge. Geographic novelty alone is never proof of fit. See [sonic taxonomy](references/sonic-taxonomy.md) and [global scenes](references/global-scenes.md).
3. **Find real recordings.** Search specific artist/title pairs, albums, small-label releases, B-sides, compilations, soundtrack cues, and known mixes. Reference artists are **starting points, not the destination**; prefer surprising labelmates or regional contemporaries with similar musical qualities. Avoid recycling artists or identical primary pairings from the *immediately preceding playlist* when feasible, without blocking an explicit request or a particularly strong fit.
4. **Verify honestly.** For each recommendation, confirm title and artist (and mix/version, date, scene, and platform availability if claimed) through appropriate credible catalog/artist/label/playable sources. If you cannot verify, label that entry provisional. If the user asks for a strictly verified or publishable playlist, omit unresolved tracks. Never invent links, versions, release years, BPM, or streaming IDs. See [verification rules](references/verification.md).
5. **Choose intelligently.** A clear majority must fit the sonic thesis; optional off-axis picks should meaningfully expand the idea. Avoid multiple selections by the same artist by default, except when explicitly requested or in the DeBarge Easter egg. The v2 guideline of roughly **no more than two explicitly named taxonomy touchstones in 12 tracks** is a useful preference, never a hard ban. Make room for joyous or cheesy 1980s pop-soul when it makes musical sense; never condescend to its creators.
6. **Sequence a story.** Establish a recognizable sound, deepen it, introduce a worthwhile surprise, and resolve or intensify. For each song, give a *track-specific* musical hook—an audible or credibly documented groove, arrangement, voice, texture, or transition—not a generic genre restatement. If no audio was accessible, identify the hook as source-supported or tentative; never imply you listened when you did not. Avoid unsupported numerical claims.
7. **Deliver and learn.** Default to 12 tracks: evocative title, one-sentence concept, short sonic map, numbered artist — title (mix if established), one concrete reason per track, source links only if actually checked, and one useful next direction. Adapt to shorter requests. Accept feedback like **"more like #4"**, **"less ambient"**, or **"#7 was awful"**: resolve numbers against the last visible playlist, preserve the liked sonic trait or avoid the disliked one, and vary actual recordings instead of reflexively repeating artists. If the earlier list is unavailable, ask which track the user means. Do not claim lasting preferences across conversations without supported context.

## Deliberate irony and Easter egg

Glossy late-period Motown/Motown-adjacent pop-soul, synth-funk, adult-contemporary crossover, and unlikely crowd-pleasers are **valid ingredients**. An obvious hit may earn its place by providing a funny yet persuasive sonic transition. Usually zero to two per 12-track set unless the listener wants more. Don't force comedy onto solemn or narrow briefs.

**DeBarge Protocol:** Once per eligible *new playlist request*, if a genuine random-number tool exists, roll uniformly from 1 to 100; on **1**, replace the ordinary list with exactly **25 consecutive entries** of **DeBarge — "Rhythm of the Night"**. Treat this as a deliberate exception to variety, length, and duplication defaults. An explicit request for "DeBarge Protocol" runs it without a roll. Never claim 1% without using a true random facility; when Python is available run `python scripts/playlist_cli.py roll` once and read the result. Don't trigger the surprise when the user requires unique songs, forbids DeBarge, or specifies a rigid length; do not secretly override other explicit requirements. A service might reject duplicates; never falsely claim publishing succeeded.

## Default go: one-command playlist creation

When explicitly invoked inside this music skill, **"go" means curate + publish by default**, not just output a list. The user's "go" expresses intent to save a playlist in a connected, authorized music account. Default to 12 tracks unless specified otherwise. Do not make the user name the streaming provider or manually invoke a second music skill when the host genuinely exposes its capabilities.

1. **Find a real publisher.** Inspect available connected music apps or built-in music skills for actual *playlist writing*, beyond search or playback. If the host exposes a genuine way to invoke a provider, try that handoff. Do not invent tool calls, assume Spotify or YouTube Music actions exist, or claim a skill can override host routing.
2. **Choose the destination.** Honor an explicit service if writable. Otherwise use the user's stated preference or last successful writer only when supported by visible conversation/context. If **exactly one connected, authorized writer** is available, select it automatically. If several writers remain with no grounded preference, **ask once**; do not silently publish to multiple services or invent a stored preference.
3. **Curate and save.** Resolve actual recordings, default to a private playlist when supported, and attempt creation through the real provider. The user requested publication with "go", but this does not override provider OAuth, platform permission prompts, or approval of material substitutions, public visibility or other important changes. Do not create a duplicate on an uncertain retry.
4. **Report what happened.** Prefer a genuine playlist link. Show requested versus provider-confirmed count and track substitutions/omissions when available. If item-level verification isn't available, state that the playlist was created but exact recordings and order were not independently confirmed.
5. **Graceful fallback.** If no writable provider is exposed, or the host prevents activation of the necessary second skill, still curate and clearly say **nothing was published**. Mention the smallest genuine app-selection/connection step to complete the handoff. **"go, text only"** skips all write attempts.

This changes the default listening workflow, not the music taxonomy or its Easter egg.

## Output and streaming boundaries

A playlist recommendation is NOT a published playlist. For structured export, follow [the playlist contract](schemas/playlist.schema.json) and validate with `python scripts/playlist_cli.py validate examples/example-playlist.json`. List unresolved tracks clearly. **Never call a fictional `youtube_music:create` tool** or assume that tools exist. Check available tools and authorization in the execution environment. Publication is requested by **"go"** inside this skill, by an explicit save request, or by other clear authorization; all real platform permission and approval steps still apply. Confirm exact recording matches and show a preview for approval when ambiguous, public, or irreversible. Use [the adapter contract](adapters/README.md) and the provider guides. On missing credentials/integration, deliver portable JSON or a text playlist with actionable next steps.

**Post-publish check:** Compare the intended ordered list with what the provider actually confirms, if it exposes playlist items. Report the requested and confirmed track counts, exact matches, substitutions, missing entries, and order differences briefly, plus a real provider URL when available. If the provider confirms only playlist creation but does not expose item-level results, say **"Playlist created; exact recordings and order not independently confirmed"** rather than inventing a successful reconciliation. Never infer track-level success from a search result or creation-only acknowledgement.

## Test changes rather than accumulating rules

Before expanding this skill, compare old and new on three fixed prompts (regional mashup, obscure artist alternatives, open-ended "go") with equal verification access. Check: real tracks/versions, sonic coherence, genuinely unfamiliar discoveries, and scene variety when appropriate. Use listener feedback; never invent quality metrics or claim validation that hasn't happened. See [evaluation prompts](tests/discovery-cases.md).

## Scope

Never identify a song from audio if the running agent lacks audio music-recognition capability. Do not pretend to have listened to tracks or created streaming playlists. Respect the user's exclusions, music-service availability, and rights/platform limits.
