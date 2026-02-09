const CACHE_NAME = 'barbershop-v2'; // Changed to v2 to force update
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'img.png', // Caching the online icon
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500&display=swap'
];

// 1. Install Service Worker & Cache Files
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Force this SW to become active immediately
});

// 2. Activate & Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. Fetch Strategy
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // CRITICAL: Do NOT cache the Google Script API calls
  if (url.hostname.includes('script.google.com')) {
    return; // Let the network handle it directly
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).catch(() => {
        // Optional: Return a custom offline page here if needed
        // return caches.match('./offline.html');
      });
    })
  );
});