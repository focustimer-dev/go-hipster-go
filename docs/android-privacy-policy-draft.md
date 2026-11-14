# Go, Hipster, Go! — Android privacy policy (DRAFT, not published)

> **Release review required.** This is an Android-specific policy draft, separate from [the ChatGPT plugin privacy policy](privacy.md). It is **not** the Play Console privacy-policy URL. Do not put this raw Markdown/GitHub page into the Console as the final hosted policy. Confirm first-party worker analytics/logging and third-party SDK behavior, then publish as a public HTTPS web page accessible without login and link that identical policy **inside the Android app**. No Data safety “No data collected” response may be assumed until this is verified.

## Scope

This draft describes the **native Android app** Go, Hipster, Go!, including its Jukebox, Manual, Your Crate, Chaos Roll widget, map, and AI handoff features. The app helps create music discovery requests for other AI services. It does **not itself listen to your music, log in to your AI/music accounts, or automatically submit a request or publish a playlist**.

## Data stored on your device

The app saves preferences (themes, music/AI choices, handoff settings, selected moods, tempo, and recording-quality preferences), saved requests and recent inspirations, and metadata about Gemini skill update checks. These are maintained in local app/WebView storage; the widget uses local preferences. It may place a request on the system clipboard and, at your direction, open or share it with an AI app. **Clipboard contents may be read by apps/services to which you paste or share them.**

The native manifest disables Android app backup (`allowBackup=false`). Uninstalling normally removes the app's local data, and the Lab install uses a separate package and separate data. Lab preferences and Crate entries do **not** automatically migrate to production.

## Network requests and third-party services

The app's primary interface and Atlas assets are packaged for offline use. Some optional/connected features use the network:

- When you **add or share an inspiration containing a public HTTPS link**, the app attempts a metadata preview. For recognized music/video services it can send **the full link you supplied** in the query of a request to the first-party `hipster-go.samelling.workers.dev/api/inspiration-preview` endpoint; if that fails, or for other links, it may fetch public page metadata directly from the link's host. This may disclose the link and standard connection information (including IP address) to the destination or infrastructure provider. No media is downloaded.
- The app can check public GitHub release metadata for Gemini Skill updates; automatic daily in-app checks are **enabled by default** and can be turned off in the update UI. The check does not install packages or inspect your Gemini account.
- When you select an AI app handoff, the app copies or shares the generated request to ChatGPT, Gemini, Claude or your chosen destination. That external service processes data under its **own** privacy terms. The app cannot verify whether an AI generated a playlist or saved it to a music provider.

**Must verify before publishing:** Cloudflare Worker access logs/analytics and retention, possible infrastructure or CDN logs for link previews, any analytics/crash-reporting SDKs in the final production bundle, and whether additional network requests are made by any included third-party libraries. Those facts determine the final Data safety disclosure; do not describe them as “no collection” without evidence.

## Your choices

You can remove saved requests and references from Your Crate and disable optional skill-update checks. The app does not have an in-app user account. Uninstalling the Android app generally removes its local data, subject to the phone's OS/device behavior. To manage data sent to an external AI or music service, use that service's account/privacy controls.

## Contact

For app support and privacy inquiries: [gohipstergosupport@proton.me](mailto:gohipstergosupport@proton.me). Do not email passwords or tokens.

## Before this text becomes a live policy

- [ ] Verify data flow and retention in `cloudflare/worker.js` and Cloudflare analytics/logging configuration.
- [ ] Confirm SDK/dependency disclosures and final merged production manifest.
- [ ] Check whether the Play Data safety form requires declaring transmitted link data, diagnostics or device identifiers.
- [ ] Confirm text matches actual current UI behavior, especially update-check default and Crate removal.
- [ ] Convert to a **public HTTPS, non-editable, ordinary webpage**; add that URL in the app and Console. Audit worldwide anonymous access.
- [ ] Review legal/compliance wording with owner and date the final policy. Keep this file marked draft until approved.
