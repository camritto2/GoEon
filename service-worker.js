const CACHE_NAME = 'goeon-cache';

// Installation : on met en cache les fichiers de base
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/navbar.html',
  '/navbar.css',
  '/global.css',
  '/index.css',
  '/script.js',
  '/images/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting(); // Active immédiatement la nouvelle version
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Stratégie "réseau d'abord" : on essaie toujours le réseau,
// et on utilise le cache uniquement si hors-ligne
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // On met à jour le cache avec la version fraîche
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request)) // Hors-ligne : on sert le cache
  );
});
