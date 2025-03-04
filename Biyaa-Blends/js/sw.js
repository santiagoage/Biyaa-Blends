// Nombre de la caché
const CACHE_NAME = 'biyaa-blends-cache-v1';

// Archivos para cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/cart.css',
  '/css/swiper-bundle.min.css',
  '/js/main.js',
  '/js/cart.js',
  '/js/scrollreveal.min.js',
  '/js/swiper-bundle.min.js',
  '/img/logo.jpg',
  '/img/favicon.png',
  '/img/nopa4.jpg',
  '/img/nosotros.jpg',
  '/img/harina.jpg',
  // Incluye todas las imágenes y recursos necesarios
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado');
  // Limpiar caches antiguas
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red está disponible, usamos respuesta de red y la almacenamos en caché
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        let responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Service Worker: Cacheando nuevo recurso', event.request.url);
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Si la red falla, intentamos usar la caché
        console.log('Service Worker: Recuperando recurso de la caché', event.request.url);
        return caches.match(event.request);
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});