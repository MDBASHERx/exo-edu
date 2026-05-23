const CACHE_NAME = 'exo-cache-v1';
const urlsToCache = [
    '/',                  // Root
    '/index.html',        // Main HTML file
    '/offline.html',      // Offline fallback page
    '/styles/offline.css', // Offline CSS file

    // Avatar images    
    '/avatars/female/admin.png',
    '/avatars/female/female1.png',
    '/avatars/female/female2.png',
    '/avatars/female/female3.png',
    '/avatars/female/student.png',
    '/avatars/female/teacher.png',
    '/avatars/male/male.png',
    '/avatars/male/male1.png',
    '/avatars/male/male2.png',
    '/avatars/male/male3.png',
    '/avatars/male/student.png',
    '/avatars/male/teacher.png',

    // Favicon icons
    '/favicon/android-chrome-192x192.png',
    '/favicon/android-chrome-512x512.png',
    '/favicon/apple-touch-icon.png',
    '/favicon/favicon-16x16.png',
    '/favicon/favicon-32x32.png',
    '/favicon/favicon-96x96.png',
    '/favicon/favicon.ico',
    '/favicon/favicon.svg',
    '/favicon/site.webmanifest',
    '/favicon/web-app-manifest-192x192.png',
    '/favicon/web-app-manifest-512x512.png',

    // GIFs and images
    '/gif/error.gif',
    '/img/logo.jpg',

    // Scripts
    '/js/script.js',

    // Fonts
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            if (event.request.mode === 'navigate')
            {
                return caches.match('/offline.html');
            }
            return caches.match(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName))
                    {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});