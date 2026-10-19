# Go, Hipster, Go! — Visual identity

## The five-point deep cut

The logo is a geometric, garnet-red, five-point star reconstructed from the supplied faceted-star reference. Five alternating wedges are truly **transparent** rather than filled by a simulated gray checkerboard. It evokes obscure record labels, angular 1980s sleeve art and an almost unjustified level of confidence.

- **`icon.svg`** — quiet, high-contrast small-scale form for the ChatGPT composer (1024 × 1024 SVG viewBox, transparent exterior *and* five cutout facets).
- **`logo.svg`** — presentation/logo form with very fine concentric **vinyl-groove etching** visible at large sizes, without altering the silhouette.
- **Color:** garnet / deep ruby. Light and dark OpenAI theme accents: `#8A030D` and `#E85C62`.
- **Safe area:** the outermost point and corners have intrinsic padding within the square canvas. Do not place the artwork on an opaque background or stretch it.
- **Exports:** Use a proper SVG renderer to create RGBA PNGs at 32, 48, 64, 128, 256, 512 or 1024 px. Rasterizations do not replace the source SVG.

Both SVGs are first-class vector paths, not embedded raster images. There are no fonts or checkerboard rectangles. Fine vinyl grooves are absent from the simplified small icon on purpose.

The OpenAI plugin manifest points `composerIcon` to `./assets/icon.svg` and `logo` to `./assets/logo.svg`, with same designs for dark variants. If a host does not automatically refresh an existing displayed icon, try reloading the interface; do not treat display caching as evidence that the package lacks assets.

The musical taxonomy, source verification, optional connected streaming publication, snarky record-clerk character and statistically improbable Easter egg are unchanged.

## Hipster, Go! PWA

Use the same nautical/faceted star throughout: `assets/icon.svg` for both mastheads and the favicon/home-screen icon, and `assets/logo.svg` for the larger GO mark. The PWA copies these paths into its inline SVGs and `launcher/icon.svg`; when changing the canonical artwork, synchronize those copies. Prefix inline SVG IDs per placement so gradients and clip paths cannot collide. Do not substitute a solid star, Unicode star, central dot or alternate facet geometry.

The masthead keeps its paper badge so the garnet mark remains legible. The transparent icon uses manifest purpose `any`; it is not a maskable icon. A future maskable export must be a separately designed safe-area asset. Version the icon URL after artwork changes so browsers can fetch the new mark; installed launchers may refresh on their own schedule.
