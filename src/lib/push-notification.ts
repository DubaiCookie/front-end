import { getToken } from "firebase/messaging";
import { deleteDeviceToken, registerDeviceToken, type DeviceType } from "@/api/device-token.api";
import { getFirebaseMessaging, getFirebaseMessagingConfig, hasFirebaseMessagingConfig } from "@/lib/firebase";

const DEVICE_TOKEN_STORAGE_KEY = "fcmDeviceToken";

function getDeviceType(): DeviceType {
  const userAgent = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    return "IOS";
  }

  if (/Android/i.test(userAgent)) {
    return "ANDROID";
  }

  return "WEB";
}

function canUseNotificationApi() {
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

async function getServiceWorkerRegistration() {
  const existingRegistration = await navigator.serviceWorker.getRegistration("/");
  if (existingRegistration) {
    return existingRegistration;
  }

  return navigator.serviceWorker.ready;
}

async function registerCurrentToken(token: string) {
  await registerDeviceToken({
    token,
    deviceType: getDeviceType(),
    userAgent: navigator.userAgent,
  });
  localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
}

export async function requestAndRegisterPushToken() {
  if (!canUseNotificationApi() || !(await hasFirebaseMessagingConfig())) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  return syncPushTokenIfPermitted();
}

export async function syncPushTokenIfPermitted() {
  if (!canUseNotificationApi() || !(await hasFirebaseMessagingConfig()) || Notification.permission !== "granted") {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  const config = await getFirebaseMessagingConfig();
  if (!messaging || !config) {
    return null;
  }

  const serviceWorkerRegistration = await getServiceWorkerRegistration();
  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration,
  });

  if (!token) {
    return null;
  }

  const storedToken = localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
  if (storedToken !== token) {
    await registerCurrentToken(token);
  }

  return token;
}

export async function unregisterStoredPushToken() {
  const storedToken = localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
  if (!storedToken) {
    return;
  }

  try {
    await deleteDeviceToken(storedToken);
  } finally {
    localStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
  }
}
