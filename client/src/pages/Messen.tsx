import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, Download, ExternalLink, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../api";
import type { Messe } from "../types";
import { downloadIcs, formatRange, isPast, monthLabel } from "../lib/messen";

const REGION_COLORS: Record<string, string> = {
  "Zürich": "#0ea5e9",
  "Bern / Mittelland": "#e11d48",
  "National": "#17141b",
  "Nordwestschweiz": "#a855f7",
  "Zentralschweiz": "#13c296",
  "Ostschweiz": "#f97316",
  "Graubünden": "#84cc16",
  "Romandie": "#2f6df6",
  "Aargau": "#eab308",
};
const colorFor = (region: string) => REGION_COLORS[region] ?? "#e11d48";

const SOURCES = [
  { name: "SwissSkills – Berufsmessen", url: "https://swiss-skills.ch/de/events/berufsmessen" },
  { name: "e-chance.ch – Berufsmessen", url: "https://e-chance.ch/entdecken/berufsmessen/" },
  { name: "gateway.one – Übersicht", url: "https://www.gateway.one/de-CH/magazin-leser/welche-berufsmessen-gibt-es-in-der-schweiz.html" },
  { name: "talendo.ch – Events", url: "https://talendo.ch/de/events" },
];

export function Messen() {
  const { data: messen = [], isLoading } = useQuery({ queryKey: ["messen"], queryFn: api.messen });
  const [region, setRegion] = useState("");
  const [showPast, setShowPast] = useState(false);

  const regions = useMemo(() => Array.from(new Set(messen.map((m) => m.region))), [messen]);

  const filtered = useMemo(
    () =>
      messen
        .filter((m) => (region ? m.region === region : true))
        .filter((m) => (showPast ? true : !isPast(m.end)))
        .sort((a, b) => a.start.localeCompare(b.start)),
    [messen, region, showPast],
  );

  // nach Monat gruppieren
  const groups = useMemo(() => {
    const map = new Map<string, Messe[]>();
    for (const m of filtered) {
      const key = monthLabel(m.start);
      (map.get(key) ?? map.set(key, []).get(key)!).push(m);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const icsHttp = `${origin}/api/messen.ics`;
  const icsWebcal = icsHttp.replace(/^https?:/, "webcal:");

  return (
    <div className="animate-fade space-y-6">
      <section className="relative overflow-hidden rounded-3xl border-2 border-ink bg-ink p-8 text-white shadow-pop">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-500/30 blur-2xl" />
        <span className="eyebrow text-sun">Termine in der ganzen Schweiz</span>
        <h1 className="mt-3 max-w-3xl text-3xl leading-tight sm:text-5xl">
          Berufsmessen <span className="text-brand-500">live erleben</span>
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          An einer Berufsmesse triffst du echte Berufsleute, kannst Dinge ausprobieren und Fragen
          stellen. Such dir eine Messe in deiner Nähe – und leg sie dir gleich in den Kalender.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={icsWebcal} className="btn-pop">
            <CalendarPlus size={16} /> Kalender abonnieren
          </a>
          <button onClick={() => downloadIcs("berufsmessen-schweiz.ics", filtered)} className="btn-ghost border-white text-white hover:bg-white hover:text-ink">
            <Download size={16} /> Auswahl als .ics
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          „Abonnieren" fügt den Kalender einmalig hinzu – er aktualisiert sich dann automatisch, wenn
          neue Messen dazukommen. Funktioniert mit Apple Kalender, Google Kalender & Outlook.
        </p>
      </section>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setRegion("")} className={`chip ${region === "" ? "chip-active" : ""}`}>
          Alle Regionen
        </button>
        {regions.map((r) => (
          <button key={r} onClick={() => setRegion(r === region ? "" : r)} className={`chip ${region === r ? "chip-active" : ""}`}>
            {r}
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Vergangene anzeigen
        </label>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-slate-400">Lädt …</p>
      ) : groups.length === 0 ? (
        <p className="py-12 text-center text-slate-400">Keine Messen für diese Auswahl gefunden.</p>
      ) : (
        groups.map(([label, items]) => (
          <section key={label}>
            <h2 className="eyebrow mb-3">{label}</h2>
            <div className="space-y-3">
              {items.map((m) => {
                const c = colorFor(m.region);
                return (
                  <article key={m.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div
                      className="grid shrink-0 place-items-center rounded-2xl px-4 py-3 text-center text-white sm:w-40"
                      style={{ background: c }}
                    >
                      <span className="font-display text-sm font-extrabold leading-tight">{formatRange(m.start, m.end)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg leading-tight">{m.name}</h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin size={14} /> {m.venue}, {m.city}
                        <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: c }}>
                          {m.region}
                        </span>
                      </p>
                      {m.note && <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{m.note}</p>}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button onClick={() => downloadIcs(`${m.id}.ics`, [m])} className="btn-soft">
                        <CalendarPlus size={15} /> In Kalender
                      </button>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        Website <ExternalLink size={15} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}

      <section className="card p-5">
        <h3 className="eyebrow mb-2">Weitere Messen & immer aktuell</h3>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Diese Liste deckt die grössten Messen ab (Angaben ohne Gewähr – Datum bitte auf der
          offiziellen Seite prüfen). Noch mehr regionale Anlässe findest du hier:
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {SOURCES.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
              {s.name} ↗
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
