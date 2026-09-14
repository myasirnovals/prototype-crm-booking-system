/* NutriFlow app shell cache. User, health, and API data are never cached. */
const CACHE_NAME = 'nutriflow-shell-v1';
const APP_SHELL = ['/', '/index.html', '/dashboard.html', '/login.html', '/manifest.webmanifest', '/icons/nutriflow-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Do not cache third-party resources, API responses, admin area, or content
  // explicitly marked sensitive by the server.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) return;

  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok && !/no-store/i.test(response.headers.get('Cache-Control') || '')) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match('/dashboard.html')))
  );
});
