# Spin Bike Power

Track your spin bike: power, cadence, and heart rate with Bluetooth sensors.

## Live App

🚴 **[https://colscoding.github.io/tdd-spin-bike-power/](https://colscoding.github.io/tdd-spin-bike-power/)**

## Features

- **Real-time Metrics**: Monitor power (watts), cadence (RPM), and heart rate (BPM)
- **Bluetooth Connectivity**: Connect to Bluetooth cycling sensors
- **Timer**: Track workout duration
- **Data Export**: Download workout data as JSON, TCX, and CSV formats
- **PWA Support**: Install as a Progressive Web App on mobile and desktop
- **Offline Capable**: Works without an internet connection once installed

## Tech Stack

- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa with Workbox
- **Testing**: Node.js test runner, Playwright
- **Deployment**: GitHub Pages
- **Android**: Bubblewrap TWA (see `android/` folder)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Android APK

To build an Android APK, see the [`android/` folder](./android/README.md) for instructions.

```bash
npm run android:init    # Initialize (first time)
npm run android:build   # Build APK
npm run android:install # Install on device
```
