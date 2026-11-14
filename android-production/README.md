# Go, Hipster, Go! — native Android production RC

**Unsigned, provisional production candidate only.** This is the native app, not the historical `android/` Trusted Web Activity. The installed app identity is currently proposed as `work.samelling.hipstergo`, and cannot be finalized until M0 checks Play Console registration, old TWA identity/version and certificate history. **No Play upload or signing is permitted by this build.**

The project compiles the Java implementation in `android-lab/app/src/main/java` and produces a generated resource copy from `android-lab/app/src/main/res`. It uses the same approved artwork, offline Atlas and Jukebox, and 12-slot Chaos Roll generator. `android-lab/` keeps its own package, signer, app data and installed UI. A user installing production separately will not automatically inherit Lab preferences or Crate history.

## Reproduce locally

With JDK 17, Android SDK API 36/build-tools 35.0.0, Python 3.12 and Pillow 12.0.0:

```bash
python scripts/bundle_android_production.py
python scripts/test_android_production_contract.py
python scripts/test_android_play_readiness.py
bash android/gradlew -p android-production testReleaseUnitTest assembleRelease bundleRelease lintVitalRelease --no-daemon
```

Check `android-production/app/build/outputs/apk/release/` and `android-production/app/build/outputs/bundle/release/`. **Both are unsigned.** Never use the older `android/` wrapper or the Lab signing workflow for the production RC. Final signable distribution requires the release pipeline, certificate policy and owner's approval.

Internal source identifiers (the `.lab` Java namespace, theme resources, `HipsterLab` JS bridge and CSS selectors) remain on purpose: they are not user-facing, and renaming them would introduce unnecessary functional risk. Production UI strings, app label, shortcuts and widget app identity are separate; validate those by inspecting the generated assets, merged manifest and installed APK. The native local WebView host `lab.hipster.invalid` is an isolated synthetic URL, not a public website.

Release checklist: [Android production RC plan](../docs/android-production-rc-plan.md) and [milestone tracker #285](https://github.com/focustimer-dev/go-hipster-go/issues/285). **M1 source integration is complete**. M2 automated build passes, but on-device acceptance is open. The developer account is awaiting verification; M0 Play Console package/signature approval is open.

Pre-approval work continues in [Play Store readiness checklist](../docs/android-play-store-readiness.md) and the **unpublished** [Android privacy-policy draft](../docs/android-privacy-policy-draft.md). The plugin privacy policy in `docs/privacy.md` does not cover this Android app. Google Play requires a separately reviewed public HTTPS policy accessible from the app and Store, plus a verified Data safety disclosure, before submission. Do not assume those are complete merely because the static preflight passes.
