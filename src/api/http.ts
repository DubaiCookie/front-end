import axios from 'axios';
import { env } from '@/utils/env';

export const http = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});
