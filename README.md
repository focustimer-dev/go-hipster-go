<h1 align="center">HIPSTER MUSIC GENERATOR</h1>

<p align="center"><sub>EST. MMXXVI · SMALL-BATCH PLAYLISTS · ARTISANAL OBSCURITY</sub></p>

<p align="center">“Who’s here ironically and who’s here because they sincerely enjoy it?”</p>

<p align="center"><em>Whole crowd raises both hands.</em></p>

<p align="center"><sub>Ethically sourced deep cuts. Sustainable, farm-to-table pretention.</sub></p>


An **Agent Skills-style**, open-source music curator for real, surprising, globally connected music. It combines **era + audible texture + geographic scene + microgenre** with actual track-verification discipline, a sense of humor, and a service-neutral playlist JSON format.

> **Status:** usable curation skill, offline validators and example schema; streaming adapters are documented **plans**, not deployed integrations. No OAuth or audio-recognition service is included.

**Field reports:** A user has successfully published Spotify playlists through ChatGPT and YouTube Music playlists through Gemini. **ChatGPT Work** also successfully orchestrated Hipster Music Generator → Spotify from one `go` request; **ordinary Chat** required selecting both Hipster Music Generator and Spotify in the same prompt. These are observed host behaviors, not bundled integrations or guarantees for other accounts. Exact catalog matching and order are still being evaluated. See [ChatGPT installation and mode notes](adapters/chatgpt/PLUGIN_INSTALL.md).

<details>
<summary><strong>Our needlessly particular manifesto</strong> (for the discerning listener)</summary>

- **Obscurity is not a personality.** It is, however, an extremely convenient substitute for one.
- **A sonic connection must be real.** We refuse to pair two tracks solely because both were discovered in a converted warehouse.
- **There is no shame in a shiny chorus.** Somewhere in the stacks is a statistically improbable house special. A gloriously overproduced 1980s chorus may be more radical than a limited-edition cassette pressed in somebody's kitchen.
- **We verify the music.** Your favorite 1982 Bulgarian synth-funk B-side should actually exist before we make you feel inferior for not knowing it.
- **No gatekeeping at the door.** Just an imaginary bouncer who insists your handlebars are insufficiently mustachioed.

</details>

## Try the skill — entry is free; the tote bag is not

Point an agent at this repository and ask it to add the skill. Then say **`@hipster-music-generator go`**: it will **check whether a connected playlist writer is actually exposed first**, then curate 12 tracks and attempt to save them. This is an experimental order-of-operations improvement, not a guarantee that ChatGPT or Gemini will automatically activate a second music app. If the host does not expose a playlist writer, it will still curate and tell you what wasn't saved. **Observed ChatGPT workaround:** select both **Hipster Music Generator and Spotify** in the composer before saying `go`. If a `go` run curated but couldn't publish, select Spotify and ask it to publish **the same tracks already listed**, not generate new ones. **`go, text only`** opts out.

**Go modifiers:** `go fast`, `go angry`, `go chill`, `go slow`, `go weird`—or combine them: `go weird slow`. The default is **12 tracks**; `go short` is 6, `go long` is 24, and `go fast 30` asks for 30. **50 tracks is a soft quality target, not a hard limit**; host publishing limits and actual catalog matching still apply.

1. Install the **entire repository folder** as `hipster-music-generator` in a compatible agent's skill directory. See [agent setup](adapters/agents.md).
2. Ask: `Use hipster-music-generator: give me a 12-track playlist connecting Thai molam and Italian library funk; make the transitions defensible.`
3. Or: `Use hipster-music-generator: go.` to curate a cross-scene surprise and attempt streaming publication automatically.
4. Request portable playlist JSON if your agent supports writing files; run the standard-library validator below.

<details>
<summary><strong>ChatGPT · Plugin Creator</strong></summary>

The repo now contains a [portable plugin manifest](plugin.json), a [packaged skill](skills/hipster-music-generator/SKILL.md), and a [one-time setup skill](skills/setup/SKILL.md). **Preferred approach:** install ChatGPT's **Plugin Creator**, give it this repository URL and ask it to create a personal plugin using the existing manifest and skills. Then run setup once and say `Use Hipster Music Generator: go`. See the [plugin installation walkthrough](adapters/chatgpt/PLUGIN_INSTALL.md).

Setup discovers **actually available** music-service tools and distinguishes search-only from authorized playlist-writing access. `go` now requests publication by default (subject to platform selection and approval). It can curate even without a publisher. No Spotify, YouTube Music or Apple Music publisher is bundled or automatically authorized. A GitHub URL by itself is not a one-click install; publishing this plugin to the universal directory is a separate later step.

For ChatGPT hosts without plugin support, the original [Project-based fallback](adapters/chatgpt/README.md) is still available.

</details>

<details>
<summary><strong>Claude · installation options</strong></summary>

