import axios from 'axios';
import { env } from '@/utils/env';

export const http = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

const refreshHttp = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

export const SESSION_EXPIRED_EVENT = "session-expired";

const EXCLUDED_401_PATHS = ["/login", "/signup", "/rides", "/refresh"];

function resolveRequestPath(url?: string) {
  if (!url) {
    return "";
  }

  try {
    const resolved = new URL(url, window.location.origin);
    return resolved.pathname;
  } catch {
    return url;
  }
}

function shouldSkipRefresh(url?: string) {
  const path = resolveRequestPath(url);
  return EXCLUDED_401_PATHS.some((excludedPath) => path === excludedPath || path.startsWith(`${excludedPath}/`));
}

type RetriableConfig = {
  _retry?: boolean;
  url?: string;
};

let hasNotifiedSessionExpired = false;

export function markSessionExpiredHandled() {
  hasNotifiedSessionExpired = false;
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableConfig | undefined;
    if (!originalRequest || shouldSkipRefresh(originalRequest.url) || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshHttp.post("/refresh");
      return http(originalRequest);
    } catch (refreshError) {
      if (!hasNotifiedSessionExpired) {
        hasNotifiedSessionExpired = true;
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      return Promise.reject(refreshError);
    }
  },
);
