// Enhanced Service Worker for Prague Tour Guide PWA
// Implements advanced caching, offline functionality, background sync, and push notifications

const CACHE_NAME = 'prague-tours-v2';
const STATIC_CACHE_NAME = 'prague-tours-static-v2';
const DYNAMIC_CACHE_NAME = 'prague-tours-dynamic-v2';
const API_CACHE_NAME = 'prague-tours-api-v1';
const IMAGE_CACHE_NAME = 'prague-tours-images-v1';

// Cache versioning for updates
const CACHE_VERSION = '2.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/en',
  '/de',
  '/fr',
  '/offline',
  '/manifest.json',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/icon-72x72.png',
  '/images/icon-96x96.png',
  '/images/icon-128x128.png',
  '/images/icon-144x144.png',
  '/images/icon-152x152.png',
  '/images/icon-384x384.png',
  '/images/hero-prague-castle.webp',
  '/images/filip-portrait.webp',
  '/fonts/inter-var.woff2',
  '/fonts/playfair-display-var.woff2',
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/tours',
  '/api/availability',
  '/api/csrf',
  '/api/gdpr',
];

// Background sync tags
const SYNC_TAGS = {
  BOOKING_SYNC: 'booking-sync',
  CONTACT_SYNC: 'contact-sync',
  ANALYTICS_SYNC: 'analytics-sync',
};

// Enhanced cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Cache configuration
const CACHE_CONFIG = {
  maxEntries: 100,
  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  purgeOnQuotaError: true,
};

// Background sync queue for offline actions
let backgroundSyncQueue = [];

// Push notification configuration
const NOTIFICATION_CONFIG = {
  icon: '/images/icon-192x192.png',
  badge: '/images/icon-72x72.png',
  vibrate: [200, 100, 200],
  requireInteraction: true,
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isImage(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  } else if (isAPIRequest(url.pathname)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  switch (event.tag) {
    case SYNC_TAGS.BOOKING_SYNC:
      event.waitUntil(syncBookings());
      break;
    case SYNC_TAGS.CONTACT_SYNC:
      event.waitUntil(syncContactForms());
      break;
    case SYNC_TAGS.ANALYTICS_SYNC:
      event.waitUntil(syncAnalytics());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Prague Tours',
    body: 'You have a new update!',
    ...NOTIFICATION_CONFIG,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions || [
        {
          action: 'view',
          title: 'View Details',
          icon: '/images/icon-72x72.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    })
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'view' || !action) {
    // Open the app or navigate to specific page
    const urlToOpen = data?.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.focus();
              if (data?.url) {
                client.navigate(data.url);
              }
              return;
            }
          }

          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Cache strategies implementation
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    console.error('Network first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp|avif)$/);
}

function isImage(pathname) {
  return pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/);
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

// Background sync for offline bookings
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-booking') {
    event.waitUntil(syncOfflineBookings());
  }
});

async function syncOfflineBookings() {
  try {
    // Get offline booking drafts from IndexedDB
    const db = await openBookingDB();
    const transaction = db.transaction(['bookingDrafts'], 'readonly');
    const store = transaction.objectStore('bookingDrafts');
    const drafts = await getAllFromStore(store);

    console.log(`Syncing ${drafts.length} offline booking drafts...`);

    for (const draft of drafts) {
      try {
        // Attempt to submit the booking
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft.data),
        });

        if (response.ok) {
          // Remove successfully synced draft
          await removeFromBookingDB(draft.id);
          console.log(`Successfully synced booking draft ${draft.id}`);
        } else {
          console.error(`Failed to sync booking draft ${draft.id}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error syncing booking draft ${draft.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline bookings:', error);
  }
}

// IndexedDB utilities for offline booking storage
async function openBookingDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PragueToursOffline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('bookingDrafts')) {
        const store = db.createObjectStore('bookingDrafts', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeFromBookingDB(id) {
  const db = await openBookingDB();
  const transaction = db.transaction(['bookingDrafts'], 'readwrite');
  const store = transaction.objectStore('bookingDrafts');
  return store.delete(id);
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/icon-192x192.png',
      badge: '/images/badge-72x72.png',
      data: data.url,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  const SYNC_TAGS = {
    BOOKING_SYNC: 'booking-sync',
    CONTACT_SYNC: 'contact-sync',
    ANALYTICS_SYNC: 'analytics-sync',
  };

  switch (event.tag) {
    case SYNC_TAGS.BOOKING_SYNC:
      event.waitUntil(syncBookings());
      break;
    case SYNC_TAGS.CONTACT_SYNC:
      event.waitUntil(syncContactForms());
      break;
    case SYNC_TAGS.ANALYTICS_SYNC:
      event.waitUntil(syncAnalytics());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Prague Tours',
    body: 'You have a new update!',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions || [
        {
          action: 'view',
          title: 'View Details',
          icon: '/images/icon-72x72.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    })
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'view' || !action) {
    // Open the app or navigate to specific page
    const urlToOpen = data?.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.focus();
              if (data?.url) {
                client.navigate(data.url);
              }
              return;
            }
          }

          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync functions
async function syncBookings() {
  console.log('Syncing offline bookings...');

  try {
    const cache = await caches.open('offline-requests');
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes('/api/booking') && request.method === 'POST') {
        try {
          const response = await fetch(request.clone());
          if (response.ok) {
            await cache.delete(request);
            console.log('Booking synced successfully');

            // Show success notification
            await self.registration.showNotification('Booking Confirmed', {
              body: 'Your tour booking has been confirmed!',
              icon: '/images/icon-192x192.png',
              badge: '/images/icon-72x72.png',
              tag: 'booking-success',
            });
          }
        } catch (error) {
          console.error('Failed to sync booking:', error);
        }
      }
    }
  } catch (error) {
    console.error('Booking sync failed:', error);
  }
}

async function syncContactForms() {
  console.log('Syncing offline contact forms...');

  try {
    const cache = await caches.open('offline-requests');
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes('/api/contact') && request.method === 'POST') {
        try {
          const response = await fetch(request.clone());
          if (response.ok) {
            await cache.delete(request);
            console.log('Contact form synced successfully');
          }
        } catch (error) {
          console.error('Failed to sync contact form:', error);
        }
      }
    }
  } catch (error) {
    console.error('Contact form sync failed:', error);
  }
}

async function syncAnalytics() {
  console.log('Syncing offline analytics...');

  try {
    const cache = await caches.open('offline-requests');
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes('analytics') || request.url.includes('gtag')) {
        try {
          await fetch(request.clone());
          await cache.delete(request);
        } catch (error) {
          console.error('Failed to sync analytics:', error);
        }
      }
    }
  } catch (error) {
    console.error('Analytics sync failed:', error);
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Log performance metrics for monitoring
    console.log('Performance metrics:', event.data.metrics);
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEANUP_CACHES') {
    event.waitUntil(cleanupOldCaches());
  }
});

// Enhanced cache management
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name =>
    !name.includes('v2') &&
    (name.includes('prague-tours') || name.includes('static') || name.includes('dynamic'))
  );

  return Promise.all(oldCaches.map(name => caches.delete(name)));
}

// Utility functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|woff2|woff|ttf|eot)$/);
}

function isImage(pathname) {
  return pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/);
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

function shouldCache(response) {
  return response.status === 200 && response.type === 'basic';
}
