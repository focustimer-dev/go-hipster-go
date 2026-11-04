# Browser parity: first catch-up slice

The Android Lab is the product-design authority. This PWA-only adapter makes the hosted gig-poster Jukebox's workspace closer to the accepted Android 0.9.16 candidate without changing Android's native bridge, APK or bundle.

## Included
- Petrol/mustard top rail with Jukebox, Your Crate, Manual and Preferences
- Browser-local exact saved requests (up to ten; never silently evict) and three recent inspirations
- Editable current inspiration reflected in the real GO prompt, with copied-prompt invalidation
- Save-request button by the receipt, copy/share/open/delete actions, setup check, browser manual and accessible fallbacks
- Static PWA-only Cloudflare HTML insertion; Android bundles do not load the PWA adapter
- Read-only parity manifest to guide Monday/Thursday review

## Not included
- PWA link-preview metadata fetching; needs a bounded, server-side fetch design
- Native Android share-intent receiving, haptics or APK update checks
- Cross-device storage sync
- Experimental MapLibre globe/Robinson replacement. Keep PR #155 on Android Lab for acceptance.

## Verification
Run the Python tests, Node syntax-check the PWA module and test the actual Worker-served root on narrow and wide browsers. Check Jukebox selections remain stable through screen changes; GO includes the current inspiration as data; Save stores exactly the rendered request; Copy reports only real clipboard success; record that localStorage denial is handled; check PWA and Android bundle isolation. Compare screenshots to Android Lab 0.9.16.

Do not merge or deploy until preview acceptance. The production Worker is not changed merely by updating GitHub.
