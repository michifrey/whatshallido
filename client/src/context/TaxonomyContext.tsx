import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { api } from "../api";
import type { Category, Dimension, DimensionKey } from "../types";

interface TaxonomyValue {
  categories: Category[];
  dimensions: Dimension[];
  categoryMap: Record<string, Category>;
  dimensionMap: Record<string, Dimension>;
  getCategory: (key: string) => Category;
  getDimension: (key: DimensionKey) => Dimension | undefined;
}

const fallbackCategory: Category = { key: "?", name: "Beruf", emoji: "💼", color: "#64748b" };

const TaxonomyContext = createContext<TaxonomyValue | null>(null);

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["taxonomy"],
    queryFn: api.taxonomy,
    staleTime: Infinity,
  });

  const value = useMemo<TaxonomyValue | null>(() => {
    if (!data) return null;
    const categoryMap = Object.fromEntries(data.categories.map((c) => [c.key, c]));
    const dimensionMap = Object.fromEntries(data.dimensions.map((d) => [d.key, d]));
    return {
      categories: data.categories,
      dimensions: data.dimensions,
      categoryMap,
      dimensionMap,
      getCategory: (key) => categoryMap[key] ?? fallbackCategory,
      getDimension: (key) => dimensionMap[key],
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-400">
        <div className="animate-pulse text-lg">Lädt …</div>
      </div>
    );
  }
  if (isError || !value) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center text-slate-500">
        <div>
          <p className="text-lg font-semibold">Verbindung zum Server fehlgeschlagen.</p>
          <p className="mt-2 text-sm">Läuft das Backend? Starte es mit <code>npm run dev:server</code>.</p>
        </div>
      </div>
    );
  }

  return <TaxonomyContext.Provider value={value}>{children}</TaxonomyContext.Provider>;
}

export function useTaxonomy(): TaxonomyValue {
  const ctx = useContext(TaxonomyContext);
  if (!ctx) throw new Error("useTaxonomy muss innerhalb von TaxonomyProvider verwendet werden");
  return ctx;
}
