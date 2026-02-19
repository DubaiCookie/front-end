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
export const REQUEST_FAILED_EVENT = "request-failed";

const EXCLUDED_401_PATHS = ["/login", "/signup", "/rides", "/refresh"];
const EXCLUDED_GENERIC_ERROR_CASES: Array<{ path: string; status?: number }> = [
  { path: "/login", status: 401 },
  { path: "/signup", status: 400 },
  { path: "/queue/enqueue" },
  { path: "/payments" },
  { path: "/payments/confirm" },
];

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

function shouldSkipGenericError(url: string | undefined, status?: number) {
  const path = resolveRequestPath(url);
  return EXCLUDED_GENERIC_ERROR_CASES.some((item) => {
    const pathMatched = path === item.path || path.startsWith(`${item.path}/`);
    const statusMatched = item.status === undefined || item.status === status;
    return pathMatched && statusMatched;
  });
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
    if (!axios.isAxiosError(error)) {
      window.dispatchEvent(new Event(REQUEST_FAILED_EVENT));
      return Promise.reject(error);
    }

    if (shouldSkipGenericError(error.config?.url, error.response?.status)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      window.dispatchEvent(new Event(REQUEST_FAILED_EVENT));
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
