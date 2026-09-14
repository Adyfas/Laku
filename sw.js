var CACHE_NAME = "laku-app-v2";

var APP_SHELL = [
  "/app.html",
  "/javascript/core/appUtils.js",
  "/javascript/core/unitConversion.js",
  "/javascript/core/guidedTour.js",
  "/javascript/core/popup.js",
  "/javascript/core/app.js",
  "/javascript/core/navbar.js",
  "/javascript/core/animations.js",
  "/javascript/apps/hpp/hppApp.js",
  "/javascript/apps/hpp/hppClient.js",
  "/javascript/apps/hpp/hppIngredients.js",
  "/javascript/apps/hpp/hppCalc.js",
  "/javascript/apps/hpp/hppRecipes.js",
  "/javascript/apps/kas/kasApp.js",
  "/javascript/apps/kas/kasClient.js",
  "/javascript/apps/laba/labaApp.js",
  "/javascript/apps/laba/labaClient.js",
  "/javascript/apps/utang/utangApp.js",
  "/javascript/apps/utang/utangClient.js",
  "/javascript/apps/inventory/inventoryApp.js",
  "/javascript/apps/inventory/inventoryClient.js",
  "/javascript/apps/promo/promoApp.js",
  "/javascript/apps/promo/promoClient.js",
  "/font/Manrope-VariableFont_wght.ttf",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install: cache app shell
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets, stale-while-revalidate for app.html
self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // app.html: stale-while-revalidate
  if (url.pathname === "/app.html") {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (cached) {
          var fetchPromise = fetch(event.request).then(function (response) {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(function () {
            return cached;
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(function () {
      // Offline fallback for navigation
      if (event.request.mode === "navigate") {
        return caches.match("/app.html");
      }
    })
  );
});
