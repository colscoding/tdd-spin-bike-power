#!/bin/sh

set -e  # Exit on error

rm -rf dist/
npx parcel build src/index.html --public-url ./
npx workbox injectManifest workbox-config.cjs

# Fix manifest paths - replace absolute paths with relative for GitHub Pages
sed -i 's|"/mobile|"mobile|g' dist/manifest.webmanifest
sed -i 's|"/desktop|"desktop|g' dist/manifest.webmanifest
sed -i 's|"/icon|"icon|g' dist/manifest.webmanifest

# Add inline service worker registration for PWABuilder detection
# Insert before <body> tag in the minified HTML
sed -i 's|<body>|<script>if("serviceWorker"in navigator){navigator.serviceWorker.register("sw.js").then(function(r){console.log("SW registered:",r.scope)}).catch(function(e){console.log("SW failed:",e)})}</script><body>|' dist/index.html

echo "✓ Build completed successfully"
