# Go, Hipster, Go! — PWA design and map parity audit (7 November 2026)

## Authority and release boundary

**Android Lab is the primary product.** Treat `PRODUCT.md`, the latest approved appendices in `launcher/editions/gig-poster/DESIGN.md`, and the actual current Android Lab implementation as the design authority. Older illustrative passages in DESIGN.md (five moods, five across, earlier GO order) are historical and superseded by the later approved eight-mood, compact request-block and Manual changes.

The PWA is a deliberately lighter browser companion (~80–90% user-flow parity), not a second Android build. The installed skill performs curation; the launcher builds a copyable request, not an authenticated Spotify playlist or auto-submitted AI message.

## Screen-by-screen source audit

| Surface | Design requirement | Implementation / result | Release disposition |
| --- | --- | --- | --- |
| Jukebox | Original approved portraits, up to 2 moods, tempo/Any, region stamps, clear GO and copy recovery | Shared gig-poster launcher with theme-only CSS. Liberi default; Bosque and Usiku opt-in. Original portraits and native prompt logic unchanged. | Preserve; run phone/desktop/reduced-motion regression |
| Your Crate | Persistent local inspirations (last 3), up to 10 exact saved prompts, clear metadata and return to Jukebox | `pwa-workspace.js` uses browser-local storage, exact prompts and recoverable metadata URLs; no cross-device-sync claim | Preserve, verify save/use/delete/reload |
| Manual | Setup / Using the App guide picker; truthful ChatGPT/Gemini/Claude/Other and music service limitations | Browser-specific guide picker in the Manual tab; `/setup/` remains a separate full guide. Both inherit selected appearance; native demo/install claims are not copied into browser. | Preserve and check all theme surfaces, narrow/mobile |
| Preferences | Infrequent configuration outside main Jukebox and appearance switch | `Preferences` in top-right sheet: Liberi/Bosque/Usiku persist on-device. Recording quality remains in the Jukebox's Listening preferences disclosure. | Preserve; no extra permanent chrome |
| Jukebox Atlas | Preserve familiar interactive Robinson layout, stamp IDs, no gesture regressions | Embedded browser Atlas remains its accepted Robinson implementation. No surprise engine swap. Theme selection already recolors map surface and stamps. | Preserve until a separately reviewed embedded three-projection port |
| Three-map Atlas | Robinson, Cahill–Keyes, Globe, true geography, regions and native animation, no fake projection | The actual Android snapshot is served at `/pwa-atlas/` as a bounded browser route. This pass adds browser-only theme paints for Globe/Robinson and CSS for Cahill, sharing the stored theme. Map geometry and Android JS are untouched. | Validate all three map modes under Bosque and Usiku; keep separate route |
| Android-only features | Native handoff, updater, vibration, APK-specific files | Intentionally absent from public PWA; no false connected-service success | Do not port blindly |

## Palette integration rules

- **Liberi** is identical to the existing gig-poster original; no extra style rules are applied to the Android bundle.
- **Bosque** keeps warm paper and forest-green printed geography, Racing Yellow selected region stamps, and the approved Funk exception.
- **Usiku** keeps the dark room, forest/cream geography and saddle/cognac material accents. Racing Yellow means *selected*, not tobacco. Selected and neutral state remains explicit with text/underlines, not color alone.
- Selected mood art is never rewritten or replaced. Portrait inks and skin-tones use their locked original plates.
- Browser-only Atlas CSS and MapLibre paint expressions live under `launcher/assets/pwa-atlas-*`; generated `launcher/pwa-atlas/` is build output. The Android engine is authoritative for transitions and touch behavior.

## Remaining design deltas (intentional or deferred)

1. **The three-projection Atlas is not embedded directly in the Jukebox.** `docs/pwa-0-9-56-adaptation.md` explicitly defers replacing the original browser Atlas until a dedicated adapter passes gesture, performance, state, projection and animation QA. The user retired the large “Try all 3 maps” promotion; do not reintroduce it.
2. **Manual differences are browser-specific, not defects.** Browser installation/help, clipboard fallbacks and capabilities differ from Android's native plugin/handoff and video demo.
3. **App and browser storage are not shared across devices.** The same-origin PWA pages can share selection and inspiration state; Android's own app storage stays separate.
4. **Historical design notes are not current DOM requirements.** Later approved eight-mood and GO/Crate specifications override early alternate-design passages; compare against `main` as rendered, not an old screenshot.
5. **Android's intermittent software-rendered Cahill and Globe transition timing tests remain a distinct stabilization track.** Do not modify geometry or relax those tests as part of a browser theme change.

## Release gates

- Build the canonical edition without generated diffs; Python unit and JS syntax checks.
- PWA isolated Chromium QA at 320px/390px, desktop, and reduced motion. Verify all three themes across Jukebox, Crate, Manual and Preferences.
- For browser Atlas, assert actual MapLibre source paint expressions and SVG Cahill region fills for both new themes, plus region persistence and all three switches.
- Verify the public deploy by its expected Git commit SHA and smoke the public browser PWA, Crate, Manual and Atlas. A merged Git branch alone is not proof of publication.
- Only after stable functional deployment: small visual corrections identified by phone review (theme contrast, map transition palette, small-screen alignment).

## Scope of this reconciliation

No new character assets, no altered media-creation contract, no Android API changes, no replacement of the embedded Robinson Atlas, and no new trial CTA. Only the browser adapter/stylesheet, representative QA, and this evidence record change.
