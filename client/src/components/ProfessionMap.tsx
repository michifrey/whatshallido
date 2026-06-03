import type { CategoryWithCount } from "../types";

/** Pro Kategorie ein "Ort" auf der Landkarte mit passendem Tätigkeits-Icon. */
const PLACES: Record<string, { place: string; scene: string }> = {
  natur: { place: "Bauernhof, Wald & Garten", scene: "🚜" },
  bau: { place: "Baustelle & Strasse", scene: "🏗️" },
  technik: { place: "Werkstatt & Labor", scene: "⚙️" },
  it: { place: "Digital-Hub", scene: "💻" },
  gesundheit: { place: "Spital & Praxis", scene: "🏥" },
  soziales: { place: "Schule & Betreuung", scene: "🏫" },
  gestaltung: { place: "Atelier & Studio", scene: "🎨" },
  wirtschaft: { place: "Laden & Büro", scene: "🛒" },
  gastro: { place: "Küche & Restaurant", scene: "🍴" },
  koerper: { place: "Salon & Spa", scene: "💇" },
};

interface Props {
  categories: CategoryWithCount[];
  selected: string;
  onSelect: (key: string) => void;
}

export function ProfessionMap({ categories, selected, onSelect }: Props) {
  return (
    <div className="rounded-3xl bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 p-3 dark:from-slate-800 dark:to-slate-900 sm:p-4">
      <p className="mb-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
        🗺️ Klick auf ein Feld, um die Berufe dort zu entdecken
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => {
          const meta = PLACES[c.key];
          const active = selected === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onSelect(active ? "" : c.key)}
              style={{ borderColor: active ? c.color : "transparent" }}
              className="group relative overflow-hidden rounded-2xl border-[3px] bg-white/90 p-3 text-center shadow-card backdrop-blur transition hover:-translate-y-1 hover:shadow-cardlg dark:bg-slate-900/90"
            >
              <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: c.color }} />
              <span className="block text-4xl transition group-hover:scale-110">{meta?.scene ?? c.emoji}</span>
              <span className="mt-2 block text-sm font-extrabold leading-tight">{meta?.place ?? c.name}</span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                {c.emoji} {c.count} Berufe
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
