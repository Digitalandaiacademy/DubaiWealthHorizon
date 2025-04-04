// DubaiWealth Horizon Service Worker
const CACHE_NAME = 'dwh-cache-v2'; // Increment this version when deploying updates
const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Assets to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Network-first strategy with cache fallback and expiration check
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip browser-sync and socket.io requests
  if (event.request.url.includes('browser-sync') || 
      event.request.url.includes('socket.io')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            // Store the fresh response with timestamp
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-fetched-on', new Date().getTime().toString());
            
            const responseWithTimestamp = new Response(
              responseToCache.body, 
              {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              }
            );
            
            cache.put(event.request, responseWithTimestamp);
          });

        return response;
      })
      .catch(() => {
        // Network failed, try the cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              // Check if the cached response has expired
              const fetchedOn = cachedResponse.headers.get('sw-fetched-on');
              if (fetchedOn) {
                const fetchedOnTime = parseInt(fetchedOn);
                const now = new Date().getTime();
                
                if (now - fetchedOnTime > CACHE_EXPIRATION) {
                  // Cached response has expired, remove it
                  caches.open(CACHE_NAME)
                    .then(cache => cache.delete(event.request));
                  
                  console.log('Cached response expired');
                  return cachedResponse; // Still return it as fallback
                }
              }
              return cachedResponse;
            }
          });
      })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        console.log('Cache cleared successfully');
        // Notify the client that the cache was cleared
        event.ports[0].postMessage({ success: true });
      })
      .catch(error => {
        console.error('Error clearing cache:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});