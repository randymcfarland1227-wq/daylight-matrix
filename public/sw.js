/* Daylight Matrix service worker: keeps the app usable offline at the gym.
   HTML is network-first (so a new build is never trapped behind a stale cache);
   hashed assets are cache-first. Your logs live in localStorage and are never touched here.
   Round 7 UX pass keeps Round 6 video rules.
   Round 6: exercise clips play through Vimeo's official player iframe. Vimeo (vimeo.com, player.vimeo.com, vimeocdn.com) is NEVER cached
   or intercepted here: those requests go straight to the network, and offline the app shows the photos instead.
   The app loads nothing from YouTube. Any YouTube / ytimg / googlevideo request is also left alone: never intercepted or cached.
   The only cross-origin thing cached is the exercise photo set (Free Exercise DB, public domain): cache-first, so photos you have seen work offline. */
const THIRD_PARTY_MEDIA = /(^|\.)(vimeo\.com|vimeocdn\.com|youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com|ggpht\.com)$/;
const VERSION = "dm-v8-daily-flow";
const PHOTOS = "dm-photos-v1"; // real exercise photos: kept across app versions, capped below
const PHOTO_HOST = "raw.githubusercontent.com";
const PHOTO_PATH = "/yuhonas/free-exercise-db/";
const PHOTO_MAX = 400;
const CORE = ["./", "./manifest.webmanifest", "./favicon.svg", "./icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => /^dm-v\d/.test(k) && k !== VERSION && k !== PHOTOS).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Only Daylight's own files. Other sites share this address in their own folders (/frontier/,
  // /flow-hub/, /peculiar-command-center/…) and must never be answered from this cache — it was
  // serving Life Hub old copies of its data. Bumping VERSION above also clears what was saved.
  if (url.origin === self.location.origin && /^\/[^/]+\//.test(url.pathname) && !/^\/(assets|__grok)\//.test(url.pathname)) return;
  if (THIRD_PARTY_MEDIA.test(url.hostname)) return; // Vimeo / YouTube: never intercepted, never cached
  if (req.method === "GET" && url.hostname === PHOTO_HOST && url.pathname.startsWith(PHOTO_PATH) && /\.(jpe?g|png|webp)$/i.test(url.pathname)) {
    e.respondWith(
      caches.open(PHOTOS).then((c) =>
        c.match(req).then(
          (hit) =>
            hit ||
            fetch(req).then((res) => {
              if (res.ok && res.type !== "opaque") {
                c.put(req, res.clone()).then(() => c.keys()).then((ks) => ks.length > PHOTO_MAX && c.delete(ks[0])).catch(() => {});
              }
              return res;
            }),
        ),
      ),
    );
    return;
  }
  if (req.method !== "GET" || THIRD_PARTY_MEDIA.test(url.hostname) || url.origin !== self.location.origin) return;
  const isDoc = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isDoc) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./"))),
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
