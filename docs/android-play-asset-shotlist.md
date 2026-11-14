# Play Store artwork and screenshot capture sheet

**Status:** shot plan only. **No store image is approved or uploaded yet.** Capture the current non-Lab Android RC on a real phone or emulator; do not fabricate app screens, music playback or playlist publishing. Every image must describe features that are actually present in the signed release under test.

## Required Google Play assets (official dimensions, checked 2026-11-14)

| Asset | Google Play requirements | Our production source/status |
|---|---|---|
| **Store icon** | **512 × 512 px, 32-bit PNG with alpha**, ≤ **1024 KB** | Approved red-star launcher exists as `android-lab/app/src/main/res/mipmap-*/ic_launcher.png`. **A separate 512px store-master export is still required**; do not upscale a low-res mipmap blindly |
| **Feature graphic** | **1024 × 500 px, JPEG or 24-bit PNG (no alpha)** | Not exported/approved. Build from existing approved brand artwork, not unrelated generic mockups |
| **Screenshots** | Minimum **2**; JPEG or 24-bit PNG (no alpha); each dimension **320–3840px**, long side at most **2×** short side | Capture actual installed `work.samelling.hipstergo.qa` RC. Crop oversized/tall raw Pixel captures to allowed aspect ratio **without distorting UI** |
| **High-quality phone presentation** | Recommended **4+ screenshots**, at least 1080 px width, approximately **9:16 portrait** or **16:9 landscape**; max **8 phone screenshots** | Aim for six authentic 1080 × 1920 portrait screenshots, or nearest compliant unscaled crops. Validate size and file formats |

Official asset requirements: https://support.google.com/googleplay/android-developer/answer/9866151

## Approved creative direction for production art

Use the existing **Go, Hipster, Go!** visual identity (printed music ephemera, genuine artwork, expressive mood portraits, Atlas, warm paper inks and distinctive cassette/record widget). Favor one clear subject and high contrast. The feature graphic should **complement** rather than simply enlarge the red-star launcher icon; place essential detail toward the center to avoid cropping across Play placements. Do not imply Google, Spotify, Gemini or another third party sponsors the app. Do not include a Google Play badge, exaggerated claim, "best" ranking or promotional price promise.

Images from `android-lab/artwork/chaos-roll/` are source materials, **not** final production widget screenshots. The Lab cassette source includes printed `/ LAB`; the production/QA packaging step removes that suffix. Never upload an image that still contains **Lab** or **RC** wording as if it were the final public app.

## Phone screenshots in priority order

All screenshots must be captured from a **single known QA/production commit**, with the version and screenshot date recorded. The release app's core UI should be visible; no unrelated private accounts, playlists or identifying notification shade details.

| Order | Shot | Demonstrates | Capture and text review |
|---|---|---|---|
| **01** | **The Jukebox** | Main mood selections and twelve-slot tempo/mood curve | Choose an attractive populated but honest example. Show app title and control labels without a clipboard success toast |
| **02** | **Musical Atlas** | Robinson region explorer with one selected region | Selected geography and route controls must be readable. Do not claim the app streams music |
| **03** | **Your Crate** | A saved inspiration and saved request on the device | Use non-sensitive **dummy** example text. Avoid a real user’s private prompt or personally identifying link |
| **04** | **Manual / AI handoff** | Stable package instructions and normal copy-and-review workflow | Show accurate current stable skill `3.11.6`, no deprecated ZIP link; do not imply the app silently installs a skill |
| **05** | **Chaos Roll cassette** | **Real 3×2 home-screen widget** using approved production art | Capture actual Android launcher, cassette with `HIPSTER GO`, **without `/ LAB`**; crop to comply with Play screenshot rules |
| **06** | **Chaos Roll vinyl or alternate theme** | 1×1 record widget or contrast-rich second app theme | Must be real installation, correct proportions, no fake animation or custom UI compositing |

The first three should be Jukebox, Atlas and Crate. Widget screenshots show the home screen rather than the app itself, so make their relevance clear; if they are confusing, use a sixth real in-app view instead. No overlaid fingers, fake ratings, simulated AI catalog verification, invented playback, or fabricated third-party logos.

**Suggested alt text (all ≤140 chars):**
- 01: “Jukebox with mood portraits and a draggable twelve-track tempo and mood curve.”
- 02: “Atlas map with selected music region and exploration controls.”
- 03: “Your Crate showing locally saved inspirations and music discovery requests.”
- 04: “Manual with instructions for copying a request to a selected AI assistant.”
- 05: “Chaos Roll cassette-style Android home-screen widget for a fresh music prompt.”
- 06: “Chaos Roll vinyl-style widget beside the Go, Hipster, Go! launcher icon.”

## Capture and QA workflow

1. Use the successful **main-branch** [Android production RC workflow](https://github.com/focustimer-dev/go-hipster-go/actions) and record its SHA plus `hipster-go-android-rc-evidence` hashes. Install only the `hipster-go-android-qa-sideload` artifact.
2. Set theme, tempo and regions. Seed **dummy** Crate content. Check that any installed external AI service is not accidentally visible in screenshot chrome.
3. Take authentic Android screenshots; use non-destructive cropping only to meet Play limits. Do not stretch screenshots, draw in missing controls or add user-facing fictional text.
4. Export as opaque PNG/JPEG, confirm dimensions and legibility at thumbnail scale. Remove personal notifications and device-identifying content.
5. Save exact filenames (`01-jukebox.png` through `06-widget-vinyl.png`), source SHA, theme, capture device/OS and reviewer notes; archive screen evidence outside release source until approved.
6. Export a **new** 512px transparent icon master from approved original art and a **new** 1024×500 opaque feature graphic; review both for consistency and permissions.
7. Run the image checks, record approvals, then upload only after developer account verification and final Play listing signoff.

## Assets awaiting real evidence

- [ ] Store icon 512 × 512 PNG alpha, approved
- [ ] Feature graphic 1024 × 500 JPEG/PNG opaque, approved
- [ ] At least four authentic phone screenshots at compliant size/ratio
- [ ] Consistent title, theme and native non-Lab branding
- [ ] Screenshot provenance: installed APK SHA, device, capture date and owner approval
- [ ] Alt text and visual asset rights reviewed
- [ ] Actual Play Console upload/pre-launch visual inspection

**Note:** This is a production creative brief, **not proof that the images have been created**.
