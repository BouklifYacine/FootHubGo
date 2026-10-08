/*
 * FootHubGo service worker (hand-written, no build step). Scope: the whole site, registered by the
 * app shell only. Rules:
 * - pages (navigations) always go to the network; offline, the static /offline.html is shown.
 *   The HTML of the app (signed-in pages) is NEVER cached.
 * - API, auth, server actions (POST), Socket.IO: not touched at all.
 * - only immutable build assets (/_next/static, hashed names) and the icons are cached.
 * - push: shows the notification; tap: focuses an open tab on the notification's page or opens one.
 * Bump VERSION to drop the old caches.
 */
const VERSION = "v1";
const PRECACHE = `fhg-precache-${VERSION}`;
const ASSETS = `fhg-assets-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [OFFLINE_URL, "/icons/icon-192.png", "/icons/badge-96.png"];
const MAX_ASSETS = 150;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("fhg-") && ![PRECACHE, ASSETS].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const isCacheableAsset = (url) =>
  url.origin === self.location.origin && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"));

async function trimAssets() {
  const cache = await caches.open(ASSETS);
  const keys = await cache.keys();
  for (const request of keys.slice(0, Math.max(0, keys.length - MAX_ASSETS))) await cache.delete(request);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(ASSETS).then((cache) => cache.put(request, copy).then(trimAssets));
  }
  return response;
}

async function networkOrOffline(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.mode === "navigate") {
    event.respondWith(networkOrOffline(request));
    return;
  }
  if (isCacheableAsset(url)) event.respondWith(cacheFirst(request));
  // Everything else (API, auth, RSC payloads, sockets, other origins): the browser's default.
});

/** Only a page of this app: never an external link from a payload. */
function appUrl(value) {
  return typeof value === "string" && value.startsWith("/app") && !value.startsWith("//") ? value : "/app";
}

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }
  const title = typeof payload.title === "string" && payload.title ? payload.title : "FootHubGo";
  const options = {
    body: typeof payload.body === "string" ? payload.body : "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    lang: "fr",
    data: { url: appUrl(payload.url) },
  };
  if (typeof payload.tag === "string" && payload.tag) {
    options.tag = payload.tag;
    // Same tag: replaces the previous notification and still alerts.
    options.renotify = true;
  }
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(appUrl(event.notification.data && event.notification.data.url), self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const same = windows.find((client) => client.url === target);
      if (same) return same.focus();
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        if ("navigate" in open) {
          try {
            return await open.navigate(target);
          } catch {
            // Not controlled by this worker: open a new window below.
          }
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
