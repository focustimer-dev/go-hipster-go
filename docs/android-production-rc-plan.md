# Go, Hipster, Go! — Android production release-candidate plan

**Status:** RC program opened 2026-11-13; planning only, not yet a release or approval to publish.  
**Source of truth:** This document and its linked tracking issue.  
**Goal:** ship the **native** Go, Hipster, Go! Android app (not the historic Trusted Web Activity) through Google Play with zero user-visible Lab branding, preserved approved UX, repeatable release artifacts, and defensible acceptance evidence.  
**Working milestone:** production-identity **1.0.0-rc.1** (version name only is provisional); no public rollout until the gates below are accepted.  
**Decision checkpoints:** package identity / signing strategy, phone UX acceptance, production-track submission.  
**Scope boundary:** no new discovery features, new themes, animated widget reels, PWA parity work, or independent curation-skill publication in this cycle.

## 0. Starting evidence and architectural constraints

- Latest stacked widget head inspected: `codex/chaos-approved-raster-art`, SHA `2b445ddebd5501766c48f454cb63d8939445398e`, Android **Lab 0.9.82 / code 92**. Android Lab CI, interface workflow audit, and Validate skill succeeded on that head. That establishes **build/test success**, not on-device production acceptance.
- Open integration stack: [#280](https://github.com/focustimer-dev/go-hipster-go/pull/280) system bars/haptics → [#281](https://github.com/focustimer-dev/go-hipster-go/pull/281) native Chaos Roll → [#283](https://github.com/focustimer-dev/go-hipster-go/pull/283) approved raster widget art; they are draft PRs. Review the current HEAD/CI before merging, not the historical commit above. [#227](https://github.com/focustimer-dev/go-hipster-go/pull/227) Atlas visual fixes remains a separate draft: disposition by observed phone evidence; do not automatically merge it.
- The current native code is in `android-lab/`. Its package is `work.samelling.hipstergo.lab`; `AndroidManifest.xml` labels it `Hipster GO Lab`. User-visible strings remain in `android-lab/web/workspace.html` (e.g., “Share ... to Hipster GO Lab,” “Uninstalling Lab,” “ANDROID LAB”), `LabActivity.java` and potentially related dialogs and generated Manual content. The launch shortcuts specify the Lab package and `hipsterlab://` URI. Widget intents include a `.lab.CHAOS_ROLL` action.
- `android/` is a **legacy TWA** with application ID `work.samelling.hipstergo`, not the native app. Its old build cannot be substituted for the native production build; `android/gradlew` is shared build infrastructure.
- Current Android target SDK is **36**, the required API level for 2026 Google Play mobile submissions. Verify target/merged manifest on the final bundle.
- Existing installed Lab and any historical TWA have different app IDs and stores. **Do not claim automatic data migration** from Lab to production. Do not promise an in-place update to the TWA until package registration/signature/version history are checked. Preserve Lab as an isolated test channel.
- Existing production PWA and its app/plugin skill version are separate release surfaces. A native release must not publish the PWA or skill as a side effect.
- Existing historical audit `docs/android-workflow-audit.md` reported first-run visibility, Other AI saving, stale displayed version and clipboard help; newer work may have fixed them. **Retest** rather than presuming either failure or resolution.
- [Issue #183](https://github.com/focustimer-dev/go-hipster-go/issues/183) documents a software-rendered Cahill timing flake. Current CI gates functional state but not that same timing assertion. Real-device motion/blank-frame checks must be explicit and evidence-based.

## Release principle / severity rubric

**Feature freeze starts after M1.** Make only P0/P1 correctness, security, accessibility, policy, regression, and evidence-driven polish changes. Improvements must preserve the product's artwork, working Atlas, exact 12-slot generator, existing color/theme tokens, AI-handoff contract, and accepted Chaos Roll PNGs. No unchecked scope creep.

- **P0 stop-ship:** crash/ANR or data loss on a normal flow; exploitable origin/share/intent issue; wrong app identity or signer; broken GO/clipboard invariants; noncompliant Play metadata; invalid bundle.
- **P1 stop-ship:** inaccessible primary workflow; invisible first-run setup; missing-app handoff dead end; widget is cropped/unusable; repeatable serious map freeze; wrong service/provider claims; damaged saved preferences.
- **P2 fix-before-release if bounded:** small visual/contrast inconsistencies, unclear recovery copy, weak resize treatment, avoidable app-size/startup regression.
- **P3 defer:** aesthetic refinements not affecting usability, optional animation, new features and PWA parity.
- Every fix needs a concise reproduction, focused regression check and before/after evidence. Record known exceptions; no silent waivers.

## Milestone 0 — Freeze the release contract and identity (go/no-go gate)

**Work**
- [ ] Confirm the Play Console package registration state for `work.samelling.hipstergo` and whether any published/previously uploaded version exists. **Do not hardcode a final production ID based only on the old TWA directory.** If already registered, confirm ownership and compatible update/signing requirements.
- [ ] Inventory the original TWA and Lab signing certificates and the planned Play App Signing/upload certificate, recording **only fingerprints**, not keys/passwords. Confirm whether historical TWA update is supported or a first clean native install is required.
- [ ] Choose final install identity, user-facing name **Go, Hipster, Go!** (launcher can use shortened **Hipster GO**), first public version policy (proposed `1.0.0-rc.1`; build code must be Play-safe and monotonic), and whether an explicit one-time local-data export is necessary. Keep standalone Lab intact.
- [ ] Pin the exact integrated native feature HEAD and accepted design assets; record tests, linked PRs, SHA, source provenance and baseline APK size.
- [ ] Publish concise scope freeze: production app + widget included; animation, new Atlas scope and PWA parity deferred.

**Exit:** signed-off identity/signing decision record and frozen HEAD; no unresolved irreversible Play identity choice. **Human approval required** before locking app ID/signature.

## Milestone 1 — Merge the reviewed Android feature stack

**Work**
- [ ] Recheck PRs #280, #281, #283 against current bases; all required CI green at their final heads.
- [ ] Merge in dependency order with no unrelated functional behavior change; rebase only when necessary; run full combined source checks on `main`.
- [ ] Review #227 and #183 as known risks, deciding which phone-reproducible issues are P1 and which are deferred.
- [ ] Pin an immutable integration SHA, full test evidence and baseline screenshots. Preserve raster artwork byte-for-byte; no SVG substitute.

**Exit:** one integrated native candidate, no conflicting feature PRs, all contract/build checks green. **No production package or Play upload yet.**

## Milestone 2 — Promote native source into a production app variant; remove Lab branding

**Implementation strategy:** build **Lab and Production variants from the same native implementation**, not an independent fork. Internal repo folder `android-lab/`, Java classes and test IDs may retain historical names if they are not exposed in the installed application; user-facing copy and production identifiers must not.

**Work**
- [ ] Implement a production variant using the approved app ID and independent versioning, label, icons and resources. Keep Lab `work.samelling.hipstergo.lab` installable separately with its own signer and storage; do not accidentally use `android/` TWA.
- [ ] Audit explicit Android component names, shortcut `targetPackage` / `targetClass`, custom `hipsterlab://` scheme, widget receiver and PendingIntent actions, share targets, deep links and preferences. Parameterize package-sensitive values; verify the production namespace/activity resolution and shortcut/widget dispatch. Do not merely perform a broad string replacement.
- [ ] Remove **Lab / sandbox / experimental / separate offline install** language from production's app label, launcher, Manual footer, setup, Crate, error toasts, skill-update dialogs, widget picker label, icon/content descriptions, screenshot strings and store copy. Rename internals only where necessary to prevent user-facing leakage or bugs.
- [ ] Keep user education truthful: app **copies and opens** chosen AI; it does not automatically send prompts or create playlists. Local saved requests can be deleted/uninstalled; an external AI/music service controls its own data.
- [ ] Generate displayed **app version from build metadata**, not stale hardcoded text; distinguish from separately installed skill version. Unit/screenshot test production variant for prohibited visible wording and retained intended exceptions in Lab.
- [ ] Validate production clean install and Lab side by side. Distinct storage means no fabricated migration promise; confirm exactly what happens to Lab Crate data when production starts.

**Exit:** installed production package shows **zero user-visible “Lab”/“sandbox” references**, correct identity everywhere, and an unchanged isolated Lab app; all launch, shortcut, widget, share and update surfaces work.

## Milestone 3 — Reliability, privacy and security hardening

**Work**
- [ ] Re-audit WebView's packaged-origin allowlist, Javascript bridge exposure, CSP, offline asset completeness, external intent handling, exported components, inbound text-only shares, no untrusted `file://`/content URI imports, HTTPS metadata preview bounds, redirect/DNS rules and cancellation.
- [ ] Confirm permissions are minimal; verify backup posture, data retention, clipboard clearing/retry UX, sensitive logging, external AI handoff, no automatic send/publish and no background widget polling. Audit third-party dependency licenses and notices bundled into production.
- [ ] Exercise first-run setup, reset/return, Open/Share/Browser for ChatGPT/Gemini/Claude/Other, missing-app fallback, save/restore/remove requests, incoming Spotify/YouTube/browser shares, changing AI/service/recording preference and repeated GO. No silent dropped action.
- [ ] Verify exact current 12-track `c1:` encoding, mood/tempo curve and no Inspiration contamination of Chaos Roll; deterministic widget generator tests. Confirm network-offline GO and Atlas still work.
- [ ] Test upgrade and reinstall for production package, preserving settings on compatible updates and expressly identifying irreversible data-loss cases. Validate errors and loading/cancellation states with slow/offline network.
- [ ] Document privacy/data-flow inventory for Play disclosures: native local store; optional public GitHub update checks and HTTPS inspiration preview; clipboard/share handoff; third-party AI/music services. Check logs, credentials and analytics inventory instead of assuming no data collection.

**Exit:** all P0/P1 reliability/security tests pass; reproducible P2 defects tracked or fixed; no undocumented collection/sharing statements.

## Milestone 4 — Visual quality, Android feel and accessibility

**Work**
- [ ] Device/screenshot matrix across **all nine themes** at phone 320/390/412 width, portrait/landscape, 100% and 200% text, dark/light system settings; inspect edge-to-edge insets, system bar contrast/icons, IME/keyboard, Back behavior, haptic setting, native dialogs, status/toast hierarchy, touch feedback, accessibility focus and reduced motion.
- [ ] Verify approved cassette **3×2** and vinyl **1×1** artwork across launcher sizes and wallpapers; no stretched/cropped art, duplicate typography or opaque background; large/medium sizes, rotation, widget tap/long-press, TalkBack label and missing AI fallback.
- [ ] Check Atlas 3 projections, pinch/pan, navigation, regional selection, seam/ghost markers (#227), no blank frame / motion regression (#183), scroll chaining and reduced motion. Use physical device evidence before deciding whether old headless timing thresholds represent a real bug.
- [ ] Audit color contrast, no color-only meaning, 48dp touch targets, semantic announcements, visible focus, accessible primary onboarding and clear readable GO receipt.
- [ ] Benchmark app start, GO responsiveness, map interactions, widget update and APK/AAB size vs frozen M1 baseline. Investigate **unexplained >10% regression** using repeated device measurements, not a single CI run. Trim unused assets only when screenshots, quality and verified originals are preserved.

**Exit:** complete before/after evidence archive, user phone acceptance, zero P0/P1 and no unexplained material performance/size regression. No arbitrary visual redesign.

## Milestone 5 — Deterministic release pipeline and signed Play bundle

**Work**
- [ ] Add a **production-only** CI workflow separate from historical Lab signer: build `bundle<Production>Release` / `assemble<Production>Release`, run unit/integration/static/lint checks, output reproducible named artifacts. The final exact Gradle tasks depend on the chosen variant naming.
- [ ] Pin JDK, Gradle/AGP, Android SDK, Python, Node and asset generation; fail on stale generated assets, duplicate platform slots, wrong package, wrong label, wrong version, or forbidden production Lab copy.
- [ ] Inspect final `.aab` with bundletool/manifest; validate API 36, app ID, min SDK, export intents, resources, 64-bit and **16 KB memory page compatibility if packaged native code demands it**, and missing icons/metadata. Check Play SDK Index/dependency policy where applicable.
- [ ] Sign AAB with approved **upload key** using isolated secrets; never commit, log or share the keystore/password. Verify certificate fingerprint, bundle hash, source SHA and workflow run match; retain SBOM/dependency/licenses and release manifest.
- [ ] Produce a production-identity signed **APK for device testing** and a Play-signed **AAB** for Console upload. Installable Play-distributed APK signatures can differ from local upload APK certificates; test with Play's internal track after registration.
- [ ] Verify rollback procedure: retain previous known-good artifacts, allow a new higher-version fix release, preserve schema/setting compatibility; avoid implying Play can downgrade already-installed clients.

**Exit:** exactly one reproducible production RC artifact set tied to immutable SHA and successful gated CI, with no credentials exposed. **Do not upload to Play without approval.**

## Milestone 6 — Store and policy readiness

**Work**
- [ ] Create/confirm Play Console application; check account verification, developer type, testers requirement and app ID before locking it.
- [ ] Finalize icon, feature graphic, phone screenshots from **production build only**, short/full description, support email, website, classification, countries/pricing and release notes. No Lab, misleading automatic publishing claims or unsupported service promises.
- [ ] Publish a reachable app privacy policy **in-app and in Console** that matches verified data inventory. Complete Data safety, target audience, ads, content rating, app access instructions and other current Play App Content declarations.
- [ ] Confirm Google Play rules: new app submissions target **API 36** after Aug 31 2026; Play App Signing; 16 KB policy conditional on native libraries. Audit permissions; run Play pre-launch report and SDK/manifest warnings.
- [ ] Verify expected tester path for this account: personal accounts created **after Nov 13 2023** require 12 continuously opted-in closed testers for at least 14 days before applying for production access; other account types may differ.

**Exit:** Play Console dashboard has no unresolved blockers, release listing and review fields complete, store assets matched to installed build. Owner approval required to upload/start test.

## Milestone 7 — Internal / closed release-candidate validation

**Work**
- [ ] Internal testing first; install **from Play** to validate actual generated splits/signing, widget, app-to-AI shares/links, startup and updates across Android versions.
- [ ] Closed test with target **15–20 recruited testers** to provide a margin if the personal-account 12-for-14-day rule applies. Record opt-in count/time, tester devices, issues and real session feedback; do not claim compliance from invitations alone.
- [ ] Track crash/ANR and reports daily during test; triage to P0/P1/P2/P3. Fix via new monotonic versionCode RC and restart affected scenarios while preserving the test group's continuity where possible.
- [ ] Exit review: minimum required test duration met **if applicable**, no outstanding P0/P1, reproduction evidence for resolved defects, review of privacy/accessibility and no unresolved store warnings.

**Exit:** stable Play-tested RC, tester acceptance, production-access application complete where required.

## Milestone 8 — Controlled public release and support

- [ ] Approve final tag and SHA, bundle digest, release notes, user-facing version and privacy listing.
- [ ] Apply for production access and wait for approval when account rules require it.
- [ ] For a **first** production launch, use a deliberate limited country/availability decision because Google's percentage-based staged rollout is unavailable for a first release; reserve **percentage-based staged rollout for later updates**.
- [ ] Monitor crashes, ANRs, failed handoffs, widget issues, store feedback and install/update behavior; use follow-up hotfix versions only for demonstrated problems.
- [ ] Close the RC issue with immutable link to production artifact, Console release details and acceptance evidence. Schedule PWA parity, animation and new features separately after production stabilizes.

**Exit:** Play production is actually live and verified; no “released” status based solely on merged code or unsigned APK.

## Test matrix / acceptance record

| Layer | Minimum acceptance | Evidence required |
|---|---|---|
| Source | Final SHA pinned; full native/JS/python tests; bundle asset checks; lint; no silent flaky skip | Workflow links + failures disposition |
| Identity | Production ID and label; launcher, shortcuts, inbound share, widget and manual; side-by-side Lab | `aapt`/`bundletool` output and device screenshots |
| Core flow | Setup, GO copy, handoff, return, save/share, repeated GO, 12 slots, offline | Device walkthrough and regression tests |
| Atlas | Robinson, Globe, Keyes, motion seam/blank frame, scroll/accessibility | Physical phone video/screenshot plus geometry assertions |
| Widget | 1×1 record, 3×2 cassette, intermediate sizes, alpha, tap, refresh, fallback | Multiple launchers/wallpapers, TalkBack results |
| Appearance | Nine themes, small screen, large text, landscape, 48dp focus/targets | Matrix screenshots + audit notes |
| Security/privacy | Limited WebView bridge, exported intents, data-flow inventory, credentials handling | Review record + negative tests |
| Package | AAB signed via upload key, reproducible version/code/SHA, Play install | Bundle hash + Play internal-track install |
| Store | Privacy / Data safety / content declarations / listing / testers | Console checklist and owner signoff |

### Repeatable verification commands (adapt for production variant)

Current baseline:

```bash
python -m unittest discover -s tests -v
python -m unittest discover -s android-lab/tests -v
node scripts/test_android_lab_dom.cjs
node scripts/test_render_efficiency.cjs
node scripts/test_lab_discovery_routes.cjs
bash android/gradlew -p android-lab testReleaseUnitTest assembleRelease lintVitalRelease --no-daemon
```

For release candidates, use the **new production variant tasks** and record the exact task names. A repo-wide string scan (`rg -n -i 'hipster go lab|android lab|uninstalling lab|sandbox|hipsterlab://|work\.samelling\.hipstergo\.lab'`) is a discovery aid, **not** a blind global-replace mandate: internal source/CI references may remain; reject production-facing leaked strings and invalid intents.

### Progress log (update at each milestone, do not backfill guesses)

| Gate | Current state | Owner acceptance |
|---|---|---|
| M0 Identity/contract | OPEN — Play Console and signer choices not verified | Not signed |
| M1 Integration | OPEN — #280/#281/#283 still drafts | Not signed |
| M2 Production variant/branding | NOT STARTED | Not signed |
| M3 Security/reliability | NOT STARTED | Not signed |
| M4 Polish/accessibility | NOT STARTED | Not signed |
| M5 Bundle/signing | NOT STARTED | Not signed |
| M6 Store/policy | NOT STARTED | Not signed |
| M7 Internal/closed test | NOT STARTED | Not signed |
| M8 Launch | NOT AUTHORIZED | Not signed |

## Official external requirements checked 2026-11-13

- API target: https://support.google.com/googleplay/android-developer/answer/11926878
- Release / AAB and first release rollout behavior: https://support.google.com/googleplay/android-developer/answer/9859348
- Play App Signing / upload key: https://support.google.com/googleplay/android-developer/answer/9842756
- 12 testers / 14 days applicability: https://support.google.com/googleplay/android-developer/answer/14151465
- Data safety / privacy: https://support.google.com/googleplay/android-developer/answer/18265346
- Store app content declarations: https://support.google.com/googleplay/android-developer/answer/9859455
- 16 KB (if native code): https://developer.android.com/guide/practices/page-sizes

**Non-negotiable:** build, passing CI, APK signing, Play upload and public publication are distinct states. Report each separately. All irreversible actions require explicit user approval.
