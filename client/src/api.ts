import type {
  Canton,
  CategoryWithCount,
  Messe,
  Meta,
  PlacementLink,
  PlacementMode,
  Profession,
  RecommendedProfession,
  Taxonomy,
  TestData,
} from "./types";

const BASE = "/api";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`Fehler ${res.status} bei ${path}`);
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Fehler ${res.status} bei ${path}`);
  return res.json() as Promise<T>;
}

export interface ProfessionFilter {
  search?: string;
  category?: string;
  type?: "lehre" | "weiterfuehrend";
}

export const api = {
  taxonomy: () => getJson<Taxonomy>("/taxonomy"),
  categories: () => getJson<CategoryWithCount[]>("/categories"),
  meta: () => getJson<Meta>("/meta"),
  test: () => getJson<TestData>("/test"),
  professions: (filter: ProfessionFilter = {}) => {
    const qs = new URLSearchParams();
    if (filter.search) qs.set("search", filter.search);
    if (filter.category) qs.set("category", filter.category);
    if (filter.type) qs.set("type", filter.type);
    const q = qs.toString();
    return getJson<Profession[]>("/professions" + (q ? `?${q}` : ""));
  },
  profession: (id: string) => getJson<Profession>(`/professions/${id}`),
  recommend: (dimensions: string[], limit?: number) =>
    postJson<RecommendedProfession[]>("/professions/recommend", { dimensions, limit }),
  improveLetter: (letter: string, mode: "lehrstelle" | "schnupperlehre") =>
    postJson<{ improved: string }>("/letter/improve", { letter, mode }),
  cantons: () => getJson<Canton[]>("/cantons"),
  messen: () => getJson<Messe[]>("/messen"),
  placements: (id: string, canton: string | undefined, mode: PlacementMode) => {
    const qs = new URLSearchParams({ mode });
    if (canton) qs.set("canton", canton);
    return getJson<PlacementLink[]>(`/professions/${id}/placements?${qs.toString()}`);
  },
};
