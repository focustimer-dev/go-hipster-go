# Gemini: native app skill first, CLI second

**The Gemini mobile/web app now supports native reusable Agent Skills**. Use that for everyday music listening rather than treating a custom Gem or Gemini CLI extension as equivalent.

## If Gemini sounds suspiciously polite

**First verify which version it loaded.** A GitHub URL read in an earlier chat—or a saved Gemini Skill with uploaded files—is not automatically refreshed when this repository changes.

**If you supplied the GitHub URL in a chat:** start a fresh Gemini conversation and send:

```text
Reload Hipster Music Generator from the latest main branch of
https://github.com/focustimer-dev/hipster-music-generator
Read the entire SKILL.md and relevant references, especially the
Insufferable Record-Store Clerk voice rules. Confirm what you loaded.
Then run: go weird, 6 tracks, text only.
Keep the dry, smug, passive-aggressive clerk voice in the opening,
the actual musical commentary and the sign-off; don't make up facts.
```

**If you saved or uploaded it as a Gemini Skill:** use [Gemini web](https://gemini.google.com/) → **Customize → Skills**, open the existing Hipster Music Generator, and select **Replace skill** to upload the **entire updated ZIP with its references**. Gemini documents [replacing a skill](https://support.google.com/gemini/answer/17094296). Merely restarting the Android app doesn't refresh an old saved skill.

Test with **`go weird, 6 tracks, text only`** first to isolate the curator's own voice. When publishing through YouTube Music, the provider card may remain neutral; the curator's surrounding prose should not. A bland response after a confirmed refresh is a genuine Gemini tone-compliance regression.

## First try: give Gemini the GitHub link (observed working in one session)

A user successfully provided `https://github.com/focustimer-dev/hipster-music-generator` directly in a Gemini app chat, asked Gemini to add the skill, and then explicitly called Gemini's built-in YouTube Music skill. Gemini produced a six-song playlist. **This is one user-reported success, not a documented universal GitHub-install mechanism.** We have not independently confirmed persistent installation across new chats, exact track/ordering fidelity, or availability on every Gemini plan.

Try:

1. In Gemini app, send: `Add the Hipster Music Generator skill from https://github.com/focustimer-dev/hipster-music-generator and use the repository SKILL.md and its references.`
2. Once Gemini confirms what it loaded, ask: `Use Hipster Music Generator and the built-in YouTube Music skill. Go: make a 12-track playlist (the normal default). Confirm what was actually saved, including track count and substitutions.`
3. If the YouTube Music skill is not automatically called, explicitly invoke it using the actual skill selector or available connected-app controls. Don't assume a particular invocation syntax will work for every account.
4. Test whether the skill is still present in a **new conversation** before calling this an install-once flow. Direct GitHub loading might be session-scoped.

Why six songs? The earlier trial prompts explicitly requested **six**; the canonical music skill defaults to **twelve** unless the user sets a different count.

## Supported alternative: upload an instruction-only ZIP

1. Run `python scripts/build_agent_packages.py --zip` to generate `dist/hipster-music-generator-gemini-app-skill.zip` (or download a release ZIP).
2. In **Gemini web** at https://gemini.google.com, open **Menu → Customize → Skills → Create → Upload**.
3. Upload the ZIP with `SKILL.md` and four text-only `references/` files. **No scripts, schemas, or CLI code are included.** Create the skill.
4. Switch to Gemini **Android** and invoke `Use Hipster Music Generator: go`, or use an available skill selector.
5. Connect YouTube Music via Gemini's normal app authorization if needed. Select its built-in skill separately if Gemini does not engage it.

**Important:** The ZIP route is Google's documented app-skills installation pathway; the GitHub-chat workflow above is user-observed and needs cross-session validation. Updates from GitHub are not guaranteed to sync into any previously uploaded or chat-loaded skill. Enable **Keep Activity** where Google requires it for skills or connected media.

## If Gemini says the skill cannot execute scripts

Earlier ZIP packages mistakenly bundled the Python CLI, and Gemini may have interpreted the skill as a script rather than instructions. Upload the **instruction-only** ZIP built from this revision, not the earlier 12-file ZIP. It intentionally contains only five Markdown files and does not require execution. If Gemini offers to curate and create a YouTube Music playlist, the next test is whether it follows the taxonomy and writes the exact tracks, not whether Python runs.

When replacing a previously uploaded skill, use the Gemini Skills settings to update or recreate it as supported by your account. Restart the conversation to ensure the updated instructions are used. You can also test immediately by replying: "Yes, curate six tracks now. Do not run scripts; follow the music instructions and use YouTube Music only if available."

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
