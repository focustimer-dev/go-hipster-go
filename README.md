<p align="center"><img src="assets/logo.svg" width="132" height="132" alt="Hipster Music Generator — crimson five-point star" /></p>

<h1 align="center">HIPSTER MUSIC GENERATOR</h1>

<p align="center"><sub>EST. MMXXVI · SMALL-BATCH PLAYLISTS · ARTISANAL OBSCURITY</sub></p>
<p align="center">“Who’s here ironically and who’s here because they sincerely enjoy it?”</p>
<p align="center"><em>Whole crowd raises both hands.</em></p>


An open-source **Agent Skill for discovering real, unlikely, surprisingly coherent music** across eras, textures, geographic scenes and microgenres. Delivered by an extravagantly self-important, passive-aggressive record-store clerk who considers your listening habits a public infrastructure problem.

## Start here — let your agent do the paperwork

**First, try the easy way.** In your AI agent of choice, paste:

```text
Add the Hipster Music Generator skill from
https://github.com/focustimer-dev/hipster-music-generator

Read the repository's SKILL.md and its referenced files. Install or
load the skill using this agent's supported mechanism, then run the
skills/setup/SKILL.md instructions first.

Tell me what you successfully loaded, whether it persists across
conversations, and which connected music services can actually CREATE
playlists. Don't assume account connection means writing is available.
```

Once the agent confirms what it loaded and what setup discovered, say:

```text
go
```

**`go` curates twelve real tracks by default and attempts to save the playlist** to an available, authorized streaming service. If no actual publisher is exposed, it still curates and says plainly what wasn't saved. Say `go, text only` to skip publishing.

**Why this is the first step:** Many agents can load a skill directly from GitHub, without forcing you to download and copy an entire folder. Not all hosts support that flow, and some only load it for the current conversation. **Ask the agent to verify installation and persistence** rather than treating a GitHub URL as a magic install button. Manual and platform-specific paths are below when needed.

## Go, but with opinions

Modifiers change the **sound**, not merely the genre label. Combine them freely:

| Say | You get |
| --- | --- |
| `go` | Twelve-track sonic surprise |
| `go weird` | Riskier, still defensible musical bridges |
| `go fast angry` | Propulsion and confrontation; subtlety is optional |
| `go chill` | Space and warmth without assuming slow tempo |
| `go weird slow` | Patient, hypnotic strangeness |
| `go short` / `go long` | 6 / 24 tracks |
| `go fast 30` | 30 tracks with extra forward momentum |
| `go, text only` | No streaming write attempt |

Exact requested counts take precedence over ordinary short/long defaults; **50 is a soft quality target, not a platform limit**. The result should report any shortfall rather than quietly replacing twelve tracks with six.

Or skip the shorthand and ask for something truly specific:

```text
Give me twelve real tracks connecting Thai molam and Italian library funk.
Make the transitions musically defensible, not just geographically surprising.
```

## What you're installing

- **Sonic-first discovery.** **Era + audible texture/production + geographic scene + microgenre**. Being obscure on the same continent is not a musical bridge.
- **Real songs.** Verify artist, recording, version and catalog availability instead of inventing remarkably convenient B-sides.
- **Actual sequencing.** An intentional listening arc and a concrete musical reason for each track.
- **Honest publishing.** A connected account is not necessarily an exposed playlist-writing tool; the skill distinguishes curation from provider-confirmed saving.
- **An insufferable curator.** Snark, passive aggression and extravagantly unearned confidence—with evidence-based music research underneath. Say `less snark` if you insist.

<details>
<summary><strong>Our needlessly particular manifesto</strong> — for the discerning listener</summary>

- **Obscurity is not a personality.** It is, however, an extremely convenient substitute for one.
- **A sonic connection must be real.** We refuse to pair tracks just because both were discovered in a converted warehouse.
- **There is no shame in a shiny chorus.** A gloriously overproduced 1980s pop-soul selection may be the most convincing curveball.
- **We verify the music.** Your favorite Bulgarian synth-funk B-side ought to exist before we make you feel inferior for not knowing it.
- **No gatekeeping at the door.** Just an imaginary bouncer who insists your handlebars are insufficiently mustachioed.

</details>

## Installation when the easy way needs help

Try the GitHub-link prompt above first. **Use host-specific installation or manual file placement only when your agent can't load and retain the skill directly.** A music-account connection is always a separate authorization step.

<details>
<summary><strong>ChatGPT — plugin setup and Work</strong></summary>

If ordinary GitHub loading doesn't persist, use [Plugin Creator](adapters/chatgpt/PLUGIN_INSTALL.md) to build/install the existing [plugin manifest](plugin.json) and [packaged skill](skills/hipster-music-generator/SKILL.md). Run the [setup skill](skills/setup/SKILL.md) to inspect genuinely exposed connected music services. [Project instructions](adapters/chatgpt/README.md) are a fallback without plugin support.

**Observed:** ChatGPT Work has published to Spotify from a single `go`; ordinary Chat on Android required selecting **Hipster Music Generator and Spotify together**. Neither behavior is a universal guarantee. The detailed runtime notes are collapsed under **Field reports** below.

</details>

<details>
<summary><strong>Gemini — direct GitHub loading and native skill upload</strong></summary>

A user successfully asked Gemini to load this GitHub skill and then invoked YouTube Music to generate a playlist. The observation doesn't establish a persistent GitHub-based install across chats.

If the agent cannot load or retain it, create the five-file, instruction-only ZIP with `python scripts/build_agent_packages.py --zip` and use the native Skills uploader in Gemini web. Uploaded skills aren't guaranteed to auto-sync from GitHub. See the [Gemini guide](adapters/gemini/README.md) and [Android test cases](adapters/gemini/MOBILE_SMOKE_TEST.md). Gemini CLI is a separate installation path.

</details>

<details>
<summary><strong>Claude and other agents — plugin or manual fallback</strong></summary>

Try pointing your agent at the repository first. If it needs an explicit install mechanism, see the [Claude guide](adapters/claude/README.md) and [generic Agent Skills guide](adapters/agents.md).

Where filesystem placement is genuinely required, install the **whole repository folder**, keeping `SKILL.md` and its relative reference files together. Claude runtime installation has not been live-tested here.

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
| Gemini + YouTube Music | A user reported a six-track playlist after loading the repository and explicitly using the music connection; six were requested | Persistent installation and exact track/ordering fidelity |

The personal plugin has also sometimes displayed a generic icon despite packaged branding assets; see [issue #2](https://github.com/focustimer-dev/hipster-music-generator/issues/2). That is a UI concern, not evidence about playlist publication.

</details>

<details>
<summary><strong>Iterative improvements & release notes</strong></summary>

See the [full changelog](CHANGELOG.md) for dates and version-specific detail. The major lines of work are:

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
| [`skills/setup/SKILL.md`](skills/setup/SKILL.md) | One-time capability/setup instructions |
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
