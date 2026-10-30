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
