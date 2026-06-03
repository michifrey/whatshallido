/**
 * Weist Berufen automatisch ein Foto via Unsplash zu.
 *
 *   npm run fill-images -- [--dry-run] [--force]
 *
 *   --dry-run  zeigt nur, welche Bilder gewählt würden (schreibt nichts)
 *   --force    überschreibt auch bereits vorhandene Bilder
 *
 * Benötigt UNSPLASH_ACCESS_KEY. Schont das Rate-Limit (Pause zwischen Anfragen).
 */
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";
import { db, ensureSchema, sqlite } from "../db/index.js";
import { professions } from "../db/schema.js";
import { searchImages } from "../services/imageService.js";

/** Baut aus einem Beruf einen guten Suchbegriff (ohne Abkürzungen/Fachrichtungen). */
export function imageQueryFor(p: { name: string }): string {
  const clean = p.name
    .replace(/\b(EFZ|EBA|HF|FH|PH)\b/g, "")
    .replace(/\/[^\s]*/g, "") // "/in", "/-frau" etc. entfernen
    .replace(/\s+/g, " ")
    .trim();
  return `${clean} Beruf`;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  ensureSchema();
  const all = db.select().from(professions).all();
  const targets = force ? all : all.filter((p) => !p.imageUrl);
  console.log(`🖼️  ${targets.length} Berufe ${force ? "(force: alle)" : "ohne Bild"}.`);

  let done = 0;
  let fail = 0;
  for (const p of targets) {
    const query = imageQueryFor(p);
    try {
      const images = await searchImages(query);
      const url = images[0]?.url;
      if (!url) {
        console.warn(`  – kein Treffer für "${p.name}" (${query})`);
        fail++;
        continue;
      }
      if (dryRun) {
        console.log(`  [dry] ${p.name} → ${url}`);
      } else {
        db.update(professions).set({ imageUrl: url, updatedAt: new Date() }).where(eq(professions.id, p.id)).run();
        console.log(`  ✓ ${p.name}`);
      }
      done++;
      await new Promise((r) => setTimeout(r, 1200)); // Unsplash-Rate-Limit schonen
    } catch (e) {
      const err = e as Error & { status?: number };
      console.error(`  ! Fehler bei "${p.name}": ${err.message}`);
      fail++;
      if (err.status === 503) {
        console.error("   → Kein UNSPLASH_ACCESS_KEY gesetzt – Abbruch.");
        break;
      }
    }
  }
  console.log(`Fertig: ${done} verarbeitet, ${fail} fehlgeschlagen.`);
  sqlite.close();
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
