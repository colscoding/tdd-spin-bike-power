#!/usr/bin/env node
/**
 * Build script to generate service worker with timestamped cache name
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate timestamp-based cache version
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const cacheName = `spin-bike-power-${timestamp}`;

// Read the service worker template
const swTemplate = readFileSync(join(__dirname, 'sw.js'), 'utf-8');

// Replace the cache name placeholder
const swContent = swTemplate.replace(
    /const CACHE_NAME = ['"].*?['"];/,
    `const CACHE_NAME = '${cacheName}';`
);

// For build, we need to handle hashed filenames from Parcel
// Use a more flexible caching strategy
const buildSwContent = swContent.replace(
    /const urlsToCache = \[[\s\S]*?\];/,
    `const urlsToCache = [
    './',
    './index.html',
    './manifest.webmanifest'
];`
);

// Write to dist directory
const distPath = join(__dirname, 'dist', 'sw.js');
writeFileSync(distPath, buildSwContent, 'utf-8');

console.log(`✓ Service worker built with cache name: ${cacheName}`);
console.log(`✓ Written to: ${distPath}`);
