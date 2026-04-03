const TOKEN_KEY = "recalli_token";

export const setToken = (token: string) => {
  if (typeof window !== undefined) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  if (typeof window !== undefined) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  if (typeof window !== undefined) return;

  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== undefined) return false;
  return !!getToken();
};
