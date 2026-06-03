import { Router } from "express";
import { messen, messenToIcs } from "../domain/messen.js";

export const messenRouter = Router();

/** JSON-Liste aller Messen für die Webseite. */
messenRouter.get("/messen", (_req, res) => {
  res.json(messen);
});

/** iCalendar-Feed – zum Abonnieren (webcal) oder Herunterladen. */
messenRouter.get("/messen.ics", (_req, res) => {
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="berufsmessen.ics"');
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(messenToIcs(messen));
});
