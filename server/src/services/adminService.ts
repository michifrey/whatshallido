import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { professions, type NewProfession, type Profession } from "../db/schema.js";
import { infoUrl, lehrstelleUrl, slug, videoUrl } from "../domain/links.js";
import { getProfession } from "./professionService.js";

export interface ProfessionInput {
  id?: string;
  name: string;
  category: string;
  type?: "lehre" | "weiterfuehrend";
  duration?: string | null;
  tags: string[];
  description?: string | null;
  imageUrl?: string | null;
  infoUrl?: string | null;
  videoUrl?: string | null;
  lehrstelleUrl?: string | null;
}

function toRow(input: ProfessionInput, id: string): NewProfession {
  return {
    id,
    name: input.name.trim(),
    category: input.category,
    type: input.type ?? "lehre",
    duration: input.duration ?? null,
    tags: input.tags,
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
    infoUrl: input.infoUrl ?? infoUrl(input.name),
    videoUrl: input.videoUrl ?? videoUrl(input.name),
    lehrstelleUrl: input.lehrstelleUrl ?? lehrstelleUrl(input.name),
    source: "admin",
    updatedAt: new Date(),
  };
}

export function createProfession(input: ProfessionInput): Profession {
  const id = input.id?.trim() || slug(input.name);
  if (getProfession(id)) {
    const err = new Error("Ein Beruf mit dieser ID existiert bereits");
    (err as { status?: number }).status = 409;
    throw err;
  }
  db.insert(professions).values(toRow(input, id)).run();
  return getProfession(id)!;
}

export function updateProfession(id: string, patch: Partial<ProfessionInput>): Profession | undefined {
  const existing = getProfession(id);
  if (!existing) return undefined;
  const merged: NewProfession = {
    ...existing,
    ...patch,
    id,
    tags: patch.tags ?? existing.tags,
    updatedAt: new Date(),
    source: "admin",
  };
  db.update(professions).set(merged).where(eq(professions.id, id)).run();
  return getProfession(id);
}

export function deleteProfession(id: string): boolean {
  const result = db.delete(professions).where(eq(professions.id, id)).run();
  return result.changes > 0;
}
