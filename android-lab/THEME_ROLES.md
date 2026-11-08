# Android color roles — Bosque and Usiku

**Authoritative source:** `android-lab/web/theme-tokens.css`. It is loaded by the
Android Jukebox and the embedded Manual iframe. Both use the same
`data-pwa-theme` names; the regular Libéri theme keeps its established
poster colors and is intentionally not overridden.

| Role family | Used by |
| --- | --- |
| `surface` / `ink` | Jukebox, Your Crate and everyday text |
| `panel` / `on-panel` | Manual, preferences and dark inset panels |
| `rail` / `on-rail` | Android navigation |
| `field` / `on-field` | Inspiration editing and setup-input fields |
| `ticket-stock` / `ticket-ink` | Cream first-run paper setup, even in Usiku |
| `action` / `on-action` | Active buttons, handoff and selected choices |
| `go`, `highlight`, `on-highlight` | GO key, COPIED impression and selected-yellow lettering |
| `rule` / `control-outline` | Structural separators and control borders |
| `focus` | Visible keyboard focus treatment |

Use `var(--lab-ui-<role>)` for these repeated jobs. Keep printing/material
effects such as Usiku's saddle leather gradient, the original mood portraits,
and atlas land/ocean/route paint in their separate, existing systems.

**Do not:** add an ad-hoc Libéri `#742019` confirmation or another duplicate
share CTA. GO provides the copy acknowledgement; the receipt offers the next
action and optional recovery. `scripts/test_android_lab_themes.cjs` checks
both mobile widths, and `android-lab/tests/test_theme_roles.py` guards
the shared role set and text-contrast pairings.

**Release scope:** Android only. This consolidation does not publish the PWA,
alter playlist construction, change projections or replace the original artwork.
