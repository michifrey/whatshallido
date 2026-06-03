/**
 * Seed-Script: importiert die Berufe aus der JSON-Datei in die SQLite-DB.
 * Aufruf:  npm run seed
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = join(here, "..", "data", "berufe.seed.json");

function lehrstelleUrl(name: string): string {
  return "https://www.yousty.ch/de-CH/lehrstellen?q=" + encodeURIComponent(name);
}

function main(): void {
  const raw = JSON.parse(readFileSync(seedPath, "utf8")) as { berufe: SeedRecord[] };
  ensureSchema();

  const rows: NewProfession[] = raw.berufe.map((b) => ({
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
    source: b.quelle ?? "seed",
    updatedAt: new Date(),
  }));

  // Idempotent: Tabelle leeren, dann neu befüllen (in einer Transaktion).
  const insertAll = sqlite.transaction(() => {
    db.delete(professions).run();
    for (const row of rows) {
      db.insert(professions).values(row).run();
    }
  });
  insertAll();

  console.log(`✅ Seed abgeschlossen: ${rows.length} Berufe in die Datenbank geschrieben.`);
  sqlite.close();
}

main();
