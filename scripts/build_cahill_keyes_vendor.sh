#!/usr/bin/env bash
# Regenerates a static, offline-only browser bundle. No runtime CDN requests.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --no-save --package-lock=false --ignore-scripts \
  d3-geo@3.1.1 d3-geo-polygon@2.0.1 esbuild@0.25.12
./node_modules/.bin/esbuild android-lab/web/cahill-keyes-entry.js \
  --bundle --platform=browser --format=iife --target=es2020 \
  --minify --legal-comments=inline \
  --outfile=android-lab/web/cahill-keyes-vendor.js
test -s android-lab/web/cahill-keyes-vendor.js
