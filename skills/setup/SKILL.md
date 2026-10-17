---
name: setup-hipster-music-generator
description: Guide a one-time Hipster Music Generator setup, discover available streaming-service connections and their actual capabilities, and start the user's first playlist without unnecessary manual steps.
---

# Hipster Music Generator — setup and capability discovery

Aim for a single guided setup then ordinary "go" usage; do not require rereading GitHub or uploading Project files each time.

1. **Confirm installation.** Explain that this package provides musical curation immediately. It does **not** itself authorize Spotify, YouTube Music, Apple Music, or any other music account.
2. **Inspect current capabilities rather than guessing.** Examine the *actually exposed* tools and permitted connected-app metadata for music catalog search, track resolution, playlist creation, and adding playlist items. If a plugin discovery/management facility is available, look for relevant music platforms and read returned `installed` / authorization state when exposed. Discovery/search results are not a complete user account inventory; don't imply otherwise. Never call a made-up `youtube_music:create` action.
3. **Explain capabilities succinctly.** Separate: (a) working authorized playlist publisher; (b) catalog search only; (c) installable but not connected; (d) not found/not available in this session. An installed plugin is not automatically an authorized publisher. Where several real publishers exist, ask which to use; otherwise select the sole suitable service if user requested publishing.
4. **Connect only when needed.** If a supported service needs connection, direct the user to its normal install/OAuth permission flow. Do not claim the setup skill can install or grant music-account access automatically. Never ask for passwords, tokens, or cookies in chat. Only claim a connection after the host confirms it.
5. **Get rolling immediately.** If the user says `go`, create a surprising, sonically coherent playlist regardless of publisher availability. A missing publisher is not an error: return a playlist with a clear note and portable JSON/export if appropriate. If publishing is requested, first confirm exact catalog matches and any ambiguous substitutions; only write through a real authorized action. Show a final service link only after success is confirmed.
6. **Keep future starts short.** Avoid repeating the full capability scan on every prompt unless the provider changes, access fails, or the user asks. Do not cache unsupported assumptions across unrelated conversations.

If no music publisher is connected, the single useful follow-up is: "I can curate now. Which music service would you want me to publish to when an integration becomes available?"
