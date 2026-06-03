import type { Messe } from "../types";

const MONTHS = ["Jan", "Feb", "März", "April", "Mai", "Juni", "Juli", "Aug", "Sept", "Okt", "Nov", "Dez"];
const MONTHS_LONG = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const parse = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return { y, m: m - 1, day };
};

/** "17.–21. Nov 2026" bzw. monatsübergreifend "31. Aug – 5. Sept 2027". */
export function formatRange(start: string, end: string): string {
  const a = parse(start);
  const b = parse(end);
  if (a.y === b.y && a.m === b.m) return `${a.day}.–${b.day}. ${MONTHS[a.m]} ${a.y}`;
  if (a.y === b.y) return `${a.day}. ${MONTHS[a.m]} – ${b.day}. ${MONTHS[b.m]} ${a.y}`;
  return `${a.day}. ${MONTHS[a.m]} ${a.y} – ${b.day}. ${MONTHS[b.m]} ${b.y}`;
}

/** Gruppen-Schlüssel + Label nach Monat (für die Agenda-Ansicht). */
export function monthLabel(start: string): string {
  const a = parse(start);
  return `${MONTHS_LONG[a.m]} ${a.y}`;
}

export function isPast(end: string, today = new Date()): boolean {
  const b = parse(end);
  const e = new Date(Date.UTC(b.y, b.m, b.day));
  const t = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return e < t;
}

// --- iCalendar (.ics) clientseitig erzeugen (Download einzelner/mehrerer Messen) ---

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: string) => d.replace(/-/g, "");
const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

function dayAfter(d: string): string {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + 1);
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}`;
}

export function buildIcs(list: Messe[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Berufs-Kompass//Berufsmessen Schweiz//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Berufsmessen Schweiz",
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

export function downloadIcs(filename: string, list: Messe[]): void {
  const blob = new Blob([buildIcs(list)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
