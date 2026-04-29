import { initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";
import { env } from "@/utils/env";

type FirebaseMessagingConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let runtimeConfigPromise: Promise<FirebaseMessagingConfig | null> | null = null;

function getBuildTimeConfig(): FirebaseMessagingConfig | null {
  const config = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    vapidKey: env.FIREBASE_VAPID_KEY,
  };

  return hasRequiredConfig(config) ? config : null;
}

function hasRequiredConfig(config: Partial<FirebaseMessagingConfig>) {
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      config.vapidKey,
  );
}

async function loadRuntimeConfig() {
  try {
    const response = await fetch("/firebase-messaging-config.json", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as Partial<FirebaseMessagingConfig>;
    return hasRequiredConfig(config) ? config as FirebaseMessagingConfig : null;
  } catch {
    return null;
  }
}

export async function getFirebaseMessagingConfig() {
  const buildTimeConfig = getBuildTimeConfig();
  if (buildTimeConfig) {
    return buildTimeConfig;
  }

  runtimeConfigPromise ??= loadRuntimeConfig();
  return runtimeConfigPromise;
}

export async function hasFirebaseMessagingConfig() {
  return Boolean(await getFirebaseMessagingConfig());
}

export function hasBuildTimeFirebaseMessagingConfig() {
  return Boolean(
    env.FIREBASE_API_KEY &&
      env.FIREBASE_AUTH_DOMAIN &&
      env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_MESSAGING_SENDER_ID &&
      env.FIREBASE_APP_ID &&
      env.FIREBASE_VAPID_KEY,
  );
}

export async function getFirebaseMessaging() {
  const config = await getFirebaseMessagingConfig();
  if (!config) {
    return null;
  }

  if (!(await isSupported())) {
    return null;
  }

  if (!app) {
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
  }

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
}
