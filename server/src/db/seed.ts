import seedJson from "../data/berufe.seed.json";
import { lehrstelleUrl } from "../domain/links.js";
import { computeZukunft } from "../domain/zukunft.js";
import { db, ensureSchema, sqlite } from "./index.js";
import { professions, type NewProfession } from "./schema.js";

interface SeedRecord {
  id: string;
  name: string;
  kat: string;
  typ?: "lehre" | "weiterfuehrend";
  dauer?: string;
  tags: string[];
  desc?: string;
  info?: string;
  video?: string;
  imageUrl?: string;
  quelle?: string;
}

/** Importiert die Berufe aus der gebündelten JSON in die Datenbank (idempotent). */
export function seedDatabase(): number {
  ensureSchema();
  const data = seedJson as unknown as { berufe: SeedRecord[] };
  const rows: NewProfession[] = data.berufe.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.kat,
    type: b.typ ?? "lehre",
    duration: b.dauer ?? null,
    tags: b.tags ?? [],
    description: b.desc ?? null,
    infoUrl: b.info ?? null,
    videoUrl: b.video ?? null,
    lehrstelleUrl: lehrstelleUrl(b.name),
    imageUrl: b.imageUrl ?? null,
    zukunft: computeZukunft(b.name, b.kat),
    source: b.quelle ?? "seed",
    updatedAt: new Date(),
  }));

  const tx = sqlite.transaction(() => {
    db.delete(professions).run();
    for (const row of rows) db.insert(professions).values(row).run();
  });
  tx();
  return rows.length;
}

/** Anzahl der Berufe in der DB (für Auto-Seed-Entscheidung). */
export function countProfessions(): number {
  ensureSchema();
  const row = sqlite.prepare("SELECT COUNT(*) AS c FROM professions").get() as { c: number };
  return row.c;
}
