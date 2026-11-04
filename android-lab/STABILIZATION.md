# Stabilization and release acceptance

The candidate version comes from `app/build.gradle`. The comparison baseline is
`release-baseline.json` (0.9.15), shared by performance CI and this release process.
The PWA and Android use the same canonical launcher sources; packaging injects
Android extensions only through named `PLATFORM_*` slots. Missing or duplicate
slots fail the build. Keep `web/runtime-assets.json` in sync with runtime resource
references; offline dependency tests reject omitted assets.

## Changes

- Region/focus state owns atlas selection updates. Mood, pace and options do not
  rewrite geography. The existing composited camera and Robinson geometry stay.
- Each full render reads at most one native snapshot. Native notifications
  invalidate it; prompt rendering and hidden shelf rendering reuse that snapshot.
- Clipboard acknowledgement follows the actual synchronous clipboard write.
  The native GO continuation reuses that copy; explicit OPEN copies afresh.
- Preview connections use validated DNS addresses directly, no system proxy,
  manual checked redirects, a bounded resolver pool and a 12-second operation
  deadline. Cancellation closes the active HTTP call. Generation tokens reject
  callbacks from replaced or cancelled inspirations, including same-text races.
- HTML metadata is parsed structurally with jsoup, restricted to the document
  head, and decoded once. No scripts or page resources execute.
- Approved PNG plates remain in source. Runtime WebPs retain identical dimensions
  and every RGBA byte. Regenerate with `python scripts/build_runtime_portraits.py`
  (Pillow 12.0.0); the bundle includes only runtime assets, not historic plates.
- Obsolete portrait background rules are removed. Current portrait geometry,
  selection treatment and masks remain in `mood-portraits.css`.

## Automated verification

```sh
python scripts/build_gig_poster.py
python scripts/build_agent_packages.py --check
python -m unittest discover -s tests -v
python -m unittest discover -s android-lab/tests -v
python scripts/playlist_cli.py validate examples/example-playlist.json
python scripts/bundle_android_lab.py
node scripts/test_android_lab_dom.cjs
node scripts/test_render_efficiency.cjs
node scripts/test_lab_discovery_routes.cjs
bash android/gradlew -p android-lab testReleaseUnitTest assembleRelease lintVitalRelease --no-daemon
node scripts/test_android_lab.cjs
node scripts/test_mood_ink.cjs
node scripts/audit_android_lab.cjs
```

The native bundle tests require Pillow; browser checks use Playwright 1.64.1 and
DOM checks use jsdom 26.1.0. The render budget rejects atlas writes for unrelated
controls and repeated native reads. Performance CI compares both builds under
identical mobile/CPU conditions and rejects material startup, task-time or frame
regressions, alongside camera destination and transform-cleanup checks. The
relative timing budgets allow runner noise; they do not certify phone smoothness.

## Before distributing or deploying

1. Integrate the reviewed stacked changes into one approved release head. Record
   its exact commit and CI results; do not build a different branch by accident.
2. Pass automated native build/lint, browser, portrait and performance checks on
   that head. Review the phone, narrow, large-text and landscape captures together.
3. Complete the real-device checks in `release-baseline.json`. Check offline
   operation, retained preferences and recent inspirations when updating in place.
4. For Android, verify application ID, version/code and the existing signing
   certificate before distributing. For the PWA, use the explicit production
   deployment workflow and verify the reported release commit.
5. Update the comparison baseline only after acceptance, retaining before/after
   measurements. A successful merge alone does not publish the PWA or install an APK.

The legacy `android/` target is the separate hosted wrapper, not Android Lab. Its
Gradle launcher is reused by Lab; do not delete the directory as unused code.

## Verification recorded for this implementation

Local verification on 2026-11-03: 139 core tests, five offline bundle/asset tests,
28 native JVM tests, discovery-route and DOM tests, render-efficiency budgets,
eight PWA/Lab portrait viewport checks and the four-profile workflow audit passed.
All native Java sources compiled against the official Android 36 API jar. This
local compile/JUnit run is supplementary; Gradle APK assembly and Android lint
remain CI requirements, and no device/TalkBack acceptance is claimed here.

