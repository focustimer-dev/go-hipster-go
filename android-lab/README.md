# Hipster GO Lab

A separate native Android experiment. Package `work.samelling.hipstergo.lab`,
version `0.9.0`, Android 7+. It installs alongside the production APK and PWA.

## Isolation

The release bundles a frozen copy of `launcher/`. No production deployment,
Worker changes, API credentials, or production data are required. Lab preferences
and WebView storage belong to this separate app. UI updates require a new Lab APK.
The build script only modifies the generated, ignored asset copy. No interface
or portrait changes are applied to the canonical launcher sources.

The native bridge is available only to packaged pages on a synthetic local HTTPS
origin. External navigation opens outside the WebView, external resource requests
are blocked, frames and network connections are blocked, and file/content access
is disabled. Native code now requests INTERNET permission only to check public
GitHub release metadata. The WebView still cannot load external resources or
make network connections. No AI login happens in Lab. Native prompt storage is
limited to requests you explicitly save on the device.

## Native handoffs

- **GO:** copies the current request and opens the selected AI using native code.
- **Open mode (default):** launches installed ChatGPT or Gemini, then paste/send.
  If the selected package is unavailable, opens the AI website instead.
- **Share mode:** tries sending the prompt to the selected AI's share receiver;
  falls back to Android's share chooser. The initial native handoffs and Share
  mode were confirmed working by the user on their Pixel.
- **Browser mode:** copies and opens the AI website in the browser.
- **One-tap GO:** turn off to retain the separate GO then OPEN flow.
- **Haptics:** optional system-respecting confirmation feedback.
- **Launcher shortcuts:** long-press the icon for Funky or Weird.
- **Native share:** opens Android's chooser with the current prompt.

Open **⋯ → Preferences** to change handoff mode and toggles. Skill selection,
connected music apps, pasting, and sending remain controlled by the receiving AI.
This experiment does not automate sending prompts or publishing playlists.

## Deliberate skill updates

Open **Manual → Gemini skill updates → Review**. Native code
reads GitHub Releases from this public repository, using the exact Gemini ZIP
asset. Stable excludes drafts and prereleases. Lab includes published prereleases
as well as stable releases; no experimental release is currently required or
invented by this feature. The checker considers the latest 100 release records.

Checks happen at most once per day when the app launches. Turn daily checks off
in the update panel, or use **Check for updates** whenever wanted. A dot on Manual indicates an available package; no Android notification permission or
background service is used. Failed checks preserve cached release information
and the user's installation record. GO works offline and never waits on a check.

The panel provides **View changes**, a download/instructions panel, **Gemini web**,
and **I installed this package**. Nothing is downloaded or installed automatically.
Confirmation is self-reported: Lab cannot read Gemini's installed skill. The first
record is unknown until the user confirms an installation. Downloading never
records installation. Confirmation is tracked separately for Stable and Lab.

Asset identity and update timestamp/digest are included in the confirmation,
because the current publishing workflow can replace a ZIP under the same version.
A replacement package can therefore become available without a version bump.
All metadata links must point to this repository's exact GitHub release/asset
paths. No skill instructions are fetched into the prompt or executed by Lab.

## Saved requests

Choose **Save request** beside the Jukebox receipt. Give the exact request
a name, then find it under **Crate → Saved requests → Options**. Open it in the selected AI, copy,
share, or delete it. Up to ten requests can be stored; a full shelf never silently
evicts an older one. Saving is explicit, device-local, and not cloud-backed.
Uninstalling Lab removes the shelf. Saving a request does not save a playlist or
make AI output deterministic. Install APK updates over the existing Lab to retain
its preferences and saved requests.

## Share inspiration into Lab

In Spotify, YouTube Music, a browser, or another app, choose **Share → Hipster GO
Lab** for a song link or plain text. Lab shows an editable review dialog. Choose
**Use inspiration** to apply it, or **Cancel** to leave the current reference
unchanged. Sharing never launches an AI or publishes a playlist.

