#!/bin/sh

set -e  # Exit on error

rm -rf dist/
npx parcel build src/index.html --public-url ./
npx workbox injectManifest workbox-config.cjs

# Inject service worker registration (needed because Parcel transforms JS literals)
node post-build.cjs

echo "✓ Build completed successfully"
