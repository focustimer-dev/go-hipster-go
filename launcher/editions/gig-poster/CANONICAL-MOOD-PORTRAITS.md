# Canonical Mood Portraits — Approved v1 (2026-10-30)

**STATUS: ART-DIRECTION LOCKED.** The six character identities and their neutral-to-selected expressions below are the approved visual baseline. **Do not regenerate portraits from text prompts or substitute lookalikes.** The older sprite sheets and Library comparisons are not automatically canonical. No production deployment is implied by this document.

## Order
1. Happy — long tousled hair, mustache, sunglasses; jubilant laugh on selection.
2. Angry — spiked punk hair, hoop earrings, studded leather; narrowed, furious scream on selection.
3. Sad — bob haircut, round glasses; exaggerated open-mouthed sob on selection.
4. Weird — wavy longer hair, *thin* mustache, engraved shirt; mismatched eyebrow and playful crooked grin on selection.
5. Criminal — **beanie, sunglasses, paisley bandana, leather jacket**; selected state replaces *only sunglasses* with a naturally fitted dark domino mask, eyes visible in a suspicious sideways glance. **Never use the curly-haired hat/bandana substitute**. Reference comparison was approved immediately before the Funk pass.
6. The Funk — beaded braids, star glasses, embroidered high-collar costume; broad ecstatic laugh on selection.

## Asset provenance / reference handles
- Approved 6-character board generated in conversation: `vintage_hipster_character_comparison_board.png` (2026-10-30). This is a *visual approval reference*, not a drop-in production sprite.
- Happy original: conversation upload 2026-10-30 (long-haired mustached aviator portrait).
- Angry approved: conversation upload `ANGRY — ORIGINAL / ANGRY — SELECTED (APPROVED)` (2026-10-30).
- Sad: conversation upload (round-glasses crying woman), plus Library `Tearful Engraving Portrait.png`.
- Weird approved: conversation upload `WEIRD / ORIGINAL / WEIRD / SELECTED / PROPOSED` (2026-10-30), plus Library `Weird Portrait: Original vs Proposed.png`.
- Criminal approved: conversation image `ORIGINAL PWA / CRIMINAL — UPDATED EXPRESSION` (2026-10-30), based on the authentic beanie-and-bandana PWA original. Reject older similarly named comparison files.
- Funk: Library `funk-neutral-registration.webp` and `funk-selected-registration.webp` (primary authentic identity references); selected exaggerated expression approved 2026-10-30. Board captures approval direction, not exact sprite bytes.

## Implementation guardrails
- Restore the exact canonical character identities from approved references. No re-generation or interpolation of people.
- Align neutral and selected states to identical crops, pixel dimensions, anchor points and silhouette scale; compare at mobile size.
- Render sprite previews **from the actual asset bytes** before publishing. A reference board alone does not satisfy a build.
- Add filenames + checksums of final production PNG/WebP sprites here after they are extracted/assembled, and gate releases against accidental replacement.
- Future changes require explicit user approval per character.

## Approved production sprites (selection demo approved 2026-10-30)

Both sheets are 1536 × 1024 WebP, with a 3 × 2 layout in the order above. The exact bytes from the approved interactive demo are preserved. Neutral and selected sheets use the same tile rectangles; CSS does not scale or morph the portraits. Comparison-sheet margin artifacts are clipped identically in both states.

| File | SHA-256 |
| --- | --- |
| `assets/moods-neutral-approved-v1.webp` | `fc61de6740b8ad4f909c561bb3b34b2d6e5d9347b84cc9fcb2387f425dd5c794` |
| `assets/moods-selected-approved-v1.webp` | `f45fa9c3d5915723f393e71a7ee8cb26d11c3931ec533fd8b98f6ace74625a72` |

`mood-portraits.css` follows the application's existing `aria-pressed` state, including shuffle and Undo. Inline filters in `assets/mood-portrait-filters.svg` reproduce the approved golden-paper / midnight-teal neutral treatment and vermilion / midnight-teal selected treatment with restrained, source-luminance ivory highlights. The inset border and underlined label supplement color. Reduced motion disables the 160ms expression fade.

## Desire v3 — approved corrected portrait (2026-11-14)

Desire now uses the tighter, deeper-crosshatched portrait approved after
side-by-side comparison with the original six-character production cast.
The paired calm / yearning expressions use the same face scale and registration.
Each file is a lossless **1254 × 1254 RGBA WebP** with black engraving luminance
encoded into alpha opacity. The white paper becomes transparent and the
renderer supplies each theme's ink; **do not apply referenceInk** (which would
re-extract luminance and destroy the intended alpha levels).

| Runtime file | SHA-256 | Bytes |
| --- | --- | ---: |
| `desire-neutral-v3.webp` | `35db845af7e3e05d634af21deb37a4ed6d72d6e690ac7760becd40effbbaf53c` | 611676 |
| `desire-selected-v3.webp` | `fa62b1482bf9bdd1b94512dd95781a1ac113ef052fa7f5ba4fa5ec3b08752f30` | 625516 |

The vector decorative-heart overlay is independent of either face. The
selected portrait must display as the selected expression for all nine themes;
Android's package optimizer may compress it further but must preserve alpha
and registration. The superseded v2 portrait files are excluded from this PR.


## Desire v4 — full-crown and theme-ink alpha plates (2026-11-14)

The approved v3 engraving contained a source-level straight crop through the
crown; CSS translation could only move that cut edge. V4 recreates the full
pearl circlet and hair in both expressions, while matching the original cast's
engraving density and registration at actual Android mood-tile size.

Each 1254×1254 lossless WebP stores dark ink as opacity (white paper becomes
transparent). CSS paints the alpha as the theme's
`--lab-mood-neutral-ink` / `--lab-mood-selected-ink`, not the older SVG flood;
position is `translateY(2%) scale(.92)` for both states. Decorative hearts
remain independent of facial shading.

| Runtime file | SHA-256 | Bytes | Ink alpha bounds |
| --- | --- | ---: | --- |
| `desire-neutral-v4.webp` | `59680b820cb7406639dbe67164835108ca3e6f0c284a97f2051dd3526f9ed207` | 537520 | (70, 32, 1184, 1164) |
| `desire-selected-v4.webp` | `dc7c2204ac872c1a1a743fbd07329bfb5e32d39e66497189d6320e4d0bcaa4d7` | 545786 | (68, 32, 1186, 1164) |

V3 is retained as a historical rollback plate but is not bundled into the
Android runtime. This revision requires an on-device visual approval before
merging PR #311 or publishing the production app.
