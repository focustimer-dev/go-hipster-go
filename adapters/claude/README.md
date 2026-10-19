# Claude: load → setup → go

Claude chat, Cowork and Claude Code are **different installation environments**. Hipster Music Generator is an instruction-based Agent Skill; it does not ship a Spotify authorization, paid account, or music publisher.

## For an agent asked to install this repository

**Critical pre-install selection rule:** The listener may be asking Claude itself to install the skill. **Do not recommend either archive until you have identified the exact upload interface.** If the user is already on **Customize → Plugins → Upload a plugin**, send the **Claude Plugin ZIP**, *not* the Claude Skill ZIP, and verify that the archive root contains `.claude-plugin/plugin.json`. If the user is on **Customize → Skills → Upload a skill**, send the **Claude Skill ZIP**, with `hipster-music-generator/SKILL.md` in the archive. If the user hasn't specified which screen, **ask one short question about the screen** instead of guessing from their words "install the skill." If the host can load from GitHub without a ZIP, prefer that but confirm the result is actually persistent before claiming installation.

**Observed regression:** A user pasted the repository's installation prompt into Claude. Claude supplied the *Skill ZIP*, but the user was on Claude's *Plugin* upload page, which rejected the ZIP because its plugin manifest was absent. **This was an agent recommendation error, not a mistake by the listener.** The correct Plugin ZIP is a separate, verified GitHub Release asset; actual successful import into that Claude account remains to be tested.

**Prompt to use inside Claude, if you're already looking at an upload page:**

```text
Install Hipster Music Generator from
https://github.com/focustimer-dev/hipster-music-generator

First identify whether I'm on Claude's "Upload a plugin" or
"Upload a skill" screen. Read adapters/claude/README.md.
For the Plugins screen, give me ONLY the Claude Plugin ZIP, with
.claude-plugin/plugin.json at its root. For Skills, give me ONLY
the Claude Skill ZIP, with hipster-music-generator/SKILL.md.
If the screen is unclear, ask. Don't claim installation
until the upload actually succeeds. Then run setup.
```

## Claude chat / Cowork — choose the right uploader

**Which Claude screen are you on?** The two ZIPs are **not interchangeable**:

| Claude screen | Required archive | What's inside |
| --- | --- | --- |
| **Customize → Skills → Upload a skill** | **[Download Claude Skill ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-skill.zip)** | `hipster-music-generator/SKILL.md` plus references |
| **Customize → Plugins → Upload a plugin** | **[Download Claude Plugin ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-plugin.zip)** | Top-level `.claude-plugin/plugin.json` manifest plus `skills/` |

**Common validation error:** If the Plugins page says *"Zip must contain a .claude-plugin/plugin.json file or a top-level SKILL.md"*, you've probably uploaded the **Skill ZIP** into the **Plugin** uploader. Remove that file and choose the **Plugin ZIP** instead. No changes to Spotify authorization or the music skill are required to resolve that format error.

For most Claude chat users, the Skill uploader is the simpler installation method. If you've already reached the **Plugin** uploader, use the Plugin ZIP there.

