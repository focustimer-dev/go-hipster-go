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


## Jukebox control hierarchy (Bosque + Usiku)

This Android-only refinement lives together in the final **Jukebox quiet pass**
block of `android-lab/web/workspace.css`. It does not affect Libéri or the
public PWA.

- **Poster is the founding visual identity**: use it for the brand, mood names,
  headings, GO, and action labels (including +ART, TRY HARD, Shuffle, Atlas,
  tempo choices and inspiration controls). Quieter means reducing their
  ornamentation, not replacing that typeface.
- **Arial** is reserved for sentences, descriptive help and secondary status.
  **Courier** stays where it conveys a genuine printed artifact, such as a
  receipt serial number. Avoid adding a fourth type family.
- The illustrated moods and three geographic projections remain immediately
  accessible. Projection choices, Shuffle locks, the **Any** bypass, and the
  **+ART / TRY HARD** checkboxes use a quiet printed-strip language instead of
  nested card outlines. Pressed states use a visible underline plus their
  pre-existing state cues; keyboard focus is a separate theme-colored outline.
- Every flattened button keeps a minimum **44 CSS px** hit area. Long labels
  may wrap; no new hidden submenus or taps are introduced.
- The **GO** button remains the only large color-filled action. Preserve
  its selected-yellow lettering, the original faceted star, all copy/handoff
  behavior, the paper receipt, and the recording lever.
- Leave Atlas size, projection geometry, panning, region touch boundaries,
  mood artwork and theme surface colors unchanged. If tests show accidental
  clipping at 320px/390px, fix only the affected control composition.

The browser regression in `scripts/test_android_lab_themes.cjs` checks the
font roles, touch target sizes, flat selected states, and two phone widths.
