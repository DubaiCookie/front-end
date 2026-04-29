const baseUrl = import.meta.env.VITE_API_BASE_URL;
const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
const appBaseUrl = import.meta.env.VITE_APP_BASE_URL;
const wsUrl = import.meta.env.VITE_WS_URL;
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID;
const firebaseVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined (build-time env)");
}

export const env = {
  API_BASE_URL: baseUrl,
  TOSS_CLIENT_KEY: tossClientKey ?? "",
  APP_BASE_URL: appBaseUrl ?? "",
  WS_URL: wsUrl ?? "",
  FIREBASE_API_KEY: firebaseApiKey ?? "",
  FIREBASE_AUTH_DOMAIN: firebaseAuthDomain ?? "",
  FIREBASE_PROJECT_ID: firebaseProjectId ?? "",
  FIREBASE_STORAGE_BUCKET: firebaseStorageBucket ?? "",
  FIREBASE_MESSAGING_SENDER_ID: firebaseMessagingSenderId ?? "",
  FIREBASE_APP_ID: firebaseAppId ?? "",
  FIREBASE_VAPID_KEY: firebaseVapidKey ?? "",
};