The accepted reference is stored locally and stays active until removed. A
**FROM YOUR CRATE** card appears above GO with **Review**; **Remove** lives inside the editor. Crate also has an Inspiration section. Your region, mood and tempo choices
are preserved. The reference replaces the generated seed in the prompt while
active, is quoted as data, and is explicitly not an instruction or required track.
After removing it, the ordinary seed behavior returns. Editing the reference
invalidates any older copied prompt, including a copy already in progress.

Lab accepts `ACTION_SEND` with `text/plain`, reads text/subject and a safe textual
ClipData fallback, and rejects oversized shares instead of silently truncating.
The limit is 2,000 characters; images, audio files and file/content URIs are not
imported. Lab does not open shared links, scrape their content, or claim a recording
match. The chosen AI performs any supported lookup after you press GO. The local
reference is included when an exact request is deliberately saved to the shelf.
Warm shares reuse the existing Lab activity and preserve its listening choices.

## Build and verify

JDK 17, Android SDK 36 and build tools 35.0.0, Python 3, and the checked-in wrapper
from `android/` are required. From the repository root:

```sh
bash android/gradlew -p android-lab testReleaseUnitTest assembleRelease --no-daemon
python -m unittest discover -s android-lab/tests -v
```

For functional web tests, install Playwright and its Chromium browser, then run
`node scripts/test_android_lab.cjs` (set NODE_PATH if installed outside the repo).
Tests exercise exact prompt transfer, ChatGPT/Gemini selection, Open, and Share.
A DOM-level version runs with jsdom 26: `node scripts/test_android_lab_dom.cjs`.
Run the repository's normal checks as well; existing main failures are documented
in the Android packaging PR.

Align and sign `android-lab/app/build/outputs/apk/release/app-release-unsigned.apk`
using the private signing backup and alias `hipster-go`, following
`android/README.md`. Keys and passwords must remain outside Git. Increment the
Lab version code for every APK update. Do not deploy this branch to production.

## Phone smoke test

1. Install **Hipster GO Lab** alongside **Hipster GO**.
2. Select ChatGPT; press GO; confirm prompt is copied and ChatGPT opens.
3. Return, select Gemini, and repeat. Check the current request, not an old one.
4. Try Share and Browser modes. Note whether each AI accepts the shared text.
5. Disable one-tap GO and check GO then OPEN; toggle haptics.
6. Check map gestures, Android Back, launcher shortcuts, and returning from AI.
7. Reopen the app to check preference retention. Try airplane mode: the map and
   prompt generation should remain usable; AI services still require a connection.

No attached Android device was available during authoring. Build, signature, and
browser tests do not substitute for the phone smoke test above.

## Next candidates

Home-screen widgets, exportable
playlist request cards, and native quick settings. Add these individually after
phone feedback; none are enabled in this first experiment.

## Validation

Release assembly, release vital lint, and native unit tests passed. Native tests
cover numeric version ordering, stable/prerelease filters, exact Gemini assets,
trusted URLs, same-version ZIP replacement, and published release JSON.
Snapshot isolation and DOM
handoff tests passed, including stale-prompt rejection. Local Chromium rendering
was blocked by the execution sandbox denying its socket operation. The browser
smoke test is included in the separate Lab CI workflow. Repository-wide Python
checks retain the same seven failures and one bundle-sync error seen on unchanged
main. Phone launching, clipboard behavior, gesture rendering and sharing still
require the device smoke test.

## Version 0.2 phone checks

- Open skill updates, check Stable, and review the release page and instructions.
- Confirm an already-installed package only if it matches the one shown; verify
  that confirmation changes the in-app badge. Download alone must not change it.
- Switch to Lab and back; installation records remain separate.
- Disable daily checks and confirm manual checks still work.
- Retry offline; cached information stays labelled with its last checked date.
- Save a named GO request, restart Lab, then copy/share it and compare exact text.
- Cancel a save or delete, and verify no unexpected shelf change.

The user confirmed the update checker and saved-request shelf working in version
0.2. Existing native handoffs and outbound Share were verified in version 0.1.

## Version 0.3 phone checks

