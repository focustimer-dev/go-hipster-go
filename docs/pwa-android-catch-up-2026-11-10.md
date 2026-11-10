# PWA catch-up from canonical Android — 10 November 2026

## Scope and source
Android Lab on `main` is the source of truth, with the three real projections and eight approved themes. This is a **browser-only, controlled review branch**, not permission to deploy the public Worker.

## Included in this slice
- Preserve Libéri, Bosque and Usiku and add Kingston Blank-Label, Detroit Midnight Xerox, Addis Jazz Offset, Polish Jazz Modernism and Beirut Cassette Slip to Preferences.
- Copy Android semantic print colors from `android-lab/web/theme-tokens.css` into the PWA skin and guard them with a source comparison test.
- Map the five new themes to the existing poster, GO, browser-only Manual, Crate, region states and visible focus treatments; no extra UI cards or fonts.
- Extend the single canonical Android Atlas preview bridge to carry those palettes across Robinson, Globe and Cahill–Keyes, including runtime theme changes and native print CSS profile activation.
- Keep the existing `ghg-pwa-theme-v1`, Crate and regional selection keys. The AI handoff remains browser copy/open, never a native APK action.
- Add full eight-choice source tests and mobile/desktop/reduced-motion Chromium checks for five new styles, persistence, prompt integrity and no horizontal overflow.

## Known limits / next review
- The browser skin is a **color and interaction adapter**, not yet a pixel-perfect port of Android printmaking and portrait shader treatments. Compare selected Funk, neutral portraits, GO, slider, Atlas ornaments and Manual print contrast against Android on an actual phone before calling full visual parity.
- The embedded live Atlas is already built from Android source through `scripts/build_pwa_atlas_preview.py`; the old printed Robinson plate remains a fallback. Check the current US Midwest/South and Mediterranean/Balkans geographic subdivisions after deploying the preview, not from older 0.9.56 planning notes.
- Android-only native AI handoff, update prompts and native system dialogs remain intentionally distinct.
- Recent Android Manual simplification (#231) remains open at branch creation. Do not copy work-in-progress Android instructions into PWA until accepted.
- Browser storage does not synchronize with Android.

## Release gates
1. Run `python -m unittest discover -s tests` and JS syntax checks.
2. Validate isolated Cloudflare preview at 320/390px, desktop and reduced-motion, including all eight themes, real Atlas mode switches, two selected moods, Crate save/reload, Manual and GO.
3. Inspect screenshot artifacts for selected Funk, print inks, contrast and touch clipping; check remote source-vs-preview commit.
4. Require explicit approval before **merging** and triggering the one-shot production deploy, then verify `x-ghg-release` and run live smoke tests.

No public release marker, Android files, cached originals or native build inputs are changed by this slice.
