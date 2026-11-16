# Go, Hipster, Go! — first Google Play release

Developer verification is complete per the account owner. Start with the native Android production RC. Use this page as the release index, with the linked files as the editable sources.

| Item | Source |
| --- | --- |
| Candidate | [Main build after PR #330](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43798682076), commit `98710823670f10e079a9bd8a9307097073cf7bc2` |
| App identity | `work.samelling.hipstergo` (confirm ownership in Play), `1.0.0-rc.1`, version code `100000`, target SDK 36 |
| Listing copy and release notes | [en-US listing](../config/google-play-listing.en-US.json) |
| Artwork and capture order | [Store asset shot list](android-play-asset-shotlist.md) |
| Policy and app content | [Data safety review](android-play-data-safety-review.md) and [submission checklist](android-play-store-readiness.md) |
| Published legal pages | [Privacy](https://hipster-go.samelling.workers.dev/privacy/) · [Support](https://hipster-go.samelling.workers.dev/support/) |

## 1. Register the app

1. Open [Play Console](https://play.google.com/console), select **All apps → Create app** and enter **Go, Hipster, Go!**, **English (United States)** and **App**. Confirm pricing before saving. The current listing proposes **Music & Audio**.
2. Check whether `work.samelling.hipstergo` already has Play or off-Play signing history. If Google requests existing-key proof, resolve it with the original signing key before committing the package or signing path. Decide whether existing production-package installs need an in-place upgrade. The isolated `.qa` app has a separate identity.
3. Enroll in [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756) and record the upload certificate SHA-256 and Play app-signing certificate SHA-256. Keep a secure backup of the upload keystore. The upload key signs the AAB and Google uses the app-signing key for the APKs it distributes.

## 2. Assemble the review package

- Use a successful main RC run and record its commit, run URL and bundle SHA-256. Download **hipster-go-production-rc-unsigned** for the production AAB and **hipster-go-android-rc-evidence** for the compiled manifest, dependency inventory and checksums. Match the package/version to the release record before signing. Use **hipster-go-android-qa-sideload** for phone QA.
- Pull the icon, feature graphic and real phone captures into one folder alongside the source SHA. Check a 512 × 512 store icon, a 1024 × 500 feature graphic and at least two compliant screenshots. Preferred sequence is moods, tempo slider and curve, Atlas, Your Crate inspiration and saved structure, then Manual or Chaos Roll. Use the [official preview asset specs](https://support.google.com/googleplay/android-developer/answer/9866151). Confirm any composed frames against the matching APK and exclude QA-only UI from store art.
- Paste the en-US listing fields into **Grow users → Store presence → Main store listing**. In **Policy and programs → App content**, complete privacy policy, Data safety, ads, app access, target audience and content rating using the compiled candidate and actual Cloudflare logging and retention settings. Confirm the in-app privacy link and the external AI handoff as installed. Review listing copy against the same build.

## 3. Bootstrap the first test release

1. Sign the production AAB with the registered upload key using JDK `jarsigner` (or equivalent release signing). Use an interactive password prompt locally or masked environment variables in CI. Verify the signature and signer fingerprint against the upload certificate before handing the file to Play. Record the signed AAB checksum.
2. In **Testing → Internal testing**, create a release, upload the signed AAB, add release notes and start the internal rollout. Install the Google Play-delivered build. Smoke-test widget, Jukebox-to-Manual navigation, Atlas, Crate persistence, skill links, AI handoff and privacy links.
3. Set up **Closed testing**. If this is a personal developer account created after November 13, 2023, keep at least 12 testers opted in continuously for 14 days and then apply for production access. Log feedback and fixes as the test runs. [Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)

## 4. Keep subsequent uploads in this repository

Keep the existing keyless RC checks. Add a manually dispatched Play workflow on trusted main commits with a dedicated GitHub environment. Use the exact AAB from a successful main RC run, verify its checksum and source commit, sign it, verify its certificate and upload to the internal track. Give every uploaded AAB a higher version code. After initial internal verification, promote the already-tested bundle in Play Console for the first public launch.

| Configuration | Location |
| --- | --- |
| `PLAY_UPLOAD_KEYSTORE_B64`, `PLAY_UPLOAD_STORE_PASSWORD`, `PLAY_UPLOAD_KEY_PASSWORD` | GitHub environment secrets |
| `PLAY_UPLOAD_KEY_ALIAS`, `PLAY_UPLOAD_CERT_SHA256`, package ID | GitHub environment variables |
| Google service account | Enable Android Publisher API in a Google Cloud project. Invite its email in Play Console **Users and permissions**, scoped to this app and its testing tracks. |
| Auth option | Prefer GitHub OIDC plus Google Workload Identity Federation, restricted to this repository and release environment. Request an impersonated service-account token with the Android Publisher scope. If using a JSON key, keep it in `PLAY_SERVICE_ACCOUNT_JSON` in the same environment and rotate it through Google Cloud. |

These are proposed configuration names. The upload implementation should create a Play edit, upload the signed bundle, update the internal track and commit the edit, then record the returned version code. Check the track before retrying a commit whose outcome is unclear. Scope credentials to the release job and keep decoded keys in temporary runner storage that is excluded from artifacts. [Google Play Developer API setup](https://developers.google.com/android-publisher/getting_started)

## Release record

Fill in one row per candidate in the PR or release notes. Attach the store assets by filename and record unresolved declarations before requesting review.

| Source SHA and CI run | Package and version | Signed AAB SHA-256 and upload cert | Listing and asset review | Data safety and policy | Track and verification |
| --- | --- | --- | --- | --- | --- |
| See candidate above | `work.samelling.hipstergo` / `100000` provisional | Pending Play signing setup | Pending final exports and review | Pending retention and owner review | Pending first internal upload |
