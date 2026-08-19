// Service worker minimo per le push notification via Web Push.
// Non fa caching/offline: il solo scopo è ricevere push e aprire
// l'URL giusto al click, il resto dell'app resta un sito normale.

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload;

  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Car2ne", body: event.data.text() };
  }

  const title = payload.title || "Car2ne";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: payload.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);

          if (clientUrl.pathname === url && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
