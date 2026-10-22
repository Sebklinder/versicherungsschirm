// Offline-Cache: immer zuerst das Netz (Updates kommen sofort an), ohne Netz die zuletzt geladene Version
// shortcut: bei sehr langsamem WLAN wartet die Seite aufs Netz statt sofort den Cache zu nehmen; bei Bedarf Timeout ergänzen
var CACHE = 'versicherungsschirm';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.add('./'); }));
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('./'); });
  }));
});
