# Canonical Android workflow audit

## Outcome

The canonical Lab 0.9.7 bundled interface has a confirmed first-run setup visibility blocker. Do not certify onboarding or Google Play readiness from passing DOM tests.

The review preserved the approved app direction, artwork, atlas, and controls. No application runtime changes were made.

## Evidence and scope

- Canonical APK source: 0f60842dde1fefe8c10465c5cecaed0a44ac7094.
- [Interface audit run 41558984579](https://github.com/focustimer-dev/go-hipster-go/actions/runs/41558984579) completed successfully at harness commit 2e26f90e3c9765b1cb114de7491ef176115916e0.
- 40 browser captures: 10 checkpoints at 320×740, 412×915, 412×915 with 200% root font size, and 915×412 landscape. Raw metrics and screenshots are in the run artifact (seven-day retention).
- The browser rendered the regenerated, previously byte-matched APK interface, with a simulated Android bridge. These are interface captures, not Android screenshots.
- Fresh first use and Preferences were captured without changes. The harness detected invisible setup controls in every profile.
- To inspect later setup screens, the harness added an explicitly recorded diagnostic visibility override. Setup captures are marked DIAGNOSTIC-OVERRIDE. This is not evidence that shipped first-run setup works.
- No page-wide horizontal overflow was measured in the captured states.
- The final harness reported no uncaught JavaScript errors. Exact GO text matched the bridge handoff; a failed clipboard did not launch an AI.
- Existing source checks/Android builds do not substitute for hardware, TalkBack, system font scale, OS navigation, real saved-request dialogs or external service testing.
- No AI was installed or connected, no prompt was sent, and no playlist was published. Setup confirmation in this test is a simulated user action.

## Ranked findings

### P1 — First-run setup is invisible

**Evidence:** Fresh browser captures omit the setup ticket at all four profiles even though its buttons exist. The legacy rule in launcher/editions/gig-poster/edition.css hides body.gig-poster .ticket. The first-crate panel uses class ticket and its own stylesheet does not restore display. DOM tests that invoke click on hidden buttons missed this.

**Impact:** A new listener sees discovery controls without the intended install/connect/check guidance. The footer Manual remains a workaround, but the primary onboarding path cannot be used.

**Next fix:** Restore visibility specifically for #firstCrateSetup .ticket while retaining hidden/completed behavior. Preserve the poster's intentional hiding of unrelated legacy ticket components. Add a real-browser isVisible assertion before setup interaction; test first use, paused, resumed and completed states. The audit must stop needing its diagnostic override.

### P1 — Other AI requests silently fail to save

**Evidence:** android-lab/web/workspace.js offers SAVE REQUEST for every pairing. LabActivity.java Bridge.saveRequest accepts only url(ai)!=null. The url helper returns null for other, so no shelf.save call or error message occurs. Other AI is reachable through the first-crate setup selector.

**Impact:** A user can copy a valid manual-AI request but pressing Save does nothing. Current DOM mocks accept saves more broadly than the native implementation, so passing interface tests do not cover this rejection.

**Next fix:** Preserve exact local saving for a validated Other AI request and ensure its saved actions offer manual copy/share rather than a fictitious launch; alternatively make unsupported saving visibly unavailable with an explanation. Prefer consistent local saving within the existing feature set. Verify native validation and saved actions, not just a mocked callback.

### P2 — Manual app version is stale

**Evidence:** android-lab/web/workspace.html contains ANDROID LAB · 0.9.3; the inspected APK manifest is 0.9.7, version code 16. This is visible in the Manual capture.

**Impact:** Users cannot reliably tell which application version they are troubleshooting.

**Next fix:** Derive displayed version from build metadata rather than manually maintaining a second version string. Keep app version separate from installed-skill confirmation.

### P2 — Manual connection-check copy failure lacks a direct recovery

**Evidence:** workspace.js sets labSetupStatus to “Could not copy. Try again.” when the Manual's COPY SETUP CHECK fails. That section does not expose the exact connection-check text for manual selection. The first-crate flow has a manual-copy textarea.

**Impact:** A persistent clipboard problem leaves this path repeating the same unsuccessful action.

**Next fix:** Offer the exact check as selectable text in the existing Manual section on failure, preserving the chosen pairing and accessible status. Reuse the first-crate pattern without adding a new product capability.

### P2 — Small secondary setup/help links

**Evidence:** Measured normal phone targets for Setup instructions and Installation & nerd stuff are approximately 14px and 12px high. They are separated, but much smaller than primary controls.

**Impact:** The fallback help links are harder to tap, especially when a user is already stuck.

**Next fix:** Expand their hit areas with spacing while preserving their quiet visual hierarchy. Check actual Android 48dp targets on device; browser CSS metrics alone do not establish native compliance.

## What to preserve

- The shared petrol/mustard printed identity and locked character models.
- The current top navigation and single Preferences surface.
- Explicit distinction between copying a request and creating a playlist.
- Prompt identity between visible request and handoff; failure does not auto-launch.
- Local-only saved-request explanation and explicit confirmation semantics.
- No measured page-wide overflow in Crate, Manual or Preferences across the reviewed profiles.
- The physical recording-quality toggle and approved ART/TRY HARD styling.

## Remaining verification

A full native health score is intentionally withheld. These tests cannot score TalkBack, real Android font scaling, predictive Back, keyboard/IME insets, gesture feel, true cold-start performance, native dialog behavior or external-app launching.

Before a release candidate, use an emulator or phone to verify:
1. Fresh install → visible setup → real AI/service install/check → return.
2. ChatGPT/Gemini Open, Share and Browser modes, missing-app fallback, and manual Other AI.
3. Saved request name/cancel/full shelf, exact copy/share/replay/delete, including Other AI.
4. Incoming inspiration accept/cancel/edit/remove and stale-prompt protection.
5. Stable/Lab skill-update check, offline cached state and honest installation confirmation.
6. Update over the canonical signer/package with a higher version code, retaining user data.
7. System Back, gesture/three-button navigation, TalkBack, keyboard, real font scaling, orientation and dark/system appearance behavior.

## Next implementation batch

Fix the hidden setup and Other AI saving path first, then version display and clipboard recovery. Add visible-browser/native acceptance checks that reproduce each defect. Inspect and fix in one bounded batch, then confirm once; park new capabilities under the feature freeze.

The harness is separate from Android compilation to avoid rebuilding unchanged native code on every interface-only audit. It cancels superseded audit runs and retains bulky captures for seven days. Findings remain recorded here.
