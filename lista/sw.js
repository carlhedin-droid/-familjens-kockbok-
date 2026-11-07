/* Inköpslistan: nätet först, cache som reserv – så att listan öppnas även utan täckning i butiken.
   Firestore sköter själva datan offline. */
const CACHE = 'handla-v1';
const HOSTS = [self.location.origin, 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || !HOSTS.includes(url.origin)) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: url.origin === self.location.origin }).then(r => r || Response.error())));
});
