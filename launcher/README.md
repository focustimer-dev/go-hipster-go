# Hipster, Go! — PWA launcher

## The clerk's counter: first use and return visits

The Jukebox explains the copy → paste → send handoff beside its headline. Copy and recovery actions stay literal; supporting copy uses the dry, begrudgingly helpful record-store-clerk voice documented in `assets/BRAND_GUIDE.md`.

After a successful GO copy, a local `ghg-jukebox-used-v1` flag reveals a small, static “NO REFUNDS” print mark on the next page load. The main “YOUR TASTE IS A PROBLEM.” headline stays visible on every visit. The first-visit admission ticket follows the AI/music selectors, rather than appearing above the hero. It disappears only when the visitor selects **I'M ALREADY READY** or **BACK TO THE JUKEBOX**; copying GO does not prove setup is complete. Previously dismissed tickets stay dismissed. Unsupported-pair warnings and service controls remain available.

The Jukebox uses a single paper counter: services, mix choices, and the raised yellow GO key. Service keys and mood keys carry selection borders; informational text has no surrounding card. Mobile moods use three keys above two, keeping full labels readable. The ticker, decorative section letters, dark mood tray and duplicate framing are removed from this surface; the Manual keeps its existing styling.

The **YOUR CRATE** ticket appears as soon as the first AI-choice panel scrolls out of view and physically docks in the printed mixtape receipt once that area enters view. There is no separately maintained duplicate receipt summary; the ticket docks **collapsed by default** in a compact receipt row so the post-GO handoff stays visible. The visitor may expand the ticket for the full selection description, or scroll back up to release the floating ticket. It stays in normal receipt-sheet flow, so the existing receipt-feed and copied-to-clipboard stamp animations operate on it together rather than overlaying it. Its collapsed view shows abbreviated **AI › service · mood · pace** and **up to two region codes (+N) · ART state · HARD state**, with full selected regions in the expanded view. Antarctica, if explicitly selected, is always spelled out in the short summary. The ticket is a live display, not an alternative input or a new playlist.
 
Mood, tempo and the atlas retain their directly available controls. Three small **Mood / Pace / Regions** pin toggles share the shuffle toolbar; each preserves its current field while shuffling the others. Pins do not add duplicate summary rows or hide the actual controls. All three pinned disables shuffle with an explanation. Pins last for the current page session, and Undo restores the prior choices.

**Interactive atlas secrets (draft prototype; isolated Cloudflare review Worker, not production).** The engraved Robinson map has three original nautical-route segments plus a fourth **Pacific Handoff** discovery, three engraved illustrations and chart endpoint marks. A small, keyboard-accessible discovery layer supports four **Contraband Route** notes with optional **ADD THESE REGIONS**, three illustrated ship/monster oddities, and two cartographer marginalia. The three original decorative routes are redrawn between actual coast ports—Georgetown/Dakar, Rio de Janeiro/Luanda, and Mombasa/Mumbai—using the atlas's exact Robinson projection and offshore waypoints. A fourth **Guangzhou/Nansha → Long Beach** great-circle sketch follows the northern Pacific and is explicitly split at ±180° longitude into two SVG subpaths, with matching edge dots; it never draws across the chart interior to join the two halves. The two pieces are one shared interactive discovery and add only East Asia and US West. They are illustrative listening corridors, **not verified historical shipping itineraries**; tapping any route replaces an open ship/monster card without closing it, stealing pointer focus or scrolling the map. The map shows these targets only once its existing close-up engraving threshold is reached; the ocean artwork, country boundaries, pan/zoom geometry, stamps, and main GO flow are untouched. Route actions *add* the suggested regions without erasing earlier selections; no claim of a verified historical musical connection is made from the map alone. The detail note opens **below** the map rather than hiding any land. Escape or Close dismisses it. Dragging/pinching never triggers a discovery; all zoomed-out hit targets are disabled and removed from keyboard navigation. No persistent tracking or collectibles.

The tempo slider retains five native range positions, Slow through Fast, and a separate **Any** bypass. Any adds no tempo instruction; touching the parked center fader explicitly selects Mid-tempo. The optional atlas retains its native disclosure, compact stamps, hit areas and search-without-quotas semantics.

