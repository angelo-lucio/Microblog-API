import { useAuth } from "./useAuth";

export const useApi = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuth();

  const baseUrl = config.public.apiBaseUrl;

  // wrapper around $fetch that adds Authorization header if token is present
  const authFetch = async <T = any>(url: string, opts: Record<string, any> = {}) => {
    const token = getToken();
    const headers = new Headers(opts.headers as HeadersInit);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return await $fetch<T>(url, { ...opts, headers });
  };

  return {
    baseUrl,
    authFetch,
  };
};
