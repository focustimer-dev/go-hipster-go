# Gemini installation

## Prompt installation

Ask Gemini to create and save `go-hipster-go` from the small [SKILL.md](SKILL.md), preserving its absolute reference URLs. Save only that entry; do not download ZIPs, reconstruct folders, read every reference or use Task mode just to install. Use the PWA setup prompt for the full request.

This route requires runtime web access for reference reading. Saved instructions are not attached reference files. If a required URL cannot be retrieved, disclose the missing reference and offer the full ZIP; never silently claim the complete skill is available.

Verify the saved skill appears in Customize → Skills and is selectable in a new chat. Then ask for setup (no playlist), followed by `go weird, 6 tracks, text only` to verify workflow and taxonomy access. Prompt creation and reference retrieval must be tested in Gemini before describing this route as verified.

## Download the Gemini skill — no terminal required

Upload [the release ZIP](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip) through Gemini web → Customize → Skills → Create → Upload (or Replace skill). It contains a root SKILL.md, deferred workflow and all regional/taxonomy references. It needs no scripts. Native app upload availability varies; use web when missing.

The generated GEM_KNOWLEDGE.md is an archival combined mirror, not an installation entry. Do not ask Gemini to save that entire document. Repository changes do not refresh existing saved skills automatically.

## GO means make a playlist (v3.7.2)

Gemini's installed Skill carries all the research, verification, sonic sequencing and publication rules. The Jukebox passes the destination, mood, optional tempo, sound-led discovery lens and crate spark. **Plain `go` now curates AND attempts to create one playable YouTube Music playlist by default.** `go live` remains a synonym for older prompts, not a required mode. There is no Curate only checkbox in the Jukebox. If requested explicitly, `go, text only` skips writing.

The curator's intended 12 artist/title/version recordings are selected first, then the actual provider's **playlist** action is tried once. Google's theme generator may substitute tracks or ignore order/count. Do not silently call those exact: label the mix **APPROXIMATE** unless item-level read-back establishes fidelity. If the connected writer fails or is unavailable, return the original crate, mark **PLAYLIST NOT CREATED**, and offer one actionable next step. A playlist card is not necessarily saved; the user may need **Save to library**.

**Installing or refreshing the Skill:** save the small entry with the PWA prompt and confirm it persists in a new chat. If it only reads the repository, upload the [complete Gemini Skill ZIP](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip) from Gemini desktop/mobile web, not the native app.

## Historical two-stage experiment (v3.5.5, superseded)

The previous two-stage flow was an experiment following observed mismatches between curated crates and provider-generated YouTube Music mixes. Current GO attempts one authorized playlist by default, while retaining the original curated list and clearly labeling provider mixes APPROXIMATE.

## Gemini v3.7.2 cleanup

The five-file Gemini ZIP is built from host-filtered musical rules and one native Gemini provider/setup contract. It retains the entire global-scenes and sonic-taxonomy reference files but excludes irrelevant Claude/ChatGPT rules, the universal Spotify default, developer CLI commands and historical field reports. Replace previously installed Gemini Skills using the current ZIP; GitHub changes do not update an existing upload.

## If Gemini suddenly shows YouTube video search cards

This is **not** a completed YouTube Music playlist. When exact song-name matching is requested but the Gemini connected app only exposes theme-based playlist creation, Gemini may search ordinary YouTube one recording at a time and never generate a playlist. The Jukebox now requests the original verified crate **and one playlist attempt on GO**. If Google responds with individual YouTube video results rather than a YouTube Music playlist, report **PLAYLIST NOT CREATED**.

Google's documented app name is **`@YouTubeMusic`**, not `@youtube-music`. Merely pasting this text from the Jukebox does **not** create an active Connected App mention. In Gemini, type `@` and **select YouTube Music from the actual picker** if the app did not activate; similarly select the installed Go, Hipster, Go! skill from `/` or `@` where needed. Google currently documents **Create a playlist** by a mood, activity or artist; it does not document editing an arbitrary exact ordered recording list. Use **Save to library** if the generated playlist needs saving.

## If Gemini produces an artist-heavy 25-song playlist

