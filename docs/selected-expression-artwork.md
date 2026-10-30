# Selected expression engravings — release contract

Status: **artwork pending / NOT enabled**. This branch only provides guarded UI
wiring. Do not enable `data-expression-art="v2"` or merge as a finished art
feature until both original-source-based assets below exist and are approved.

## Approved identity (neutral source)

- `launcher/editions/gig-poster/assets/engraved-six-clerks.webp` — six heads
  in a 3-column by 2-row atlas. Exact cell identity, silhouette, crop and
  registration must be maintained. This neutral image remains unchanged.
- `launcher/editions/gig-poster/assets/weird-v18.webp` — overrides the Weird
  cell with the current approved face, hair, thin brows and moustache. Preserve
  this identity rather than reverting to `weird-curly.webp`.
- Do **not** use `clerks-expressions.webp` or `the-funk.webp` as new
  selected sprites: they contain materially different models.

## Required new art

1. `engraved-six-clerks-selected.webp`: identical dimensions and 3×2
   registration as the current neutral `engraved-six-clerks.webp`. Same
   background transparency, dark teal line engraving, clothing and facial
   structure. Only expression changes, no labels or borders.
2. `weird-v18-selected.webp`: identical dimensions as `weird-v18.webp`;
   same hair and identity, only an altered expression.

Expression direction:
- Happy: wider genuine smile, subtly brighter eyes.
- Angry: intensified glare / jaw tension, not a different hairstyle.
- Sad: lowered, wistful eyes and slightly downturned mouth.
- Weird: asymmetrical mischievous expression, unchanged hair/moustache.
- Criminal: expressive eyes/brow visible above the original bandana.
- The Funk: joyous open grin / subtle raised shoulders; star glasses and braids
  remain identical.

## Activation and QA

After artwork review, add images, declare the new image paths in the Cloudflare
Worker asset manifest, update the generated launcher `<body>` to include
`data-expression-art="v2"`, then regenerate the edition. Current CSS adds
a fading overlay only when this explicit flag is present. Without the flag,
the six neutral portraits remain exactly as in production.

Check every expression at 320/390px; compare neutral and selected pixel crop,
alignment and line density. Test mouse, keyboard, select/deselect, shuffle and
undo. Reduced-motion must switch without a fade. Verify no layout shift and
no broken artwork requests. Review in Cloudflare preview before merge/release.
