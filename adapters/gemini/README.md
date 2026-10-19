# Gemini: native app skill first, CLI second

**The Gemini mobile/web app now supports native reusable Agent Skills**. Use that for everyday music listening rather than treating a custom Gem or Gemini CLI extension as equivalent.

## Download the Gemini skill — no terminal required

**[Download the latest Gemini Skills ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/go-hipster-go-gemini-app-skill.zip)** · [See the versioned v3.2.4 release](https://github.com/focustimer-dev/hipster-music-generator/releases/download/gemini-skill-v3.2.4/go-hipster-go-gemini-app-skill.zip)

This is the **five-file, instruction-only** package ready for Gemini's Skills uploader: `SKILL.md` plus four `references/` files. No Python scripts, credentials or desktop installation needed.

1. Open [Gemini web](https://gemini.google.com/) and go to **Customize → Skills → Create → Upload**.
2. Upload the ZIP from the link above, and save the skill.
3. Say **`Use Go, Hipster, Go!: setup`**. Spotify is the universal **default preference**, but Gemini's Spotify media connector cannot create playlists. To publish through Gemini's supported generator, explicitly say **`setup change YouTube Music`** and use `@YouTubeMusic` when connected; save a generated playlist to your library when prompted. Then try `go weird`. A saved Gemini Skill does not itself store each listener's choices across conversations.

If your Gemini agent can install or load the skill directly from the GitHub repository, **try that first**; the ZIP is the reliable manual fallback. Uploaded copies do **not** automatically sync with GitHub. The release asset is rebuilt from the canonical skill by [the publishing workflow](../../.github/workflows/publish-gemini-skill.yml) whenever relevant source files change.

## If Gemini sounds suspiciously polite

**First verify which version it loaded.** A GitHub URL read in an earlier chat—or a saved Gemini Skill with uploaded files—is not automatically refreshed when this repository changes.

**If you supplied the GitHub URL in a chat:** start a fresh Gemini conversation and send:

```text
Reload Go, Hipster, Go! from the latest main branch of
https://github.com/focustimer-dev/hipster-music-generator
Read the entire SKILL.md and relevant references, especially the
Insufferable Record-Store Clerk voice rules. Confirm what you loaded.
Then run: go weird, 6 tracks, text only.
Keep the dry, smug, passive-aggressive clerk voice in the opening,
the actual musical commentary and the sign-off; don't make up facts.
```

**If you saved or uploaded it as a Gemini Skill:** use [Gemini web](https://gemini.google.com/) → **Customize → Skills**, open the existing Go, Hipster, Go!, and select **Replace skill** to upload the **[latest complete ZIP](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/go-hipster-go-gemini-app-skill.zip)** with its references. Gemini documents [replacing a skill](https://support.google.com/gemini/answer/17094296). Merely restarting the Android app doesn't refresh an old saved skill.

Test with **`go weird, 6 tracks, text only`** first to isolate the curator's own voice. When publishing through YouTube Music, the provider card may remain neutral; the curator's surrounding prose should not. A bland response after a confirmed refresh is a genuine Gemini tone-compliance regression.

## First try: give Gemini the GitHub link (observed working in one session)

A user successfully provided `https://github.com/focustimer-dev/hipster-music-generator` directly in a Gemini app chat, asked Gemini to add the skill, and then explicitly called Gemini's built-in YouTube Music skill. Gemini produced a six-song playlist. **This is one user-reported success, not a documented universal GitHub-install mechanism.** We have not independently confirmed persistent installation across new chats, exact track/ordering fidelity, or availability on every Gemini plan.

Try:

1. In Gemini app, send: `Add the Go, Hipster, Go! skill from https://github.com/focustimer-dev/hipster-music-generator and use the repository SKILL.md and its references.`
2. Once Gemini confirms what it loaded, ask: `Use Go, Hipster, Go! and the built-in YouTube Music skill. Go: make a 12-track playlist (the normal default). Confirm what was actually saved, including track count and substitutions.`
3. If the YouTube Music skill is not automatically called, explicitly invoke it using the actual skill selector or available connected-app controls. Don't assume a particular invocation syntax will work for every account.
4. Test whether the skill is still present in a **new conversation** before calling this an install-once flow. Direct GitHub loading might be session-scoped.

Why six songs? The earlier trial prompts explicitly requested **six**; the canonical music skill defaults to **twelve** unless the user sets a different count.

## Build the ZIP yourself — optional developer path

You don't need Python to install the skill: **[download the ready-to-upload package](https://github.com/focustimer-dev/hipster-music-generator/releases/latest/download/go-hipster-go-gemini-app-skill.zip)** instead. For local builds or modifications, run `python scripts/build_agent_packages.py --zip`, which creates `dist/go-hipster-go-gemini-app-skill.zip` with `SKILL.md` and four plain-text reference files.

Upload it through **Gemini web → Customize → Skills → Create → Upload**. The ZIP route is the supported app-skills upload workflow; GitHub-chat loading is user-observed and may only last for the current session. Existing uploaded skills must be replaced to pick up changes. Enable **Keep Activity** where Google requires it for skills or connected media.

## If Gemini says the skill cannot execute scripts

Earlier ZIP packages mistakenly bundled the Python CLI, and Gemini may have interpreted the skill as a script rather than instructions. Upload the **instruction-only** ZIP built from this revision, not the earlier 12-file ZIP. It intentionally contains only five Markdown files and does not require execution. If Gemini offers to curate and create a YouTube Music playlist, the next test is whether it follows the taxonomy and writes the exact tracks, not whether Python runs.

When replacing a previously uploaded skill, use the Gemini Skills settings to update or recreate it as supported by your account. Restart the conversation to ensure the updated instructions are used. You can also test immediately by replying: "Yes, curate six tracks now. Do not run scripts; follow the music instructions and use YouTube Music only if available."

## Gemini gave me songs, but no saved playlist

**Observed on Gemini Android:** Go, Hipster, Go! successfully curated twelve tracks, then mistakenly advised the user to select both Go, Hipster, Go! and YouTube Music **in a composer**. That was a ChatGPT-only fallback leaking into Gemini. The new skill corrects that advice; the screenshot does not establish that YouTube Music saved those tracks.

For an **already-curated list**, try this in the same Gemini conversation when your YouTube Music connection is available:

```text
@YouTubeMusic Create a playlist inspired by the twelve recordings above.
Match those exact versions and order only if supported. If this creates
a different thematic mix, tell me what changed. Show Save to library
if available; do not claim the playlist was saved without confirmation.
```

Gemini can generate a music playlist from a mood, artist, activity or genre. That **doesn't guarantee transferring a specific ordered tracklist**. If a generated playlist appears, you may need to tap **Save to library** to retain it. If `@YouTubeMusic` isn't available, check Gemini **Connected Apps**. Don't re-run setup or re-curate the original twelve tracks repeatedly. See [Google's Gemini–YouTube Music help](https://support.google.com/gemini/answer/15237118).

## Music-service behavior (documented versus tested)

Google currently documents that Gemini Apps with **YouTube Music** can generate playlists from a mood, activity, genre, artist or similar idea. This is our preferred destination for a provider-generated *approximation*. It does **not** prove the host can recreate an arbitrary exact ordered set of obscure tracks. If the interface offers **Save to library**, the listener may need to use it after generation; previewed is not necessarily saved.

Google's current **Spotify** connected-media support in Gemini mobile covers searching/playing music and existing playlists; it expressly excludes creating playlists, radio, or saving tracks to playlists through that connection. Spotify remains a listening/search option, **not** a confirmed playlist writer.

Apple Music, other services, and host support for connected-app actions *inside the custom skill* are **not confirmed**. Do a real capability check in the active Gemini chat. Don't claim that linking a streaming account alone grants write access.

See [the mobile acceptance tests](MOBILE_SMOKE_TEST.md). Do not use fictional music-provider commands or request raw OAuth tokens.

Official documentation:
- [Google: Create and manage skills for Gemini Apps](https://support.google.com/gemini/answer/17094296)
- [Google: YouTube Music in Gemini](https://support.google.com/gemini/answer/15237118)
- [Google: Media streaming apps in Gemini mobile](https://support.google.com/gemini/answer/15300097)

## Gemini CLI — optional developer route

The repository also includes `gemini-extension.json` and `skills/go-hipster-go/SKILL.md`. With Gemini CLI installed:

```bash
gemini extensions install https://github.com/focustimer-dev/hipster-music-generator
gemini extensions list
```

An extension is **not** a Gemini mobile-app skill. Consult [Gemini CLI skills](https://geminicli.com/docs/cli/using-agent-skills/) for that host.

## Older fallback: a Gem

If native Skills are not visible in your account, create a custom Gem on Gemini web using [Gem instructions](GEM_INSTRUCTIONS.md) and the full [Gem knowledge bundle](GEM_KNOWLEDGE.md). Gems created on web are usable in the Android app, but knowledge uploads are snapshots, not automatic GitHub sync. The native Skills route is preferred when available.
