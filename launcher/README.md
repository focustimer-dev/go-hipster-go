# Hipster, Go! — PWA launcher

Live URLs:
- [Launch](https://hipster-go.samelling.workers.dev/) — Jukebox: prepare requests for ChatGPT, Gemini or Claude and Spotify, YouTube Music or Apple Music
- [Setup](https://hipster-go.samelling.workers.dev/setup/) — Manual: tailored setup checks, connection guidance and current skill/plugin downloads
- [Legacy Gemini shortcut](https://hipster-go.samelling.workers.dev/gemini/) — launch page preselected for Gemini + YouTube Music

This is a static **Cloudflare Worker** PWA. The source lives in `launcher/`, with two real HTML pages, shared `assets/hipster.css` and `assets/app.js`, a root and a legacy Gemini PWA manifest, and an SVG star icon.

The aesthetic deliberately satirizes indie-sleaze, MySpace CSS, vintage record-store zines, urban lumberjack and artisanal beard-oil marketing. Usability is deliberately not satirical: selectors, links, copied command, statuses and accessible button states remain meaningful.

Service selection is a preference, not evidence of a working connection. Pair-specific notes distinguish available routes: ChatGPT + Spotify requires an authorized writer; Gemini + YouTube Music plain `go` curates and attempts one playlist, preserving the intended list and honestly labeling the provider mix if approximate; Gemini + Spotify is search/play rather than playlist creation. Claude + Spotify is subject to its connector's actual capabilities and Premium requirements. **Claude + Apple Music requires a separate compatible MCP connector**: local on Desktop or hosted for web/mobile, with track-search and playlist-writing tools. Other combinations require capability checks and can fall back to text-only curation. The launcher never submits prompts, invokes skills, creates music, stores credentials, or claims a playlist was saved.

For Android, open the live Launch page in Chrome and use **Install app** or **Add to Home screen**. Depending on the launcher, long-press exposes Happy / Angry / Sad / Weird via the web-app shortcuts. The native Gemini-app link is Android best-effort with a web fallback. The installed skill and music service still must be selected in the AI when needed. A pasted `@` mention does not guarantee activation.

The deployment is a Cloudflare Worker containing these file contents. Updating GitHub source **does not automatically deploy** the Worker. Static HTML and JS are served with no-cache; the worker serves `/setup/` and `/gemini/` along with root and app assets. The legacy Gemini manifest has scope `/` so Setup navigation stays in the same installed web app.

Run UI and behavior smoke checks after deploying: launch + setup routes render; both selectors work and warn on unsupported pairs; mood copy text updates; Android share/app handoff is optional; manifest shortcuts and ZIP links remain correct; mobile viewport does not overflow.

## First-time setup & the bearded mood clerks

The Launch page has one slim, collapsed **New here? Start with setup** disclosure. The old always-visible green **First time?** panel has been removed, and its tailored **Copy setup check**, **Open AI**, status, and manual-copy fallback are inside the disclosure. It expands only on request; dismissing it is remembered in browser local storage using the existing dismissal key, so previous dismissals remain respected. The Manual remains available after dismissal, including its own tailored setup check. The current AI/music selection determines the setup prompt and destination.

Four illustrative bearded/man-bun mood portraits are stored in `launcher/assets/hipster-moods.svg`; text labels and ARIA mood names remain separate. Moods select without copying. Tapping the selected mood again returns to plain `go`. **GO copies the current selection without clearing it.**

Copy confirmation and Open AI sit immediately below GO. Changing AI, service or mood invalidates the previous copy state; Open AI is guarded until the current prompt is copied. Copying a setup prompt also invalidates the music handoff. The receipt shows AI, service, mood and count; the full prompt and explicit manual-copy handoff remain available in a native disclosure. Clipboard failure opens that disclosure. Android sharing remains a separate action using the current prompt.

The optional tempo slider selects Slow, Relaxed, Mid-tempo, Brisk, or Fast independently of mood. Any tempo clears the preference. Tempo is included in the prompt, receipt and URL; changing it requires a fresh GO copy. These are perceived-pace preferences, not verified BPM filters.

## Fresh crate: route diversity without random-song roulette

Every press of **GO** chooses one of twelve different sound-led search lenses **and** assembles an independent three-part creative spark from 1,000 combinations. Browser cryptographic randomness selects each when available; fallback cycling avoids repeats in unsupported environments. The previous three lens IDs and three spark IDs are kept locally, so a repeated press explores new territory. The lens and spark are appended to the copied prompt and receipt preview. It is a **search starting point**, not a compulsory genre or artist quota; the listener's mood and tempo still take precedence. Only lens IDs are stored, **not** the user's playlists, songs or listening history.

The AI still selects/verifies recordings; the PWA neither searches a catalog nor stores a cross-session played-track ledger. A new prompt does not guarantee YouTube Music's thematic playlist generator will preserve the exact tracks. Compare the curator's proposed list with the provider card before attributing repetition to either system.

## Manual and saved selections

The Manual uses the same AI/service selectors as the Jukebox. Copying its tailored setup check shows confirmation beside the action and changes the next link to **NEXT: OPEN…**. The user still pastes and sends the prompt. Clipboard failure opens the full prompt for manual copying; changing the selected pair clears the previous success state. Skill/plugin download links remain available in the downloads disclosure.

Changing AI preserves the selected music service, mood and tempo. AI and music-service preferences are kept in browser local storage when available. URL parameters override them; mood and tempo are carried in the Jukebox URL rather than saved as browser defaults. Supported parameters are `ai` (`chatgpt|gemini|claude`), `service` (`spotify|youtube|apple`), `mood` (`go|happy|angry|sad|weird`) and `tempo` (`slow|relaxed|moderate|brisk|fast`). Omit tempo for Any tempo.

The UI includes keyboard focus states, native disclosures, clipboard fallbacks and reduced-motion styling. These features are not a claim of a complete accessibility certification. There is **no service worker or offline cache**; home-screen installation does not make curation or setup work offline.

## Maintaining the launcher

Update the HTML, shared assets and manifests in this directory, run the repository tests, then deploy the matching content to the existing Worker. GitHub commits alone do not publish the site. Keep deployment configuration and bindings intact when replacing content; verify the live Jukebox and Manual after deployment. The root README is the visitor entry point; this file records PWA behavior, while host-specific installation details belong in `adapters/`.

### Gemini installation: Task mode vs. browser ZIP upload

The Jukebox's Gemini setup prompt now opens with **select Task mode beneath the Gemini prompt box before pasting**. Task mode is for asking Gemini to attempt the multi-step GitHub Skill installation; this is a **one-time install**, not a recurring scheduled task. Confirm Skill v3.5.6 appears as a persistently installed Skill in another conversation. Merely reading GitHub in a Task does not prove installation.

**ZIP fallback platform constraint:** On the user's tested setup, the Gemini native mobile app does not offer the Skill ZIP uploader. Use **gemini.google.com in a desktop or mobile web browser → Customize → Skills → Create → Upload** instead. The ZIP fallback is independent of Task mode; no Task selection is required for manual web upload. Ordinary `go` does not require Task mode.

### Gemini plain GO is the complete playlist workflow (v3.5.7)

Gemini + YouTube Music Jukebox GO copies a short `Use Go, Hipster, Go!: go [mood]` command, the YouTube Music destination and the optional tempo, rotating discovery lens and random crate spark. **Pressing GO always requests curation and an attempt to create a playable playlist.** There is no curate-only checkbox, mode selector, or `go live` requirement. The installed Skill performs music discovery, verification and liner notes, then tries one authorized provider playlist; if Google's generated result differs from the intended crate, it labels the result **APPROXIMATE** and reports what can be verified. If publication fails, it returns the crate with **PLAYLIST NOT CREATED**, rather than presenting the failure as a successful full workflow. The explicit `go, text only` command is still available for troubleshooting, but is not shown as a Jukebox feature.

The Gemini installation prompt continues to require Task mode for attempted GitHub installation and version 3.5.7 verification; manual ZIP upload is on Gemini desktop/mobile web. Other services' publishing routes are unchanged.

### Previous Gemini two-stage curation (v3.5.5)

GO with Gemini + YouTube Music now copies a **stage-one, curator-only** prompt. It does **not** ask for a provider-generated playlist, and does not contain a pasted `@YouTubeMusic` invocation. The Gemini Skill should return the intended verified artist/title/version tracks in order, plus notes and **CURATED — NOT PUBLISHED** status. A second-stage **approximate YouTube Music playlist** is optional and must be requested explicitly in the same Gemini chat after reviewing the crate. That separate action may use the native Connected App if selected, but its results cannot be called exact without item-level verification. Keep the original crate intact for comparisons.

This deliberately changes Gemini's previous automatic playlist-generation behavior because field tests showed Google returning entirely different 25-song mixes for a carefully curated twelve-track set. The Jukebox still creates fresh random sonic lenses and crate sparks; ChatGPT and other service workflows remain unchanged.

### Criminal mood

Select **Criminal** for lesser-known criminal/gangster anthems, strongly favoring non-English vocals. Discovery routes include narcocorridos, Sicilian mafia songs, and relevant Caribbean, African and Latin American scenes. Songs must explicitly concern crime, supported by lyrics or credible song-level sources; the prompt asks for a short English explanation and skips uncertain matches. Mood and tempo take priority over randomized discovery cues.
