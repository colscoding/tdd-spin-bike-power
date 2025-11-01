# Mobile and Desktop App Deployment Guide

This guide provides step-by-step instructions for deploying this spin bike power app as native mobile and desktop applications.

## Table of Contents
- [Android App (Capacitor)](#android-app-capacitor)
- [iOS App (Capacitor)](#ios-app-capacitor)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [Electron Desktop App](#electron-desktop-app)
- [Browser Extension](#browser-extension)

---

## Android App (Capacitor)

### Prerequisites
- Node.js and npm installed
- Android Studio installed
- Java Development Kit (JDK) 11 or higher
- Google Play Console account ($25 one-time fee)

### Step 1: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

When prompted:
- **App name**: Spin Bike Power Tracker
- **Package ID**: com.colscoding.spinbikepower (reverse domain notation)
- **Web asset directory**: `.` (current directory since files are in root)

### Step 2: Configure Capacitor
Edit `capacitor.config.json`:
```json
{
  "appId": "com.colscoding.spinbikepower",
  "appName": "Spin Bike Power",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

### Step 3: Add Android Platform
```bash
npx cap add android
```

### Step 4: Build and Sync
```bash
npx cap sync android
npx cap open android
```

### Step 5: Configure Android Project
In Android Studio:
1. Update `android/app/build.gradle`:
   - Set `minSdkVersion` to 22 or higher
   - Set `targetSdkVersion` to 33 or latest
   - Update `versionCode` and `versionName`

2. Configure permissions in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Step 6: Test on Device/Emulator
1. Connect Android device or start emulator
2. In Android Studio: **Run** → **Run 'app'**
3. Test Bluetooth functionality thoroughly

### Step 7: Generate Signed APK/AAB
1. **Build** → **Generate Signed Bundle/APK**
2. Create new keystore (save credentials securely!)
3. Choose **Android App Bundle (.aab)** for Play Store
4. Build release version

### Step 8: Deploy to Google Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new application
3. Fill in store listing details:
   - App name, description, screenshots
   - Category: Health & Fitness
   - Content rating questionnaire
4. Upload AAB file
5. Set up pricing (Free/Paid)
6. Submit for review (typically 1-7 days)

---

## iOS App (Capacitor)

### Prerequisites
- macOS computer
- Xcode 14+ installed
- Apple Developer account ($99/year)
- CocoaPods installed: `sudo gem install cocoapods`

### Step 1: Add iOS Platform
```bash
npx cap add ios
```

### Step 2: Open in Xcode
```bash
npx cap open ios
```

### Step 3: Configure iOS Project
In Xcode:
1. Select project root → **Signing & Capabilities**
2. Select your Team (Apple Developer account)
3. Update Bundle Identifier: `com.colscoding.spinbikepower`
4. Set deployment target to iOS 13.0 or higher

### Step 4: Configure Permissions
Edit `ios/App/App/Info.plist`:
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to connect to fitness devices</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app needs Bluetooth to connect to your bike sensors</string>
```

### Step 5: Test on Simulator/Device
1. Select target device (simulator or connected iPhone)
2. Click **Run** button (or Cmd+R)
3. Test all Bluetooth features

### Step 6: Archive for App Store
1. Select **Any iOS Device** as target
2. **Product** → **Archive**
3. Wait for archive to complete
4. Click **Distribute App**

### Step 7: Submit to App Store
1. Choose **App Store Connect**
2. Select provisioning profile
3. Upload to App Store
4. Go to [App Store Connect](https://appstoreconnect.apple.com)
5. Fill in app metadata:
   - Screenshots (required for all device sizes)
   - Description, keywords, support URL
   - Privacy policy URL (required)
6. Submit for review (typically 1-3 days)

---

## Progressive Web App (PWA)

### Step 1: Create Web App Manifest
Create `manifest.json`:
```json
{
  "name": "Spin Bike Power Tracker",
  "short_name": "Bike Power",
  "description": "Track your spin bike power, cadence, and heart rate",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Step 2: Create Service Worker
Create `service-worker.js`:
```javascript
const CACHE_NAME = 'spin-bike-power-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
  '/main.css',
  '/MeasurementsState.js',
  '/connect-power.js',
  '/connect-cadence.js',
  '/connect-heartrate.js',
  '/create-tcx.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Step 3: Register Service Worker
Add to `index.html` before closing `</body>`:
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  }
</script>
```

### Step 4: Link Manifest in HTML
Add to `<head>` in `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2196F3">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Bike Power">
```

### Step 5: Create Icons
Generate icons in various sizes (72, 96, 128, 144, 152, 192, 384, 512px) and place in `icons/` folder.

### Step 6: Test PWA
1. Deploy to HTTPS server (required for PWA)
2. Open in Chrome/Edge
3. Check for "Install" prompt in address bar
4. Use Chrome DevTools → Application → Manifest to verify

### Step 7: Deploy
Deploy to any static hosting (GitHub Pages, Netlify, Vercel, etc.) with HTTPS enabled.

---

## Electron Desktop App

### Step 1: Install Electron
```bash
npm install --save-dev electron electron-builder
```

### Step 2: Create Main Process File
Create `electron-main.js`:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableBluetoothAPI: true
    }
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Step 3: Update package.json
Add to `package.json`:
```json
{
  "main": "electron-main.js",
  "scripts": {
    "electron": "electron .",
    "electron-build": "electron-builder"
  },
  "build": {
    "appId": "com.colscoding.spinbikepower",
    "productName": "Spin Bike Power",
    "directories": {
      "output": "dist"
    },
    "files": [
      "**/*",
      "!test-results/**/*",
      "!playwright-report/**/*",
      "!node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "icons/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "icons/icon.icns",
      "category": "public.app-category.healthcare-fitness"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "icons/icon.png",
      "category": "Utility"
    }
  }
}
```

### Step 4: Test Locally
```bash
npm run electron
```

### Step 5: Build for Distribution
```bash
# Build for current platform
npm run electron-build

# Build for specific platforms
npm run electron-build -- --win --x64
npm run electron-build -- --mac
npm run electron-build -- --linux
```

### Step 6: Distribute
- **Windows**: NSIS installer in `dist/` folder
- **macOS**: DMG file in `dist/` folder (requires code signing for distribution)
- **Linux**: AppImage and .deb in `dist/` folder

For Microsoft Store distribution:
1. Create Windows APPX package
2. Submit to [Partner Center](https://partner.microsoft.com/dashboard)

---

## Browser Extension

### Step 1: Create Manifest
Create `manifest.json` (Chrome/Edge v3):
```json
{
  "manifest_version": 3,
  "name": "Spin Bike Power Tracker",
  "version": "1.0.0",
  "description": "Track your spin bike power, cadence, and heart rate",
  "permissions": [
    "bluetooth"
  ],
  "action": {
    "default_popup": "index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

### Step 2: Create Extension Package
```bash
# Create a zip file with all necessary files
zip -r spin-bike-power-extension.zip \
  index.html \
  main.js \
  main.css \
  manifest.json \
  icons/ \
  *.js \
  -x "*.test.js" "*.spec.js" "playwright*" "node_modules/*"
```

### Step 3: Test Extension Locally
**Chrome**:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select project folder

**Edge**:
1. Go to `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select project folder

### Step 4: Submit to Chrome Web Store
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time developer fee
3. Click "New Item"
4. Upload ZIP file
5. Fill in store listing:
   - Detailed description
   - Screenshots (1280x800 or 640x400)
   - Category: Productivity or Health & Fitness
   - Privacy policy (required for extensions using Bluetooth)
6. Submit for review (typically 1-3 days)

### Step 5: Submit to Microsoft Edge Add-ons
1. Go to [Partner Center](https://partner.microsoft.com/dashboard)
2. Create developer account (free)
3. Submit new extension
4. Upload ZIP file
5. Fill in listing details
6. Submit for review (typically 1-3 days)

---

## Testing Checklist

Before releasing any app version:

- [ ] Test Bluetooth connectivity on target platform
- [ ] Verify all UI elements are responsive
- [ ] Test data export functionality
- [ ] Check for memory leaks during extended use
- [ ] Test offline functionality (if applicable)
- [ ] Verify permissions are requested properly
- [ ] Test on multiple device sizes/resolutions
- [ ] Check for console errors
- [ ] Validate data accuracy against known devices
- [ ] Test edge cases (disconnection, low battery, etc.)

---

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [PWA Documentation (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Chrome Extension Guide](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
