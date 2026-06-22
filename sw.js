// Integra o service worker do OneSignal (notificações push) ao SW existente
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE = 'contascasa-v1';
const ASSETS = [
  '/contas-casa/',
  '/contas-casa/index.html',
  '/contas-casa/manifest.json',
  '/contas-casa/icon-192.png',
  '/contas-casa/icon-512.png'
];

// Instala e faz cache dos arquivos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network First (tenta rede, cai no cache se offline)
self.addEventListener('fetch', e => {
  // Ignora requisições ao Supabase (sempre precisam de rede)
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Atualiza cache com resposta nova
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
