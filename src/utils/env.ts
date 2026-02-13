const baseUrl = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not defined (build-time env)");
}

export const env = {
  API_BASE_URL: baseUrl,
};