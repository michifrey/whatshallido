import type { NextFunction, Request, Response } from "express";

/** Aktueller Admin-Token (zur Laufzeit aus der Umgebung gelesen). */
export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN ?? "dev-admin-token";
}

/** Prüft den Admin-Token (Header 'x-admin-token' oder 'Authorization: Bearer …'). */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const headerToken = req.header("x-admin-token");
  const bearer = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const token = headerToken ?? bearer;
  if (token !== getAdminToken()) {
    res.status(401).json({ error: "Nicht autorisiert. Admin-Token fehlt oder ist falsch." });
    return;
  }
  next();
}
