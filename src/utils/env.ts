export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  QUEUE_POLL_MS: Number(import.meta.env.VITE_QUEUE_POLL_MS ?? 1000),
};