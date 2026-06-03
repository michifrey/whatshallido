import { useCallback, useEffect, useState } from "react";
import type { Bewerbung } from "../types";

const KEY = "bk-bewerbungen";
const EVENT = "bk-bewerbungen-change";

function read(): Bewerbung[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Bewerbung[];
  } catch {
    return [];
  }
}

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Bewerbungs-Tracker: speichert Bewerbungen im localStorage (gerätelokal). */
export function useBewerbungen() {
  const [items, setItems] = useState<Bewerbung[]>(read);

  useEffect(() => {
    const handler = () => setItems(read());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const persist = useCallback((next: Bewerbung[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const add = useCallback(
    (data: Omit<Bewerbung, "id">) => {
      const entry: Bewerbung = { ...data, id: uid() };
      persist([entry, ...read()]);
      return entry;
    },
    [persist],
  );

  const update = useCallback(
    (id: string, patch: Partial<Bewerbung>) => {
      persist(read().map((b) => (b.id === id ? { ...b, ...patch } : b)));
    },
    [persist],
  );

  const remove = useCallback((id: string) => persist(read().filter((b) => b.id !== id)), [persist]);
  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, update, remove, clear };
}
