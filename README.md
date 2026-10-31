<p align="center"><img src="assets/logo.svg" width="132" height="132" alt="Go, Hipster, Go! — crimson five-point star" /></p>

<h1 align="center">GO, HIPSTER, GO!</h1>

<p align="center"><sub>EST. MMXXVI · SMALL-BATCH PLAYLISTS · ARTISANAL OBSCURITY</sub></p>
<p align="center">“Who’s here ironically and who’s here because they sincerely enjoy it?”</p>
<p align="center"><em>Crowd stays silent... no one is sure any more</em></p>


An open-source **Agent Skill for discovering real, unlikely, surprisingly coherent music** across eras, textures, geographic scenes and microgenres. Delivered by an extravagantly self-important, passive-aggressive record-store clerk who considers your listening habits a public infrastructure problem.

## Start with Hipster, Go!

**[Open the Jukebox](https://hipster-go.samelling.workers.dev/)** · **[First-time setup: Manual](https://hipster-go.samelling.workers.dev/setup/)**

The mobile-friendly **Jukebox** assembles a short music-curation request for **ChatGPT, Gemini or Claude** with **Spotify, YouTube Music or Apple Music**. It doesn't play tracks or create playlists by itself; **GO copies the request**, and your selected AI and authorized music service do the actual work.

**Your first visit:** Choose your AI and music service. The **FIRST TIME HERE?** ticket offers **SET ME UP** (copy a tailored connection check, open your AI, paste/send, then return) or **I'M ALREADY READY**. The full [Manual](https://hipster-go.samelling.workers.dev/setup/) handles installation and recovery; choosing a service here does not connect it.

**Build a crate:**

- **Mood:** Happy, Angry, Sad, Weird, Criminal or **The Funk**. Leave the mood unselected for a surprise; tap the selected mood again to clear it. Criminal requires *real songs about crime*, not just suspicious-sounding music.
- **Pace and place:** Slow, Relaxed, Mid, Brisk, Fast or **Any**; optionally choose from **25 listening territories** in the interactive atlas or accessible region controls. No region means worldwide. **Antarctica is strictly opt-in**—never included in worldwide or automatic shuffle. The map uses a primary region per country while honoring documented musical overlaps; [Turkey, Spain and other cases](references/regional-atlas.md#map-regions-and-musical-overlap) are explained in the regional atlas.
- **Make it yours:** Shuffle the crate's selections; pin **Mood**, **Pace** or **Regions** to hold them during shuffle, and **Undo** a shuffle. **+ ART** requests thematic cover art; **TRY HARD** opts into the [Deep Crate Protocol](references/go-hard.md). Both are optional and off by default.
- **GO, then hand off:** GO copies the current 12-track request. A floating **YOUR CRATE** selection ticket follows you down the page, then docks **collapsed, with its drop shadow**, into the printed receipt; tap it to expand. After a successful copy, the receipt says **COPIED. NOW OPEN [AI]** and gives the next step. A copied prompt is not a saved playlist.

Add the PWA to your home screen where your browser supports it. It does not install the skill, submit prompts, play music or publish playlists itself; there is no offline service-worker cache.

**Claude + Apple Music requires a compatible MCP connector**, with actual track-search and playlist-writing tools; see the [Claude guide](adapters/claude/README.md#apple-music-requires-a-separate-mcp-connector).

Prefer working directly in chat? Follow the steps below. The skill defaults to Spotify; an explicit PWA service choice takes precedence. For implementation and maintenance details, see the [PWA guide](launcher/README.md). The [skill](SKILL.md) and [plugin manifest](plugin.json) are authoritative for the current source version; previously installed ZIPs or saved skills do **not** auto-update from GitHub.

## Start here — load, setup, go

**Try the easy way first.** Many agents can read a skill straight from GitHub. No folder archaeology required unless your particular host insists on it.

**1. Load the skill.** Copy this prompt into your AI assistant. On GitHub, use the **Copy** icon at the top-right of the code block.

```text
Load Go, Hipster, Go! from GitHub:
focustimer-dev/go-hipster-go

Read SKILL.md and linked references.
Use my platform's supported loading method.
Confirm what loaded and if it persists.
```

<details>
<summary><strong>Using Claude? Copy this prompt instead</strong></summary>

Claude's Plugin and Skill uploaders need **different ZIP files**. Use this prompt rather than the universal one:

```text
Load Go, Hipster, Go! from GitHub:
focustimer-dev/go-hipster-go

Read SKILL.md and linked references.
Try a supported persistent install.
Before suggesting a ZIP, identify my
Claude upload screen.
Plugins: use the Claude Plugin ZIP.
Skills: use the Claude Skill ZIP.
Do not interchange these two files.
If the screen is unknown, ask me once.
Confirm what loaded and if it persists.
```

**Claude ZIP note:** The **Plugins** uploader needs `.claude-plugin/plugin.json` at the archive root; the **Skills** uploader needs `go-hipster-go/SKILL.md`. Never interchange the two archives. See the [Claude installation guide](adapters/claude/README.md) for the correct downloads.

</details>

**2. Run `setup` in the loaded skill.** Spotify is now the **default listening and publishing preference**: the skill checks whether Spotify can actually write playlists in your current AI platform, then shows the defaults without a service-selection interview. If your platform cannot publish to Spotify—or you simply prefer another service—use `setup change YouTube Music` (on Gemini) or another explicit service change. Run `setup` again whenever you want to change your preferences or refresh current music-service capabilities; `setup status` shows what is known.

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

### Playlists & modifiers

Modifiers shape the **sound**, not just a genre label. Combine moods, speeds and track counts freely:

| Say | Musical direction |
| --- | --- |
| `go` | 12-track sonic surprise; attempt to publish |
| `go weird` | Stranger, still musically defensible connections |
| `go funky` | Syncopated, elastic grooves and interlocking ensemble parts |
| `go criminal` | Verified crime narratives, often from non-English regional scenes |
| `go fast angry` | Rhythmic propulsion with bite |
| `go chill` | Warm, easy listening—not necessarily slow |
| `go sad` | Melancholy and yearning without compulsory ballads |
| `go sad fast` | Cathartic music with some forward momentum |
| `go weird slow` | Patient, hypnotic strangeness |
| `go hard` / `go funky hard` | Opt in to deeper verified discovery, competing sequences, and critical transition edits; still 12 tracks by default |
| `go antarctica` | Explicitly opt into Antarctica's thematic route; never included by default or random selection |
| `go short` / `go long` | 6 / 24 tracks |
| `go fast 30` | 30 tracks with the requested energy |
| `go, text only` | Curate without attempting a streaming write |
| `less snark` | Reduce the curator's entirely unearned superiority |

PWA **+ ART** and **TRY HARD** are opt-ins; their actual music selection and cover-art workflows run in the installed skill, not in the PWA. An explicit count overrides the ordinary length default; **50 tracks is a soft quality target, not a platform limit**. If the host returns fewer than requested, it should disclose the difference rather than quietly congratulating itself.

Or go beyond the shorthand:

```text
Give me twelve real tracks connecting Thai molam and Italian library funk.
Make the transitions musically defensible, not just geographically surprising.
```

### Setup & preferences

| Say | What happens |
| --- | --- |
| `setup` | Default to Spotify, check actual writer availability, and set defaults without an interview |
| `setup status` | Review known preferences and available service capabilities |
| `setup change YouTube Music` | Explicitly change the publishing preference (particularly useful on Gemini) |
| `setup change Spotify` | Restore Spotify as the preferred publishing service |
| `setup change 24 tracks` | Change the default playlist length |
| `setup again` | Refresh service discovery while retaining existing choices |

Setup does **not** generate a playlist. It won't store your preferences outside the current session unless the host genuinely supports user-approved persistence. **Spotify is the default preference, not a guaranteed publisher**: Gemini's Spotify media connection is documented for search/play, not playlist creation, so Gemini users can opt into `setup change YouTube Music`. Choosing a service is not the same as confirming that its playlist-writing tool is accessible.

## What you're installing

- **Sonic-first discovery.** **Era + audible texture/production + geographic scene + microgenre**. The [expanded research map](references/global-scenes.md) now explores Lao/Saigon archives, qawwali, Indigenous rock, Memphis rap/sigilkore, Indonesian punk, non-English psychedelia and nonbinary country—without quotas or stereotypes. Being obscure on the same continent is not a musical bridge.
- **Regions with provenance.** The [regional atlas](references/regional-atlas.md) separates a primary *map listening territory* from authentic cross-border scenes. Spain's Atlantic routes and Turkey's Balkan connections aren't invitations to discard your selected geography. Antarctica is an explicit-only thematic exception, not a spontaneous country shuffle.
- **Real songs.** Verify artist, recording, version and catalog availability instead of inventing remarkably convenient B-sides.
- **Actual sequencing.** An intentional listening arc and a concrete musical reason for each track. Optional **GO HARD** adds wider candidate verification and alternative orderings; ordinary GO remains the faster path.
- **Optional sleeve art.** A requested cover uses the installed skill's cover-art workflow; the PWA only copies the request.
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

If ordinary GitHub loading doesn't persist, use [Plugin Creator](adapters/chatgpt/PLUGIN_INSTALL.md) to build/install the existing [plugin manifest](plugin.json) and [packaged skill](skills/go-hipster-go/SKILL.md). Run **`setup`** (or the [dedicated setup skill](skills/setup/SKILL.md)) to choose music-service preferences and inspect genuinely exposed connected music services. [Project instructions](adapters/chatgpt/README.md) are a fallback without plugin support.

**Observed:** ChatGPT Work has published to Spotify from a single `go`; ordinary Chat on Android required selecting **Go, Hipster, Go! and Spotify together**. Neither behavior is a universal guarantee. The detailed runtime notes are collapsed under **Field reports** below.

</details>

<details>
<summary><strong>Gemini — direct GitHub loading and native skill upload</strong></summary>

A user successfully asked Gemini to load this GitHub skill and then invoked YouTube Music to generate a playlist. The observation doesn't establish a persistent GitHub-based install across chats.

To try persistent installation in Gemini, ask it to create and save the [small Gemini entry skill](adapters/gemini/SKILL.md), then **verify it appears under Customize → Skills and is selectable in a new chat**. Reading this repository once is not installation; there is no special **Task mode** requirement for this setup. If the entry method cannot save a working skill or read its linked references, **[download the complete Gemini Skill ZIP](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip)** and upload it through **Gemini web (desktop or mobile browser) → Customize → Skills → Create → Upload** (or Replace). The native app may not offer the uploader. No terminal or manual ZIP construction is necessary. GitHub commits do not refresh existing installed skills. See the [current Gemini guide](adapters/gemini/README.md) and [Android smoke tests](adapters/gemini/MOBILE_SMOKE_TEST.md). Gemini CLI has its own installation path.

**Package names:** Official release downloads use only `go-hipster-go-` filenames (Gemini Skill, Claude Skill, Claude Plugin, ChatGPT Plugin). Former `hipster-music-generator-` ZIP aliases are retired to prevent choosing the wrong file; use the latest release links above.


</details>

<details>
<summary><strong>Claude — ready-to-upload skill, native Spotify connector, or Claude Code plugin</strong></summary>

Start with the GitHub-link prompt. **On Claude's Skills upload screen**, use the **[Claude Skill ZIP](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-claude-skill.zip)**. **On Claude's Plugins upload screen**, use the **[Claude Plugin ZIP](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-claude-plugin.zip)** instead: the skill-only ZIP fails plugin validation because it lacks `.claude-plugin/plugin.json`. These are different uploaders. Custom Skills may require code execution enabled. Separately **[add Spotify to Claude](https://claude.com/marketplace/connectors/spotify)** if you want it to publish playlists; Spotify Premium is advertised for personalized playlist creation. Then `setup` → `go`.

Claude's Spotify connector requires Premium for personalized prompt-generated playlists; that does not prove it can insert **25 exact duplicates**. Generated cards or previews are **not saved playlists** unless the service/library confirms persistence. If Spotify refuses a later operation but playlists were already created, reconcile the **existing playlists, songs, order and description** before claiming a total failure. A later denial does not prove 0 saved, and another playlist must not be created automatically. [Claude's Premium-denial troubleshooting](adapters/claude/README.md#spotify-denied-playlist-creation-premium-gate-versus-exact-25-track-editing). Claude's commentary should use vivid playlist titles, a short snarky proposed description and track-specific liner notes; if it's generic, follow the [Claude writing-quality troubleshooting guide](adapters/claude/README.md#claude-made-a-playlist-but-the-descriptions-sound-like-a-corporate-brochure). Claude Code users can install the existing GitHub marketplace plugin. These are different environments: having Spotify connected in Claude chat does not by itself expose Spotify tools to Claude Code. **[Full Claude instructions](adapters/claude/README.md)** · [optional Claude Plugin ZIP](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-claude-plugin.zip). There is no end-to-end live Claude account test yet.

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

These are **listener-reported tests from October 16–17, 2026**, not guaranteed capabilities on every account. Short entries keep this table easier to scan on mobile.

| AI + service | Observed | Not yet verified |
| --- | --- | --- |
| **ChatGPT Work → Spotify** | `go` created a playlist | Exact versions/order; one run had 6 rather than 12 tracks |
| **ChatGPT → Spotify** | Selecting both apps saved 12 tracks | Skill-only writer routing ([issue #1](https://github.com/focustimer-dev/go-hipster-go/issues/1)); exact versions/order |
| **Gemini → YouTube Music** | Six-track playlist generated | **Save to library** and exact versions/order; 12-track routing needs retest |
| **Claude → Spotify** | Two previews; **generated but not saved** | Premium requirement encountered; exact duplicates and descriptions |
| **Meta Muse → Spotify** | Playlist created (listener report) | Exact versions/order; persistent skill loading |

**Claude detail:** Neither persisted in Spotify; **zero saved playlists were confirmed** in that test. A later attempt returned a Premium-required error. The listener's actual subscription tier was not independently verified. See [Claude guidance](adapters/claude/README.md).

**Current source behavior:** For Gemini + YouTube Music, plain `go` means curation **and an attempt to create one playable playlist** when an authorized writer exists. The installed skill preserves its originally curated list, reports provider substitutions as **approximate**, and labels failures clearly; a generated playlist card is not proof that the playlist was saved to the library. The previous curate-only Jukebox checkbox is retired. `go, text only` remains an explicit opt-out. **Check your installed Gemini Skill version against the repository's [canonical SKILL.md](SKILL.md)**; uploaded skill ZIPs do not refresh automatically.

**Gemini detail:** A separate twelve-track curation gave an incorrect ChatGPT-style composer instruction. That guidance was corrected but has not been retested. See [Gemini guidance](adapters/gemini/README.md).

**Muse detail:** The listener tested the consumer Meta Muse agent, **not Muse Code**. See [Muse guidance](adapters/muse/README.md).

**Platform notes, not additional field tests:** [Spotify's Claude announcement](https://newsroom.spotify.com/2026-04-23/claude-integration/) describes discovery for Free and Premium listeners but prompt-tailored playlists for Premium; [Spotify's Muse announcement](https://newsroom.spotify.com/2026-09-23/spotify-meta-muse-agent/) documents playlist creation. Google's [Spotify media-app guidance](https://support.google.com/gemini/answer/15300097) covers search/play, not playlist creation, while its [YouTube Music guidance](https://support.google.com/gemini/answer/15237118) supports generating playlists and may require tapping **Save to library**. These differences explain why Spotify is the **default preference**, but Gemini users may need `setup change YouTube Music` to publish.

**Evidence rule:** An on-screen playlist, a saved provider playlist, and an exact recording-by-recording match are three different outcomes. Don't claim a saved playlist or exact ordering without confirmation.

The personal plugin has also sometimes displayed a generic icon despite packaged branding assets; see [issue #2](https://github.com/focustimer-dev/go-hipster-go/issues/2). That is a UI concern, not evidence about playlist publication.

</details>

<details>
<summary><strong>Iterative improvements & release notes</strong></summary>

See the [full changelog](CHANGELOG.md) for dates and version-specific detail. The major lines of work are:

- **First-run preferences:** conversational `setup`, revisitable provider choices, and honest session-only versus persistent settings.
- **Jukebox onboarding:** one-time setup ticket, compact clipboard-to-AI handoff, returning-user "NO REFUNDS" stamp, and floating selection receipt with a collapsed paper dock.
- **Crate controls:** six moods including The Funk and Criminal, tempo/Any, regional atlas, constrained shuffle/pins/Undo, optional + ART and TRY HARD, and deliberate-only Antarctica.
- **Claude and Meta Muse:** platform-specific onboarding, native Spotify connector guidance and conservative cross-conversation skill persistence claims.
- **Musical discovery:** wider scene taxonomy, track-level sonic bridges, authentic recordings and feedback-driven adjustments.
- **Publishing handoff:** one-command intent, capability preflight and faithful recovery of already-curated lists.
- **Flexible prompts:** composable `go` mood/speed modifiers and explicit track counts.
- **Quality control:** request-versus-result counts, version matching and honest uncertain or missing track reports.
- **Identity:** the insufferably smug record-shop persona and crimson-star branding.

Implemented instructions aren't the same as demonstrated cross-host publishing or proven musical improvement. Open issues and unresolved experiments remain in [GitHub issues](https://github.com/focustimer-dev/go-hipster-go/issues).

</details>

<details>
<summary><strong>Repository files, validation & developer setup</strong></summary>

| File | Purpose |
| --- | --- |
| [`launcher/`](launcher/README.md) | Hipster, Go! PWA: Jukebox, Manual, shared UI and manifests |
| [`SKILL.md`](SKILL.md) | Canonical music-curation skill |
| [`skills/setup/SKILL.md`](skills/setup/SKILL.md) | Service discovery and revisitable listener setup |
| [`references/global-scenes.md`](references/global-scenes.md) | Scene and geography research |
| [`references/regional-atlas.md`](references/regional-atlas.md) | 25 territory lookups, cross-region provenance, and research routes |
| [`references/go-hard.md`](references/go-hard.md) | Optional Deep Crate Protocol |
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

MIT licensed. Contributions are welcome: [open an issue](https://github.com/focustimer-dev/go-hipster-go/issues) with the **prompt, exact recording titles, and what succeeded or regressed**. Never upload copyrighted recordings or streaming-service credentials. See [AGENTS.md](AGENTS.md) and [CHANGELOG.md](CHANGELOG.md).

*You're welcome. We understand it's difficult to express gratitude when you aren't accustomed to hearing good music.*



<p align="center"><sub>Ethically sourced deep cuts. Sustainable, farm-to-table pretension.</sub></p>
