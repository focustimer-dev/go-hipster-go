# Go, Hipster, Go! — rename and upgrade guide

**Product:** Go, Hipster, Go! · **Technical name:** `go-hipster-go` · **Former name:** `hipster-music-generator`

## Repository rename completed

The canonical repository is now https://github.com/focustimer-dev/go-hipster-go. Source, setup prompts and current download links use that address. GitHub redirects existing repository links; new instructions should use the canonical address.

The v3.5.1 cleanup updates package metadata and install guides. Switching AI in the launcher preserves the selected music service, mood and tempo. The launcher URL and saved browser preferences remain compatible.

## Install or replace the renamed skill

- **Gemini:** Replace the existing upload with `go-hipster-go-gemini-app-skill.zip`, then invoke `@go-hipster-go go @youtube-music` where Skills and Connected Apps support `@` selection.
- **Claude:** Install `go-hipster-go-claude-skill.zip` from Skills or `go-hipster-go-claude-plugin.zip` from Plugins. They are different archive types.
- **ChatGPT:** Download `go-hipster-go-chatgpt-plugin.zip` and install as a new personal plugin with the Plugin Creator or compatible uploader. The former personal plugin is a separate snapshot, and GitHub does not rename it automatically. Select **Go, Hipster, Go!** in new chats. Once the new plugin passes setup, disable or remove the old **Hipster Music Generator** snapshot in your app/plugin settings; repository changes do not remove it. For Spotify, select both Go, Hipster, Go! and Spotify in the composer.
- **Launcher:** The PWA stays at https://hipster-go.samelling.workers.dev/ with the same home-screen manifest IDs, paths and mood shortcuts.

The release pipeline publishes the newly named ZIPs **and legacy filenames as aliases** to the new ZIP content. Previous versioned release packages remain available. A renamed ZIP or plugin cannot automatically update an installed AI skill, and the frontend alone cannot turn on a music-provider writer.

This is an identity migration only: no changes to the musical taxonomy, playlist-selection mechanics, verification rules, DeBarge Protocol, connected credentials, or streaming accounts.

## Host checks after replacing an upload

1. Run `setup status` and verify the selected music service and actual writer availability.
2. Try `go weird, 6 tracks, text only` to check identity and curator voice without publishing.
3. When requesting a saved playlist, verify its actual saved count and order. ZIP validation alone does not prove host integration or streaming access.

Gemini and Claude uploads must be replaced in their own account interfaces. No live replacement or publishing test in those accounts is claimed by this release.
