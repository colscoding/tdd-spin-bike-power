import 'process'

export const registerServiceWorker = () => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator && process?.env?.NODE_ENV !== 'test') {
        window.addEventListener('load', () => {
            const swUrl = new URL('sw.js', document.baseURI).href;
            navigator.serviceWorker.register(swUrl)
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
}