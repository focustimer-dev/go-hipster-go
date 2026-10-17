# ChatGPT install-once plugin (v3.1.0)

[Open the private ChatGPT plugin](https://chatgpt.com/plugins/plugins_6ad2c9ef604081919bf5b18ef6cb072b)

This ChatGPT plugin packages the repository's **SKILL.md** and supporting references under `skills/hipster-music-generator/`. It also includes `skills/setup/SKILL.md` as an onboarding skill. The portable manifest uses the Agent Plugins schema at `plugin.json`.

## Installation

1. Open the plugin link above using the ChatGPT account that owns the plugin.
2. Install/enable the private plugin when the UI offers that option.
3. Run setup, or ask: `Set up Hipster Music Generator and check what music services you can actually use.`
4. Ask: `Use Hipster Music Generator: go.`

## Capability levels

- **Discovery only**: curate grounded artist/track lists without an external account.
- **Catalog search**: confirm playable tracks only when a real music catalog connector is exposed.
- **Publishing**: requires a provider-specific authenticated write tool, available permissions, and confirmation from the provider.

Search or discovery results are not exhaustive evidence of what a user has installed. Video analytics applications are not music playlist writers. Do not request tokens in chat, claim a connection exists without inspecting available tools, or assume publication succeeded. Spotify, YouTube Music, Apple Music and other streaming providers require separate adapters or supported existing plugins.

## Source of truth and versioning

The GitHub `SKILL.md` and references remain the canonical source. **The currently installed private plugin is a packaged snapshot, not a live GitHub sync**. Updating GitHub does not upgrade the plugin automatically; publish a new plugin release through Plugin Creator after updating the package.

The private plugin is not a public marketplace listing. Public directory submission and review are a separate process.
