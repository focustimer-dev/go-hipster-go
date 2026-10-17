# Claude installation — no Claude account required to package

Claude and Claude Code support Agent Skills; Claude also has its own **plugin** manifest format, different from the root OpenAI plugin.json. This repository includes both.

## Claude chat / Cowork (paid plans where custom skills/plugins are enabled)

- Download the **skill-only ZIP** generated with `python scripts/build_agent_packages.py`. It contains one `hipster-music-generator/` directory with `SKILL.md` and all supporting references and scripts.
- In Claude, go to **Customize → Skills → Create skill → Upload a skill**, and upload the ZIP. For a plugin instead, use **Customize → Plugins** and upload the plugin ZIP if your plan/host supports custom plugin upload.
- Ask `Use Hipster Music Generator: go`. Try `setup-hipster-music-generator` to discover only music integrations the active host actually exposes.
- Installing the skill does **not** grant Spotify, Apple Music, or YouTube Music authentication. Connections and write permissions require separate user authorization.

**Status:** Schema and package structure are checked offline; no Claude account was available for an actual import or generation test. Claude chat custom plugins and custom skills are plan-dependent. No implicit GitHub auto-sync is promised for uploaded ZIPs.

## Claude Code — install directly from GitHub

In a Claude Code session:

```text
/plugin marketplace add https://github.com/focustimer-dev/hipster-music-generator
/plugin install hipster-music-generator@hipster-music-plugins
```

Confirm with `/plugin` or `claude plugin list`, then invoke `/hipster-music-generator:hipster-music-generator`. You can also invoke the setup skill with `/hipster-music-generator:setup` where listed; use the skill name shown by `/plugin`.

The repository contains `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and standalone `skills/` directories; the plugin's skill is entirely self-contained and does not rely on paths outside a downloaded plugin.

For local packaging and static validation run:

```bash
python scripts/build_agent_packages.py --check
python scripts/build_agent_packages.py --zip
claude plugin validate .
```

`claude plugin validate` requires an installed Claude Code CLI and must be run by someone who has it. This repository's Python checks do not substitute for actual Claude import tests.

References:
- [Claude plugins](https://code.claude.com/docs/en/plugins)
- [Create a marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Upload a custom Claude skill](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
