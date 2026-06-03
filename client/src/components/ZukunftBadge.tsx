import { TrendingUp } from "lucide-react";
import type { Profession } from "../types";

const COLOR: Record<number, string> = {
  5: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  4: "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300",
  3: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  2: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  1: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

/** Kleiner Badge für die Zukunftssicherheit (Karten-Ansicht). */
export function ZukunftBadge({ zukunft }: { zukunft: Profession["zukunft"] }) {
  if (!zukunft) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${COLOR[zukunft.score] ?? COLOR[3]}`}
      title="Zukunftssicherheit – grobe Orientierung, keine Garantie"
    >
      <TrendingUp size={12} strokeWidth={2} /> Zukunft: {zukunft.label}
    </span>
  );
}

/** Ausführlichere Darstellung mit Punkten (Detail-Ansicht). */
export function ZukunftDetail({ zukunft }: { zukunft: Profession["zukunft"] }) {
  if (!zukunft) return null;
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-semibold"><TrendingUp size={16} strokeWidth={1.75} /> Zukunftssicherheit:</span>
        <span className="font-bold">{zukunft.label}</span>
        <span className="ml-auto tracking-widest" aria-hidden>
          {"●".repeat(zukunft.score)}
          <span className="text-slate-300 dark:text-slate-600">{"●".repeat(5 - zukunft.score)}</span>
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{zukunft.note}</p>
      <p className="mt-1 text-xs text-slate-400">
        Grobe Orientierung (Branche + Trends) – keine Garantie. Aktuelle Lehrstellen siehst du über «Lehrstelle finden».
      </p>
    </div>
  );
}
