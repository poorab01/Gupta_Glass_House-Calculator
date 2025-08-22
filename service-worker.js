const CACHE_NAME = 'window-calculator-v1';
const urlsToCache = [
    '/',
    '/index.html',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    // You would add any other assets like images or fonts here
];

// Install event: caches the necessary files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Service Worker: Cache installation failed', err);
            })
    );
});

// Activate event: deletes old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event: serves cached content first, then updates from network
self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Return cached response if found
            if (response) {
                console.log('Service Worker: Found in cache', event.request.url);
                return response;
            }
            // If not found, fetch from the network
            return fetch(event.request)
                .then(res => {
                    // Cache the new response
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, resClone);
                    });
                    return res;
                })
                .catch(err => {
                    // Handle network errors, e.g., display a custom offline page
                    console.error('Service Worker: Fetch failed', event.request.url, err);
                });
        })
    );
});
