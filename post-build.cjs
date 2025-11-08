#!/usr/bin/env node

/**
 * Post-build script to inject service worker registration
 * 
 * Why this is needed:
 * - Parcel transforms ANY JavaScript it processes, including string literals in
 *   navigator.serviceWorker.register('sw.js')
 * - PWABuilder needs to see a simple, inline service worker registration for detection
 * - This script injects it AFTER Parcel is done processing
 * 
 * Note: Manifest path fixing is no longer needed - fixed in .parcelrc
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

// Inject inline service worker registration into index.html
function injectServiceWorkerRegistration() {
    const indexPath = path.join(DIST_DIR, 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.error('❌ index.html not found');
        process.exit(1);
    }

    let html = fs.readFileSync(indexPath, 'utf8');

    // Service worker registration script (for PWABuilder detection)
    const swScript = `<script>if("serviceWorker"in navigator){navigator.serviceWorker.register("sw.js").then(function(r){console.log("SW registered:",r.scope)}).catch(function(e){console.log("SW failed:",e)})}</script>`;

    // Insert before <body> tag
    if (!html.includes('serviceWorker')) {
        html = html.replace('<body>', swScript + '<body>');
        fs.writeFileSync(indexPath, html);
        console.log('✓ Injected service worker registration');
    } else {
        console.log('✓ Service worker registration already present');
    }
}

// Main execution
try {
    console.log('\n🔧 Post-build: Injecting service worker registration...\n');
    injectServiceWorkerRegistration();
    console.log('✅ Post-build complete!\n');
} catch (error) {
    console.error('\n❌ Post-build failed:', error.message);
    process.exit(1);
}
