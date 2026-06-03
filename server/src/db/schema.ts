import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Berufe-Tabelle. tags und type sind bewusst als Text gespeichert,
 * tags als JSON-Array (Drizzle json-Modus).
 */
export const professions = sqliteTable("professions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  type: text("type", { enum: ["lehre", "weiterfuehrend"] })
    .notNull()
    .default("lehre"),
  duration: text("duration"),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  description: text("description"),
  infoUrl: text("info_url"),
  videoUrl: text("video_url"),
  lehrstelleUrl: text("lehrstelle_url"),
  imageUrl: text("image_url"),
  source: text("source").default("seed"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export type Profession = typeof professions.$inferSelect;
export type NewProfession = typeof professions.$inferInsert;
