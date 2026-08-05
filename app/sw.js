const CACHE = "rmp-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data.js",
  "./forms.js",
  "./mail.js",
  "./registros.js",
  "./manifest.json",
  "./assets/header-principal.png",
  "./assets/header-vap.png",
  "./assets/footer-notas.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/headers/marcas_principal.png",
  "./assets/headers/marcas_vap.png",
  "./assets/headers/marcas_pie.png",
  "./assets/headers/detector_metales.png",
  "./assets/headers/lava_utiles.png",
  "./assets/headers/transporte.png",
  "./assets/headers/transporte_pie.png",
  "./assets/headers/pales.png",
  "./assets/headers/cuchillos.png",
  "./assets/headers/cutters.png",
  "./vendor/html2canvas.min.js",
  "./vendor/jspdf.umd.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