1. In Spotify or YouTube Music, share a song link to Hipster GO Lab.
2. Cancel once and confirm nothing changes; share again, edit, and choose Use.
3. Check the FROM YOUR CRATE card, then choose your region/mood/tempo and GO.
4. Inspect the received prompt in the AI: the exact reviewed reference appears,
   the selected regions remain, and the generated seed is omitted while active.
5. Return to Lab, use Review/Remove, and verify an old OPEN link requires fresh GO.
6. Share a second song while Lab is already open, then restart Lab and check that
   the accepted reference persists. Saved requests and skill-update records remain.

The user confirmed the native incoming share and review flow working in version 0.3.
Release build/vital lint, 15 native tests, snapshot isolation, and DOM handoff and
inspiration tests passed. Existing Chromium sandbox limitations are unchanged.


## Version 0.4 workspace

One persistent 56px top rail contains Jukebox, Crate, Manual and Preferences.
It replaces the old native LAB SETTINGS bar and duplicate website navigation.
Android system insets remain native; no persistent bottom app controls are added.
The canonical masthead scrolls with Jukebox and carries a small LAB annotation.

Crate is a full screen for inspiration and the existing ten-request shelf. Save
request sits beside the receipt and freezes the exact current prompt without
rerolling. GO names its AI and handoff mode. Preferences use a themed dialog;
inspiration, saved-request actions and deliberate update confirmations retain
their native flows and existing storage keys. Manual includes the incumbent
explainer/download shelf, setup-check copying, service choices and skill updates.

Screen switches preserve the listening brief and separate scroll positions in
that running page. Scroll is session-only, not promised after recreation/relaunch.
Install over existing Lab to retain saved requests, accepted inspiration,
preferences and per-channel update confirmations. No migration or uninstall.
Bundling changes only the ignored Lab snapshot. Map, portrait and launcher
sources remain unchanged.

Phone checks for 0.4:

1. Install over Lab and verify existing saved data remains.
2. Scroll Jukebox, visit Crate, inspect a saved request, then return. Check choices,
   scroll position and atlas view.
3. Save beside the receipt, then inspect/copy/share/reopen/delete from Crate.
4. Add/edit/remove inspiration; verify a changed reference requires fresh GO.
5. Manual → Change should land service choices below the rail. Copy a setup check;
   review update/download/confirmation without recording installation on download.
6. Try handoff modes and one-tap GO off. Android Back closes Preferences, returns
   secondary screens to Jukebox, then leaves Lab.
7. Check portrait/landscape, large system text, keyboard and Android gesture/
   three-button navigation. Native layout and gesture feel need phone validation.

Native build/unit/vital lint and DOM/snapshot checks passed before an execution
interruption. The recovered source is rechecked before packaging. No device
rendering or gesture verification is claimed. The repository-wide suite retains
its known seven failures and one bundle-sync error; playlist example validates.

## Lab 0.5 — occasional choices in Preferences

AI and music service choices now live in the existing Preferences dialog.
Manual → Your services → Change opens that same dialog, retaining the current
page. Existing local preference keys and selection handlers are unchanged. No
new toolbar, drawer, animation, model control or service capability is added.

The Jukebox header reads “Pick your sound → GO → Continue in your AI”.
Share mode asks the listener to review and send the shared request; copy/open
and browser modes keep the paste instruction they still require. The floating
selection ticket now anchors to the header trail rather than the moved service
controls. The shared PWA, atlas and portraits are unchanged.

## Lab 0.6 — transparent engraved cast

The shared PWA and bundled Lab use lossless alpha ink sprites derived from the
locked original portraits. Paper highlights reveal the app surface. No faces,
expressions, cell positions or sprite dimensions are regenerated or rescaled.
The original approved RGB sheets remain intact as source evidence.

Both layers bypass the old RGB filters. Selection crossfades neutral to zero
and selected to one; reduced motion switches immediately. The last key keeps
the same border width in both states, fixing a one-pixel landscape height shift.

Offline authoring: install Pillow, numpy and scipy, then run
`python scripts/build_mood_ink.py --check` to verify every decoded alpha pixel
and visible ink pixel against the source-based recipe. The provenance manifest
records original and output hashes, crop bounds and extraction parameters.

