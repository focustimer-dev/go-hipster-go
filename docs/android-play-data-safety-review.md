# Android Play Data safety and privacy inventory — evidence review

**Review date:** 2026-11-14. **Status:** technical evidence assembled; **not owner-approved, not submitted**. This is an audit of the *native Android app* (`android-production/` built from `android-lab/`), **not** the ChatGPT plugin or public PWA.

**Policy rule:** Google Play's Data safety definition includes user data transmitted off a device by first-party code, embedded app-controlled WebViews, and bundled SDKs. A user-requested share to another installed app can also be relevant, subject to the policy's user-initiated-action exception. Local-only data does not automatically count as collected. We must not check “No data collected” merely because the app has no first-party login.

Official policy: [Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469), [User data](https://support.google.com/googleplay/android-developer/answer/10144311), [app content](https://support.google.com/googleplay/android-developer/answer/9859455).

## Actual data-flow inventory

| Trigger and evidence | Data involved | Who receives it | Preliminary classification | Remaining verification |
|---|---|---|---|---|
| Jukebox themes, mood/tempo choices, Crate, recent inspirations. Java `SavedRequests.java`, `SharedInspiration.java`; WebView local storage | User selections, user-written prompts and reference links | Local SharedPreferences and WebView storage | **On-device processing**, not off-device collection by itself | Ensure no new sync/analytics dependency is added; validate device removal |
| User pastes/shares a public music link. `LinkPreview.java` uses `GET /api/inspiration-preview?url=...` | **Full user-submitted URL** (query string may itself contain identifying tokens), connection metadata | First-party Cloudflare Worker at `hipster-go.samelling.workers.dev`; Worker may request allowed external music/video providers | **Off-device transmission**; evaluate under Data safety “collect” with optional/ephemeral handling only after verifying actual retention. Do not assume “none” | Confirm Cloudflare/account/CDN access logs, retention and any subprocessor behavior; data type and optionality |
| Link preview fallback. `LinkPreview.java` validates public HTTPS, DNS and bounded response | Full public link, connection metadata | Direct public destination host | Off-device transfer to a third-party site; user initiated, but disclosure/exception decision requires review | Confirm redirect/DNS policy and whether Google considers this user-initiated exception in the final form |
| Metadata proxy. `cloudflare/worker.js`, `cloudflare/link-preview.js` | Full URL selected for preview, return title/description | Allowlisted hosts and provider oEmbed services (Spotify, YouTube, SoundCloud, Vimeo, etc.) | Worker is **not** a private/offline-only operation; user link can reach external providers | Check host/domain list, logging at HTTP edge and whether any provider receives token-bearing URLs |
| App launch / daily update check. `SkillUpdates.java` | Standard HTTPS connection metadata, public release API request; app-local preferred channel and checked timestamp | GitHub API | Network request, **automated by default**, can be switched off in UI; no Gemini account inspection or automatic ZIP installation | Review client/SDK telemetry, IP/access metadata, Google Data safety classification and option semantics |
| GO/handoff. `LabActivity.java`, `ChaosRollActivity.java` | User-generated discovery brief copied to system clipboard; optional direct share to external AI app | OS clipboard; a chosen ChatGPT, Gemini, Claude or other destination | Clipboard is local; explicit sharing may count as sharing depending Google’s **user-initiated** exception. AI provider terms apply after handoff | Confirm final UI wording does not imply automatic sending/publication; evaluate external app share semantics |
| Open GitHub skill ZIP or external website. Native `browser()`, Manual | URL and standard HTTPS connection details | External browser, GitHub, AI providers | Normal navigation to external web/app selected by user; no in-app skill installation | Confirm no embedded third-party web auth/collection changes |
| Crash/usage measurement | No dedicated Firebase Analytics, Ads SDK or crash SDK in current `android-production/app/build.gradle` dependencies (OkHttp, Jsoup, desugaring) | No first-party endpoint observed in inspected Java/Worker code | **Not evidence that all infrastructure and OS telemetry is absent** | Audit final Gradle dependency tree, merged manifest, embedded assets, Play SDK Index, logging in Cloudflare |

## Cloudflare deployed settings inspected (read-only)

On **2026-11-14**, the deployed `hipster-go` Worker script settings returned `logpush=false`, `observability=null`, with no confirmed nonempty tail-consumer list. The Worker source inspected has no explicit `console.log` in the preview path and returns responses with `cache-control: no-store`. **These limited findings do not establish that Cloudflare/CDN/account analytics or network logs retain no IPs, URLs or request metadata.** An owner-level data-retention and account-analytics confirmation remains required.

## Native permission and security facts verified from source

- Production `AndroidManifest.xml` requests `android.permission.INTERNET` only; `allowBackup=false`, `usesCleartextTraffic=false`.
- The app UI and map assets are packaged in its offline native WebView; no first-party Android sign-in UI was found in the inspected source.
- Current native Gradle dependencies: OkHttp `4.12.0`, Jsoup `1.24.1`, desugaring library `2.1.5`; JUnit/org.json are unit-test dependencies. Verify final **resolved** dependencies before entering Play declarations.
- The metadata worker limits pages to an allowlist of providers and uses bounded content parsing. Native fallback uses public HTTPS/DNS filters and no automatic unsafe redirects.
- Local saved requests can be deleted individually, recent inspiration entries can be removed and uninstall normally clears this app's local data. No first-party account deletion flow appears required **unless app accounts are added later**.

## Play Console app-content questions — owner must approve actual answers

| Declaration | Working answer | Evidence and gate |
|---|---|---|
| Ads | **Candidate: No** | No ads SDK/placement evident in native Gradle and UI; confirm final resolved SDKs and actual promotion |
| App vs game | **Candidate: App** | Music discovery-brief utility |
| Category | **Candidate: Music & Audio** | Confirm category in live Play Console |
| Audience | **Owner decision required** | This is not designed specifically for children; age ranges are a policy declaration, not inferred from music genres |
| Content rating | **Do questionnaire in Play Console** | Prompts can mention anger/crime/desire; user-generated music references and third-party destinations do not establish an automatic age rating |
| First-party accounts | **No account in inspected native source** | External AI/music accounts may be needed for external services |
| Account deletion URL | **Likely not applicable if no in-app account creation** | Verify final features and Play's actual form; local data removal still disclosed |
| Data collected / shared | **Undecided** | Full user-submitted URLs and request/network metadata must be evaluated; do not file a blanket “No” |
| Data encrypted in transit | **Candidate: Yes for app's explicit requests** | HTTPS-only outbound paths; verify final SDKs/network stack |
| Data deletion available | **Local deletion/uninstall described** | Verify on device; no server-side deletion promise until Cloudflare retention is confirmed |
| Privacy policy | **Not approved / not hosted** | Public ordinary HTTPS page, app-specific, worldwide accessible without login, linked inside app and Play Store |
| Digital goods / paid features | **Owner decision** | No in-app billing evident; free/paid choice in Console can have lasting consequences |
| Access instructions | **No first-party login** | Tell reviewers core app works without connecting external AI; optional handoffs need their own app/account |

## Exact gates before data-safety submission

- [ ] Verify Cloudflare account-level analytics, logs, retention, and whether query-string URLs are retained or exposed; document an owner-approved response.
- [ ] Confirm Google Data safety data types/optional processing/ephemeral exceptions for full user link transmissions, standard IP/access metadata and explicit Android sharing.
- [ ] Inspect **resolved** production Android SDK/library graph, final merged manifest and release bundle contents; check for third-party analytics or ad collection.
- [ ] Confirm app first-run, update-check default, Crate deletion, actual HTTPS routes and network failure with an installed RC build.
- [ ] Approve an accurate, dated [native policy draft](android-privacy-policy-draft.md) and deploy its **ordinary public HTML page**; link that page inside the native app and Play Console. Do not use GitHub Markdown/PDF.
- [ ] Complete the real Play Console declarations with the owner; capture screenshots or an export of responses for the release tracker.

**Outcome:** Data-flow review is materially advanced. **Data safety completion and privacy approval are still open gates.** No personal data was retrieved or changed in this audit; no Play submission or Cloudflare configuration mutation occurred.
