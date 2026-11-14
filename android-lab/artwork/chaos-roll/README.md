# Approved Chaos Roll raster artwork

These PNGs are the user-approved generated artwork from the November 13, 2026 design session. Preserve the actual pixels and alpha; do not replace them with SVG, Canvas primitives, procedural illustrations, or cropped variants.

- `record.png`: 1 × 1 artwork; 7-inch vinyl in a clear sleeve.
- `cassette.png`: 3 × 2 artwork; standard-cassette proportions, clear shell and gold reels.

The build copies these files verbatim into drawable-nodpi. Both layouts use fitCenter on a transparent container. Intermediate launcher sizes use the record until there is enough width and height for the cassette. Launcher cell dimensions vary; grid metadata is a preference, not an exact pixel measurement.

The printed text is deliberately baked into the approved art. **The cassette source also contains `HIPSTER GO / LAB` on its black upper-right band.** The Lab rendition preserves the original pixels and SHA-256 exactly. The separate production/QA packaging path now removes only the printed `/ LAB` suffix from that band's pixels before compressing its private `widget_chaos_cassette.webp`, retaining `HIPSTER GO` and everything else (case, screws, spools, alpha, headline). No replacement SVG, enlarged overlay or change to the source PNG is involved. A narrow pixel-level regression test protects the original and the masked region; a new installed-app screenshot is still required for final visual acceptance.

The existing generator always requests 12 tracks and excludes Inspiration. If that contract changes, create a clean label asset before adding dynamic typography; do not stack duplicate text bars over this image.

Static release first. Reel/record animation is not implemented. The entire widget rolls; the cassette retains an invisible 48dp top app-opening target.

## Device acceptance

- Compare installed 1 × 1 and 3 × 2 widgets with these originals.
- Test light, dark and textured wallpapers for alpha edges and contrast.
- Confirm no clipping, stretching, smoky background card or duplicate lettering.
- Confirm full-widget roll, cassette top app-open, resize, rotation and TalkBack.
- Check lettering at actual launcher size before accepting the release.

SHA-256:

- record.png: f89056903c3ff7e672fc08e7de3a4cf8f1d1d267f2251740cc2701e085a087ab
- cassette.png: bd07067beb29d718a49b6dd34a6417b3d0c52b1d83c66fdb5cc4e99cc9ef9540
