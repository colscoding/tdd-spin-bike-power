# Building Android APK with Bubblewrap

This project includes Bubblewrap scripts to build an Android APK from your PWA.

## Quick Start

### 1. Check Requirements
```bash
./android-setup.sh
```

This will check if you have:
- Node.js ✓ (you have this)
- Android SDK (needed for building APKs)

### 2. Install Android SDK (if needed)

**Option A: Android Studio (Recommended)**
1. Download from https://developer.android.com/studio
2. Install and run Android Studio
3. Go to Settings > Appearance & Behavior > System Settings > Android SDK
4. Note the SDK location
5. Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Option B: Command Line Tools Only**
```bash
# Download from https://developer.android.com/studio#command-tools
# Extract and set ANDROID_HOME
```

### 3. Build Your APK

```bash
# Deploy your PWA first
npm run deploy

# Initialize Bubblewrap (first time only)
npm run android:init
# Follow prompts - accept defaults or customize

# Build APK
npm run android:build

# Install on device
npm run android:install
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run android:init` | Initialize Bubblewrap TWA project |
| `npm run android:build` | Build Android APK |
| `npm run android:install` | Install APK on connected device |
| `npm run android:update` | Update TWA from deployed manifest |

## Files Created

After initialization, you'll see:
- `twa-manifest.json` - TWA configuration
- `android/` - Android project files
- `app-release-signed.apk` - Your installable APK!

## Digital Asset Links (for URL handling)

After building, get your SHA256 fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
```

Then create `dist/.well-known/assetlinks.json` and redeploy.

## Alternative: PWABuilder (No SDK Required)

If you don't want to install Android SDK:
1. Go to https://www.pwabuilder.com
2. Enter: https://colscoding.github.io/tdd-spin-bike-power/
3. Click "Package for Stores" > "Android"
4. Download APK

## Troubleshooting

**"ANDROID_HOME not set"**
- Install Android SDK and set environment variable
- Or use PWABuilder instead

**"No connected devices"**
- Enable USB debugging on your Android phone
- Connect via USB
- Run `adb devices` to verify

**Build fails**
- Make sure Android SDK Build Tools are installed
- Run `./android-setup.sh` for diagnostics
