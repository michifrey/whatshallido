import { useCallback, useState } from "react";

const KEY = "bk-admin-token";

export function useAdminToken() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(KEY) ?? "");

  const save = useCallback((value: string) => {
    localStorage.setItem(KEY, value);
    setToken(value);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setToken("");
  }, []);

  return { token, save, clear };
}
