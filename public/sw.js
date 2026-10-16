// Progressive Web App Service Worker for Uomboni Secondary School (NECTA S0486)
// Provides fast offline resilience for public assets and custom offline navigation fallback.
// PRIVACY DIRECTIVE: Never caches private student records, exam results, or authenticated API endpoints.

const CACHE_VERSION = 'uomboni-pwa-v12';
const STATIC_CACHE = `uomboni-static-${CACHE_VERSION}`;
const FONTS_CACHE = `uomboni-fonts-${CACHE_VERSION}`;
const MEDIA_CACHE = `uomboni-media-${CACHE_VERSION}`;

// Public assets safe for pre-caching
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/uomboni_official_logo.jpg'
];

// Install Event - Precache safe public shells and offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn('PWA Precache skipped:', asset, err?.message);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Event - Purge deprecated caches and claim clients immediately for auto-updates
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, FONTS_CACHE, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            console.log('PWA: Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Strategic routing with strict privacy separation
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // 1. STRICT PRIVACY & AUTHENTICATED ENDPOINTS - NEVER CACHE
  // Private student information, examination results, authenticated API responses, and admin operations
  if (
    url.pathname.startsWith('/api/results') ||
    url.pathname.startsWith('/api/school-data') ||
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/secure') ||
    url.pathname.startsWith('/api/student') ||
    url.pathname.startsWith('/api/payment') ||
    request.headers.has('Authorization') ||
    request.headers.has('X-Staff-Auth')
  ) {
    // Network only with no caching
    return;
  }

  // 2. DEV TOOLING & MODULE BYPASS (for Vite dev server speed)
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.includes('node_modules') ||
    url.pathname.includes('vite') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // 3. NAVIGATION REQUESTS (HTML Pages) - Network-first falling back to offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Try to match cached page first
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // Fallback to custom offline.html
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;

          return new Response(
            'Uko nje ya mtandao (Offline). Tafadhali unganisha intaneti na upakie upya.',
            { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 4. GOOGLE FONTS - Cache-First with long expiration
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONTS_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => new Response('', { status: 408, headers: { 'Content-Type': 'text/css' } }));
      })
    );
    return;
  }

  // 5. PUBLIC STATIC MEDIA & IMAGES - Stale-While-Revalidate
  const isMedia = url.pathname.match(/\.(jpg|jpeg|png|svg|webp|gif|ico|woff|woff2)$/i);
  if (isMedia) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 6. DEFAULT - Pass through to network
});

// Message listener for manual skip waiting or status checks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