Browser QA: `node scripts/test_mood_ink.cjs` checks all six moods in the shared
PWA and bundled Lab at 360, 412, 915 and 1280 pixel widths, including exclusive
state layers, fixed geometry, reduced motion and touch targets. Real Android
WebView rendering remains an on-device check. Install over Lab; do not uninstall.

## Lab 0.7 — recover clipped crowns

Several source-sheet portrait crops cut across hair or caps. Version 2 restores
only each cell's top 80 rows from aligned earlier artwork. Faces, expressions,
body pixels, sprite cell geometry and the atlas are unchanged. Criminal/Funk
use the canonical source board; Weird uses its earlier full-frame hair; Angry
uses the full approved pair; neutral Sad uses the existing full-frame engraving.
Source identifiers, alignment matrices and checksummed crown masks are recorded
in mood-ink-v2.json. The builder verifies the crown masks and decoded output.
Version 1 sprites and source sheets remain available for regression comparison.


## Discovery routes experiment (Lab 0.8)

Each explicit GO draws one stable v1 route ID from a shuffled 24-route deck. Lab stores only remaining IDs and the last 30 draws locally. It uses the whole deck before reuse, avoids the preceding family when possible, and avoids the last eight IDs after reshuffling when possible. Preview/Open/Copy again do not draw. A supplied musical reference skips random routing. The old three-part seed is omitted in Lab; the skill owns route interpretation and must be updated to 3.10.0. Unknown routes fall back honestly. Clear Android app data to reset the deck. This varies requests, not a guarantee of different recordings.

Run `node scripts/test_lab_discovery_routes.cjs` for deck persistence and exhaustion checks.

## Lab 0.9 — refreshed production launcher

Build a new isolated Lab APK from the production PWA at the November 1 clean-art verified release, preserving native handoffs, preferences, saved requests, inspiration and experimental discovery routes. All eight mood controls appear, with transparent approved portraits for the original six and unchanged Desire/Triumph portraits. The APK bundles this snapshot locally and does not automatically receive future Cloudflare PWA updates. A new APK must be signed with the existing private keystore and installed over the previous Lab (same application ID and signer) to retain data. The Lab remains a separate experiment, not a production Android release.


## Recording-quality preference

Preferences includes **Skip rough recordings**, using the existing checkbox row. It is off by default and remembered in this app's WebView storage. The shared launcher handles the actual prompt, receipt and clipboard invalidation. Clean older recordings and intentional lo-fi remain eligible; heavy hiss, crackle and muffled archival transfers are discouraged. This build requires a new APK; installed Lab copies do not update from the PWA.


## Lab 0.9.5 — recording-quality policy alignment

Bundles skill 3.11.1 source and the compact `Recording preference: Skip rough recordings.` app flag. Recording-quality rules live in the shared skill reference; saved toggle and URL behavior are unchanged. The eight locked portraits retain printed petrol labels, vermilion stock, matching Desire hearts and Funk pink with occluded laser rays. Version code 14; use the existing signer to update in place.


## Lab 0.9.6 — first-crate setup and tactile controls

Bundles production PWA commit 457ccbe1d9acdf022b15f7395b3592af4ff6b6c6: first-crate onboarding, per-pair listener confirmations, focused recovery, the hi-fi recording switch and one-shot clerk stamp. Setup copying uses the native clipboard; its supported AI links use the existing native handoff without sending. Existing preferences, saved requests and inspiration remain device-local. Package ID and signer are unchanged; version code 15 updates Lab 0.9.5 in place.

## Lab 0.9.7 — physical listening switch

Preferences now uses an original metal bat-handle switch for Skip rough recordings: ON above the mount, OFF below, with the lever pointing to the current state. The active label uses the same petrol selection treatment as the service buttons. The entire row remains tappable; the existing checkbox, persisted preference and curation behavior are unchanged. Keyboard focus, reduced motion and forced-color native fallback are supported.

Version code 16 retains the Lab package identity and release signer for an in-place update from 0.9.6. This hardware treatment is confined to the Android workspace.