1. **Try the GitHub link first:** ask Claude to read [this repository](https://github.com/focustimer-dev/hipster-music-generator) and apply its `SKILL.md`. This can work within a chat, but reading GitHub is **not proof of a persistent skill installation**.
2. **For reliable reuse**, open Claude's **Customize → Skills → + → Create skill → Upload a skill** and select the ZIP above. Enable the new skill. The archive contains the required `hipster-music-generator/` root folder, the full SKILL.md, its local references and helper files. Claude requires **code execution enabled** for custom Skills; check the actual Skills controls if they aren't visible. Anthropic says Skills are available across Free, Pro, Max, Team and Enterprise subject to these controls.
3. **Connect Spotify separately:** [Add Spotify to Claude](https://claude.com/marketplace/connectors/spotify) through its official connector and complete whatever authorization the provider asks for. Spotify's Claude connection is available to Free and Premium listeners for discovery; **Spotify Premium** is specified for prompt-generated personalized playlists. The Anthropic connector lists `create_playlist`, `search`, and `fetch_tracks`, but the public tool list does **not** prove arbitrary *exact* item insertion or ordering.
4. Invoke `Use Hipster Music Generator: setup` and choose Spotify as the preferred publishing service if appropriate. Then say `go`, `go weird`, or `go sad 24`. Claude can **suggest a connected app without you naming it every time**, but may require your selection/approval. After publishing, compare the actual URL, count, song versions and ordering; a generated mix is not necessarily an exact transfer.

**[Download the complete Claude Plugin ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-plugin.zip)** if your Claude host offers **Customize → Plugins → Upload a plugin**. The skill-only ZIP is the simpler default in Claude chat. Neither ZIP bundles Spotify credentials or adds a provider tool by itself.

**Update policy:** Uploaded ZIPs are snapshots, not live subscriptions to GitHub. If the skill changes, upload the newer package using Claude's skill-edit/replace controls. `setup` is safe to rerun; any cross-chat preference persistence requires a genuinely supported, user-approved storage mechanism.

**Live test status:** Official Claude skill upload and Spotify connector capabilities are documented; we have **not yet run** an end-to-end Hipster Music Generator → Claude → Spotify account test. The ZIPs are statically validated in GitHub CI, which is not the same as a successful install or exact playlist publication.

References: [Claude custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) · [Claude Spotify connector](https://claude.com/marketplace/connectors/spotify) · [How Claude suggests connected apps](https://support.claude.com/en/articles/14730684-how-claude-suggests-connected-apps)

## Apple Music requires a separate MCP connector

The [Hipster, Go! Manual](https://hipster-go.samelling.workers.dev/setup/?ai=claude&service=apple) prepares a Claude + Apple Music setup check. Installing this skill or selecting Apple Music in the PWA does **not** connect your account.

Use an Apple Music MCP connector compatible with your Claude environment: a local connector for Desktop, or a hosted remote connector for web/mobile. A local Mac connection does not automatically become available on your phone. Check the connector's actual tools for recording search, playlist creation and adding tracks; some implementations only search your existing library.

No Apple Music MCP server or credentials are bundled here, and an end-to-end Claude → Apple Music publishing test has not been completed. If writing is unavailable, return a verified text playlist and clearly report that it was not saved.

References: [Anthropic remote connector setup](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) · [Example community Mac connector and its requirements](https://github.com/pedrocid/music-mcp). The example is not a tested project integration.

## Spotify denied playlist creation: Premium gate versus exact 25-track editing

**Observed Claude field report (2026-10-17, corrected):** Spotify refused a 25-entry DeBarge playlist with a **Premium-required** generation error. Two generated playlist results appeared without descriptions, but the listener later confirmed **they did not save to Spotify**. The correct durable-publication count is therefore **0 confirmed saved**; the two generated results are not evidence of saved playlist objects. Their song counts and exact contents are unverified. Claude also proposed `create_playlist` and `add_playlist_items` as a manual route even though those tools weren't exposed in its session, and directed the listener to duplicate the song repeatedly in Spotify. The denial does not independently establish the listener's subscription tier or a broken account connection.

**What can actually be established:** Spotify's [official Claude launch announcement](https://newsroom.spotify.com/2026-04-23/claude-integration/) permits discovery on Free and Premium but specifies **Premium for personalized prompt-generated playlists**. The [published Claude connector tool list](https://claude.com/connectors/spotify) names `create_playlist`, `search`, and `fetch_tracks`, but does not advertise `add_playlist_items`. A tool listed publicly may be absent in a particular chat; its name doesn't guarantee exact versions, arbitrary duplicates, or ordered playlist editing.

**Correct next steps:** Preserve the original 25-position DeBarge manifest. Distinguish **two generated playlist results, neither saved** from a confirmed library entry. A temporary card or preview is not a durable save, even when it contains tracks; here **0 saved playlists are confirmed**, with **unknown track contents/order**. Do not retry blindly, fabricate saved links, or tell the listener to delete or repair nonexistent library playlists. If any genuinely saved playlist later appears, reconcile its URL and contents through read-only tools before mutation. Distinguish **actual account plan: unverified**, **tools exposed in this chat: observed**, **exact duplicate insertion: unconfirmed**, and **description writing: unconfirmed or missing**. Spotify Premium is required for personalized prompt-generated playlists through Claude, but does not guarantee exact ordered insertion or repeated recording support. If the listener has Premium, ask which Spotify account Claude is using before considering reauthorization. Do not claim a reconnect fixes a Premium gate, reroll DeBarge, silently substitute songs, suggest fictional tools, or force manual duplication.

Example of a useful failure report:

> **Generated, not saved:** Two playlist results appeared, but you confirmed they did not persist in Spotify. **0 playlists saved are confirmed**; their draft track contents and order remain unverified. Claude's later Premium-required error is consistent with a blocked prompt-generated playlist, but does not verify your subscription tier. I won't create duplicates or reroll the original 25 DeBarge entries.

## Claude made a playlist but the descriptions sound like a corporate brochure

The **install may be working even when Claude's copy is dull**. The skill now has a dedicated **playlist writing** section near the beginning of `SKILL.md`; it expects an evocative record-sleeve title, a concise proposed service description and track notes with real sonic hooks and just enough irritating superiority to suggest the clerk has tenure.

**After updating the installed plugin/skill**, test the tone before asking for another playlist:

```text
Use Hipster Music Generator. Rewrite the title, playlist description
and track commentary for the playlist above in the Insufferable
Record-Store Clerk voice. Make the title evocative and peculiar;
the description two snarky, sonically specific sentences; each
track note one concrete musical observation and an occasional
passive-aggressive aside. Avoid generic genre reviews and
repetitive insults. Do not change the song selection or order,
reroll DeBarge, or republish unless I ask.
```

If Claude only offers a neutral Spotify playlist card, it may not be able to **set the playlist's description metadata**. In that case it should write a separately labeled **Suggested playlist description** in chat. Never claim it updated Spotify unless the provider confirms the metadata write. After trying the style, share a sample of Claude's actual output if it still feels flat; we haven't yet compared real Claude and ChatGPT descriptions side by side.

**Remember to update the installed ZIP:** changing GitHub does **not** hot-reload the existing Claude plugin. Use [the Claude Plugin ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-plugin.zip) in **Customize → Plugins**, or the [Claude Skill ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-skill.zip) in **Customize → Skills** as appropriate.

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
