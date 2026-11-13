// V15.9.1: Attendance requires a network connection. Never cache login/challenge responses.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('gdl-attendance-')).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, {cache: 'no-store'}).catch(() => new Response(
      '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Attendance offline</title><h1>You are offline</h1><p>Reconnect, then reload attendance.gdl.bt.</p></html>',
      {status: 503, headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}}
    )));
  }
});
