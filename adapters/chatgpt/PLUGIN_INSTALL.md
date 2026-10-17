# ChatGPT: install once via Plugin Creator

The **preferred** ChatGPT pathway is a packaged plugin, not repeatedly pasting a GitHub URL into a chat or uploading a Project knowledge snapshot. Portable plugin source lives in the repository root `plugin.json` and `skills/`.

## Personal setup

1. In ChatGPT **Plugins**, install **Plugin Creator** if available.
2. Start a chat with `@plugin-creator` and provide this public repository: `https://github.com/focustimer-dev/hipster-music-generator`.
3. Ask it to **create a personal Hipster Music Generator plugin from the repository's `plugin.json` and `skills/` directory**, preserving the canonical source and `skills/setup/SKILL.md` as onboarding. Review the generated plugin and install it from your available Plugins UI if needed. GitHub URLs are *inputs to the creation workflow*, not magic install links.
4. Run its **setup** skill once to check which music-service tools are **actually exposed and authorized**. Approval and connection screens are provider-controlled; do not enter tokens into the chat.
5. In a new music conversation, ask `Use Hipster Music Generator: go`. A correctly installed plugin can be used without manually re-fetching the entire repository each time. **For a reliably published Spotify playlist in the currently observed Android workflow, select both Hipster Music Generator and Spotify in the composer, then say `go`.** A skill-only `go` has been observed to curate successfully while lacking Spotify's writing action in that chat. If that happens, activate Spotify and ask to publish the **existing ordered playlist** without re-curating; do not discard the work.

**Availability varies:** Plugin Creator may provide personal/local installation in supported ChatGPT surfaces. Local MCP apps hosted on one computer generally will **not** be usable from ChatGPT web/mobile; for cross-device playlist publishing, a registered/remote provider integration is needed. A plugin manifest does not automatically publish to the public Plugin Directory, and personal plugins are not guaranteed to auto-sync from GitHub.

## Work versus ordinary Chat: observed Spotify behavior

A user tested both on their connected Spotify account:

- **ChatGPT Work:** Hipster Music Generator followed by plain `go` successfully orchestrated Spotify publishing without explicitly naming Spotify in the prompt. This is a **user-reported result**; it is not a guarantee for other accounts or a demonstration of exact recording/order fidelity.
- **Ordinary Chat (Android):** selecting only Hipster Music Generator and sending `go` has repeatedly generated a playlist **without** Spotify's write tools. Selecting **both Hipster Music Generator and Spotify** before sending `go` successfully created a playlist visible in Spotify.

**Recommended minimal-friction path:** use **Work** for one-command `go` when available. Otherwise, in ordinary Chat, select both plugins in the composer; don't rebuild or reauthorize Spotify merely because a particular chat lacks its writer. The different outcomes indicate host-level plugin orchestration, not a broken curation skill. See [the tracked integration limitation](https://github.com/focustimer-dev/hipster-music-generator/issues/1).

## Expected capabilities

- **Curation:** available immediately after the skill is installed, subject to the host reading the skill and optional reference files.
- **Music service discovery:** attempts to inspect accessible tools and optionally available plugin metadata, but cannot claim a complete list of the user's subscriptions or apps.
- **Playlist publication:** only when a real connected, authorized, writable provider integration exists and confirms it.
- **No provider writer:** return a verified text/JSON playlist with explicit publication status `not_published` instead of claiming success.

## First smoke test

Ask: `Use Hipster Music Generator setup. Tell me which music services you can actually search and which ones you can create playlists in, without guessing. Then go: give me 6 tracks bridging Peruvian chicha and Turkish psych.`

Report what worked and didn't in a GitHub issue. [Legacy Project instructions](README.md) remain available as a fallback for hosts without plugin support.

## Public distribution

A public **GitHub repository is not an automatically installable ChatGPT plugin**. Personal Plugin Creator installation, managed-workspace marketplace import, and publication to the shared Plugin Directory are separate processes. See [official plugin packaging docs](https://developers.openai.com/plugins/build/plugins) and [GitHub marketplace import guidance](https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github).
