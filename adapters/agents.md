# Installing across AI agents

The repository root is a standards-oriented Agent Skill: the directory must be named `hipster-music-generator` and contain `SKILL.md`. Some hosts recognize the standard directly; others require a dedicated install path, extension, file upload, or custom instructions. Always confirm the actual host version and tool permissions.

## Try the link first

Before manual file placement, ask an agent: `Add or load Hipster Music Generator from https://github.com/focustimer-dev/hipster-music-generator; read SKILL.md and its references using the skill mechanism you support. Confirm whether the skill is available in future chats.` Then, **inside the loaded skill**, say `setup` to choose music services and defaults; finish with `go`. Run `setup` again to adjust choices, `setup change ...` to modify one preference, or `setup status` to review them. This can work in capable agent sessions but **is not a universal, permanent GitHub installation or guarantee of persistent preferences**. Use the host-specific instructions below only if the agent cannot do this itself.

## Generic Agent Skills installation

Clone or download the complete repository and place the **folder** (not just SKILL.md) into the host's skill discovery directory. The relative `references/`, `scripts/`, `schemas/`, and `adapters/` paths must remain available.

## Codex / compatible agents

For agents using `.agents/skills/`, copy or symlink the repository folder to `.agents/skills/hipster-music-generator` in the project, or the agent's documented user-level skill directory. Restart/reload if necessary and ask for a playlist. Exact user-level locations can vary by host.

## Claude Code

Put the folder in `.claude/skills/hipster-music-generator` in the project or an appropriate personal skills location. Verify the installation using the platform's documented skill listing/discovery controls.

## Gemini CLI

Gemini CLI supports the Agent Skills convention; its docs describe `.gemini/skills/` and `.agents/skills/` discovery locations and `gemini skills install <URL>` on supported versions. See [official guide](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/creating-skills.md) and check `gemini skills list` / `/skills` as supported by your release.

## ChatGPT

For consumer ChatGPT, use the [Project-based installation guide](chatgpt/README.md) and [copyable instructions](chatgpt/PROJECT_INSTRUCTIONS.md). This is an adapted use of the skill, not native installation or an authenticated streaming adapter. The OpenAI API has a separate Skill bundle mechanism.

## Other platforms

Where a runtime has no native skill discovery, supply the text of `SKILL.md` through the platform's supported custom-instruction or knowledge-upload feature, and make the referenced files accessible. An instruction file alone does **not** provide catalog search, OAuth tokens, streaming API calls or tool access. Do not assume a ChatGPT session will automatically execute files installed in GitHub.

## Quick smoke test

After installing, ask: `Use hipster-music-generator: give me 6 real tracks connecting Peruvian chicha and Turkish psych, with the musical bridge for each and honest verification status.` Then try `go` while explicitly invoking the skill. Verify the correct taxonomy, provenance caveats, and absence of claimed playlist publication.

## Tested package definitions for Claude and Gemini

See the dedicated [Claude guide](claude/README.md) and [Gemini guide](gemini/README.md). Both packages read the same vendored full skill (`skills/hipster-music-generator/`), not a truncated rewrite. CI checks that it matches the canonical `SKILL.md` and that all references exist. Actual platform installation requires runtime smoke testing.
