// Catatan Keuangan Bengkel — PWA revisi_006.
// Hanya layar offline dan aset instalasi. Tidak ada cache data/transaksi GAS.
const CACHE='bengkel-pwa-revisi-006';
const BASE=self.registration.scope;
const ASSETS=['offline.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'].map(path=>new URL(path,BASE).href);
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})));await self.skipWaiting();})());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('bengkel-pwa-')&&key!==CACHE)await caches.delete(key);}await self.clients.claim();})());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==new URL(BASE).origin)return;
  // Navigasi aplikasi selalu mengambil HTML terbaru; kegagalan jaringan membuka layar offline.
  if(request.mode==='navigate'&&(url.pathname===new URL(BASE).pathname||url.pathname===new URL('index.html',BASE).pathname)){
    event.respondWith((async()=>{try{return await fetch(new Request(request,{cache:'no-store'}));}catch(_){return (await caches.match(new URL('offline.html',BASE).href))||new Response('Anda sedang offline. Hubungkan ke internet.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());return;
  }
  if(ASSETS.includes(url.href))event.respondWith((async()=>{return (await caches.match(request))||fetch(request);})());
});