Two compact opt-in buttons sit alongside GO: **+ Art** requests a cover, and **TRY HARD** enables the skill's Deep Crate Protocol. The copied GO prompt now includes only short opt-in signals (`Curation mode: GO HARD. Use the skill's Deep Crate Protocol.` and `Cover art: yes. Use the skill's cover-art workflow.`); the detailed rules belong to the installed skill. The option defaults off, is reflected in the receipt and shareable `hard=1` URL, and can be combined with art, mood, tempo, region and service. The PWA never performs deep research itself; the receiving AI follows its installed skill and exposed tools. The normal quick GO route remains unchanged.\n\nThe receipt shows no idle stamp and earns a **Copied to clipboard** ink stamp only when the current prompt is successfully copied. Changing preferences clears the stamp; blocked or outdated copies cannot mark a new request ready. This confirms clipboard copying only, never music-service publication. Mood helpers confirm the selection with short clerk asides; tapping the selected mood again clears it without repeating that instruction in every aside. Press feedback and receipt ink respect reduced motion, with no sound, artificial delay, new assets or dependencies.

The Manual's tailored check is the main setup path. Selected-platform help uses Try this / If it fails / Connect your music / Confirm it worked. Universal installation and all-platform downloads live together under **Other installation methods**. Existing installation prompts, release URLs and service capability limits are preserved.

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

The world map assigns one primary listening region per country without redrawing borders. The regional-audit pass aligns Turkey with Middle East & Caucasus, Brazil with Southern South America, Sudan with North Africa, and Madagascar with East Africa. Spain remains primarily Mediterranean & Balkans for its Balearic/Catalan/Andalusian scenes, but its Galician/Asturian/Basque Atlantic scenes, Portugal's Atlantic catalog, and French Corsica are explicit music-research overlaps. The full provenance rules are in `references/regional-atlas.md`; a map color does not prohibit a verified subnational scene in a neighboring music region. Projected paths, atlas camera and map hit geometry are unchanged, while edition autofocus metadata is regenerated from the same country outlines.

## First-time setup & the bearded mood clerks

The Jukebox shows one small **FIRST TIME HERE?** admission ticket after the selected AI and music services. **SET ME UP** reveals a three-action handoff within the ticket: copy the tailored setup check, open the selected AI to paste/send it, then return to the Jukebox once the AI confirms its skill and music connection. **I'M ALREADY READY** skips setup; **BACK TO THE JUKEBOX** closes the guide without claiming setup verification. The same existing dismissal key remembers the choice. The Manual remains accessible for installation failures and alternative downloads. No modal, forced tour, or atlas geometry change is involved.

Four illustrative bearded/man-bun mood portraits are stored in `launcher/assets/hipster-moods.svg`; text labels and ARIA mood names remain separate. Moods select without copying. Tapping the selected mood again returns to plain `go`. **GO copies the current selection without clearing it.**

The receipt sits immediately below GO; copy confirmation and Open AI follow it. A successful copy reveals **COPIED. NOW OPEN [AI].** with platform-specific paste/send and skill/music selection guidance, while explicitly avoiding a false claim of playlist publication. Changing AI, service or mood invalidates the previous copy state, hides that guidance and gates Open AI until the current prompt is copied again. Copying a setup check also invalidates the music handoff. The receipt's full prompt and explicit manual-copy handoff remain available in a native disclosure; clipboard failure opens it. Android sharing remains a separate action.

The optional tempo slider selects Slow, Relaxed, Mid-tempo, Brisk, or Fast independently of mood. Any tempo clears the preference. Tempo is included in the prompt, receipt and URL; changing it requires a fresh GO copy. These are perceived-pace preferences, not verified BPM filters.

## Fresh crate: route diversity without random-song roulette

Every press of **GO** chooses one of the eligible region-compatible or geography-neutral discovery lenses **and** assembles an independent three-part creative spark from 1,000 combinations. Browser cryptographic randomness selects each when available; fallback cycling avoids repeats in unsupported environments. The used lens indices for each selected-region pool and recent spark indices are kept locally, so a repeated press explores new territory. The lens and spark are appended to the copied prompt and receipt preview. It is a **search starting point**, not a compulsory genre or artist quota; the listener's mood and tempo still take precedence. Only lens IDs are stored, **not** the user's playlists, songs or listening history.

The AI still selects/verifies recordings; the PWA neither searches a catalog nor stores a cross-session played-track ledger. A new prompt does not guarantee YouTube Music's thematic playlist generator will preserve the exact tracks. Compare the curator's proposed list with the provider card before attributing repetition to either system.

