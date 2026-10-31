# Hipster GO Lab

A separate native Android experiment. Package `work.samelling.hipstergo.lab`,
version `0.1.0`, Android 7+. It installs alongside the production APK and PWA.

## Isolation

The release bundles a frozen copy of `launcher/`. No production deployment,
Worker changes, API credentials, or production data are required. Lab preferences
and WebView storage belong to this separate app. UI updates require a new Lab APK.
The build script only modifies the generated, ignored asset copy. No interface
or portrait changes are applied to the canonical launcher sources.

The native bridge is available only to packaged pages on a synthetic local HTTPS
origin. External navigation opens outside the WebView, external resource requests
are blocked, frames and network connections are blocked, and file/content access
is disabled. No INTERNET permission is requested. No AI login happens in the Lab.
Prompts are copied locally; no prompt history is written to disk by native code.

## First experiment

- **GO:** copies the current request and opens the selected AI using native code.
- **Open mode (default):** launches installed ChatGPT or Gemini, then paste/send.
  If the selected package is unavailable, opens the AI website instead.
- **Share mode:** tries sending the prompt to the selected AI's share receiver;
  falls back to Android's share chooser. Receiving-app support is unverified.
- **Browser mode:** copies and opens the AI website in the browser.
- **One-tap GO:** turn off to retain the separate GO then OPEN flow.
- **Haptics:** optional system-respecting confirmation feedback.
- **Launcher shortcuts:** long-press the icon for Funky or Weird.
- **Native share:** opens Android's chooser with the current prompt.

Open **LAB SETTINGS** to change handoff mode and toggles. Skill selection,
connected music apps, pasting, and sending remain controlled by the receiving AI.
This experiment does not automate sending prompts or publishing playlists.

## Build and verify

JDK 17, Android SDK 36 and build tools 35.0.0, Python 3, and the checked-in wrapper
from `android/` are required. From the repository root:

```sh
bash android/gradlew -p android-lab assembleRelease --no-daemon
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

## Initial validation

Release assembly and release vital lint passed. Snapshot isolation and DOM
handoff tests passed, including stale-prompt rejection. Local Chromium rendering
was blocked by the execution sandbox denying its socket operation. The browser
smoke test is included in the separate Lab CI workflow. Repository-wide Python
checks retain the same seven failures and one bundle-sync error seen on unchanged
main. Phone launching, clipboard behavior, gesture rendering and sharing still
require the device smoke test.
