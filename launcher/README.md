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

The Jukebox's Gemini setup prompt now opens with **select Task mode beneath the Gemini prompt box before pasting**. Task mode is for asking Gemini to attempt the multi-step GitHub Skill installation; this is a **one-time install**, not a recurring scheduled task. Confirm Skill v3.6.3 appears as a persistently installed Skill in another conversation. Merely reading GitHub in a Task does not prove installation.

**ZIP fallback platform constraint:** On the user's tested setup, the Gemini native mobile app does not offer the Skill ZIP uploader. Use **gemini.google.com in a desktop or mobile web browser → Customize → Skills → Create → Upload** instead. The ZIP fallback is independent of Task mode; no Task selection is required for manual web upload. Ordinary `go` does not require Task mode.

### Gemini plain GO is the complete playlist workflow (v3.6.3)

Gemini + YouTube Music Jukebox GO copies a short `Use Go, Hipster, Go!: go [mood]` command, the YouTube Music destination and the optional tempo, rotating discovery lens and random crate spark. **Pressing GO always requests curation and an attempt to create a playable playlist.** There is no curate-only checkbox, mode selector, or `go live` requirement. The installed Skill performs music discovery, verification and liner notes, then tries one authorized provider playlist; if Google's generated result differs from the intended crate, it labels the result **APPROXIMATE** and reports what can be verified. If publication fails, it returns the crate with **PLAYLIST NOT CREATED**, rather than presenting the failure as a successful full workflow. The explicit `go, text only` command is still available for troubleshooting, but is not shown as a Jukebox feature.

The Gemini installation prompt continues to require Task mode for attempted GitHub installation and version 3.6.3 verification; manual ZIP upload is on Gemini desktop/mobile web. Other services' publishing routes are unchanged.

### Historical Gemini two-stage experiment (v3.5.5, superseded)

The older v3.5.5 Jukebox copied a **stage-one, curator-only** prompt. It does **not** ask for a provider-generated playlist, and does not contain a pasted `@YouTubeMusic` invocation. The older workflow returned intended verified artist/title/version tracks, notes and **CURATED — NOT PUBLISHED** status. The old workflow required an explicit second-stage request for an **approximate YouTube Music playlist**; current GO now requests one authorized playlist by default. That separate action may use the native Connected App if selected, but its results cannot be called exact without item-level verification. Keep the original crate intact for comparisons.

That historical experiment avoided automatic generation after field tests showed Google returning very different 25-song mixes. The Jukebox still creates fresh random sonic lenses and crate sparks; ChatGPT and other service workflows remain unchanged.

### Criminal mood

Select **Criminal** for strongly non-English criminal and gangster narratives. The Jukebox rotates seven story angles and sends a short GO prompt. The installed Skill contains the complete regional research map, song-specific verification, Patois nuance, narrative variety and the rule that mood/tempo override random sparks. With no updated installed skill, a short GO alone cannot provide all detailed research instructions.


### ChatGPT + Apple Music

Connect Apple Music in ChatGPT Settings → Apps and select both it and Go, Hipster, Go! in the conversation. GO includes `@Apple Music` and requests exact recordings in the intended order through the app’s playlist widget or an available authorized writer. If the widget offers **Create playlist in Apple Music**, use that control to save. Search and playlist generation do not require an Apple Music subscription; saving to the library does. The workflow distinguishes **ready to save**, tool-confirmed saving and user-confirmed saving, and does not assume library/history access or independent read-back verification. A missing direct writer alone does not force a text fallback when a saveable widget is available. Claude’s separate MCP setup is unchanged.

### Expanded mood discovery (3.6.3)

Happy, Angry, Sad and Weird each rotate six interpretations; Criminal rotates seven narrative angles. The Jukebox rotates 56 discovery cues without repeating a cue until its pool is exhausted; the last cue is excluded at the cycle boundary. The skill adds 44 categorized research routes plus 42 audible-mechanism searches, and checks recent recordings/artists/source compilations only when that history is actually available. Browser storage contains cue IDs only; it cannot know which songs the AI returned. Existing installed skills must be refreshed to use the expanded reference library.

### Gemini source of truth and optional mood threads (v3.6.3)

The setup prompt now targets the published Gemini five-file ZIP and its readable `adapters/gemini/GEM_KNOWLEDGE.md` mirror, not the multi-platform root SKILL.md. Task-mode installation is only complete when Gemini confirms a persisted Skill; manually select the Skill in Gemini when automatic activation doesn't occur. GO rotates **optional** narrative threads: these never require all tracks to match one subplot. The Setup tab's Manager, Emeritus quote is intentionally static.

### Crate Atlas: optional Mercator map

The Jukebox includes a collapsed, optional “Paint your crate map” selector with six continent-wide paint shortcuts and 20 finer regional territories. The simplified Mercator land silhouette and bounding-box territories are approximations for musical discovery, not political boundaries. Selecting anywhere on the map or the associated text chips toggles a territory; tapping an entire continent paints/unpaints all its regions. Geography is a **soft research steer**, not a track quota or evidence of any song's origin. A blank map means no geographic instruction. Only selected region IDs persist in local browser storage (no account credentials, playlist or listening history); CLEAR MAP resets them. The copied GO prompt is invalidated and must be recopied when changed. Keyboard focus and alternative text chips are supported.
