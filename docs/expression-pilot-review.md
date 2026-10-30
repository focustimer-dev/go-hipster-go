# Selected-expression pilot — not for production

This branch provides six 340px transparent PNGs extracted from the existing
interactive local **expression study**. It integrates them with the exact current
neutral artwork, which remains untouched, and with the existing `aria-pressed`
mood states. The code does **not** enable expressions by default.

**Access:** only the separate Cloudflare review Worker can add
`data-expression-pilot="true"` when the page is opened with
`?expressionPilot=1`. Removing that parameter restores the unchanged
six neutral portraits. The same mood-state logic drives tap, shuffle and undo.

**Not yet release quality:** These are concept crops, not edits perfectly
registered to the source engravings. Sad's glasses drift, various artwork
remnants remain, and several selected portraits have slightly different
face scale. This branch must **not be merged or sent to production**. It is
an integration proof and interaction/size test.

Success criteria: all six previews load at 320px/390px, unchanged neutral
states, no layout shift, no broken image requests, reduced-motion support,
and correct expression response on selection/deselection/shuffle/undo.

Source-art provenance and final illustration criteria remain in draft PR #77.
