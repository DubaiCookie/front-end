/* global firebase */
importScripts("https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js");

async function loadFirebaseMessagingConfig() {
  try {
    const response = await fetch("/firebase-messaging-config.json", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const config = await response.json();
    if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) {
      return null;
    }

    return config;
  } catch {
    return null;
  }
}

loadFirebaseMessagingConfig().then((config) => {
  if (!config || !firebase?.apps) {
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || "WayThing";
    const options = {
      body: payload.notification?.body || payload.data?.body || "",
      icon: "/logo-icon-192.png",
      badge: "/logo-icon-192.png",
      data: payload.data || {},
    };

    self.registration.showNotification(title, options);
  });
});
