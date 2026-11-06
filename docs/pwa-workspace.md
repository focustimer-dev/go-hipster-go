# Browser parity: accepted baseline and controlled catch-ups

The Android Lab is the product-design authority. The first PWA-only workspace slice followed Android 0.9.16; the current controlled catch-up targets canonical Android development baseline **0.9.56**, without changing Android's native bridge, APK or bundle. See [pwa-0-9-56-adaptation.md](pwa-0-9-56-adaptation.md) and [pwa-parity.json](pwa-parity.json).

## Included
- Petrol/mustard top rail with Jukebox, Your Crate, Manual and Preferences
- Browser-local exact saved requests (up to ten; never silently evict) and three recent inspirations
- Editable current inspiration reflected in the real GO prompt, with copied-prompt invalidation
- Save-request button by the receipt, copy/share/open/delete actions, setup check, browser manual and accessible fallbacks
- Static PWA-only Cloudflare HTML insertion; Android bundles do not load the PWA adapter
- Read-only parity manifest to guide Monday/Thursday review

## Current 0.9.56 browser catch-up candidate
- Compact Manual with Setup / Using the App guides and self-contained browser setup checks; no video or native features are represented as working in the browser
- Jukebox-level inspiration entry point using the existing Crate / prompt contract
- Petrol/mustard full-width GO band alignment and no red stripe on the inspiration sleeve
- Reusable isolated PWA preview workflow and mobile, desktop and reduced-motion guide tests
- The three-projection Atlas remains a separate browser adapter work item until map/gesture/performance acceptance

## Not included
- PWA link-preview metadata fetching; needs a bounded, server-side fetch design
- Native Android share-intent receiving, haptics or APK update checks
- Cross-device storage sync
- Direct copy of Android 0.9.56's accepted MapLibre Globe, Robinson and Cahill–Keyes geometry/animations. Browser atlas parity requires its own QA and release gate.

## Verification
Run the Python tests, Node syntax-check the PWA module and test the actual Worker-served root on narrow and wide browsers. Check Jukebox selections remain stable through screen changes; GO includes the current inspiration as data; Save stores exactly the rendered request; Copy reports only real clipboard success; record that localStorage denial is handled; check PWA and Android bundle isolation. Compare the intended guide taxonomy and visual hierarchy to Android Lab 0.9.56, and verify browser-only differences are explicit.

Do not merge or deploy until preview acceptance. The production Worker is not changed merely by updating GitHub.
