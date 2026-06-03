import cors from "cors";
import express, { type Express } from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { professionsRouter } from "./routes/professions.js";
import { taxonomyRouter } from "./routes/taxonomy.js";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/professions", professionsRouter);
  app.use("/api", taxonomyRouter);

  // In Produktion: das gebaute Frontend ausliefern (falls vorhanden).
  const clientDist = resolve(process.cwd(), "../client/dist");
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => res.sendFile(resolve(clientDist, "index.html")));
  }

  return app;
}
