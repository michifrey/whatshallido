import { useState } from "react";
import type { CategoryWithCount } from "../types";

/**
 * Position + Text jeder Kategorie auf der gezeichneten Berufe-Landkarte
 * (Prozent-Koordinaten passend zum Hintergrundbild /career-map.jpg).
 * vert: Tooltip nach oben ("up") oder unten ("down").
 * align: Tooltip zentriert / nach rechts (start) / nach links (end).
 */
interface Zone {
  key: string;
  left: number;
  top: number;
  short: string;
  desc: string;
  vert: "up" | "down";
  align: "center" | "start" | "end";
}

const ZONES: Zone[] = [
  { key: "bau", left: 12, top: 26, short: "Bau", desc: "Häuser, Brücken und Strassen planen und bauen.", vert: "down", align: "start" },
  { key: "gesundheit", left: 33, top: 19, short: "Gesundheit", desc: "Menschen pflegen, heilen und im Spital helfen.", vert: "down", align: "center" },
  { key: "koerper", left: 60, top: 29, short: "Schönheit", desc: "Haare, Schönheit, Wellness und Körperpflege.", vert: "down", align: "center" },
  { key: "natur", left: 88, top: 23, short: "Natur & Tiere", desc: "Mit Tieren, Pflanzen und der Natur arbeiten.", vert: "down", align: "end" },
  { key: "soziales", left: 48, top: 43, short: "Soziales", desc: "Mit Kindern und Menschen lernen und helfen.", vert: "up", align: "center" },
  { key: "technik", left: 76, top: 37, short: "Technik", desc: "Maschinen bauen, reparieren und Anlagen steuern.", vert: "up", align: "end" },
  { key: "wirtschaft", left: 79, top: 62, short: "Verkauf", desc: "Verkaufen, beraten, Waren und Büro organisieren.", vert: "up", align: "end" },
  { key: "gestaltung", left: 27, top: 79, short: "Gestaltung", desc: "Gestalten, dekorieren, Medien und Design.", vert: "up", align: "start" },
  { key: "it", left: 55, top: 82, short: "Informatik", desc: "Programmieren, Computer und digitale Welten.", vert: "up", align: "center" },
  { key: "gastro", left: 93, top: 79, short: "Gastro", desc: "Kochen, backen und Gäste verwöhnen.", vert: "up", align: "end" },
];

interface Props {
  categories: CategoryWithCount[];
  selected: string;
  onSelect: (key: string) => void;
}

export function ProfessionMap({ categories, selected, onSelect }: Props) {
  const byKey = Object.fromEntries(categories.map((c) => [c.key, c]));
  const [imgOk, setImgOk] = useState(true);

  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
        🗺️ Fahr über einen Ort für die Beschreibung – klick ihn an, um die Berufe zu öffnen
      </p>

      {/* Landkarte mit Pins (ab Tablet) */}
      <div className="relative hidden w-full overflow-visible sm:block">
        {imgOk ? (
          <img
            src="/karte.png"
            alt="Illustrierte Schweizer Berufe-Landkarte"
            onError={() => setImgOk(false)}
            className="block w-full rounded-3xl shadow-card"
          />
        ) : (
          <div className="flex aspect-[3/2] w-full items-center justify-center rounded-3xl bg-gradient-to-br from-sky-200 via-emerald-100 to-emerald-200 text-center text-sm text-slate-500 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700">
            <span className="max-w-xs px-4">
              Hintergrundbild fehlt noch.<br />Lege es als <code>client/public/karte.png</code> ab.
            </span>
          </div>
        )}

        {ZONES.map((z) => {
          const c = byKey[z.key];
          if (!c) return null;
          const active = selected === z.key;

          const vert = z.vert === "up" ? "bottom-full mb-2" : "top-full mt-2";
          const align =
            z.align === "center" ? "left-1/2 -translate-x-1/2" : z.align === "start" ? "left-0" : "right-0";

          return (
            <button
              key={z.key}
              onClick={() => onSelect(active ? "" : z.key)}
              style={{ left: `${z.left}%`, top: `${z.top}%` }}
              className="group absolute z-[1] -translate-x-1/2 -translate-y-1/2 hover:z-30 focus:z-30 focus:outline-none"
            >
              <span className="relative flex flex-col items-center">
                {/* Pin */}
                <span
                  style={{ borderColor: active ? c.color : "#ffffff", boxShadow: active ? `0 0 0 4px ${c.color}55` : undefined }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white text-lg shadow-cardlg transition group-hover:scale-125 group-focus:scale-125 md:h-11 md:w-11 md:text-xl"
                >
                  {c.emoji}
                </span>
                {/* Dauerhaftes Mini-Label */}
                <span className="mt-1 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 shadow dark:bg-slate-900/90 dark:text-slate-100">
                  {z.short}
                </span>

                {/* Tooltip mit Beschreibung */}
                <span
                  className={`pointer-events-none absolute ${vert} ${align} z-30 w-44 rounded-2xl bg-white p-3 text-left opacity-0 shadow-cardlg transition duration-150 group-hover:opacity-100 group-focus:opacity-100 dark:bg-slate-900`}
                >
                  <span className="block text-xs font-extrabold" style={{ color: c.color }}>
                    {c.emoji} {c.name}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-slate-600 dark:text-slate-300">{z.desc}</span>
                  <span className="mt-1.5 block text-[11px] font-bold text-slate-800 dark:text-slate-100">
                    {c.count} Berufe · zum Öffnen klicken →
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Kacheln (Handy) */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {categories.map((c) => {
          const z = ZONES.find((x) => x.key === c.key);
          const active = selected === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onSelect(active ? "" : c.key)}
              style={{ borderColor: active ? c.color : "transparent" }}
              className="relative overflow-hidden rounded-2xl border-[3px] bg-white p-3 text-center shadow-card dark:bg-slate-900"
            >
              <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: c.color }} />
              <span className="block text-3xl">{c.emoji}</span>
              <span className="mt-1 block text-sm font-extrabold leading-tight">{c.name}</span>
              {z && <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 dark:text-slate-400">{z.desc}</span>}
              <span className="mt-1 block text-[11px] font-bold text-slate-600 dark:text-slate-300">{c.count} Berufe</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
