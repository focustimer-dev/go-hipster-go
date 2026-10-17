# Gemini: native app skill first, CLI second

**The Gemini mobile/web app now supports native reusable Agent Skills**. Use that for everyday music listening rather than treating a custom Gem or Gemini CLI extension as equivalent.

## Preferred: native Gemini app skill (Android and web)

1. From this repository, run `python scripts/build_agent_packages.py --zip` to generate `dist/hipster-music-generator-gemini-app-skill.zip` (or download a prebuilt ZIP from a trusted release).
2. In **Gemini web** at https://gemini.google.com open **Menu → Customize → Skills → Create → Upload**.
3. Upload the ZIP. Its archive root contains `SKILL.md` and the full `references/` taxonomy, alongside supporting `schemas/`, `scripts/`, `adapters/`, and test reference text. Review and create the skill.
4. Switch to Gemini **Android**. The installed skill can be used from chats, either by selecting it with `/` or `@` or asking `Use Hipster Music Generator: go`. Automatic skill activation can also apply when enabled.
5. If you want music on YouTube Music, verify its **Connected Apps** authorization. Gemini may prompt you to connect when you request music. Explicitly use `@YouTubeMusic` when Gemini chooses the wrong service.

**Important:** Google documents ZIP/folder upload **in Gemini web**, not directly in the Android app; afterward the skill is available on mobile. Enable **Keep Activity** if Google requires it for Skills and connected music. A GitHub URL isn't currently documented as a one-click Gemini-app skill installer, and GitHub updates do **not** auto-sync to an uploaded skill. Re-upload a regenerated ZIP to update it.

## Music-service behavior (documented versus tested)

Google currently documents that Gemini Apps with **YouTube Music** can create playlists based on a mood, activity, genre, artist, and related ideas. This is our preferred target. It does **not** prove the host can recreate an arbitrary *exact ordered set* of obscure tracks, so preview and verify the resulting list before claiming faithful publication.

Google's current **Spotify** connected-media support in Gemini mobile covers searching/playing music and existing playlists; it expressly excludes creating playlists, radio, or saving tracks to playlists through that connection. Spotify remains a listening/search option, **not** a confirmed playlist writer.

Apple Music, other services, and host support for connected-app actions *inside the custom skill* are **not confirmed**. Do a real capability check in the active Gemini chat. Don't claim that linking a streaming account alone grants write access.

See [the mobile acceptance tests](MOBILE_SMOKE_TEST.md). Do not use fictional music-provider commands or request raw OAuth tokens.

Official documentation:
- [Google: Create and manage skills for Gemini Apps](https://support.google.com/gemini/answer/17094296)
- [Google: YouTube Music in Gemini](https://support.google.com/gemini/answer/15237118)
- [Google: Media streaming apps in Gemini mobile](https://support.google.com/gemini/answer/15300097)

## Gemini CLI — optional developer route

The repository also includes `gemini-extension.json` and `skills/hipster-music-generator/SKILL.md`. With Gemini CLI installed:

```bash
gemini extensions install https://github.com/focustimer-dev/hipster-music-generator
gemini extensions list
```

An extension is **not** a Gemini mobile-app skill. Consult [Gemini CLI skills](https://geminicli.com/docs/cli/using-agent-skills/) for that host.

## Older fallback: a Gem

If native Skills are not visible in your account, create a custom Gem on Gemini web using [Gem instructions](GEM_INSTRUCTIONS.md) and the full [Gem knowledge bundle](GEM_KNOWLEDGE.md). Gems created on web are usable in the Android app, but knowledge uploads are snapshots, not automatic GitHub sync. The native Skills route is preferred when available.
