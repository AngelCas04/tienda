const CACHE_NAME = 'tienda-app-v1';

// Evento de instalación: Buen lugar para cachear recursos críticos si los tuviéramos listados
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Estrategia: Network falling back to Cache (Intentar red, si falla, usar caché)
// Esto asegura que siempre tengas la última versión si hay internet, pero funcione si no hay.
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, la clonamos al caché
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si falla la red, intentamos servir desde el caché
        return caches.match(event.request);
      })
  );
});