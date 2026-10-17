<h1 align="center">HIPSTER MUSIC GENERATOR</h1>

<p align="center"><sub>EST. MMXXVI · SMALL-BATCH PLAYLISTS · ARTISANAL OBSCURITY</sub></p>

> A lot of the serious music I pretty much exclusively listen to, you probably haven't heard of it.

<p align="center"><em>“Who’s here ironically and who’s here because they sincerely enjoy it?”</em></p>

<p align="center"><em>Whole crowd raises both hands.</em></p>

<p align="center"><sub>Ethically sourced deep cuts. Sustainably pretentious. Fair-trade almond milk sold separately.</sub></p>


An **Agent Skills-style**, open-source music curator for real, surprising, globally connected music. It combines **era + audible texture + geographic scene + microgenre** with actual track-verification discipline, a sense of humor, and a service-neutral playlist JSON format.

> **Status:** usable curation skill, offline validators and example schema; streaming adapters are documented **plans**, not deployed integrations. No OAuth or audio-recognition service is included.

<details>
<summary><strong>Our needlessly particular manifesto</strong> (for the discerning listener)</summary>

- **Obscurity is not a personality.** It is, however, an extremely convenient substitute for one.
- **A sonic connection must be real.** We refuse to pair two tracks solely because both were discovered in a converted warehouse.
- **There is no shame in a shiny chorus.** The right DeBarge song can be more radical than a limited-edition cassette pressed in somebody's kitchen.
- **We verify the music.** Your favorite 1982 Bulgarian synth-funk B-side should actually exist before we make you feel inferior for not knowing it.
- **No gatekeeping at the door.** Just an imaginary bouncer who insists your handlebars are insufficiently mustachioed.

</details>

## Try the skill — entry is free; the tote bag is not

1. Install the **entire repository folder** as `hipster-music-generator` in a compatible agent's skill directory. See [agent setup](adapters/agents.md).
2. Ask: `Use hipster-music-generator: give me a 12-track playlist connecting Thai molam and Italian library funk; make the transitions defensible.`
3. Or: `Use hipster-music-generator: go.` to get a surprising cross-scene mashup.
4. Request portable playlist JSON if your agent supports writing files; run the standard-library validator below.

## ChatGPT: install once with Plugin Creator (v3.1)

The repo now contains a [portable plugin manifest](plugin.json), a [packaged skill](skills/hipster-music-generator/SKILL.md), and a [one-time setup skill](skills/setup/SKILL.md). **Preferred approach:** install ChatGPT's **Plugin Creator**, give it this repository URL and ask it to create a personal plugin using the existing manifest and skills. Then run setup once and say `Use Hipster Music Generator: go`. See the [plugin installation walkthrough](adapters/chatgpt/PLUGIN_INSTALL.md).

Setup discovers **actually available** music-service tools and distinguishes search-only from authorized playlist-writing access. It can curate even without a publisher. No Spotify, YouTube Music or Apple Music publisher is bundled or automatically authorized. A GitHub URL by itself is not a one-click install; publishing this plugin to the universal directory is a separate later step.

For ChatGPT hosts without plugin support, the original [Project-based fallback](adapters/chatgpt/README.md) is still available.

## Claude and Gemini (v3.1 distributions)

**Claude:** Install the GitHub marketplace in Claude Code, or build a skill/plugin ZIP with `python scripts/build_agent_packages.py --zip` for supported Claude chat/Cowork accounts. See [Claude installation](adapters/claude/README.md). Installation has not been live-tested in Claude.

**Gemini Android app:** **User-tested first try:** paste this GitHub repository URL in Gemini chat and ask it to add/use the skill, then invoke its built-in **YouTube Music** skill separately for publishing. One user reported a six-track playlist from this flow; the prompt had explicitly requested six. **Persistence across chats and exact track matching are not yet verified.** Official fallback: build/upload the five-file, instruction-only `dist/hipster-music-generator-gemini-app-skill.zip` through **Gemini web → Customize → Skills → Create → Upload**. See [Gemini guide](adapters/gemini/README.md) and [Android acceptance test](adapters/gemini/MOBILE_SMOKE_TEST.md).

**Gemini CLI:** You can separately install the extension with `gemini extensions install https://github.com/focustimer-dev/hipster-music-generator`. This is a different runtime from the mobile app.

The Gemini app ZIP deliberately excludes Python and scripts, since its music curation is an instruction workflow rather than executable code. Run `python scripts/build_gemini_app_skill.py` locally only to **build** the upload, not inside Gemini.

**Streaming note:** Google's Gemini/YouTube Music connection documents playlist creation, but exact ordering and exact mix matching still require a runtime test. Its Gemini/Spotify connection is documented for search/play, not playlist-writing. In all hosts, publishing requires a real authorized provider action; static packaging is not proof of account access.

All agent distributions are built from the same canonical `SKILL.md` and references. Run `python scripts/build_agent_packages.py --check` to verify synchronization.

## Quick validation (Python 3.10+; no pip install)

```bash
python scripts/playlist_cli.py validate examples/example-playlist.json
python scripts/playlist_cli.py roll
python -m unittest discover -s tests -v
```

A roll prints `{ "roll": 1..100, "triggered": true|false }` and is intended to be used **once per eligible playlist**, not per track. To exercise the joke deterministically: `python scripts/playlist_cli.py debarge --output debarge.json`.

## What's inside

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

## Publication to streaming services

The skill can **recommend** music without an account connection. To **publish**, a separately implemented adapter must search exact catalog recordings, handle OAuth, preview ambiguous/missing matches, and verify successful writes. Follow the [adapter contract](adapters/README.md) and service notes for [YouTube](adapters/streaming/youtube.md), [Spotify](adapters/streaming/spotify.md), and [Apple Music](adapters/streaming/apple-music.md). No connector is implicitly installed or granted by downloading this repository.

## GitHub publishing

For the **Git CLI method**, create an empty **public** repository named `hipster-music-generator` owned by `focustimer-dev` (do not add auto-generated files). From the folder containing this README:

```bash
git init -b main
git add .
git commit -m "Initial public v3 agent skill"
git remote add origin https://github.com/focustimer-dev/hipster-music-generator.git
git push -u origin main
```

GitHub authentication is required for the push. For a **phone-friendly GitHub-connected agent method**, instead create the public repository with **Add a README** checked at [github.com/new](https://github.com/new). Then ask your connected assistant to replace that starter README and commit the remaining v3 package files. An initialized `main` branch makes connector writes straightforward. Never paste a GitHub access token into a chat or the repository.

## License and contributions

MIT licensed. Contributions welcome: open an issue with a **reproducible prompt, exact track titles, and what improved or regressed**. Do not upload copyrighted recordings or leaked music-service credentials. See [AGENTS.md](AGENTS.md) and [CHANGELOG.md](CHANGELOG.md).
