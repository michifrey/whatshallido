import type { Profession } from "../types";

/**
 * Themen-Orte ("Zonen") der Berufe-Landkarte – unabhängig von den 10
 * Datenkategorien. Jeder Beruf wird per assignZone() genau EINER Zone
 * zugeordnet (Reihenfolge = Priorität: spezielle Themen-Pins zuerst,
 * danach die breiten Kategorie-Pins). So gibt es keine Doppelzählung.
 */
export interface MapZone {
  key: string;
  short: string;
  desc: string;
  emoji: string;
  color: string;
  left: number;
  top: number;
  vert: "up" | "down";
  align: "center" | "start" | "end";
  /** trifft auf einen Beruf zu? */
  match: (p: Profession) => boolean;
}

const re = (rx: RegExp) => (p: Profession) => rx.test(p.name);
const cat = (k: string) => (p: Profession) => p.category === k;

export const ZONES: MapZone[] = [
  // --- Spezielle Themen-Pins (haben Vorrang) ---
  { key: "luftfahrt", short: "Luftfahrt", desc: "Pilot/in, Flugbegleitung und Flugsicherung.", emoji: "✈️", color: "#06b6d4",
    left: 17, top: 8, vert: "down", align: "start", match: re(/Pilot|Flugbegleiter|Flugverkehrsleiter/i) },
  { key: "blaulicht", short: "Blaulicht", desc: "Polizei, Feuerwehr und Rettung – helfen und schützen.", emoji: "🚨", color: "#2563eb",
    left: 72, top: 88, vert: "up", align: "center", match: re(/Polizist|Feuerwehr|Rettungssanit/i) },
  { key: "verkehr", short: "Bahn & Verkehr", desc: "Bahn, Bus, öV, Seilbahn und Transport.", emoji: "🚆", color: "#d97706",
    left: 9, top: 50, vert: "down", align: "start", match: re(/Lokführer|Zugverkehrsleiter|öffentlicher Verkehr|Berufschauffeur|Seilbahn|Strassentransport/i) },

  // --- Breite Kategorie-Pins ---
  { key: "bau", short: "Bau", desc: "Häuser, Brücken und Strassen planen und bauen.", emoji: "🏗️", color: "#78716c",
    left: 13, top: 26, vert: "down", align: "start", match: cat("bau") },
  { key: "gesundheit", short: "Gesundheit", desc: "Menschen pflegen, heilen und im Spital helfen.", emoji: "🏥", color: "#ef4444",
    left: 33, top: 19, vert: "down", align: "center", match: cat("gesundheit") },
  { key: "koerper", short: "Schönheit", desc: "Haare, Schönheit, Wellness und Körperpflege.", emoji: "💇", color: "#14b8a6",
    left: 60, top: 29, vert: "down", align: "center", match: cat("koerper") },
  { key: "natur", short: "Natur & Tiere", desc: "Mit Tieren, Pflanzen und der Natur arbeiten.", emoji: "🌱", color: "#84cc16",
    left: 88, top: 23, vert: "down", align: "end", match: cat("natur") },
  { key: "soziales", short: "Soziales", desc: "Mit Kindern und Menschen lernen, betreuen und helfen.", emoji: "🤝", color: "#22c55e",
    left: 46, top: 44, vert: "up", align: "center", match: cat("soziales") },
  { key: "technik", short: "Technik", desc: "Maschinen bauen, reparieren und Anlagen steuern.", emoji: "⚙️", color: "#f97316",
    left: 76, top: 37, vert: "up", align: "end", match: cat("technik") },
  { key: "wirtschaft", short: "Büro & Verkauf", desc: "KV, Büro, Bank, Buchhaltung, Immobilien, Verkauf & Handel.", emoji: "🛒", color: "#a855f7",
    left: 79, top: 62, vert: "up", align: "end", match: cat("wirtschaft") },
  { key: "gestaltung", short: "Gestaltung", desc: "Gestalten, dekorieren, Medien, Bühne und Design.", emoji: "🎨", color: "#ec4899",
    left: 27, top: 79, vert: "up", align: "start", match: cat("gestaltung") },
  { key: "it", short: "Informatik", desc: "Programmieren, Computer und digitale Welten.", emoji: "💻", color: "#0ea5e9",
    left: 55, top: 82, vert: "up", align: "center", match: cat("it") },
  { key: "gastro", short: "Gastro", desc: "Kochen, backen und Gäste verwöhnen.", emoji: "🍴", color: "#eab308",
    left: 93, top: 79, vert: "up", align: "end", match: cat("gastro") },
];

/** Liefert den Zonen-Key, dem ein Beruf zugeordnet ist (erste passende Zone). */
export function assignZone(p: Profession): string | null {
  for (const z of ZONES) if (z.match(p)) return z.key;
  return null;
}

/** Zählt Berufe pro Zone. */
export function zoneCounts(professions: Profession[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const p of professions) {
    const k = assignZone(p);
    if (k) m[k] = (m[k] ?? 0) + 1;
  }
  return m;
}
