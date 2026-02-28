import { ref } from "vue";
import { useApi } from "./useApi";

type TokenPayload = {
  id: number;
  username: string;
  exp?: number;
  iat?: number;
};

const TOKEN_KEY = "microblog_token";

export const useAuth = () => {
  const user = ref<TokenPayload | null>(null);

  const getToken = () => {
    return (process.client && localStorage.getItem(TOKEN_KEY)) || null;
  };

  const setToken = (token: string) => {
    if (process.client) {
      localStorage.setItem(TOKEN_KEY, token);
      user.value = decodeToken(token);
    }
  };

  const clearToken = () => {
    if (process.client) {
      localStorage.removeItem(TOKEN_KEY);
      user.value = null;
    }
  };

  const decodeToken = (token: string): TokenPayload | null => {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1] || "";
      const json = atob(payload);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  const init = () => {
    const t = getToken();
    if (t) {
      user.value = decodeToken(t);
    }
  };

  const register = async (username: string, password: string) => {
    const { baseUrl } = useApi();
    await $fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      body: { username, password },
    });

    return login(username, password);
  };

  const login = async (username: string, password: string) => {
    const { baseUrl } = useApi();
    const token = await $fetch<string>(`${baseUrl}/auth/login`, {
      method: "POST",
      body: { username, password },
    });
    setToken(token);
    return user.value;
  };

  const logout = () => {
    clearToken();
  };

  const isAuthenticated = () => {
    return !!user.value;
  };

  const getUser = () => {
    return user.value;
  };

  init();

  return {
    register,
    login,
    logout,
    isAuthenticated,
    getUser,
    getToken,
  };
};
