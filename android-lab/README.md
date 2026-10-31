# Hipster GO Lab

A separate native Android experiment. Package `work.samelling.hipstergo.lab`,
version `0.3.0`, Android 7+. It installs alongside the production APK and PWA.

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

Open **LAB SETTINGS** to change handoff mode and toggles. Skill selection,
connected music apps, pasting, and sending remain controlled by the receiving AI.
This experiment does not automate sending prompts or publishing playlists.

## Deliberate skill updates

Open **LAB SETTINGS → Gemini skill updates**, or tap the Lab title. Native code
reads GitHub Releases from this public repository, using the exact Gemini ZIP
asset. Stable excludes drafts and prereleases. Lab includes published prereleases
as well as stable releases; no experimental release is currently required or
invented by this feature. The checker considers the latest 100 release records.

Checks happen at most once per day when the app launches. Turn daily checks off
in the update panel, or use **Check for updates** whenever wanted. An in-app title
badge indicates an available package; no Android notification permission or
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

After GO, choose **LAB SETTINGS → Save current request**. Give the exact request
a name, then find it under **Saved requests**. Open it in the selected AI, copy,
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
**FROM YOUR CRATE** card appears above GO with **Review** and **Remove** controls;
Lab Settings also has **Shared inspiration**. Your region, mood and tempo choices
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

Home-screen widgets, an Android share target for incoming inspiration, exportable
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

The native share-sheet listing and review dialog still need a device smoke test.
Release build/vital lint, 15 native tests, snapshot isolation, and DOM handoff and
inspiration tests passed. Existing Chromium sandbox limitations are unchanged.
