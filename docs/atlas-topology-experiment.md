# Shared Atlas geography experiment

This is an isolated experiment; it does not modify Android or public PWA
map rendering, hit targets, route geometry, themes, nautical artwork, animation,
or APK version.

It reads the existing 51 state/DC geometries and four US listening-region
assignments from assets/us-region-state-boundaries.json. At build time,
topojson-server constructs shared arcs without quantizing coordinates.
topojson-client mesh retains coastlines plus edges where adjacent regions
differ, but discards internal same-region state seams.

The experiment independently compares every resulting segment to the
existing labUSRegionBorderGeometry function, checks for surviving internal
state borders, and draws both outputs using D3 Robinson, D3 Cahill-Keyes
and D3 orthographic globe. GitHub Actions uploads the standalone
comparison.html and metrics.json. All dependencies are temporary and
pinned; none are shipped to the user.

Success requires identical visible segment coverage, no shared internal
state seams, and valid projected paths. This is not a runtime performance,
touch-accuracy, transition-speed, or clipping quality certification.
If valid, a later small PR could precompute the mesh at build time and
deliver only GeoJSON lines to existing renderers. Preserve MapLibre as
the Globe renderer unless separately justified; keep PR #227 independent.

To run, use the workflow named Atlas topology experiment (no deployment).