## Manual and saved selections

The Manual uses the same AI/service selectors as the Jukebox. Copying its tailored setup check shows confirmation beside the action and changes the next link to **NEXT: OPEN…**. The user still pastes and sends the prompt. Clipboard failure opens the full prompt for manual copying; changing the selected pair clears the previous success state. Skill/plugin download links remain available in the downloads disclosure.

Changing AI preserves the selected music service, mood and tempo. AI and music-service preferences are kept in browser local storage when available. URL parameters override them; mood and tempo are carried in the Jukebox URL rather than saved as browser defaults. Supported parameters are `ai` (`chatgpt|gemini|claude`), `service` (`spotify|youtube|apple`), `mood` (`go|happy|angry|sad|weird`) and `tempo` (`slow|relaxed|moderate|brisk|fast`). Omit tempo for Any tempo.

The UI includes keyboard focus states, native disclosures, clipboard fallbacks and reduced-motion styling. These features are not a claim of a complete accessibility certification. There is **no service worker or offline cache**; home-screen installation does not make curation or setup work offline.

## Maintaining the launcher

Update the HTML, shared assets and manifests in this directory, run the repository tests, then deploy the matching content to the existing Worker. GitHub commits alone do not publish the site. Keep deployment configuration and bindings intact when replacing content; verify the live Jukebox and Manual after deployment. The root README is the visitor entry point; this file records PWA behavior, while host-specific installation details belong in `adapters/`.

### Gemini installation: Task mode vs. browser ZIP upload

The Jukebox's Gemini setup prompt now opens with **select Task mode beneath the Gemini prompt box before pasting**. Task mode is for asking Gemini to attempt the multi-step GitHub Skill installation; this is a **one-time install**, not a recurring scheduled task. Confirm Skill v3.7.2 appears as a persistently installed Skill in another conversation. Merely reading GitHub in a Task does not prove installation.

**ZIP fallback platform constraint:** On the user's tested setup, the Gemini native mobile app does not offer the Skill ZIP uploader. Use **gemini.google.com in a desktop or mobile web browser → Customize → Skills → Create → Upload** instead. The ZIP fallback is independent of Task mode; no Task selection is required for manual web upload. Ordinary `go` does not require Task mode.

### Gemini plain GO is the complete playlist workflow (v3.7.2)

Gemini + YouTube Music Jukebox GO copies a short `Use Go, Hipster, Go!: go [mood]` command, the YouTube Music destination and the optional tempo, rotating discovery lens and random crate spark. **Pressing GO always requests curation and an attempt to create a playable playlist.** There is no curate-only checkbox, mode selector, or `go live` requirement. The installed Skill performs music discovery, verification and liner notes, then tries one authorized provider playlist; if Google's generated result differs from the intended crate, it labels the result **APPROXIMATE** and reports what can be verified. If publication fails, it returns the crate with **PLAYLIST NOT CREATED**, rather than presenting the failure as a successful full workflow. The explicit `go, text only` command is still available for troubleshooting, but is not shown as a Jukebox feature.

The Gemini installation prompt continues to require Task mode for attempted GitHub installation and version 3.7.2 verification; manual ZIP upload is on Gemini desktop/mobile web. Other services' publishing routes are unchanged.

### Historical Gemini two-stage experiment (v3.5.5, superseded)

The older v3.5.5 Jukebox copied a **stage-one, curator-only** prompt. It does **not** ask for a provider-generated playlist, and does not contain a pasted `@YouTubeMusic` invocation. The older workflow returned intended verified artist/title/version tracks, notes and **CURATED — NOT PUBLISHED** status. The old workflow required an explicit second-stage request for an **approximate YouTube Music playlist**; current GO now requests one authorized playlist by default. That separate action may use the native Connected App if selected, but its results cannot be called exact without item-level verification. Keep the original crate intact for comparisons.

That historical experiment avoided automatic generation after field tests showed Google returning very different 25-song mixes. The Jukebox still creates fresh random sonic lenses and crate sparks; ChatGPT and other service workflows remain unchanged.

### Criminal mood

Select **Criminal** for strongly non-English criminal and gangster narratives. The Jukebox rotates seven story angles and sends a short GO prompt. The installed Skill contains the complete regional research map, song-specific verification, Patois nuance, narrative variety and the rule that mood/tempo override random sparks. With no updated installed skill, a short GO alone cannot provide all detailed research instructions.


