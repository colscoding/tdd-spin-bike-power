import 'process'

export const registerServiceWorker = () => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator && process?.env?.NODE_ENV !== 'test') {
        window.addEventListener('load', () => {
            const swUrl = new URL('sw.js', document.baseURI).href;
            navigator.serviceWorker.register(swUrl)
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration.scope);

                    // Check for updates periodically (every hour)
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000);

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                showUpdateNotification(registration);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });

            // Handle when service worker takes control
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        });
    }
}

const showUpdateNotification = (registration) => {
    const updateContainer = document.getElementById('updateNotification');
    if (updateContainer) {
        updateContainer.style.display = 'block';

        const updateButton = document.getElementById('updateButton');
        updateButton.addEventListener('click', () => {
            if (registration.waiting) {
                // Tell the service worker to skip waiting
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        }, { once: true });

        const dismissUpdateButton = document.getElementById('dismissUpdate');
        dismissUpdateButton.addEventListener('click', () => {
            updateContainer.style.display = 'none';
        }, { once: true });
    }
};