A real Gemini playlist card is an improvement over video search cards, **not** proof that Go, Hipster, Go!'s curation survived the handoff. One observed 25-song *Anatolian Fuzz & Psych* card began with five Erkin Koray tracks, despite the intended default of twelve varied recordings. The v3.5.3 provider handoff allowed up to two artist anchors; Google's theme-based generator may prioritize these artists rather than the sonic thesis. Version 3.5.4 attempted to remove named artist anchors and request 12 distinct artists; the provider still produced a materially different 25-song playlist in a later field test. In v3.5.5, these limitations motivate making provider generation an **optional second stage**, not the automatic result of GO.

If the resulting playlist ignores them, report **requested 12 vs. returned count**, and note the visible artist concentration. Keep the intended curated tracks distinct from the generated provider mix, and don't automatically create a second playlist to retry. If Gemini's playlist card provides a refinement flow, try `Keep the theme, but make it 12 songs by 12 different artists, no artist radio or repeated performers` once. Whether that refinement succeeds must be checked on the displayed result. Remember to distinguish a Gemini-generated card from **Save to library**.

## If YouTube Music keeps playing the same records

The Jukebox now rotates a fresh, sound-led search lens on every **GO** press while avoiding the previous three lenses in that browser. This changes the *request to the curator*, not Google's catalog or generation algorithm. Ask the skill to consider earlier tracklists **only if they are visible or supplied**; an uploaded skill is not a persistent played-song ledger. For direct Gemini commands, say `go fresh: no recordings from the three playlists shown above` when earlier lists are in the same chat.

First examine the curator's **intended** 12 recordings. If those repeat, correct discovery/track exclusion. If they are distinct but `@YouTubeMusic` returns familiar recordings, the thematic provider generation is the likely bottleneck; ask for exact matches only when supported and compare the result, otherwise label the provider list approximate. Replacing the uploaded Gemini skill is required for the updated repeat-control rules; updated repository ZIPs do not automatically change already-installed skills.

## If Gemini sounds suspiciously polite

**First verify which version it loaded.** A GitHub URL read in an earlier chat—or a saved Gemini Skill with uploaded files—is not automatically refreshed when this repository changes.

**If you supplied the GitHub URL in a chat:** start a fresh Gemini conversation and send:

```text
Reload Go, Hipster, Go! from the latest main branch of
https://github.com/focustimer-dev/go-hipster-go
Read the entire SKILL.md and relevant references, especially the
Insufferable Record-Store Clerk voice rules. Confirm what you loaded.
Then run: go weird, 6 tracks, text only.
Keep the dry, smug, passive-aggressive clerk voice in the opening,
the actual musical commentary and the sign-off; don't make up facts.
```

**If you saved or uploaded it as a Gemini Skill:** use [Gemini web](https://gemini.google.com/) in a desktop or mobile browser (not the native mobile app) → **Customize → Skills**, open the existing Go, Hipster, Go!, and select **Replace skill** to upload the **[latest complete ZIP](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip)** with its references. Gemini documents [replacing a skill](https://support.google.com/gemini/answer/17094296). Merely restarting the Android app doesn't refresh an old saved skill.

Test with **`go weird, 6 tracks, text only`** first to isolate the curator's own voice. When publishing through YouTube Music, the provider card may remain neutral; the curator's surrounding prose should not. A bland response after a confirmed refresh is a genuine Gemini tone-compliance regression.

## Build the ZIP yourself — optional developer path

You don't need Python to install the skill: **[download the ready-to-upload package](https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip)** instead. For local builds or modifications, run `python scripts/build_agent_packages.py --zip`, which creates `dist/go-hipster-go-gemini-app-skill.zip` with `SKILL.md` and its complete plain-text regional and verification references.

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
gemini extensions install https://github.com/focustimer-dev/go-hipster-go
gemini extensions list
```

An extension is **not** a Gemini mobile-app skill. Consult [Gemini CLI skills](https://geminicli.com/docs/cli/using-agent-skills/) for that host.

## Older fallback: a Gem

If native Skills are not visible in your account, create a custom Gem on Gemini web using [Gem instructions](GEM_INSTRUCTIONS.md) and the full [Gem knowledge bundle](GEM_KNOWLEDGE.md). Gems created on web are usable in the Android app, but knowledge uploads are snapshots, not automatic GitHub sync. The native Skills route is preferred when available.