### ChatGPT + Apple Music

Connect Apple Music in ChatGPT Settings → Apps and select both it and Go, Hipster, Go! in the conversation. GO includes `@Apple Music` and requests exact recordings in the intended order through the app’s playlist widget or an available authorized writer. If the widget offers **Create playlist in Apple Music**, use that control to save. Search and playlist generation do not require an Apple Music subscription; saving to the library does. The workflow distinguishes **ready to save**, tool-confirmed saving and user-confirmed saving, and does not assume library/history access or independent read-back verification. A missing direct writer alone does not force a text fallback when a saveable widget is available. Claude’s separate MCP setup is unchanged.

### Expanded mood discovery (3.7.2)

Happy, Angry, Sad and Weird each rotate six interpretations; Criminal rotates seven narrative angles. The Jukebox rotates 88 discovery cues (including 16 US East and 16 US West routes), filtering geographic routes to the selected map regions without repeating a cue until its pool is exhausted; the last cue is excluded at the cycle boundary. The skill adds 44 categorized research routes plus 42 audible-mechanism searches, and checks recent recordings/artists/source compilations only when that history is actually available. Browser storage contains cue IDs only; it cannot know which songs the AI returned. Run `python scripts/sync_discovery_lenses.py` after editing `references/discovery-lenses.json`; untagged musical lenses remain eligible everywhere, while geographically tagged routes require a selected-region match. Changing a selection clears the previous lens, angle and spark. Existing installed skills must be refreshed to use the expanded reference library.

### Gemini source of truth and optional mood threads (v3.7.2)

The setup prompt now targets the published Gemini five-file ZIP and its readable `adapters/gemini/GEM_KNOWLEDGE.md` mirror, not the multi-platform root SKILL.md. Task-mode installation is only complete when Gemini confirms a persisted Skill; manually select the Skill in Gemini when automatic activation doesn't occur. GO rotates **optional** narrative threads: these never require all tracks to match one subplot. The Setup tab's Manager, Emeritus quote is intentionally static.

### Crate Atlas: optional Mercator map

The Jukebox includes a collapsed, optional “Paint your crate map” selector with six continent-wide paint shortcuts and 20 finer regional territories. The simplified Mercator land silhouette and bounding-box territories are approximations for musical discovery, not political boundaries. Selecting anywhere on the map or the associated text chips toggles a territory; tapping an entire continent paints/unpaints all its regions. Geography is a **soft research steer**, not a track quota or evidence of any song's origin. A blank map means no geographic instruction. Only selected region IDs persist in local browser storage (no account credentials, playlist or listening history); CLEAR MAP resets them. The copied GO prompt is invalidated and must be recopied when changed. Keyboard focus and alternative text chips are supported.

### Impeccable Cartographer's Desk refinement

