# PWA catch-up targeting Android Lab 0.9.56

Android is the canonical development product. The public browser demo stays approximately 80–90% aligned by **user-facing workflow**, not by copying Android-only implementation details. This document records the deliberate gap and remains descriptive, not a production deployment request.

## Reference
- Approved canonical Android main: `505fcd46f8834380d5cbe86c2faeab87a895ae84`, 0.9.56.
- This is a *development baseline*, not a claim of an Android Play Store release.
- Public PWA last verified as the previous November 3 ET release (short commit `71db742`); a repository commit does not by itself establish what Cloudflare serves.
- Preserve the existing browser Crate key, exact saved requests, three recent inspirations, selection state and skill prompt behavior.

## Slice A: this controlled browser adapter
- Reuse the Android Manual's **Setup / Using the App** hierarchy and guide subjects, in an independently styled, mobile-friendly browser picker.
- Offer a Jukebox-level way into active inspiration without touching Crate storage or changing the meaning of GO.
- Align the Jukebox's GO and inspiration bands to the accepted petrol/mustard layout.
- Make the isolated preview QA workflow usable for future `feat/pwa-*` branches. Verify on 390px mobile, desktop and reduced-motion mobile.
- No Android source changes, native APIs, cross-device storage claims or background music-service writes.

## Slice B: intentional hold — three-projection Atlas
Android 0.9.56 includes Robinson, Globe and Cahill–Keyes plus projection-transition animation. The PWA still uses its existing browser atlas. The complete engine is **not** directly portable as a CSS change: Android packages offline MapLibre resources, an SVG Cahill renderer, shared map selections and mobile viewport/camera calibrations. Pasting the native WebView implementation into the existing poster page would risk map input and load time.

Before a browser port, design a browser-facing Atlas interface with the same region IDs and selections, preserve hidden discoveries, keep geographic touch reliable, and test all projection directions, keyboard access, reduced motion, 320/390/412px widths, shipping-lane draw order, Antarctica, navigation, startup and resource budgets. The outstanding software-rendered Cahill end-to-end CI timing issue in Android is tracked separately; it does not justify shipping a partial browser engine.

## Release gate
1. Preview on isolated Worker only; never overwrite production as a side effect of PR or manifest updates.
2. Check Crate + prompt persistence after reload; mood, regions and GO continue working.
3. Verify Manual category and guide actions plus Jukebox inspiration at narrow, desktop and reduced-motion sizes.
4. Require explicit review and production promotion, and record the actual Cloudflare release revision afterward.
5. Continue Monday/Thursday reviews; compare **approved** Android changes only, and do not double-count stacked PRs.
