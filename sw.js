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
  // Seite selbst immer beim Server nachfragen, sonst liefert der Browser-Cache bis zu 10 Min. die alte Version
  var req = e.request.mode === 'navigate' ? new Request(e.request.url, { cache: 'no-cache' }) : e.request;
  e.respondWith(fetch(req).then(function (r) {
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('./'); });
  }));
});
