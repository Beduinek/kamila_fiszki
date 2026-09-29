const CACHE_NAME = "kamila-fiszki-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    clients.claim()
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy =
          response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache => {
            cache.put(
              event.request,
              copy
            );
          });

        return response;
      })
      .catch(() => {
        return caches
          .match(event.request)
          .then(cached => {
            return (
              cached ||
              caches.match("./")
            );
          });
      })
  );
});
