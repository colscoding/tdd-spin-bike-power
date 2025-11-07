#!/bin/sh

set -e  # Exit on error

rm -rf dist/
npx parcel build src/index.html --public-url ./
npx workbox injectManifest workbox-config.cjs

echo "✓ Build completed successfully"