**Claude:** Install the GitHub marketplace in Claude Code, or build a skill/plugin ZIP with `python scripts/build_agent_packages.py --zip` for supported Claude chat/Cowork accounts. See [Claude installation](adapters/claude/README.md). Installation has not been live-tested in Claude.

</details>

<details>
<summary><strong>Gemini · Android and CLI</strong></summary>

**Gemini Android app:** **User-tested first try:** paste this GitHub repository URL in Gemini chat and ask it to add/use the skill, then invoke its built-in **YouTube Music** skill separately for publishing. One user reported a six-track playlist from this flow; the prompt had explicitly requested six. **Persistence across chats and exact track matching are not yet verified.** Official fallback: build/upload the five-file, instruction-only `dist/hipster-music-generator-gemini-app-skill.zip` through **Gemini web → Customize → Skills → Create → Upload**. See [Gemini guide](adapters/gemini/README.md) and [Android acceptance test](adapters/gemini/MOBILE_SMOKE_TEST.md).

**Gemini CLI:** You can separately install the extension with `gemini extensions install https://github.com/focustimer-dev/hipster-music-generator`. This is a different runtime from the mobile app.

The Gemini app ZIP deliberately excludes Python and scripts, since its music curation is an instruction workflow rather than executable code. Run `python scripts/build_gemini_app_skill.py` locally only to **build** the upload, not inside Gemini.

**Streaming note:** Google's Gemini/YouTube Music connection documents playlist creation, but exact ordering and exact mix matching still require a runtime test. Its Gemini/Spotify connection is documented for search/play, not playlist-writing. In all hosts, publishing requires a real authorized provider action; static packaging is not proof of account access.

All agent distributions are built from the same canonical `SKILL.md` and references. Run `python scripts/build_agent_packages.py --check` to verify synchronization.

</details>

<details>
<summary><strong>Validation · Python 3.10+</strong></summary>

```bash
python scripts/playlist_cli.py validate examples/example-playlist.json
python scripts/playlist_cli.py roll
python -m unittest discover -s tests -v
```

A roll prints `{ "roll": 1..100, "triggered": true|false }` and is intended to be used **once per eligible playlist**, not per track. To exercise the joke deterministically: `python scripts/playlist_cli.py debarge --output debarge.json`.

</details>

<details>
<summary><strong>Repository contents</strong></summary>

| Location | Purpose |
|---|---|
| [`SKILL.md`](SKILL.md) | Portable instructions and activation conditions |
| [`references/global-scenes.md`](references/global-scenes.md) | Expanded scene map from v2, including Africa, Asia, Latin America, Eastern Europe, and the Caribbean |
| [`references/sonic-taxonomy.md`](references/sonic-taxonomy.md) | Era and production palette |
| [`references/verification.md`](references/verification.md) | Distinguishes real recording, platform match, and publication |
| [`schemas/playlist.schema.json`](schemas/playlist.schema.json) | Service-neutral playlist structure |
| [`scripts/playlist_cli.py`](scripts/playlist_cli.py) | Real random roll, local structural validation, DeBarge sample generator |
| [`adapters/`](adapters/README.md) | Agent setup and planned streaming integrations |
| [`tests/`](tests/discovery-cases.md) | Offline tests and manual music-evaluation cases |

</details>

<details>
<summary><strong>Streaming services · publishing requirements</strong></summary>

The skill can **recommend** music without an account connection. To **publish**, a separately implemented adapter must search exact catalog recordings, handle OAuth, preview ambiguous/missing matches, and verify successful writes. Follow the [adapter contract](adapters/README.md) and service notes for [YouTube](adapters/streaming/youtube.md), [Spotify](adapters/streaming/spotify.md), and [Apple Music](adapters/streaming/apple-music.md). No connector is implicitly installed or granted by downloading this repository.

</details>

<details>
<summary><strong>GitHub publishing · developer instructions</strong></summary>

For the **Git CLI method**, create an empty **public** repository named `hipster-music-generator` owned by `focustimer-dev` (do not add auto-generated files). From the folder containing this README:

```bash
git init -b main
git add .
git commit -m "Initial public v3 agent skill"
git remote add origin https://github.com/focustimer-dev/hipster-music-generator.git
git push -u origin main
```

GitHub authentication is required for the push. For a **phone-friendly GitHub-connected agent method**, instead create the public repository with **Add a README** checked at [github.com/new](https://github.com/new). Then ask your connected assistant to replace that starter README and commit the remaining v3 package files. An initialized `main` branch makes connector writes straightforward. Never paste a GitHub access token into a chat or the repository.

</details>

## License and contributions

MIT licensed. Contributions welcome: open an issue with a **reproducible prompt, exact track titles, and what improved or regressed**. Do not upload copyrighted recordings or leaked music-service credentials. See [AGENTS.md](AGENTS.md) and [CHANGELOG.md](CHANGELOG.md).
