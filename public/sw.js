self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Push notifications only; no offline caching
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Уведомление', body: '' }
  const title = data.title || 'Уведомление'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: data.url ? { url: data.url } : undefined
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const hadWindow = clientsArr.some((client) => {
        if ('focus' in client) client.focus()
        return client.url === url
      })
      if (!hadWindow && self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})


