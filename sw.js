/* SetList service worker — Phase 2.
 *
 * Job: make the app installable and fully usable offline after the first visit.
 * Strategy is cache-first for the app shell, which suits us perfectly — the whole
 * app is a handful of static files and all the user's data lives in localStorage,
 * so there's nothing to fetch from a server anyway.
 *
 * Everything here uses RELATIVE paths on purpose. The app deploys to a GitHub
 * Pages subpath (e.g. /SetList/), not the domain root, and relative URLs in a
 * service worker resolve against this file's own location — so the same code
 * works at the root or in a subfolder without edits.
 */

const CACHE = "setlist-v4";

// The app shell to pre-cache on install. Keep this list in sync with the files
// the app actually needs to boot offline.
const ASSETS = [
  "./SetList.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// Install: stash the shell, then take over right away.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: drop any old caches from previous versions, then claim open pages.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first. Serve from cache when we have it; otherwise hit the network
// and tuck a copy away for next time. If both fail on a navigation (truly offline,
// uncached URL), fall back to the app shell so the user still lands in the app.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only deal with GETs — there's nothing to POST to in this app.
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Only cache good, same-origin basic responses; skip opaque/partial ones.
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // Offline and not cached. For page navigations, hand back the shell.
          if (req.mode === "navigate") return caches.match("./SetList.html");
          return Response.error();
        });
    })
  );
});
