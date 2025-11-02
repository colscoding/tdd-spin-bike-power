#!/bin/sh


rm -rf dist/
parcel build src/index.html --public-url ./
./node_modules/workbox-cli/build/bin.js generateSW workbox-config.cjs
