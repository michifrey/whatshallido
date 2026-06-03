import { Router } from "express";
import { z } from "zod";
import {
  getProfession,
  listProfessions,
  recommendByDimensions,
} from "../services/professionService.js";

export const professionsRouter = Router();

const listQuery = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  type: z.enum(["lehre", "weiterfuehrend"]).optional(),
});

professionsRouter.get("/", (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Filter", details: parsed.error.flatten() });
  }
  res.json(listProfessions(parsed.data));
});

const recommendBody = z.object({
  dimensions: z.array(z.string()).min(1),
  limit: z.number().int().positive().max(50).optional(),
});

professionsRouter.post("/recommend", (req, res) => {
  const parsed = recommendBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungültige Anfrage", details: parsed.error.flatten() });
  }
  res.json(recommendByDimensions(parsed.data.dimensions, parsed.data.limit));
});

professionsRouter.get("/:id", (req, res) => {
  const profession = getProfession(req.params.id);
  if (!profession) return res.status(404).json({ error: "Beruf nicht gefunden" });
  res.json(profession);
});
