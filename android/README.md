# Go, Hipster, Go! for Android

A Trusted Web Activity wrapping https://hipster-go.samelling.workers.dev/.
The website supplies the interface and its updates. GO still hands off to the
selected AI service; ChatGPT's skill and Spotify connection remain in ChatGPT.

- Package: `work.samelling.hipstergo`
- Version: `1.0.0` (version code `1`)
- Minimum Android: 7.0 (API 24)
- Target Android: API 36
- Generator: @bubblewrap/cli 1.27.0; generated files are committed.

## Build

Install JDK 17 and the Android SDK (platform 36 and build tools 35.0.0).
Set `ANDROID_HOME` or create an ignored `local.properties` with `sdk.dir=...`.
From this directory:

```sh
./gradlew assembleRelease
```

This produces `app/build/outputs/apk/release/app-release-unsigned.apk`.
Align and sign it using Android SDK `zipalign` and `apksigner`, the private
signing backup, and alias `hipster-go`. Never commit the key or password.

```sh
zipalign -p -f 4 app/build/outputs/apk/release/app-release-unsigned.apk aligned.apk
apksigner sign --ks /absolute/path/hipster-go.keystore \
  --ks-key-alias hipster-go --ks-pass file:/absolute/path/password.txt \
  --out Go-Hipster-Go.apk aligned.apk
apksigner verify --verbose --print-certs Go-Hipster-Go.apk
```
Use `--ks-pass file:/absolute/path/password.txt` to avoid putting the password
in command history. Verify with `apksigner verify --verbose --print-certs`.
Increment `versionCode` in `app/build.gradle` for each future Android update.

The production `/.well-known/assetlinks.json` must contain the SHA-256 signing
certificate fingerprint. A Play Store release may require adding the Play App
Signing fingerprint as well. Retain the original fingerprint for sideloaded APKs.

## Install and check on a phone

Download the signed APK, open it, and allow installation from the downloading
app when Android asks. A previous home-screen PWA may remain as a separate icon.
Check launch without a browser toolbar, map pinch/pan/double-tap, Android Back,
AI handoff, return from ChatGPT, preference persistence, and offline fallback.
If a browser toolbar appears, check Digital Asset Links and browser TWA support.
The build environment does not provide an attached physical Android device;
phone interaction checks must be completed after installation.
