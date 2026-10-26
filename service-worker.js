
const CACHE_NAME = "mind-math-motion-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./schedule.html",
    "./download.html",
    "./style.css",
    "./script.js",
    "./schedule.js",
    "./manifest.json",
    "./Logo.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// Install the service worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

// Remove old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

// Fetch fresh pages when online
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    // HTML pages: network first
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();

                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, copy);
                        });
                    }

                    return response;
                })
                .catch(() => caches.match(event.request))
        );

        return;
    }

    // Other assets: cache first
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});
