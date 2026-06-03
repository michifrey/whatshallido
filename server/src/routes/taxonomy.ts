import { Router } from "express";
import { cantons } from "../domain/cantons.js";
import {
  abilityQuestions,
  abilityScale,
  categories,
  dimensions,
  interestQuestions,
  interestScale,
} from "../domain/taxonomy.js";
import { getCategoriesWithCounts, getMeta } from "../services/professionService.js";

export const taxonomyRouter = Router();

taxonomyRouter.get("/taxonomy", (_req, res) => {
  res.json({ categories, dimensions });
});

taxonomyRouter.get("/cantons", (_req, res) => {
  res.json(cantons);
});

taxonomyRouter.get("/categories", (_req, res) => {
  res.json(getCategoriesWithCounts());
});

taxonomyRouter.get("/meta", (_req, res) => {
  res.json(getMeta());
});

taxonomyRouter.get("/test", (_req, res) => {
  res.json({ interestQuestions, abilityQuestions, interestScale, abilityScale });
});
