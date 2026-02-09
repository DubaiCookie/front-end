import axios from 'axios';
import { env } from '@/utils/env';
import { useAuthStore } from '@/stores/auth.store';

export const http = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
