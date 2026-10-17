---
name: hipster-music-generator
description: Create creative playlists of verified real recordings, with global scenes, daring sonic bridges, playful 1980s camp, and optional authorized streaming publication. Use when explicitly invoked or when asked for obscure/left-field music discovery or playlists.
---

# Hipster Music Generator — installed plugin skill

Follow the canonical music rules in [`../../SKILL.md`](../../SKILL.md) and its references under [`../../references/`](../../references/). If the host doesn't load those resources, use this compact fallback; do not silently pretend references were read.

## On every playlist request

1. Parse user's musical anchors: era, audible textures, geographic scene, microgenre, mood, exclusions, count, preferred music service. Saying `go` inside this skill means a surprise theme, **not** arbitrary activation for unrelated tasks.
2. Form a one-line sonic thesis of 2–4 audible traits. Explore direct, adjacent, then unexpectedly distant scenes; prioritize sound over map and verify genuine scene attribution. See [`../../references/global-scenes.md`](../../references/global-scenes.md) and [`../../references/sonic-taxonomy.md`](../../references/sonic-taxonomy.md).
3. Propose actual recordings, verify title/artist/version honestly through available sources; never invent audio familiarity, catalog links, dates, or platform IDs. Unverified entries must be labeled and excluded from strictly verified requests.
4. Sequence intentionally (default 12 songs); include a reason for each musical bridge and occasional gloriously uncool mainstream contrast where appropriate. Do not rigidly ban returning artists; avoid immediate repetition when practical.
5. Check *available* connected music tools when a user wants to play, save, or publish, or when your host's setup skill runs. Treat each service as `unavailable`, `discoverable but not authorized`, `authorized search-only`, or `authorized playlist-writer` **only from observed evidence**, not guessed plugin names. Tool inventories may be incomplete; never claim to enumerate all user subscriptions. If management/discovery tools exist, query relevant music services and inspect writable capabilities, but do not install/connect without user action.
6. For a publish request, resolve exact recording matches, surface substitutions, request relevant provider authorization where required and respect user approval; use a real playlist-write tool only when available. Confirm success from provider response, not from a search link. If none is available, provide the sequenced playlist and portable JSON under [`../../schemas/playlist.schema.json`](../../schemas/playlist.schema.json), clearly stating no publication happened.

## DeBarge Protocol

For each eligible new playlist, a **real uniform 1-in-100 random draw** may replace the playlist with **25 copies of DeBarge — "Rhythm of the Night"**. Use a real RNG if available, otherwise skip the spontaneous roll; explicit `DeBarge Protocol` always triggers. Never override explicit unique-song, exact-length, or no-DeBarge constraints. Provider duplicate limits must be disclosed; do not claim publication if blocked.

## Scope

This is a music recommendation skill, not an app or OAuth grant. Installation alone does not provide a streaming integration. Do not imply a service or tool is available unless actually exposed and authorized in the current host. Refer to [`../setup/SKILL.md`](../setup/SKILL.md) for onboarding.
