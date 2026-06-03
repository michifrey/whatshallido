import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema.js";

const dbPath = resolve(process.env.DATABASE_PATH ?? "./data/berufe.db");
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

/**
 * Erstellt die Tabelle, falls sie noch nicht existiert.
 * (Für lokale Entwicklung; für echte Migrationen siehe drizzle-kit.)
 */
export function ensureSchema(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS professions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'lehre',
      duration TEXT,
      tags TEXT NOT NULL,
      description TEXT,
      info_url TEXT,
      video_url TEXT,
      lehrstelle_url TEXT,
      image_url TEXT,
      source TEXT DEFAULT 'seed',
      updated_at INTEGER
    );
  `);
}

export const db = drizzle(sqlite, { schema });
export { schema, sqlite };
