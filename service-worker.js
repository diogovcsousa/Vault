self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open('vault-cache-v2').then(c=>c.addAll([
      './index.html','./style.css','./script.js','./manifest.json',
      './icon-192.png','./icon-512.png'
    ]))
  );
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});