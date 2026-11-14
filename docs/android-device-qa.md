# Android 1.0 — non-Lab RC device test

**Status:** Installable test build, **not** the final Play Store application and **not** a production-signing key.

The `qa` build type uses the same native source, offline Jukebox/Atlas, theme tokens and approved Chaos Roll assets as the unsigned production app. It has **no Lab name or badge** and is labelled **Go, Hipster, Go! RC** on the launcher.

| Characteristic | QA APK | Final release candidate |
|---|---|---|
| Installed package | `work.samelling.hipstergo.qa` | Provisional `work.samelling.hipstergo` |
| Launcher name | Go, Hipster, Go! RC | Go, Hipster, Go! |
| Key | Ephemeral CI debug certificate | Future approved production upload/App Signing certificates |
| Debuggable flag | **false** | false |
| Output | signed `app-qa.apk` for phone testing | unsigned `app-release-unsigned.apk` and `app-release.aab` pending Play authorization |
| Upgrade path | **Do not expect upgrades across CI runs**; runner keys differ | determined by Play registration/certificate and increasing versionCode |
| Local preferences | QA-only storage, not Lab or production | production-only storage |
| Google Play eligible | **No** | Only after M0/M5 signing and policy gates |

The QA signing step does not read or use any existing Lab, TWA, Google Drive or Play signing keys. The runner's temporary debug key is used to make an installable test APK, and it is **not committed, published, backed up or reused**. Never migrate data from QA to production by renaming the package. The final Play package ID remains a separate approval gate.

## Get and install the APK

1. Open the successful **Android production RC (unsigned, no deployment)** workflow run in GitHub Actions.
2. Download **hipster-go-android-qa-sideload** (GitHub sign-in may be needed), then extract `app-qa.apk`. **Do not install** the unsigned production APK from the other artifact.
3. On the Pixel, open `app-qa.apk` and allow installation from your chosen files/browser app if Android requests it. If Android blocks it, do not disable Play Protect globally; report the exact warning. The app launcher should say **Go, Hipster, Go! RC**.
4. The QA package can coexist with installed Lab. It has a separate Crate and preferences. **Do not uninstall Lab** and do not assume QA settings transfer to the final store build.
5. When testing a later CI build, uninstall the earlier **QA** app first if Android reports a signing conflict. This clears QA-only data; do not use QA for permanent saved crates.

## Device acceptance checklist (Pixel, Android 17 baseline)

- [ ] First launch: correct RC name, red star icon, no Lab badge, no sandbox language, clear setup instructions
- [ ] Launch shortcuts: Funky and Weird open the **QA** installation, not Lab or old TWA
- [ ] Native settings: system bars change with all nine themes; font contrast and haptics; first-run dialog works
- [ ] Copy and open: ChatGPT, Gemini, Claude, Other. Verify **copy ≠ automatic send or playlist publication**
- [ ] Missing/restricted AI handler: choose an AI not installed, GO and widget Chaos Roll still copy the request, fall back to an available HTTPS browser or an actionable paste message; no crash or false 'submitted' claim
- [ ] Share handling: if the target AI cannot accept a text share, the ordinary Android chooser still opens, or clearly explains that the already-copied prompt must be pasted manually
- [ ] Incoming music/text share: review before use, cancel and remove; link preview recovers on slow/offline connections
- [ ] Your Crate: recent inspirations, save/reuse/remove request; restart retains QA-only data
- [ ] Tempo/mood curve: drag 12 slots, no missing or extra tracks, regional selections and recording flags preserved
- [ ] Atlas Robinson / Globe / Cahill transitions: no frozen canvas, ghost lines, unwanted scroll trapping
- [ ] Widgets: **1×1 vinyl**, **3×2 cassette** and intervening sizes; artwork aspect, legibility, tap action, no unintended extra copies or network polling
- [ ] Accessibility: 200% font, TalkBack focus order/controls, keyboard/back, visible system bar icons and large targets
- [ ] Airplane mode: Jukebox, Atlas, Crate, local preview and Chaos Roll still function; only external AI/link services require network
- [ ] No unexpected startup crashes, ANRs, battery drain or major size regression

**Reporting:** record app version, device, OS, the exact action that failed and a screenshot/short recording. Treat crashes, broken GO/share, a nonfunctional widget or inaccessible primary workflow as P0/P1 stop-ship. Refer to [release tracker](https://github.com/focustimer-dev/go-hipster-go/issues/285). Do not declare M2/M3/M4 passed until the on-device walkthrough is completed.

## Before any actual Play release

Do not upload `app-qa.apk` to Play Console. Verify package ownership/history and certificate, build and sign a clean production AAB, install it **through Play internal testing**, finalize the Android privacy policy and Data safety disclosures, then obtain owner approval for the public track.
