import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { categoryKeys, dimensionKeys } from "../domain/taxonomy.js";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  createProfession,
  deleteProfession,
  updateProfession,
} from "../services/adminService.js";
import { searchImages } from "../services/imageService.js";

export const adminRouter = Router();
adminRouter.use(adminAuth);

/** Kleiner Wrapper, damit Fehler aus async-Handlern den Error-Handler erreichen. */
const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const professionSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Name zu kurz"),
  category: z.string().refine((v) => categoryKeys.includes(v), "Unbekannte Kategorie"),
  type: z.enum(["lehre", "weiterfuehrend"]).default("lehre"),
  duration: z.string().nullish(),
  tags: z
    .array(z.string().refine((v) => (dimensionKeys as readonly string[]).includes(v), "Unbekanntes Tag"))
    .min(1, "Mindestens ein Tag"),
  description: z.string().nullish(),
  zukunft: z
    .object({ score: z.number().int().min(1).max(5), label: z.string(), note: z.string() })
    .nullish(),
  imageUrl: z.string().url().nullish().or(z.literal("")),
  infoUrl: z.string().url().nullish(),
  videoUrl: z.string().url().nullish(),
  lehrstelleUrl: z.string().url().nullish(),
});

// Prüft nur den Token (für den Login im Frontend).
adminRouter.get("/check", (_req, res) => res.json({ ok: true }));

adminRouter.post("/professions", (req, res) => {
  const parsed = professionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Daten", details: parsed.error.flatten() });
  }
  const created = createProfession(parsed.data);
  res.status(201).json(created);
});

adminRouter.put("/professions/:id", (req, res) => {
  const parsed = professionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Daten", details: parsed.error.flatten() });
  }
  const updated = updateProfession(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ error: "Beruf nicht gefunden" });
  res.json(updated);
});

adminRouter.delete("/professions/:id", (req, res) => {
  const ok = deleteProfession(req.params.id);
  if (!ok) return res.status(404).json({ error: "Beruf nicht gefunden" });
  res.status(204).end();
});

adminRouter.get(
  "/images",
  wrap(async (req, res) => {
    const query = String(req.query.q ?? "").trim();
    if (query.length < 2) return res.status(400).json({ error: "Suchbegriff zu kurz" });
    res.json(await searchImages(query));
  }),
);
