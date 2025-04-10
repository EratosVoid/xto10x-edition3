const CACHE_NAME = "xto10x-v4";
const urlsToCache = [
  "/",
  "/offline.html",
  "/favicon.ico",
  "/images/icon-192x192.png",
  "/images/icon-512x512.png",
];

// Install a service worker
self.addEventListener("install", (event) => {
  // Skip waiting to make the new service worker active immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files");
      return Promise.allSettled(
        urlsToCache.map((url) =>
          cache.add(url).catch((error) => {
            console.error(`Failed to cache ${url}:`, error);
            return Promise.resolve();
          })
        )
      );
    })
  );
});

// Helper function to check if URL scheme is supported
function isValidRequestScheme(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch (error) {
    return true; // Relative URLs are valid
  }
}

// Special handling for manifest.json
function isManifestRequest(url) {
  return url.endsWith("/manifest.json");
}

// Fetch event handler
self.addEventListener("fetch", (event) => {
  // Skip unsupported URL schemes
  if (!isValidRequestScheme(event.request.url)) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If fetch fails, return the offline page
        return caches.match("/offline.html");
      })
    );
    return;
  }

  // Handle manifest request with network-first approach
  if (isManifestRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle other requests using cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache, return cached response
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Check if valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache in the background for future use
          if (event.request.method === "GET") {
            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache
                  .put(event.request, responseToCache)
                  .catch((err) => console.error("Cache put error:", err));
              })
              .catch((err) => console.error("Cache open error:", err));
          }

          return response;
        })
        .catch(() => {
          // For non-HTML requests that fail, return a simple response
          if (event.request.destination === "image") {
            return new Response("", {
              status: 200,
              headers: new Headers({ "Content-Type": "image/png" }),
            });
          }
          return new Response("Network error occurred");
        });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");

  // Claim clients immediately
  event.waitUntil(self.clients.claim());

  // Clean up old cache versions
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Clearing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
