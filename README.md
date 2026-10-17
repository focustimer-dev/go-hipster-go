# Hipster Music Generator v3

> A lot of the serious music I pretty much exclusively listen to, you probably haven't heard of it.

An **Agent Skills-style**, open-source music curator for real, surprising, globally connected music. It combines **era + audible texture + geographic scene + microgenre** with actual track-verification discipline, a sense of humor, and a service-neutral playlist JSON format.

> **Status:** usable curation skill, offline validators and example schema; streaming adapters are documented **plans**, not deployed integrations. No OAuth or audio-recognition service is included.

## Try the skill

1. Install the **entire repository folder** as `hipster-music-generator` in a compatible agent's skill directory. See [agent setup](adapters/agents.md).
2. Ask: `Use hipster-music-generator: give me a 12-track playlist connecting Thai molam and Italian library funk; make the transitions defensible.`
3. Or: `Use hipster-music-generator: go.` to get a surprising cross-scene mashup.
4. Request portable playlist JSON if your agent supports writing files; run the standard-library validator below.

## ChatGPT: first supported installation path

Use a **ChatGPT Project** rather than assuming a GitHub `SKILL.md` auto-installs into consumer ChatGPT. The [ChatGPT setup guide](adapters/chatgpt/README.md) walks through Project instructions plus a **single consolidated knowledge file**; run the [manual smoke tests](adapters/chatgpt/SMOKE_TEST.md) after setting it up. No music account access or automatic GitHub-to-Project synchronization is implied.

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
