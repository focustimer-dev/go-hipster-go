# Browser catch-up to Android RC — 2026-11-16

**Reference revisions:** Android production `1.0.0-rc.1` (versionCode 100000), Android Lab `0.9.83`, repository main at `98710823670f10e079a9bd8a9307097073cf7bc2`. Android remains the design/behavior authority, but native-only functions should not be simulated.

**Stable skill packages:** Canonical `config/stable-skill-release.json` pins **3.11.7**, tag `gemini-skill-v3.11.7`, source `5a2eff190d97a2d3d9a356ccec8edbcb1efb15db`, four SHA-256-verified ZIP links (ChatGPT Plugin, Gemini Skill, Claude Skill, Claude Plugin). Post-release main changes, including PR #329 Gemini publishing, are **private QA candidates**, not a new stable release. Reading, downloading and installing are distinct; host-specific installation still needs verification.

## RC/PWA parity register

| Area | Current status | Browser decision |
| --- | --- | --- |
| 12-slot tempo/mood curve, two selected moods, ✥ grip | Shared runtime already updated | Preserve; validate with Chromium, device QA |
| Desire v4 portrait, curve thumbnail | Shared runtime already updated | Verify rendered opacity/size on browser |
| ElectricStars | Native locked surprise theme | Show as disabled in browser; no fake unlock or persisted override |
| Katowice Atlas ink/paper | Browser bridge had pre-RC colors | Align MapLibre and tween palette to Android tokens |
| Three Atlas projections | Browser bundles Android canonical Atlas | Run isolated projection, route and color tests |
| Browser Manual | Had a floating /releases/latest link | Link each of four immutable public stable ZIPs; script checks version/tag |
| Crate, inspiration, copy/publish explanation | Existing browser adapter | Test persistence, metadata, setup, copy fallback and manual wording |
| Haptics, native AI handoffs, widgets, APK updates | Android-only | Remain excluded from the browser |

## Acceptance gates

1. Run Python unit suite, package-builder --check, canonical stable-link sync, skill qualification, and JavaScript syntax checks.
2. Use the `feat/pwa-` isolated preview to inspect phone 320/390 px, desktop, reduced-motion, curve mode, mood selection, desire image, active and disabled theme tiles, browser Crate, and all three Atlas projections.
3. Confirm all four Manual downloads match `config/stable-skill-release.json`. Check a fresh and returning browser, local storage failures, overflow/contrast and skill-installation copy.
4. **No automatic production deploy, stable release promotion or ZIP replacement.** Require an explicit decision after preview acceptance. After deploy, compare served release SHA and live smoke tests.
5. For a new published skill version, qualify exact main candidate, test ChatGPT/Gemini/Claude installations and music permissions, version all four ZIPs, publish via the manual `publish-gemini-skill.yml` workflow, then update manifest hashes and all links.
