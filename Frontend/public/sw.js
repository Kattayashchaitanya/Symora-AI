const CACHE_NAME = "symoraai-v2";
const APP_SHELL_URLS = ["/", "/index.html"];

// Install Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First Strategy for API calls, Cache First for assets
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // API calls: Network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // Return offline response for API calls
          return new Response(
            JSON.stringify({
              offline: true,
              message: "You are offline. Limited functionality available.",
            }),
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({
                "Content-Type": "application/json",
              }),
            }
          );
        });
      })
    );
  } else {
    // App/assets: network first to avoid stale bundles, fallback to cache when offline
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && event.request.method === "GET") {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
