# Android 1.0 — Google Play submission readiness

**Status: pre-registration, review required.** Developer verification is pending; no Google Play app entry or permanent Play upload key has been confirmed. **No signing, upload, listing submission, public PWA deployment or publication is authorized by this plan.**

This checklist applies to the native production variant of **Go, Hipster, Go!**, not the old Trusted Web Activity or Android Lab installation.

## 1. Canonical en-US store listing copy

**Source of truth:** [`config/google-play-listing.en-US.json`](../config/google-play-listing.en-US.json). It contains the final editorial **candidate** for the name, short description, full description and What's New; `approval` flags remain false. Do not hand-edit other copies in parallel. The automated release-preflight test enforces Google's 30/80/4000 character limits.

The copy explains the app's actual function: building 12-track music discovery briefs that can be copied/shared with an AI assistant; moods, a 12-slot tempo/mood curve, nine themes, regional Atlas, Your Crate and Chaos Roll widget. It explains that the native app **does not stream songs or guarantee playlist publication**, and that external AI/music services require their own tools/accounts. It does not promise automatic playlist creation, platform installation, or direct streaming. Store copy must be reviewed against the actual approved signed build.

Working proposals, **not Play Console declarations**: `App` type, `Music & Audio` category, English (United States), support email `gohipstergosupport@proton.me`. Whether the app is **free or paid** is an owner decision—do not default this irreversible listing choice.

Official field limits and setup: https://support.google.com/googleplay/android-developer/answer/9859152

## 2. Required image assets and evidence

The [screenshot and asset plan](android-play-asset-shotlist.md) identifies approved source artwork and the six real-device screenshots to capture. None is falsely marked complete.

- [ ] **Store icon**: original approved red-star artwork exported as **512 × 512**, 32-bit PNG with alpha, ≤ 1024 KB, reviewed against the installed launcher icon
- [ ] **Feature graphic**: **1024 × 500**, JPEG or opaque 24-bit PNG; use approved theme/art, not fake music-player UI
- [ ] **Phone screenshots**: minimum two compliant real captures; recommended **four or more** from the actual native app at 1080 × 1920 or better, compliant aspect ratio; no Lab/RC copy or staged third-party success
- [ ] Capture the Jukebox, Atlas, Your Crate, Manual and 3×2 cassette; optionally 1×1 vinyl or alternate theme, with accurate image alt text and a single source SHA
- [ ] Review all asset usage rights and capture provenance; archive the actual evidence before Play upload

Official Google Play preview-asset specs: https://support.google.com/googleplay/android-developer/answer/9866151

## 3. App-content and Data safety declarations

