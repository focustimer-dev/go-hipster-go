<p align="center"><img src="assets/logo.svg" width="132" height="132" alt="Hipster Music Generator — crimson five-point star" /></p>

<h1 align="center">HIPSTER MUSIC GENERATOR</h1>

<p align="center"><sub>EST. MMXXVI · SMALL-BATCH PLAYLISTS · ARTISANAL OBSCURITY</sub></p>
<p align="center">“Who’s here ironically and who’s here because they sincerely enjoy it?”</p>
<p align="center"><em>Crowd stays silent... no one is sure any more</em></p>


An open-source **Agent Skill for discovering real, unlikely, surprisingly coherent music** across eras, textures, geographic scenes and microgenres. Delivered by an extravagantly self-important, passive-aggressive record-store clerk who considers your listening habits a public infrastructure problem.

## Start here — load, setup, go

**Try the easy way first.** Many agents can read a skill straight from GitHub. No folder archaeology required unless your particular host insists on it.

**1. Load the skill.** Give your AI agent this instruction:

```text
Add or load Hipster Music Generator from
https://github.com/focustimer-dev/hipster-music-generator

Read SKILL.md and its referenced files. Use your supported skill
installation or loading mechanism. Confirm what you loaded and whether
it persists across conversations. If this host requires a manual
installation step, tell me the smallest supported one.
```

**2. Run `setup` in the loaded skill.** It will check the music services *actually available in that chat*, ask where you prefer to listen and publish, and offer default playlist settings. Keep the defaults or customize them. **Run `setup` again whenever you want to change your preferences**; `setup change ...` edits one setting and `setup status` shows what is known.

```text
setup
```

**3. Make some music.** Once setup says you're ready:

```text
go
```

By default, `go` curates **12 real tracks** and attempts to publish to your chosen streaming service if a genuine authorized playlist writer is accessible. If publishing isn't available, it returns the music and clearly says it wasn't saved. **Setup is recommended, not mandatory:** `go` works without it.

