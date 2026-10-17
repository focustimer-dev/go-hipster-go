# Claude: load → setup → go

Claude chat, Cowork and Claude Code are **different installation environments**. Hipster Music Generator is an instruction-based Agent Skill; it does not ship a Spotify authorization, paid account, or music publisher.

## Claude chat / Cowork — easiest supported install

**[Download Claude Skill ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-skill.zip)**

1. **Try the GitHub link first:** ask Claude to read [this repository](https://github.com/focustimer-dev/hipster-music-generator) and apply its `SKILL.md`. This can work within a chat, but reading GitHub is **not proof of a persistent skill installation**.
2. **For reliable reuse**, open Claude's **Customize → Skills → + → Create skill → Upload a skill** and select the ZIP above. Enable the new skill. The archive contains the required `hipster-music-generator/` root folder, the full SKILL.md, its local references and helper files. Claude requires **code execution enabled** for custom Skills; check the actual Skills controls if they aren't visible. Anthropic says Skills are available across Free, Pro, Max, Team and Enterprise subject to these controls.
3. **Connect Spotify separately:** [Add Spotify to Claude](https://claude.com/marketplace/connectors/spotify) through its official connector and complete whatever authorization the provider asks for. Spotify's Claude connection is available to Free and Premium listeners for discovery; **Spotify Premium** is specified for prompt-generated personalized playlists. The Anthropic connector lists `create_playlist`, `search`, and `fetch_tracks`, but the public tool list does **not** prove arbitrary *exact* item insertion or ordering.
4. Invoke `Use Hipster Music Generator: setup` and choose Spotify as the preferred publishing service if appropriate. Then say `go`, `go weird`, or `go sad 24`. Claude can **suggest a connected app without you naming it every time**, but may require your selection/approval. After publishing, compare the actual URL, count, song versions and ordering; a generated mix is not necessarily an exact transfer.

**[Download the complete Claude Plugin ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-plugin.zip)** only if your Claude host supports custom plugin upload through **Customize → Plugins**. The skill-only ZIP is the simpler default in Claude chat. Neither ZIP bundles Spotify credentials or adds a provider tool by itself.

**Update policy:** Uploaded ZIPs are snapshots, not live subscriptions to GitHub. If the skill changes, upload the newer package using Claude's skill-edit/replace controls. `setup` is safe to rerun; any cross-chat preference persistence requires a genuinely supported, user-approved storage mechanism.

**Live test status:** Official Claude skill upload and Spotify connector capabilities are documented; we have **not yet run** an end-to-end Hipster Music Generator → Claude → Spotify account test. The ZIPs are statically validated in GitHub CI, which is not the same as a successful install or exact playlist publication.

References: [Claude custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) · [Claude Spotify connector](https://claude.com/marketplace/connectors/spotify) · [How Claude suggests connected apps](https://support.claude.com/en/articles/14730684-how-claude-suggests-connected-apps)

## Claude Code — GitHub marketplace installation

This repository already provides a Claude Code plugin manifest, its own marketplace and two self-contained skills. In Claude Code, open a session and run:

```text
/plugin marketplace add https://github.com/focustimer-dev/hipster-music-generator
/plugin install hipster-music-generator@hipster-music-plugins
```

Verify the installed plugin using `/plugin` or `claude plugin list`. Where supported, invoke `/hipster-music-generator:setup` to configure preferences and `/hipster-music-generator:hipster-music-generator` for curation; check the actual loaded skill names. A plain `go` with the skill invoked should also work.

**Important:** Installing the Claude Code music-curation plugin does **not** automatically add the Claude consumer-chat Spotify connector. Confirm which tools are exposed in the **specific Claude Code environment** before claiming any Spotify publication. If needed, configure an authorized Spotify-capable MCP service separately; don't assume the consumer Spotify connector magically appears in Claude Code.

For local developer validation:

```bash
python scripts/build_agent_packages.py --check
python scripts/build_agent_packages.py --zip
claude plugin validate .
```

The last command needs a real Claude Code installation. We have not completed a live Claude Code marketplace-install smoke test.

References: [Claude Code plugins](https://code.claude.com/docs/en/plugins) · [Marketplace installation](https://code.claude.com/docs/en/plugin-marketplaces)
