const baseUrl = import.meta.env.VITE_API_BASE_URL;
const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
const appBaseUrl = import.meta.env.VITE_APP_BASE_URL;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined (build-time env)");
}

export const env = {
  API_BASE_URL: baseUrl,
  TOSS_CLIENT_KEY: tossClientKey ?? "",
  APP_BASE_URL: appBaseUrl ?? "",
  // WS_URL: explicitWsUrl ?? toWebSocketUrl(baseUrl),
};
