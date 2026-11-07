const CACHE_NAME = "persiajam-main-v7";

const STATIC_ASSETS = [
  "./",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// نصب نسخه جدید
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// حذف کش‌های قدیمی
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// درخواست‌های صفحه و فایل‌های ثابت
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // درخواست‌های خارج از دامنه خود PWA دست‌کاری نشوند
  if (url.origin !== self.location.origin) return;

  // صفحه HTML همیشه از شبکه دریافت شود
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          "اتصال به اینترنت برقرار نیست. لطفاً دوباره تلاش کنید.",
          {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          }
        );
      })
    );
    return;
  }

  // فایل‌های ثابت از کش یا شبکه
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});
