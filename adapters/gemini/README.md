# Gemini installation — CLI extension + Gemini app Gem

Gemini CLI extensions/Agent Skills and the consumer Gemini app are **different runtimes**.

## Gemini CLI — install from GitHub

With Gemini CLI installed, in a terminal:

```bash
gemini extensions install https://github.com/focustimer-dev/hipster-music-generator
gemini extensions list
gemini extensions validate .
```

The repository root has `gemini-extension.json`; `skills/hipster-music-generator/SKILL.md` and `skills/setup/SKILL.md` are bundled under the recognized extension skills directory. Restart the interactive Gemini CLI session after install, then use `/skills list`. Ask `Use Hipster Music Generator: go`. Gemini CLI asks for consent when activating a skill and accessing its resources.

For a skill-only installation instead of the whole extension, supported CLI versions accept:

```bash
gemini skills install https://github.com/focustimer-dev/hipster-music-generator --path skills/hipster-music-generator
```

The `--path` option depends on Gemini CLI version; check `gemini skills install --help`. For extension updates, use `gemini extensions update hipster-music-generator`.

**Status:** Static structure checked locally; CLI execution and music-service permissions require testing on a machine with Gemini CLI installed.

## Gemini mobile/web app

The consumer Gemini app does **not** run Gemini CLI extensions just because it sees a GitHub URL. Use a custom **Gem** in Gemini web:

1. Open [gemini.google.com](https://gemini.google.com) → **Gems → New Gem**.
2. Name it **Hipster Music Generator**, paste [GEM_INSTRUCTIONS.md](GEM_INSTRUCTIONS.md) into instructions.
3. Add [GEM_KNOWLEDGE.md](GEM_KNOWLEDGE.md) under **Knowledge** by uploading it. It is generated from the canonical taxonomy and skill.
4. Save, then invoke the Gem on web or mobile: `go`.

Google's help center notes that personal-account Gems are scheduled to transition to skills starting November 2026; the installation pathway may change. A manually uploaded knowledge file is a snapshot, not an auto-synced GitHub connection. Google Drive-backed knowledge can sync Drive-file edits after configuration, but is not automatic GitHub sync. No music service is connected solely by Gem creation.

References:
- [Gemini CLI extensions](https://geminicli.com/docs/extensions/reference/)
- [Gemini CLI skills](https://geminicli.com/docs/cli/using-agent-skills/)
- [Gemini Gems](https://support.google.com/gemini/answer/15146780?hl=en)
