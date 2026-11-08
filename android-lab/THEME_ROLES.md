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


## Usiku material hierarchy (Android)

**GO owns the saddle material.** The old isolated GO green (`#00613b`)
is retired; `--lab-ui-go` is the existing vignette edge tone
(`#7e4c30`). The hero key uses its dark saddle ink stack: `#925b39`,
`#7e4c30`, then the already-used recessed keycap `#38261c`. This makes
the yellow Poster headline and cream handoff label readable without an
invented accent. The original faceted star and COPIED impression stay.

**The receipt is information, not a second hero.** Its masthead sits
directly on Usiku's dark-green paper, separated with a fine saddle rule,
and Save Request remains an outlined control. Keep the rich brown vignette
on the portrait fields and GO; avoid repeating it as large banners.

All of this is Android-only. Bosque's forest GO and Libéri's original
poster treatment are unaffected. Do not change the public PWA in this pass.


## Projection and portrait role contract (theme expansion hardening)

**Runtime owner:** `android-lab/web/theme.js` is the Android authority for
three map projections and their tween frames. It publishes one `ATLAS` palette
per theme through `GHGAtlasPaintColors()` and through computed
`--lab-atlas-*` CSS properties. The older separate `PALETTES` and `TWEEN`
dictionaries are retired. No geometry, state or map engine may be
theme-specific.

| Atlas role | Consumers |
| --- | --- |
| `paper` / `land` | Cahill SVG country fills and all intermediate country frames |
| `ocean` | Robinson polygon, Globe field and Cahill sea/Antarctica |
| `ink` / `selected` | country outlines, selected country fill, transition vectors |
| `field` / `backdrop` | projection outer surface and canvas backdrop; not ocean |
| `route` + opacity/width/dash | MapLibre shipping routes and CSS/SVG visual ink |
| `graticule` + opacity | live Cahill grid and intermediate fold frames |
| `oceanStroke` + opacity | Cahill sea/Antarctica outline |

The PWA-only 3-projection preview uses the same CSS roles with its original
fallback values; it does **not** receive the Android JavaScript theme
registry in this change. The public PWA remains on its separate parity cycle.

**Printed mood roles** are published from the `MOODS` registry in the same
Android early-load script. `--lab-mood-neutral-paper` (which may be a
gradient), `--lab-mood-neutral-ink`, `--lab-mood-selected-paper`,
`--lab-mood-selected-ink`, `--lab-mood-funk-paper`,
`--lab-mood-funk-ink` and `--lab-mood-desire-hearts` control paint
without changing original sprites or their alpha and registration. The
existing PWA skin retains exact fallback colors. Funk rays, Desire hearts
and Triumph are **still** special approved artwork treatments, not new
per-theme portrait assets.

**Guardrails for the next theme:** keep the approved Libéri/Bosque/Usiku
appearance, include neutral and selected portraits, check three projection
resting states AND in-between frames at 320/390px, run Android and PWA
unit/visual workflows, and never let a missing token silently inherit the
wrong theme. This first milestone is an architectural foundation, not
permission to turn on Kingston or any other candidate in Preferences.

## Kingston Blank-Label — Studio One reference refinement

The pilot remains **URL/QA-only** at `/?theme=kingston`, not offered in
Preferences or saved as an installed preference. Its print direction is an
aged 7-inch Jamaican Studio One label: warm cream paper with softened
teal ink and modest registration wear, not an all-black Xerox flyer.

- `theme.js` owns all Atlas and mood palette values for the pilot.
  Robinson, Globe and Cahill share dark petrol water `#273d3b`,
  warm land `#d3c4a8` and subdued teal selected geography `#6d9991`.
- `theme-tokens.css` owns warm Jukebox/Manual paper `#e3d9c2`,
  dark printed type `#263f3e`, gentle teal GO and readable cream text.
- `theme-print.css` is the shared print-profile consumer, not per-theme
  Kingston hacks. Selected mood tiles stay warm paper `#d2c3a6`
  with a teal impression at the rim instead of a cyan flood.
- **Character engravings retain original source images**, including their
  two-tone shading, alpha and selected expressions. Do not convert the
  entire face into an opaque CSS mask to make a new theme.
- **The Funk is a locked exception** for this print profile and future
  themes using it. Both neutral and selected retain the original figure,
  selected pink pressing, readable original petrol label ink, and unaltered
  vermilion laser intensity and geometry. No recoloring filters, custom
  masks, hue rotations or hand-modified assets. Existing Libéri/Bosque/Usiku
  artwork is left unchanged in this branch.

**Visual gate:** screenshots at 320px and 390px must include the
three resting maps, mood neutral/selected (all eight), Manual, Crate,
GO and receipt. Source tests check original Funk pseudo-element image,
laser opacity and filter. Keep this in a draft PR until visually approved.
No Android APK signing, production PWA sync or deployment is requested.
