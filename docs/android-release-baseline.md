# Android release baseline and first hardening queue

Decision: the current APK is the canonical application experience. Freeze capabilities; continue polish, workflow cohesion, reliability, accessibility and lower maintenance. Era slider and new controls are post-launch.

## Verified baseline

| Field | Value |
| --- | --- |
| APK | Hipster-GO-Lab-0.9.7-signed.apk |
| Persistent artifact | Library ID libfile_c665b61664608191817bad86d8bb4895 |
| Application ID | work.samelling.hipstergo.lab |
| Version | 0.9.7 / versionCode 16 |
| Android | min SDK 24 / target SDK 36 |
| Manifest permission | INTERNET |
| APK bytes | 22,551,215 |
| APK SHA-256 | b93e447e087b514c5945ea207774b62984b33414a8aa9cdf15bffc9f8db8c542 |
| Source | [0f60842dde1fefe8c10465c5cecaed0a44ac7094](https://github.com/focustimer-dev/go-hipster-go/commit/0f60842dde1fefe8c10465c5cecaed0a44ac7094) |
| Source branch | release/lab-0-9-7, PR #132 targeting release/lab-0-9-6 |
| Android push CI | [41545401239](https://github.com/focustimer-dev/go-hipster-go/actions/runs/41545401239), success |
| Unsigned artifact | 13189125767, hipster-go-lab-unsigned-apk |
| Artifact ZIP SHA-256 | 4b7b4b40b0cc526f9967f67ec0681c9ec6780c83b245a72988ca86911ce185a6 |
| Unsigned APK SHA-256 | 95453678a823b79f96f4e7cae612c32a5c28490f2865f09d093b542069ba0eda |
| Certificate SHA-256 | 2e1c2c7d0ae0a75daa6da443c0c3193f212a5a86e685c885c2e93400099a4af0 |

These fields were inspected from the delivered APK, source, and CI artifact during baseline reconciliation. They do not establish what is currently installed on a phone.

### Evidence chain

- All 71 entries from the CI unsigned APK match the signed APK byte-for-byte. Only META-INF/HIPSTER-.RSA, META-INF/HIPSTER-.SF and META-INF/MANIFEST.MF are added as ZIP entries. APK signing-block differences are outside ZIP entries.
- All 60 packaged assets/site files match the output of scripts/bundle_android_lab.py at the pinned source. The generated directory has one additional design metadata JSON, absent from the APK; no packaged file differs.
- The binary Android manifest independently confirms package/version/SDK values and INTERNET permission.
- V2 and V3 signing-block certificates have the same fingerprint above, matching the previously documented Lab signer. Certificate extraction is not a fresh cryptographic apksigner verification; rerun standard signature verification before distributing any rebuilt APK.
- The app bundles the interface. Installing or updating the separately hosted curation skill is a distinct operation. The reviewed source has no SKILL.md or references diff against main 5ae3614; main documentation identifies skill 3.11.1. This does not prove the skill version installed in a receiving AI.

## Branch reconciliation

| Work | Relationship to canonical APK source | Disposition |
| --- | --- | --- |
| PR #132, release/lab-0-9-7 | Exact source, 0f60842 | Canonical baseline; preserve native physical recording toggle. |
| PR #126, release/lab-0-9-6 | ba4575d is an ancestor, three commits behind | Superseded as the release target; retain history and signing/build evidence. |
| PR #104, fix/android-lab-sync-0-9 | 43d9179 is an ancestor, seven commits behind | Superseded as the release target. |
| PR #92, experiment/android-native-lab | Divergent history: 12 commits unique to that head, 56 unique to canonical | Historical experiment; compare unique patches before closing. Ancestry alone does not prove feature omission. |
| PR #91, android-apk | Divergent history: one commit unique to that head, 56 unique to canonical | Historical TWA implementation; not the selected application architecture. Preserve or explicitly retire after review. |
| main, 5ae3614 | Divergent: 19 main-only and 26 canonical-only commits | Shared skill/web companion source; reconcile by file and intent, not a blanket merge. |

All five PRs were open and unmerged at inspection. No PR was closed, merged or rebased by this reconciliation.

Main-only commit counts overstate missing functionality: several changes are already present through different history. The shared launcher/app.js and curation source compare equal; visible remaining launcher differences include recording-switch markup/styles and generated CSS hashes. The Lab recording preference lives in native Preferences. Do not overwrite that arrangement by synchronizing the companion PWA indiscriminately.

## Checks on the exact canonical source

Fresh local checks:
- 139 core unit tests pass.
- Playlist example validates structurally; this is not online track verification.
- Android snapshot unit test passes.
- Native DOM interaction suite passes: workspace/scroll, Preferences, Back, saved actions, exact inspiration and shared prompt, stale-copy race, Other AI manual path, known AI handoffs.

Existing successful push CI at the pinned SHA covers Android release unit tests, assembleRelease, lintVitalRelease, browser interaction and portrait checks. This audit did not perform a new SDK build or phone smoke test.

The documented command node scripts/test_lab_discovery_routes.cjs fails because that file is absent at this source. Treat it as a verification/documentation gap; do not describe this check as passed.

## First hardening queue

P0 denotes a demonstrated release/data correctness blocker; no runtime P0 defect was established by this source and artifact review. P1 items below are engineering gaps or validation tasks, not assumed user-visible failures.

| Priority | Task | Acceptance evidence |
| --- | --- | --- |
| P1 | Establish a maintained application source path | Preserve the pinned APK behavior and signer; identify which Android branch owns future work. A reviewable integration plan carries native workspace and shared-source changes without blindly merging historical PRs. |
| P1 | Restore a usable discovery-route verification command | Locate equivalent coverage or add a focused route-deck behavioral test; verify persistence, exhaustion, inspiration bypass and no reroll on copy/open. Update the stale guide. |
| P1 | Reconcile build/product documentation | Current commands exist; docs distinguish bundled app, hosted PWA and independently installed skill. Remove stale version/test-count assertions and contradictory gesture instructions. |
| P1 | Audit complete application workflows | Capture first-run setup, returning GO, missing AI, clipboard failure, Other AI, incoming inspiration, save/replay, updates and recovery. Record observed gaps before implementation. |
| P1 | Validate update/data preservation on device | Install over baseline using the same signer/application ID and higher version code; retain preferences, saved requests, inspiration and update records. |
| P2 | Finite visual and accessibility pass | Review actual app at narrow and typical widths, large text, portrait/landscape, selected states, Preferences, receipt/ticket and Back navigation. Fix one ranked batch and confirm once. |
| P2 | Reduce fragile bundling where justified | Inventory string-replacement hooks in bundle_android_lab.py; change only where a testable reduction in drift or maintenance is demonstrated. Preserve exact request behavior. |
| Before Play | Production identity and release process | Decide package name/data migration, AAB signing, Play-managed Android updates, privacy/data declarations, launch pairings, support and pricing. Verify current requirements at submission. |

Keep locked portraits, atlas geometry/footprint and approved +ART/TRY HARD red-dot treatment. No new moods, widgets, era slider, cloud accounts or streaming integrations enter this release without an explicit scope change.

## Next implementation packet

Fix the missing route-test/documentation gap on a branch from the canonical Android source, then perform a bounded end-to-end app workflow and visual audit. Preserve baseline artifact provenance. A source audit, DOM tests and CI screenshots do not replace Android device checks.

This document records a baseline, not a store-readiness certification or authorization to publish.
