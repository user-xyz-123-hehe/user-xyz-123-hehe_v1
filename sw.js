// V15.9.3: online-only. No Cache Storage writes or cached fallbacks.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('gdl-attendance-')).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request, {cache: 'no-store'}).then(response => {
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    headers.delete('Expires');
    return new Response(response.body, {status: response.status, statusText: response.statusText, headers});
  }).catch(() => new Response(
    event.request.mode === 'navigate'
      ? '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Attendance offline</title><h1>You are offline</h1><p>Reconnect, then reopen attendance.gdl.bt.</p></html>'
      : 'Network unavailable',
    {status: 503, headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}}
  )));
});
