# Go, Hipster, Go! — rename and upgrade guide

**Product:** Go, Hipster, Go! · **Technical name:** `go-hipster-go` · **Former name:** `hipster-music-generator`

## One remaining repository-owner action

The connected GitHub integration can edit repository content but cannot rename a repository. In the repository, open **Settings → General → Repository name**, enter `go-hipster-go` and confirm. Existing GitHub links typically redirect after a repository rename, but verify connected integrations. Until that action, working source/download links continue to use `https://github.com/focustimer-dev/hipster-music-generator`.

## Install or replace the renamed skill

- **Gemini:** Replace the existing upload with `go-hipster-go-gemini-app-skill.zip`, then invoke `@go-hipster-go go @youtube-music` where Skills and Connected Apps support `@` selection.
- **Claude:** Install `go-hipster-go-claude-skill.zip` from Skills or `go-hipster-go-claude-plugin.zip` from Plugins. They are different archive types.
- **ChatGPT:** Create or install a new `go-hipster-go` personal plugin. The old personal plugin is a separate snapshot, and changing `plugin.json` in GitHub will not change an installed plugin's identity. Keep the old plugin as a temporary fallback while switching.
- **Launcher:** The PWA stays at https://hipster-go.samelling.workers.dev/ with the same home-screen manifest IDs, paths and mood shortcuts.

The release pipeline publishes the newly named ZIPs **and legacy filenames as aliases** to the new ZIP content. Previous versioned release packages remain available. A renamed ZIP or plugin cannot automatically update an installed AI skill, and the frontend alone cannot turn on a music-provider writer.

This is an identity migration only: no changes to the musical taxonomy, playlist-selection mechanics, verification rules, DeBarge Protocol, connected credentials, or streaming accounts.
