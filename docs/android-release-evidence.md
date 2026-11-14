# Native Android RC — keyless build evidence

The **Android production RC + isolated QA APK (no deployment)** GitHub Action builds three files from a single checked-out source revision: the unsigned production APK, unsigned production AAB, and a **separately identified** signed QA APK for physical-device testing.

A green workflow now publishes three artifacts:

| Artifact | Contents | Use |
|---|---|---|
| `hipster-go-production-rc-unsigned` | `app-release-unsigned.apk`, `app-release.aab` | Inspect only; **not installable/distributable** until M0/M5 approval |
| `hipster-go-android-qa-sideload` | `app-qa.apk`, `qa-build-info.txt` | Disposable Pixel installation; **never** for Google Play |
| `hipster-go-android-rc-evidence` | `release-evidence.json`, `SHA256SUMS`, `compiled-package-audit.json`, `runtime-dependencies.txt` | Hashes, identities, compiled privacy/permission/native-library audit and resolved runtime SDK tree |

The evidence JSON includes the **actual GitHub checkout commit**, as distinct from the original PR head for pull-request builds, and each file's SHA-256 and size. It also records the QA signing certificate SHA-256 fingerprint, which is a **public certificate fingerprint, not a signing key**. Every Actions runner can generate a different temporary QA debug certificate; Android may refuse installing one QA APK over another. This is expected and unrelated to the eventual Play upload certificate.

The workflow checks package/version identity via `aapt`, confirms that the QA APK verifies with `apksigner`, and rejects any production APK that already verifies as signed before the owner explicitly approves an M5 signing pipeline.

The **compiled-package audit** reads the actual unsigned production APK, unsigned AAB and signed QA APK after Gradle finishes. It verifies that the final APK's *merged* permission set is exactly `INTERNET`, package names and target SDK match the RC, and the packaged offline UI contains the real public privacy and support HTTPS links. It inspects all three archives for native `.so` libraries; if one appears, the CI job **fails closed** until that dependency's 16 KB ELF and packaging alignment are reviewed, rather than assuming the bundle is compatible. This audit does **not** replace a 16 KB device/emulator test or Play's AAB inspection.

`runtime-dependencies.txt` lists Gradle's **resolved release runtime dependencies** from that exact build. Compare it with the SDK/provider inventory and Play SDK rules before finalizing Data safety. Resolved dependencies alone cannot prove that an SDK never transmits data at runtime; device/network review remains an M6 gate.
 It **does not** call Play Console, download any keys, access Google Drive or publish an app.

## Verify a build before giving it to testers

1. Choose a completed **green `main` branch** workflow run and record its URL.
2. Download the **evidence**, **QA**, and **unsigned production** artifacts from that **same run**, not from different runs.
3. Extract the artifacts. Compare `SHA256SUMS` against extracted bytes (or read `release-evidence.json`). The evidence uses paths relative to `android-production/app/build/outputs/`.
4. Confirm `actual_checkout_sha` matches the run's source and that `source_head_sha`, package names, version code/name, current stable skill tag and build variant match expectations.
5. For manual QA, install **only** the QA APK. Verify native handoff/clipboard fallback, 1×1 vinyl and 3×2 cassette widgets, Manual notifications and Atlas transitions. Keep screenshots and notes in [issue #285](https://github.com/focustimer-dev/go-hipster-go/issues/285).
6. After Play developer verification, check the permanent package/signing history **before signing**, then generate a new controlled production AAB with separate certificate/Play internal-track evidence.

The SHA-256 file is a plain checksum list, not an independently signed provenance statement. This proves which bytes were archived by a specific GitHub workflow, **not** that Play has accepted or reviewed them, that a given phone installed them, or that those bytes are cryptographically reproducible across different runner environments.

### Remaining M5 items

- [ ] Confirm Play Console package and existing TWA signing/version history
- [ ] Approve permanent production application ID/version increment strategy and secure upload-key storage
- [ ] Validate final merged Play manifest, Android API/SDK requirements and native library/16 KB compatibility
- [ ] Build a **separately approved** signed production AAB with signing certificate fingerprint
- [ ] Verify Play-installed splits and real-device acceptance on a Play internal track
- [ ] Owner separately authorizes Play upload and later production publication

**No step in this document requests or stores a secret signing key.**
