# Migration to Vite

## Summary
Successfully migrated from Parcel to Vite with vite-plugin-pwa. This simplifies the build process and eliminates the need for post-build scripts.

## What Changed

### Files Removed
- `.parcelrc` - Parcel configuration
- `workbox-config.cjs` - Workbox configuration (now in vite.config.js)
- `post-build.cjs` - Post-build script (no longer needed!)
- `build.sh` - Build shell script (replaced by `npm run build`)
- `src/sw-custom.js` - Custom service worker (now auto-generated)
- `src/manifest.webmanifest` - Moved to vite.config.js

### Files Added
- `vite.config.js` - Vite configuration with vite-plugin-pwa
- `public/` - Directory for static assets (icons, screenshots, favicon)

### Files Modified
- `index.html` - Moved from `src/` to project root (Vite requirement)
  - Updated script/style paths to `/src/main.js` and `/src/main.css`
- `src/ui/serviceWorker.js` - Updated to use vite-plugin-pwa's `registerSW`
- `package.json` - Updated scripts:
  - `dev` - Start Vite dev server
  - `start` - Start Vite dev server with HTTPS
  - `build` - Build with Vite
  - `preview` - Preview production build

## Benefits

1. **No Post-Build Scripts**: vite-plugin-pwa handles everything automatically
2. **Faster Development**: Vite's dev server is significantly faster than Parcel
3. **Better PWA Support**: vite-plugin-pwa is built specifically for PWAs
4. **Automatic Service Worker**: Generated automatically with proper precaching
5. **Cleaner Build**: No need for manifest path fixes or SW registration injection
6. **Modern Tooling**: Vite is actively maintained and widely adopted

## Usage

### Development
```bash
npm run dev        # Start dev server (HTTP)
npm start          # Start dev server (HTTPS)
```

### Build & Deploy
```bash
npm run build      # Build for production
npm run preview    # Preview production build
npm run deploy     # Build and deploy to GitHub Pages
```

### Android
```bash
npm run android:init      # Initialize Android project
npm run android:build     # Build APK
npm run android:install   # Install on device
```

## Configuration

The PWA configuration is now centralized in `vite.config.js`:
- Manifest settings
- Icon configurations
- Screenshot metadata
- Service worker options
- Workbox runtime caching

## Verification

Build output shows:
```
✓ 28 modules transformed.
dist/manifest.webmanifest         1.54 kB
dist/index.html                   8.45 kB
dist/assets/...                   
✓ built in 389ms

PWA v1.1.0
mode      generateSW
precache  30 entries (186.43 KiB)
files generated
  dist/sw.js.map
  dist/sw.js
  dist/workbox-*.js
```

Service worker and manifest are automatically generated with:
- Correct relative paths for GitHub Pages
- Proper precaching configuration
- Update notification support
- Offline functionality
