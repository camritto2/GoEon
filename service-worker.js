const CACHE_NAME = 'goeon-cache';

// Installation : on met en cache les fichiers de base
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/navbar.html',
  '/navbar.css',
  '/global.css',
  '/index.css',
  '/pokemon.css',
  '/script.js',
  '/manifest.json',
  '/Images/icon-192.png',
  '/Images/icon-512.png'
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
        // On ne met en cache que les réponses valides :
        // - requêtes GET uniquement (pas de POST, etc.)
        // - schéma http(s) uniquement (évite chrome-extension:// qui fait planter cache.put)
        // - réponse OK uniquement (évite de mettre en cache un 404 pendant un déploiement)
        if (e.request.method === 'GET' && e.request.url.startsWith('http') && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Hors-ligne : on sert le cache
        return caches.match(e.request).then(reponseCache => {
          if (reponseCache) return reponseCache;
          // Page jamais visitée : on retombe sur l'accueil plutôt qu'une erreur navigateur
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
