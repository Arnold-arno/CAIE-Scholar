/**
 * sw.js — CAIE Scholar Service Worker v2
 * Strategies: navigation→network-first, assets→cache-first, PDFs→network-first+cache, API→network-only
 */
const CACHE  = 'caie-v2';
const ASSETS = 'caie-assets-v2';
const PDFS   = 'caie-pdfs-v2';
const ALL    = [CACHE, ASSETS, PDFS];
const SHELL  = ['/', '/index.html', '/manifest.json', '/logo.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !ALL.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  // API — always network
  if (url.pathname.startsWith('/api/')) return;
  // PDFs — network first, cache fallback
  if (url.pathname.startsWith('/static/papers/') || url.pathname.startsWith('/static/markschemes/')) {
    e.respondWith(
      fetch(request).then(res => {
        if (res.ok) { const c = res.clone(); caches.open(PDFS).then(cc => cc.put(request, c)); }
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }
  // External CDN — cache first
  if (url.origin !== self.location.origin) {
    e.respondWith(caches.match(request).then(cached => cached || fetch(request).then(res => {
      if (res.ok) caches.open(ASSETS).then(c => c.put(request, res.clone()));
      return res;
    }).catch(() => cached)));
    return;
  }
  // HMR — skip
  if (url.pathname.includes('hot-update') || url.searchParams.has('t')) return;
  // Navigation — network first
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()));
        return res;
      }).catch(() => caches.match(request).then(c => c || caches.match('/index.html')))
    );
    return;
  }
  // Assets — cache first, update in bg
  e.respondWith(caches.match(request).then(cached => {
    const net = fetch(request).then(res => {
      if (res.ok) caches.open(ASSETS).then(c => c.put(request, res.clone()));
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
