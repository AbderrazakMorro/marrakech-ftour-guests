const CACHE_NAME = 'ftour-manager-v2';
const STATIC_CACHE = 'static-assets-v2';
const DYNAMIC_CACHE = 'dynamic-data-v1';

// Assets to pre-cache for immediate offline availability (the "Shell")
const PRECACHE_ASSETS = [
  '/dashboard',
  '/login',
  '/guests',
  '/scanner',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event: Pre-cache the shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching offline shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Apply strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests
  if (request.method !== 'GET') return;

  // 2. CACHE-FIRST for Static Assets (Scripts, Styles, Images, Fonts)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('/icon-') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;

          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. NETWORK-FIRST for API and HTML Pages (Ensures fresh data with offline fallback)
  const isDynamic = url.pathname.startsWith('/api/') || request.mode === 'navigate';

  if (isDynamic) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Successfully fetched from network, update cache
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, fall back to cache
          console.log('[SW] Network failed, falling back to cache for:', url.pathname);
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            // If it's a page navigation and not in cache, we could return a custom offline page
            if (request.mode === 'navigate') {
              return caches.match('/dashboard'); // Fallback to shell
            }

            return new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }
});
