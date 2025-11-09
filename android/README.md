# Android / TWA Build

This folder contains all Android-related files for building a Trusted Web Activity (TWA) APK using Bubblewrap.

## Structure

- `android-setup.sh` - Setup script for Bubblewrap CLI
- `android.keystore` - Signing keystore for the APK (keep private!)
- `twa-manifest.json` - Bubblewrap TWA configuration
- `app/` - Android app source and resources
- `build.gradle`, `settings.gradle` - Gradle build configuration
- `gradle/`, `gradlew`, `gradlew.bat` - Gradle wrapper
- `*.apk`, `*.aab` - Built Android packages (gitignored)

## Building the APK

### Prerequisites

1. Deploy the PWA first: `npm run deploy`
2. Install Android SDK (optional, or use PWABuilder.com)

### Commands

Run from the project root:

```bash
# Initialize the TWA project (first time only)
npm run android:init

# Update TWA configuration from deployed manifest
npm run android:update

# Build the APK
npm run android:build

# Install on connected device
npm run android:install
```

Or run the setup script:

```bash
./android/android-setup.sh
```

## Notes

- All Android files are in this folder to keep the project root clean
- The `android.keystore` file should never be committed to version control (except for this project)
- Built APKs are ignored by git and stored in this directory
- The PWA must be deployed before initializing/updating the TWA

## Documentation

- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [Trusted Web Activities](https://developer.chrome.com/docs/android/trusted-web-activity/)