The Crate Atlas now uses actual country polygon boundaries from the public-domain [johan/world.geo.json](https://github.com/johan/world.geo.json) dataset (coordinates simplified for responsive SVG rendering), projected to a cropped Mercator view. The world map zooms to a selected continent and lets people stamp the already-supported regional research territories by tapping actual country shapes or the accessible regional buttons. A passport strip shows the selected regions; stamp taps remove them, and Clear Map resets the existing local-only selection key. Russia is divided at roughly 60°E for Eastern Europe versus Northern Asia, an intentionally broad discovery approximation. Music territories are research groupings, **not political claims or quotas**. Country-map clicks are pointer affordances; keyboard and assistive-technology users use the continent and region controls. The design is offline-first, no map service or account API.

### Touch navigation and more precise North America atlas presets

The existing Crate Atlas now recognizes **two-finger pan and pinch-to-zoom** on touch devices, with single-finger vertical page scrolling preserved. On supported laptop trackpads, two-finger scroll pans while Ctrl/⌘-wheel pinch zooms the map. Country taps still select research regions; an in-progress two-finger gesture suppresses accidental taps. The Whole World control resets manual navigation. Zoom limits prevent blank-space travel; focus and accessible region buttons remain usable without gestures.

North America now offers **US West**, **US East**, **Canada West**, **Canada East**, **Mexico**, **Central America**, and **Caribbean** as individual research selections; 24 territories total. The US is split approximately on the 100°W meridian and Canada on 95°W—these are listening-discovery boundaries, not state/province borders or geographic/music provenance claims. Greenland remains visible but is not mislabeled as US or Canada. Previously stored `north-america` and `mexico-central` IDs expand to their new regions in place. All other selections, local-only storage, and prompt behavior are preserved. 

### Map-first listening atlas (zone boundaries and compact ink)

The Cartographer's Desk now displays only **listening-zone and coastline boundaries**, not every country border. A deterministic SVG edge-cancellation step derived these boundaries from the existing 24-zone geographic hit areas; individual country paths remain invisible as borders but retain precise tap targets and accessibility fallback geography. This avoids suggesting that discovery zones coincide with official political borders. The map remains fully offline and has no new provider integrations.

The primary interface is now the atlas itself (tap world to focus a continent, tap a zone to toggle; pinch/two-finger pan to navigate) and a single **Whole World** view reset. Colored regions and compact removable passport stamps are the only visible selection feedback. An unobtrusive collapsed **Choose by name** disclosure retains continent and region text controls, 44px targets, and **Clear all selections** for keyboard/assistive technology use. All existing local region preferences and GO prompts are unchanged; neither the ZIP skill nor music taxonomy needs to change.

### Jukebox accessibility and navigation refinement

The printed ticker is now static. Atlas labels use the existing functional type scale: 12px stamp names and locator text, with 14px navigation and instructions at the default browser font setting. Stamp artwork stays compact inside its 44px minimum touch target. Paper controls share a high-contrast focus treatment; the selected map borders are easier to distinguish without adding country borders.

Removing a stamp moves keyboard focus to the next stamp, the previous stamp at the end of the list, or **Choose by name** when the final selection is removed. Other selections and map movement preserve existing stamp nodes. Continuous map input is batched into animation frames and no longer rebuilds selection controls.

Touch navigation still uses two fingers to pan and pinch to zoom, leaving one-finger page scrolling available. On desktop, **Shift + scroll** deliberately pans the atlas and trackpad pinch (or Ctrl/Command + wheel) zooms it. Ordinary mouse-wheel and trackpad scrolling moves the page, including when the pointer is over the atlas. This replaces the earlier unconditional desktop wheel capture.

The existing CSS token system now owns repeated atlas paper, ink, selection, boundary and control-material colors. Functional controls wrap at narrow widths and enlarged text settings; the optional **Choose by name** disclosure stays available without implementation-specific visible labels.

All visible zones remain tappable after panning or zooming beyond the continent first opened. Tapping a zone on another continent selects it and updates the named controls without moving the camera; **Whole World** is a convenience reset, not a prerequisite to changing regions. A new press stops any unfinished continent zoom so the shape stays under the finger, and a deliberate fresh tap after a pinch works immediately while the gesture's incidental synthetic click stays suppressed.


## Mood-aware crate sparks

`references/seed-cues.json` supplies 24 rhythm cues and 24 texture/interaction cues. `references/mood-spark-bank.json` supplies 20 musical tensions per mood. Each GO independently rotates rhythm / texture / tension, producing 11,520 combinations per mood before pace filtering. Pools cover vocal delivery, instrumental interaction, arrangement, production and dynamics without region or genre assumptions. Imagery carries an audible interpretation; contrast can guide discovery without becoming a checklist for every song.

Explicit pace metadata filters rhythm cues for Slow/Relaxed and Brisk/Fast; these are creative compatibility checks, not BPM measurements. Mood and selected geography take precedence. Criminal seeds never establish lyrical evidence. Only cue indices are stored locally; without storage, repeat avoidance across reloads is unavailable. This does not track actual songs or guarantee fresh playlists.

After editing either JSON bank, run `python scripts/sync_mood_sparks.py`; `--check` verifies both embedded banks. The prompt remains one compact `Seed:` line, with no runtime fetch or extra controls.


### Touch ownership on the atlas

One finger drags the map; two fingers pan/pinch-zoom it. A six-pixel drag threshold preserves region taps. `touch-action: none` on the SVG gives camera gestures to the map; scrolling the surrounding page works outside the map. Adding or lifting a finger rebases the gesture to the current camera, avoiding jumps. Drags and pinches suppress synthetic selections; a fresh deliberate tap restores selection. Cancellation flushes pending camera updates. Physical-phone verification remains necessary because synthetic tests cannot prove browser gesture arbitration.


### Counter-stamp hero

The recurring hero headline remains **YOUR TASTE IS A PROBLEM.**. A small static **NO REFUNDS** stamp appears only on return visits. The headline uses a compact garnet double-rule ink impression with a single 200ms press on arrival. Text is always visible, with no sound, delay or controls inside the decoration. Reduced motion shows a stationary stamp without the ink-set animation. The hero retains its existing instructions; the return flag changes only the subtle stamp and noncritical returning-visitor guidance.


The hero recognizes first and returning visits with one clerk aside in its existing line: “We’ll work with what you’ve got.” becomes “We kept your place. Against our better judgment.” The visible instructions explicitly include paste **and send**, so the aside carries personality without carrying a required step. The existing local successful-copy flag controls both headline and aside; no additional tracking, listeners, animation or layout regions are added.


### Revisit the introduction without resetting preferences

Open `/?intro=1` to force the first-visit hero and setup tip on that URL, even after a successful GO. This is a display override, not a storage reset: remove `intro=1` to resume normal returning behavior. It persists through selection URL updates, adds no visible controls, and never changes saved service choices or the completed-visit flag. A separately dismissed setup tip keeps its existing dismissal preference.

## Compact GO handoff (3.7.2)

Normal GO copies only the invocation, selected regions, mood angle, tempo, one metaphorical seed and destination service. Twelve tracks and all curation/publication rules belong to the installed skill. No rotating genre lens is emitted: the skill selects a compatible regional route after interpreting mood and pace. Old longer prompts remain understood. The Manual owns missing-installation guidance.

### Explicit mentions

Copied GO starts with `@go-hipster-go` and the selected music service. YouTube Music uses `@YouTube Music`, including the space; all destinations retain their display names. These are text routing hints, not proof of app activation or authorization; select the matching host suggestions where available.


## Live release smoke check

This read-only verification is **manual after a confirmed Cloudflare Worker deployment**, not on every source-only push. A GitHub push does not deploy the Worker. The expected SHA must match the actual deployed source; a failed check never certifies publication. This eliminates source/deploy race false alarms.


`Live release smoke` runs once for relevant main-branch pushes and can be run manually from Actions. Supply the full expected deployed commit for a manual check; blank uses the selected workflow ref. A source-only push without a matching deployment is expected to fail this release check, while ordinary offline CI remains separate. The checker allows a bounded propagation window.

It compares the actual JavaScript, shared CSS and edition CSS bytes on the Jukebox and Manual with the expected commit, then checks directly available controls, pinned shuffle, Undo, clipboard-to-receipt fidelity and initialized Manual guidance in fresh Chromium contexts. Profiles cover 1280px desktop, 390px touch/mobile, and the same phone viewport with 200% base text. The last pass tests rem-based text reflow rather than emulating Android system font settings. Each pass checks horizontal overflow, control overlap, and 44×44px targets on primary, shuffle, mood, service and expanded atlas/Manual controls. Layout failures are reported by profile and do not consume propagation retries. It neither connects music accounts nor publishes playlists. Failure screenshots come from that clean context.

For a local check, install Playwright 1.62.1 and its Chromium browser, then run:

```bash
node scripts/smoke_live.mjs --expected-commit FULL_COMMIT_SHA
```

The workflow installs the browser dependency only for the check; the PWA adds no runtime dependency. Offline mismatch tests run with the normal Python suite.

The sixth mood, **The Funk**, sends `go funky` with independent tempo and regional choices. Its gig-poster portrait uses beaded braids, star sunglasses and a tall jumpsuit collar, with a grin on selection.

## Optional playlist sleeve

**+ Art** is a native pressed toggle button beside GO, including on phones, off by default. It reuses the shuffle-pin border, selected fill and focus treatment with a 44px minimum target and the accessible name Include playlist cover art. It adds only `Cover art: yes. Use the skill's cover-art workflow.` to the prompt. The skill owns the post-curation cover workflow: one square original album sleeve, one track's verified original year/local scene as the visual anchor, symbolic treatment of the full mix, and the exact final playlist title. Unknown provenance stays approximate; a reissue date is not the original year. The AI supplies a prompt if image generation is unavailable. Generating artwork does not confirm uploading it to the music service.

The option appears in the receipt and shared URL (`cover=1`), changes invalidate the clipboard handoff, and toggling it preserves the current music seed. It is not saved as a lasting preference. The PWA itself generates no images and uploads no covers.