**Portability note:** Not every host can install directly from a GitHub URL or remember preferences across chats. Setup should tell you when your choices are session-only and offer a reusable profile. It cannot connect an account or unlock an unavailable publisher by itself. [Manual installation options](#installation-when-the-easy-way-needs-help) are below.

## Everyday commands

### Setup & preferences

| Say | What happens |
| --- | --- |
| `setup` | Check accessible music services, choose a preferred destination and set defaults; safe to rerun |
| `setup status` | Review known preferences and available service capabilities |
| `setup change Spotify` | Change the preferred publishing service |
| `setup change 24 tracks` | Change the default playlist length |
| `setup again` | Refresh service discovery while retaining existing choices |

Setup does **not** generate a playlist. It won't store your preferences outside the current session unless the host genuinely supports user-approved persistence. Choosing a service is not the same as confirming that its playlist-writing tool is accessible.

### Playlists & modifiers

Modifiers shape the **sound**, not just a genre label. Combine moods, speeds and track counts freely:

| Say | Musical direction |
| --- | --- |
| `go` | 12-track sonic surprise; attempt to publish |
| `go weird` | Stranger, still musically defensible connections |
| `go fast angry` | Rhythmic propulsion with bite |
| `go chill` | Warm, easy listening—not necessarily slow |
| `go sad` | Melancholy and yearning without compulsory ballads |
| `go sad fast` | Cathartic music with some forward momentum |
| `go weird slow` | Patient, hypnotic strangeness |
| `go short` / `go long` | 6 / 24 tracks |
| `go fast 30` | 30 tracks with the requested energy |
| `go, text only` | Curate without attempting a streaming write |
| `less snark` | Reduce the curator's entirely unearned superiority |

An explicit count overrides the ordinary length default; **50 tracks is a soft quality target, not a platform limit**. If the host returns fewer than requested, it should disclose the difference rather than quietly congratulating itself.

Or go beyond the shorthand:

```text
Give me twelve real tracks connecting Thai molam and Italian library funk.
Make the transitions musically defensible, not just geographically surprising.
```

## What you're installing

- **Sonic-first discovery.** **Era + audible texture/production + geographic scene + microgenre**. Being obscure on the same continent is not a musical bridge.
- **Real songs.** Verify artist, recording, version and catalog availability instead of inventing remarkably convenient B-sides.
- **Actual sequencing.** An intentional listening arc and a concrete musical reason for each track.
- **Honest publishing.** A connected account is not necessarily an exposed playlist-writing tool; the skill distinguishes curation from provider-confirmed saving.
- **An insufferable curator.** Snark, passive aggression and extravagantly unearned confidence—with evidence-based music research underneath. Even this clerk knows not to mock someone who is genuinely hurting. Say `less snark` if you insist.

<details>
<summary><strong>Our needlessly particular manifesto</strong> — for the discerning listener</summary>

- **Obscurity is not a personality.** It is, however, an extremely convenient substitute for one.
- **A sonic connection must be real.** We refuse to pair tracks just because both were discovered in a converted warehouse.
- **There is no shame in a shiny chorus.** A gloriously overproduced 1980s pop-soul selection may be the most convincing curveball.
- **We verify the music.** Your favorite Bulgarian synth-funk B-side ought to exist before we make you feel inferior for not knowing it.
- **No gatekeeping at the door.** Just an imaginary bouncer who insists your handlebars are insufficiently mustachioed.

</details>

## Installation when the easy way needs help

Start with the three steps above: **load → `setup` → `go`**. Use host-specific installation or manual file placement only when the agent cannot load and retain the skill directly. After any manual install, run `setup` before your first `go`. Music-account authorization remains separate.

<details>
<summary><strong>ChatGPT — plugin setup and Work</strong></summary>

If ordinary GitHub loading doesn't persist, use [Plugin Creator](adapters/chatgpt/PLUGIN_INSTALL.md) to build/install the existing [plugin manifest](plugin.json) and [packaged skill](skills/hipster-music-generator/SKILL.md). Run **`setup`** (or the [dedicated setup skill](skills/setup/SKILL.md)) to choose music-service preferences and inspect genuinely exposed connected music services. [Project instructions](adapters/chatgpt/README.md) are a fallback without plugin support.

**Observed:** ChatGPT Work has published to Spotify from a single `go`; ordinary Chat on Android required selecting **Hipster Music Generator and Spotify together**. Neither behavior is a universal guarantee. The detailed runtime notes are collapsed under **Field reports** below.

</details>

<details>
<summary><strong>Gemini — direct GitHub loading and native skill upload</strong></summary>

A user successfully asked Gemini to load this GitHub skill and then invoked YouTube Music to generate a playlist. The observation doesn't establish a persistent GitHub-based install across chats.

If the agent cannot load or retain it, **[download the ready-to-upload Gemini Skill ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-gemini-app-skill.zip)** and use **Gemini web → Customize → Skills → Create → Upload**. No terminal or file-building step needed. Maintainers can still generate the ZIP with `python scripts/build_agent_packages.py --zip`. Uploaded skills don't auto-sync from GitHub. See the [Gemini guide](adapters/gemini/README.md) and [Android test cases](adapters/gemini/MOBILE_SMOKE_TEST.md). Gemini CLI is a separate installation path.

</details>

<details>
<summary><strong>Claude — ready-to-upload skill, native Spotify connector, or Claude Code plugin</strong></summary>

Start with the GitHub-link prompt. To **keep** the skill in Claude chat, **[download the Claude Skills ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-skill.zip)** and upload it under **Customize → Skills** with code execution enabled. Separately **[add Spotify to Claude](https://claude.com/marketplace/connectors/spotify)** if you want it to publish playlists; Spotify Premium is advertised for personalized playlist creation. Then `setup` → `go`.

Claude Code users can install the existing GitHub marketplace plugin. These are different environments: having Spotify connected in Claude chat does not by itself expose Spotify tools to Claude Code. **[Full Claude instructions](adapters/claude/README.md)** · [optional Claude Plugin ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/hipster-music-generator-claude-plugin.zip). There is no end-to-end live Claude account test yet.

</details>

<details>
<summary><strong>Meta Muse — official Spotify support; skill installation requires verification</strong></summary>

**Muse personal agent already connects to Spotify** for discovery, playback, and playlist creation. Try the GitHub-link prompt, run `setup`, and ask Muse whether it can **retain** the workflow; don't assume a consumer Muse custom-skill ZIP installer exists. Meta's developer **Muse Code** has a documented `SKILL.md` installer, but it is a different product.

See the **[Muse-specific GitHub-first prompt and setup guide](adapters/muse/README.md)**. A working consumer Spotify connector does not confirm exact recording order or persistent installation of our skill.

</details>

<details>
<summary><strong>Other agents — manual fallback</strong></summary>

Ask the agent to load this repository first. If it truly requires filesystem placement, follow the [generic Agent Skills guide](adapters/agents.md) and keep `SKILL.md` alongside all its referenced files.

</details>

<details>
<summary><strong>Streaming services and permissions</strong></summary>

Curation doesn't require a streaming account. Playlist publication requires an **exposed, authorized write-capable service connection**. The repository contains plans and integration contracts, **not bundled Spotify/YouTube/Apple OAuth credentials or deployed publishers**.

See the [adapter contract](adapters/README.md) and provider notes for [Spotify](adapters/streaming/spotify.md), [YouTube Music](adapters/streaming/youtube.md) and [Apple Music](adapters/streaming/apple-music.md). A search result, account link or generated URL alone is not evidence of successful publication.

</details>

## The back room

For anyone who reads the liner notes, the iteration history and platform observations are still here. They simply no longer interrupt the first listen.

<details>
<summary><strong>Field reports & compatibility notes</strong></summary>

These are **reported runtime observations**, not guaranteed host capabilities:

| Environment | Observed | Not yet established |
| --- | --- | --- |
| ChatGPT Work + Spotify | A single `go` created a playlist without explicitly selecting Spotify | Exact recording/order fidelity; Work once returned six instead of the normal twelve |
| Ordinary Chat + Spotify | Selecting both plugins produced a twelve-track playlist visible in Spotify | Automatic activation of Spotify when only the music skill is selected |
| Ordinary Chat, skill only | Curated tracks but had no Spotify playlist-writing tool, even after publishing-first preflight | Host-level plugin routing; see [issue #1](https://github.com/focustimer-dev/hipster-music-generator/issues/1) |
| Gemini + YouTube Music | A six-track user-reported playlist was generated using the connection; a later 12-track curation gave an incorrect ChatGPT-specific composer instruction rather than Gemini's `@YouTubeMusic` route | Whether the provider preserves exact recordings/order or a generated preview is saved to library; see [Gemini guidance](adapters/gemini/README.md) |

The personal plugin has also sometimes displayed a generic icon despite packaged branding assets; see [issue #2](https://github.com/focustimer-dev/hipster-music-generator/issues/2). That is a UI concern, not evidence about playlist publication.

</details>

<details>
<summary><strong>Iterative improvements & release notes</strong></summary>

See the [full changelog](CHANGELOG.md) for dates and version-specific detail. The major lines of work are:

- **First-run preferences:** conversational `setup`, revisitable provider choices, and honest session-only versus persistent settings.
- **Claude and Meta Muse:** platform-specific onboarding, native Spotify connector guidance and conservative cross-conversation skill persistence claims.
- **Musical discovery:** wider scene taxonomy, track-level sonic bridges, authentic recordings and feedback-driven adjustments.
- **Publishing handoff:** one-command intent, capability preflight and faithful recovery of already-curated lists.
- **Flexible prompts:** composable `go` mood/speed modifiers and explicit track counts.
- **Quality control:** request-versus-result counts, version matching and honest uncertain or missing track reports.
- **Identity:** the insufferably smug record-shop persona and crimson-star branding.

Implemented instructions aren't the same as demonstrated cross-host publishing or proven musical improvement. Open issues and unresolved experiments remain in [GitHub issues](https://github.com/focustimer-dev/hipster-music-generator/issues).

</details>

<details>
<summary><strong>Repository files, validation & developer setup</strong></summary>

| File | Purpose |
| --- | --- |
| [`SKILL.md`](SKILL.md) | Canonical music-curation skill |
| [`skills/setup/SKILL.md`](skills/setup/SKILL.md) | Service discovery and revisitable listener setup |
| [`references/global-scenes.md`](references/global-scenes.md) | Scene and geography research |
| [`references/sonic-taxonomy.md`](references/sonic-taxonomy.md) | Audible production and era map |
| [`references/verification.md`](references/verification.md) | Recording versus streaming versus saved-playlist evidence |
| [`schemas/playlist.schema.json`](schemas/playlist.schema.json) | Portable JSON playlist schema |
| [`scripts/playlist_cli.py`](scripts/playlist_cli.py) | Offline validation, randomness and example generation |
| [`adapters/`](adapters/README.md) | Host and streaming guides |
| [`assets/`](assets/BRAND_GUIDE.md) | Brand assets and icon guide |

For maintainers with Python 3.10+:

```bash
python scripts/build_agent_packages.py --check
python scripts/build_chatgpt_bundle.py --check
python scripts/playlist_cli.py validate examples/example-playlist.json
python -m unittest discover -s tests -v
```

Use `python scripts/build_agent_packages.py --zip` to generate upload bundles. Offline tests validate package structure and local contracts, **not** actual Spotify/YouTube Music writes.

</details>

## License & contributions

MIT licensed. Contributions are welcome: [open an issue](https://github.com/focustimer-dev/hipster-music-generator/issues) with the **prompt, exact recording titles, and what succeeded or regressed**. Never upload copyrighted recordings or streaming-service credentials. See [AGENTS.md](AGENTS.md) and [CHANGELOG.md](CHANGELOG.md).

*You're welcome. We understand it's difficult to express gratitude when you aren't accustomed to hearing good music.*



<p align="center"><sub>Ethically sourced deep cuts. Sustainable, farm-to-table pretension.</sub></p>
