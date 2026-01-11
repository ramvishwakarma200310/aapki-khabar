const CACHE_NAME = "aapki-khabar-cache-v2"; // version change
const urlsToCache = ["./", "./manifest.json"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first strategy for index/news
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Always try network first for HTML
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() => caches.match("./"))
    );
    return;
  }

  // cache-first for other assets
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
