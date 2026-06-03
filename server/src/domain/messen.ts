/**
 * Kuratierte Liste der wichtigsten Berufs- und Bildungsmessen der Schweiz
 * plus iCalendar-Export (Feed zum Abonnieren / Download).
 *
 * Daten ohne Gewähr – immer auf der offiziellen Messe-Seite prüfen.
 * Stand: gepflegt im Code, leicht erweiterbar.
 */
export interface Messe {
  id: string;
  name: string;
  city: string;
  venue: string;
  canton: string; // Kürzel, z.B. "ZH"
  region: string; // grobe Region für Filter
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (inklusive)
  url: string;
  note?: string;
}

export const messen: Messe[] = [
  {
    id: "oba-stgallen-2026",
    name: "OBA – Ostschweizer Bildungs-Ausstellung",
    city: "St. Gallen",
    venue: "Olma Messen",
    canton: "SG",
    region: "Ostschweiz",
    start: "2026-08-27",
    end: "2026-08-30",
    url: "https://www.olma-messen.ch/de/messen/oba",
    note: "Rund 140 Aussteller aus Handwerk, Technik, Gesundheit, IT und mehr.",
  },
  {
    id: "bam-bern-2026",
    name: "BAM – Berufs- und Ausbildungsmesse Bern",
    city: "Bern",
    venue: "BERNEXPO",
    canton: "BE",
    region: "Bern / Mittelland",
    start: "2026-09-02",
    end: "2026-09-06",
    url: "https://bam.ch/de",
    note: "Grösste Berufsmesse der Region Bern.",
  },
  {
    id: "basler-berufsmesse-2026",
    name: "Basler Berufs- und Weiterbildungsmesse",
    city: "Basel",
    venue: "Messe Basel",
    canton: "BS",
    region: "Nordwestschweiz",
    start: "2026-10-15",
    end: "2026-10-17",
    url: "https://www.basler-berufsmesse.ch/de",
    note: "Findet alle zwei Jahre statt.",
  },
  {
    id: "zebi-luzern-2026",
    name: "Zebi – Zentralschweizer Bildungsmesse",
    city: "Luzern",
    venue: "Messe Luzern",
    canton: "LU",
    region: "Zentralschweiz",
    start: "2026-11-05",
    end: "2026-11-08",
    url: "https://www.zebi.ch/de/messe",
    note: "150 Berufe und 600 Weiterbildungen.",
  },
  {
    id: "fiutscher-chur-2026",
    name: "Fiutscher – Bündner Berufsausstellung",
    city: "Chur",
    venue: "Stadthalle / Messe Chur",
    canton: "GR",
    region: "Graubünden",
    start: "2026-11-11",
    end: "2026-11-15",
    url: "https://fiutscher.ch/",
    note: "184 Lehren und 312 Weiterbildungen aus Graubünden.",
  },
  {
    id: "berufsmesse-zuerich-2026",
    name: "Berufsmesse Zürich",
    city: "Zürich",
    venue: "Messe Zürich (Oerlikon)",
    canton: "ZH",
    region: "Zürich",
    start: "2026-11-17",
    end: "2026-11-21",
    url: "https://www.berufsmessezuerich.ch/de",
    note: "Grösste Berufsmesse der Schweiz mit über 240 Berufen.",
  },
  {
    id: "salon-metiers-lausanne-2026",
    name: "Salon des Métiers et de la Formation",
    city: "Lausanne",
    venue: "Beaulieu Lausanne",
    canton: "VD",
    region: "Romandie",
    start: "2026-11-17",
    end: "2026-11-22",
    url: "https://www.metiersformation.ch/fr",
    note: "Rund 300 Berufe und Ausbildungen (französischsprachig).",
  },
  {
    id: "aargauische-berufsschau-2027",
    name: "Aargauische Berufsschau",
    city: "Wettingen",
    venue: "Tägerhard",
    canton: "AG",
    region: "Aargau",
    start: "2027-08-31",
    end: "2027-09-05",
    url: "https://aargauische-berufsschau.ch/",
    note: "Findet alle zwei Jahre statt.",
  },
  {
    id: "swissskills-2027",
    name: "SwissSkills – Schweizer Berufsmeisterschaften",
    city: "Bern",
    venue: "BERNEXPO",
    canton: "BE",
    region: "National",
    start: "2027-09-15",
    end: "2027-09-19",
    url: "https://swiss-skills.ch/de/events",
    note: "Zentrale nationale Berufsmeisterschaften mit über 150 Berufen live.",
  },
];

// --- iCalendar (.ics) ---

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: string) => d.replace(/-/g, "");

/** ICS-DTEND ist exklusiv → einen Tag nach dem letzten Messetag. */
function dayAfter(d: string): string {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + 1);
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}`;
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function stamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Baut einen iCalendar-Feed aus den Messen (für Abo & Download). */
export function messenToIcs(list: Messe[]): string {
  const now = stamp();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Berufs-Kompass//Berufsmessen Schweiz//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Berufsmessen Schweiz",
    "X-WR-TIMEZONE:Europe/Zurich",
  ];
  for (const m of list) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${m.id}@berufs-kompass.ch`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${icsDate(m.start)}`,
      `DTEND;VALUE=DATE:${dayAfter(m.end)}`,
      `SUMMARY:${esc(m.name)}`,
      `LOCATION:${esc(`${m.venue}, ${m.city}`)}`,
      `DESCRIPTION:${esc(`${m.note ? `${m.note} ` : ""}${m.url}`)}`,
      `URL:${m.url}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
