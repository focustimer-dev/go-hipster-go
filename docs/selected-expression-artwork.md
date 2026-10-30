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

## Original artwork recovered and verified

The local ChatGPT Library prototype `go-hipster-go-weird-engraving-v18.html`
contains **embedded WebP assets that match the current GitHub production
files byte-for-byte**, verified by full Git blob SHA-1:

| Current shipped asset | Image dimensions | Byte count | Exact Git blob SHA |
| --- | --- | --- | --- |
| `engraved-six-clerks.webp` | 1536×1024 | 1,924,388 | `b982e38a1641848c018632d63c5375de76b8c04d` |
| `weird-v18.webp` | 1254×1254 | 1,825,856 | `10b2a3104718f0795677140e97d3dd37843a379b` |

The Library also contains earlier `Six Mood Portraits in Copperplate.png`,
but its lower-left Weird is a DIFFERENT character. The local prototype
and production Git blob hashes above, not this early sheet or a later
AI interpretation, are the authoritative selected-expression references.
**No manual user upload is needed.** Never include private Library share
links in public repo documentation.

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

## Five-mood expression exploration (not approved artwork)

A local visual study compared source-accurate neutral crops to proposed selected
expressions for Happy, Angry, Sad, Criminal, and The Funk. These are **concept
studies**, not sprite-registered production assets. Findings:

- **Happy:** broader grin/raised cheeks reads well; keep glasses, hair and shirt
  exactly registered to the source.
- **Angry:** stronger brow/jaw intensity is viable, but neutral already screams;
  selected state must change emotion, not merely scale the existing face.
- **Sad:** deeper downturned mouth reads, but concepts replaced her clear glasses
  with dark lenses; reject any change to approved eyewear or hairstyle.
- **Criminal:** masked mouth limits expression; preserve beanie, scarf and glasses;
  focus on brows, cheek tension and a distinct eye-area attitude.
- **The Funk:** bigger joyful laugh works; preserve star sunglasses, beaded braids
  and high collar without shifting their silhouette.

The user approved exaggerated, believable anatomy and specifically rejected
bulging eyes for Weird. No new artwork was integrated into the app on the basis
of these studies. Before activation, require identity-preserving image edits
using original current production pixels and a neutral/selected 1:1 alignment
check for each of the six portraits.

## Cast-wide gesture pass (Oct 30 — concepts, not production sprites)

The selected expression should change the character's *attitude or action*, not
merely increase their initial facial emotion. The neutral portraits remain the
exact unchanged source artwork.

| Mood | Distinct selected action | Identity constraints |
| --- | --- | --- |
| Happy | Head tilted back, uncontrollable open laugh, lifted cheeks | Keep sunglasses, hair, shirt |
| Angry | **Stop screaming**; vicious clenched-teeth snarl, tight eyes and raised fist | Exact spiked hair, hoops, leather jacket |
| Sad | Visible tears, hand wiping a cheek or holding the face, genuine grief | Keep clear original glasses, bob, knit sweater |
| Weird | Strong crooked knowing grin, asymmetrical brow, one controlled squint | **No tongue, bulging eye, or altered moustache/hair** |
| Criminal | Slightly lowered bandana revealing a sly grin, defiant pointed gesture | Keep original beanie, shades, scarf and jacket |
| The Funk | Head back in ecstatic laughter, expressive hand gesture | Keep star lenses, beaded braids, high collar |

These are clear behavior targets, not permission to replace the actors.
A visual concept pass made these gestures more distinct, but changed source
details and framing; none of its generated faces should enter production as
a stand-in for source-registered expression assets. The release must use
original-pixel-preserving edits and side-by-side identity review.

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
