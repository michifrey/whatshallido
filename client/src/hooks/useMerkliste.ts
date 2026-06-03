import { useCallback, useEffect, useState } from "react";

const KEY = "bk-merkliste";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/**
 * Merkliste (Favoriten) im localStorage. Synchronisiert über ein Custom-Event,
 * damit alle Komponenten denselben Stand sehen.
 */
export function useMerkliste() {
  const [ids, setIds] = useState<string[]>(read);

  useEffect(() => {
    const handler = () => setIds(read());
    window.addEventListener("bk-merkliste-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("bk-merkliste-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const persist = useCallback((next: string[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("bk-merkliste-change"));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const current = read();
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      persist(next);
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, clear, has, count: ids.length };
}