**Technical inventory:** [`android-play-data-safety-review.md`](android-play-data-safety-review.md), with native Java and Cloudflare Worker source evidence. The [public Android privacy policy](https://hipster-go.samelling.workers.dev/privacy/) is deployed and linked from native Android and the PWA; the [working audit draft](android-privacy-policy-draft.md) remains separate and unapproved as a final Data safety declaration. The ChatGPT plugin privacy document must not be submitted for the Android app.

- [ ] Cloudflare infrastructure/CDN logs, analytics, query-string handling and retention verified, **especially full first-party preview URLs**; data-safety types/ephemeral processing/optional use approved
- [ ] Android SDK/third-party dependencies and merged manifest audited; confirm no tracking, advertising or undisclosed user/device data transfers
- [x] Deploy an Android-specific, dated public HTML privacy policy at `https://hipster-go.samelling.workers.dev/privacy/` (anonymous live verification passed in Cloudflare deploy CI); owner/legal review and Data safety reconciliation remain pending
- [x] Add policy/support links in the Android Manual and Preferences; automated source checks pass. **Real-device link acceptance is still pending**
- [ ] Enter the canonical policy URL in Play Console after account verification; verify Console listing. A GitHub Markdown document is **not** the published policy page
- [ ] Ads declaration (candidate: no), audience/age ranges and official content-rating questionnaire answered by owner in Play Console; do not infer age rating from themes or external content
- [ ] App-access instructions: no first-party account; external AI/music assistants may require the user's own accounts or skills
- [ ] Decide free/paid listing, countries, category, contact and public support URL
- [ ] Confirm no special declarations (e.g., Families, health/finance, user-generated social posting) apply to final features
- [ ] Do not answer “No data collected” by default; Google counts off-device data collected by app code/SDKs/WebViews and may count data shared to another app

Official app-review requirements: https://support.google.com/googleplay/android-developer/answer/9859455
Data safety: https://support.google.com/googleplay/android-developer/answer/10787469

## 4. Technical bundle and device-readiness gates

- [x] **Android API 36 target** in native production Gradle; meets Google's new-app/API 36 submission target as of November 2026
- [x] **Keyless artifact pipeline** builds unsigned production APK/AAB and separate signed **QA-only** APK from one SHA; [release-evidence runbook](android-release-evidence.md) checks hashes/package identity
- [ ] Final Play app ID approved: `work.samelling.hipstergo` is **provisional**, previously used by old TWA source; check if it was ever uploaded/registered with the same package and certificate
- [ ] Owner approves version code monotonicity, Play App Signing/upload-key management and secure CI, **after** developer verification
- [ ] Final signed AAB: inspect actual merged manifest, release-dependency graph, target SDK, signing fingerprint and device compatibility
- [ ] Verify 16 KB page compatibility of any embedded native libraries. Current Java-only sources suggest limited NDK exposure but **do not assume** none without examining the final AAB
- [ ] Fresh Play/internal install: all nine themes, 12-slot curve, Atlas projection transitions, correct Manual/AI skill links, native handoff and offline behavior
- [ ] Accessibility: TalkBack, 200% font, touch targets, system bars, back behavior, no blocked essential path
- [ ] Chaos Roll 1×1 and 3×2 widget: correct imagery and captions, resizing and tap actions; no Lab lettering; app remains isolated from Lab
- [ ] App startup, battery/network usage, APK/AAB size, no unhandled crashes/ANRs or unexplained regression
- [ ] Capture actual device screenshots from the approved source, not the disposable QA package alone for final Play signoff

Device checklist: [Android RC QA](android-device-qa.md).
API level policy: https://support.google.com/googleplay/android-developer/answer/11926878
16 KB guidance: https://developer.android.com/guide/practices/page-sizes

## 5. Account approval and testing sequence

1. Developer account verified; create/confirm permanent app entry and package history **before signing**.
2. Approve the final owner decisions (free/paid, category, target audience, app content and privacy/Data safety).
3. Sign the release AAB with the appropriately registered upload key using a secure, separately reviewed workflow. Never reuse temporary QA signing material for the Play app.
4. Upload to **internal testing** only with release authorization; collect device and Play pre-launch evidence. Internal testing is not a public release.
5. If the account is a **personal developer account created after November 13, 2023**, Google's rules require at least **12 opted-in closed testers for 14 continuous days** before applying for production access. Confirm actual account eligibility and manage a buffer above 12, because opt-outs reset continuity.
6. Address issues from real testers, complete pre-launch report, capture owner acceptance, apply for production access as required.
7. **Public publishing** is a separate explicit owner authorization after Play access is approved.

Official personal-account testing: https://support.google.com/googleplay/android-developer/answer/14151465

## Open questions the owner must eventually answer

- Is this a first-ever Play registration or an upgrade to a historic TWA package?
- What legal developer identity and public contact should the privacy policy reflect?
- Is the listing free or paid, and which countries are in scope?
- Confirm target audience/content-rating responses, app access, ads and Data safety disclosures.
- Approve final screenshots/feature graphic after installed release evidence.

**Current outcome:** Store copy and policy evidence can be reviewed now; the app is **not Play-submission-ready** until identity, privacy publication, image assets, console declarations and installed-device checks are completed.
