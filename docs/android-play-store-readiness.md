# Android 1.0 — pre-approval Play Store package

**Status:** Pre-registration preparation, **not** submitted to Google Play. Developer account verification pending as reported by the owner; there is no approved Google Play package/signing decision yet.

## Store copy — draft for owner review

**App name:** Go, Hipster, Go!

**Short description:** Make 12-track music discovery briefs with moods, regions and tempo curves.

**Full description:**

Go, Hipster, Go! turns a feeling, sound, place or odd idea into a detailed request for a music discovery session.

Use the Jukebox to combine moods, set a tempo curve and explore music scenes around the world. Add an inspiration from a song link, artist or idea; review it in Your Crate; then copy your request and send it to a supported AI assistant.

The native Android app includes:
- A hands-on mood and tempo curve, designed for twelve-track journeys
- A region explorer with globe and alternate map views
- Nine distinctive visual themes
- Your Crate for saved requests and recent inspiration
- A home-screen Chaos Roll widget for a fresh prompt
- Native copy, share and handoff options for supported AI assistants

The interface works offline for core browsing and composing. A network connection may be needed for link previews, update checks and the AI or music services you choose.

**Important:** The app prepares and copies discovery requests. An external AI assistant performs research, and playlist creation/saving depends on the tools and authorization available to that assistant. The app itself does not stream songs or guarantee playlist publication.

**Release notes (draft):**
First native Android release: Jukebox, curve, nine themes, regional Atlas, Your Crate, Manual and Chaos Roll widget.

## Assets and capture plan

The release build — **not Android Lab** — must supply:
- [ ] Launcher icon: approved red star; correct adaptive/icon mask and contrast on launchers
- [ ] Feature graphic matching the approved visual system; final Play dimensions checked in Console
- [ ] Phone screenshot 1: Jukebox with mood/tempo curve
- [ ] Phone screenshot 2: Atlas regional exploration
- [ ] Phone screenshot 3: Your Crate/inspiration review
- [ ] Phone screenshot 4: Manual/setup with honest AI handoff instructions
- [ ] Phone screenshot 5: actual installed Chaos Roll widget, cassette 3×2
- [ ] Screenshot from all tested themes archived for QA (not necessarily submitted to Store)
- [ ] Verify images contain no Lab badge, test fixtures, misleading sample playlist publication, or fake platform interactions

## Google Play app-content requirements — do not fill with assumptions

- [ ] Developer verification approved; Google Play app entry permitted
- [ ] Final `applicationId` history checked: `work.samelling.hipstergo` is used by historic TWA source and is currently provisional for the native RC
- [ ] App Signing/enrollment and upload-key strategy approved; fingerprints recorded without exposing secrets
- [ ] `versionCode` checked for monotonicity against any previous Play uploads, including old TWA
- [ ] Native signed AAB built and its package/manifest/certificate/SDK versions verified
- [ ] Privacy policy: approved Android-specific publicly hosted HTTPS page, linked in app **and** store
- [ ] Data safety: verified actual collection/transmission for full inspiration URLs sent to first-party preview endpoint and public hosts, GitHub update requests, external AI handoff, third-party dependencies, and any logs
- [ ] Cloudflare Worker preview routing, analytics/log retention and any sub-processors reviewed; document findings in the final Android privacy policy
- [ ] Advertising declaration validated
- [ ] Audience/target age/content rating questionnaire answered truthfully
- [ ] App-access instructions provided (no first-party account needed; explain optional external AI/music accounts)
- [ ] Pricing/countries/dev contact/support listing confirmed
- [ ] Play SDK policy/pre-launch and accessibility warnings resolved
- [ ] Internal test from Play with actual Play-distributed signing/splits; closed testing if required by account type
- [ ] Owner authorizes Play upload and later public publication separately

## Physical-device release acceptance (not replaceable by CI)

- [ ] Fresh install of production app; no Lab references in visible launcher, menus, Manual, toasts or notifications
- [ ] Lab and production side by side; neither overwrites the other
- [ ] All nine themes: Jukebox, Manual, Crate, Preferences, contrasts and system bars
- [ ] Accessibility: TalkBack, large text, tap targets, focus order, reduced motion
- [ ] Chaos Roll widget: 1×1 vinyl, 3×2 cassette, intermediate resize, tap, clipboard and missing-app fallback
- [ ] Core 12-slot curve from moods/tempo reflected in GO text; region selection and randomizer contracts
- [ ] Atlas Robinson/Globe/Cahill transitions, no blank screen or seam artefacts
- [ ] ChatGPT/Gemini/Claude/Other handoff; clipboard vs share semantics truthful
- [ ] Network-offline core flow and slow/broken link-preview recovery
- [ ] Upgrade/reinstall with a higher `versionCode` preserving eligible production settings; no promise of Lab/TWA migration
- [ ] Cold launch, widget update and APK size compared with approved baseline; no unexplained significant regression

## Gate when developer verification arrives

1. Check Play Console app entry and whether the old TWA package has ever been registered/installed through Play.
2. Verify permanent package and signer fingerprints/requirements; do not assume possession of the old Lab key makes it a Play upload key.
3. Create and verify production upload signing in a secure dedicated workflow (no key in git, logs or downloaded artifacts).
4. Upload to **internal testing** only after authorization; inspect Play pre-launch report and actual Play-installed app.
5. Launch the closed testing cohort and meet any account-specific participation requirement.
6. Apply for production access and publish only after owner sign-off.

**Background official docs:**
- [Preparing app for review](https://support.google.com/googleplay/android-developer/answer/9859455)
- [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Testing tracks](https://support.google.com/googleplay/android-developer/answer/9845334)
- [Personal-account closed testing](https://support.google.com/googleplay/android-developer/answer/14151465)

**No keys, app submission, or app publishing is part of this document.**
