// Service Worker для VortexMessenger PWA

const CACHE_NAME = 'vibe-messenger-v1';
const urlsToCache = [
    '/src/index.html',
    '/src/style.css',
    '/src/app.js',
    '/manifest/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем кэшированный ресурс, если он есть
                if (response) {
                    return response;
                }
                // Иначе делаем запрос к сети
                return fetch(event.request);
            })
    );
});