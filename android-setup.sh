#!/bin/sh

# Bubblewrap Android APK Setup Script
# This script helps you set up and build an Android APK from your PWA

set -e

echo "📱 Bubblewrap Android APK Setup"
echo "================================\n"

# Check if bubblewrap is available
if ! command -v bubblewrap >/dev/null 2>&1; then
    echo "Installing @bubblewrap/cli globally..."
    npm install -g @bubblewrap/cli
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "\n⚠️  Warning: Android SDK not found!"
    echo "   Bubblewrap requires Android SDK to build APKs."
    echo "   You can:"
    echo "   1. Install Android Studio: https://developer.android.com/studio"
    echo "   2. Set ANDROID_HOME or ANDROID_SDK_ROOT environment variable"
    echo "   3. Or use PWABuilder.com instead (no SDK needed)\n"
fi

# Check if twa-manifest.json exists (Bubblewrap project already initialized)
if [ -f "twa-manifest.json" ]; then
    echo "✓ Bubblewrap project already initialized"
    echo "\nAvailable commands:"
    echo "  npm run android:update  - Update TWA from deployed manifest"
    echo "  npm run android:build   - Build APK"
    echo "  npm run android:install - Install APK on connected device"
else
    echo "Bubblewrap project not initialized yet."
    echo "\nSteps to create Android APK:"
    echo "1. Deploy your PWA first:  npm run deploy"
    echo "2. Initialize TWA project: npm run android:init"
    echo "3. Build the APK:          npm run android:build"
    echo "4. Install on device:      npm run android:install\n"
    
    echo "After initialization, you can customize:"
    echo "  - Package name in twa-manifest.json"
    echo "  - App colors and icons"
    echo "  - Digital Asset Links\n"
fi

echo "Documentation: https://github.com/GoogleChromeLabs/bubblewrap"
echo "================================\n"
