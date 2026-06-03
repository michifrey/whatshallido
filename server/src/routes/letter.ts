import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { improveLetter } from "../services/aiService.js";

export const letterRouter = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const schema = z.object({
  letter: z.string().min(20).max(8000),
  mode: z.enum(["lehrstelle", "schnupperlehre"]).default("lehrstelle"),
});

letterRouter.post(
  "/improve",
  wrap(async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Ungültige Anfrage", details: parsed.error.flatten() });
    }
    const improved = await improveLetter(parsed.data.letter, parsed.data.mode);
    res.json({ improved });
  }),
);