One same-run 8x CPU/DPR3 comparison against 0.9.15 measured startup 1490 -> 1266 ms,
zoom p95 50 -> 49.9 ms, touch p95 16.7 -> 16.8 ms and total task time
4997 -> 5103 ms. All camera destinations and cleanup checks passed. These results
show no material gesture improvement or regression; the demonstrated reduction is
unrelated UI work (235 unchanged atlas writes -> zero on a mood tap; four full
native reads -> at most one). Timing is a single diagnostic run, not a phone SLA.

## 0.9.21 Jukebox candidate

- Continuous convex pan limits replace nearest-land snapping. Ocean crossings
  are allowed; camera aspect, zoom limits, world bounds and artwork are unchanged.
- Motion retains the fixed SVG viewport and persistent HTML transform. At rest,
  releasing `will-change` permits Chromium to rasterize detail at the final scale.
  Logical coordinates retain full precision; rounding is display metadata only.
- Resize updates pixel translation while preserving the geographic camera.
- Ticket geometry reads precede DOM moves; unchanged pace input skips rendering.

Local checks: 139 core tests, five offline bundle tests, DOM, route and render
checks pass. The new boundary regression covers 216,486 small drag movements
and continuity through the former 600-unit cutoff. Browser/native CI and
phone sharpness/smoothness acceptance remain pending. No APK is built yet.


## Lab 0.9.30 — Gemini workflow tutorial

The Manual and Preferences expose Gemini Quick Start; the Gemini + YouTube Music receipt links directly to Review. Five optional illustrated demos teach Setup, Submit, Review/de-cheese, Publish, and manual cover art. They use local CSS, require Play, stop on navigation/backgrounding, and become static under reduced motion. Copy controls use the established clipboard path; tutorial navigation never submits a prompt, runs de-cheese, or publishes.

Copy follows the Gemini 3.11.1 entry and references/gemini-publish.md on main at 5b0eb0cd0a5416511f64300cf705af21ad0ff5e4: standalone Publish finalizes the existing playlist with description, ordered tracklist and liner notes; the user checks the save result. Artwork uses the browser's manual edit control where available. Setup retains the actual prompt-first saved-Skill route and web ZIP fallback.

Local validation: 139 core tests, 5 bundle tests, playlist validation, existing DOM contract, four-profile workflow audit and new tutorial browser test pass. The latter checks all five scenes, exact command copies, denied clipboard recovery, no automatic submissions, receipt entry at Review, stop-on-leave, reduced motion and phone/narrow/landscape/200% layouts. Bounded visual review corrected enlarged-text label wrapping. Native-device QA is pending. Bound Robinson minimum zoom to the pinned engine's allowed [-2,maxZoom] range, fixing the error exposed by the prior four-profile audit during small layout transitions. No production deployment.


## Lab 0.9.31 — captured app tutorials and inspiration

Setup, Inspiration and Submit use actual Playwright screenshots encoded as silent, finite H.264 clips. Native bridge data is deterministic and fictional; no native dialog or external Gemini interface is portrayed as recorded. The capture manifest pins the source and viewport. The three MP4s total approximately 530 KB. Posters are bundled, preload is none, and videos play only by explicit request and stop on navigation/backgrounding. Static transcripts remain available; reduced-motion users see the poster until they choose the native video controls.

Inspiration is an early, separate lesson: add/share a song link, artist or idea in Your Crate, Use in Jukebox, adjust choices, then GO. The text accurately explains that active inspiration replaces the random discovery route while explicit moods, pace and regions remain in force. The capture asserts reference inclusion and route omission. Tutorial actions route to the actual Crate.

Regenerate captures with scripts/capture_lab_tutorial.cjs after bundling, then bundle again to include the new media. scripts/build_lab_tutorial_preview.py embeds the current guide and all three clips for an offline review copy. No recording is loaded from a third party at runtime. Browser checks decode all three clips, verify dimensions, test stop-on-leave and all six steps at four sizes, including enlarged text.
