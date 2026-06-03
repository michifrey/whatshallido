import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { professions, type Profession } from "../db/schema.js";
import { categories, dimensionKeys } from "../domain/taxonomy.js";

export interface ProfessionFilter {
  search?: string;
  category?: string;
  type?: "lehre" | "weiterfuehrend";
}

export interface RecommendedProfession extends Profession {
  match: number;
}

export function listProfessions(filter: ProfessionFilter = {}): Profession[] {
  const conditions = [];
  if (filter.category) conditions.push(eq(professions.category, filter.category));
  if (filter.type) conditions.push(eq(professions.type, filter.type));

  let rows = db
    .select()
    .from(professions)
    .where(conditions.length ? and(...conditions) : undefined)
    .all();

  if (filter.search) {
    const q = filter.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function getProfession(id: string): Profession | undefined {
  return db.select().from(professions).where(eq(professions.id, id)).get();
}

export function getMeta() {
  const all = db.select().from(professions).all();
  const byCategory: Record<string, number> = {};
  for (const c of categories) byCategory[c.key] = 0;
  for (const p of all) byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  return {
    total: all.length,
    lehre: all.filter((p) => p.type === "lehre").length,
    weiterfuehrend: all.filter((p) => p.type === "weiterfuehrend").length,
    byCategory,
    generatedAt: new Date().toISOString(),
  };
}

export function getCategoriesWithCounts() {
  const meta = getMeta();
  return categories.map((c) => ({ ...c, count: meta.byCategory[c.key] ?? 0 }));
}

/** Empfiehlt Berufe anhand gewählter Interessens-Dimensionen. */
export function recommendByDimensions(dims: string[], limit = 9): RecommendedProfession[] {
  const valid = dims.filter((d) => dimensionKeys.includes(d as never));
  if (!valid.length) return [];
  const all = db.select().from(professions).all();
  return all
    .map((p) => ({ p, score: p.tags.filter((t) => valid.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name, "de"))
    .slice(0, limit)
    .map((x) => ({ ...x.p, match: Math.round((x.score / valid.length) * 100) }));
}
