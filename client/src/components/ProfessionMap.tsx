import type { CategoryWithCount } from "../types";

/** Pro Kategorie ein "Ort" auf der Landkarte: Icon, Kurzname und Position (in %). */
const PLACES: Record<string, { scene: string; short: string; long: string; left: number; top: number }> = {
  bau: { scene: "🏗️", short: "Baustelle", long: "Baustelle & Strasse", left: 41, top: 13 },
  technik: { scene: "⚙️", short: "Werkstatt", long: "Werkstatt & Labor", left: 71, top: 17 },
  natur: { scene: "🚜", short: "Bauernhof", long: "Bauernhof, Wald & Garten", left: 14, top: 27 },
  it: { scene: "💻", short: "Digital-Hub", long: "Informatik & Digital", left: 86, top: 45 },
  gestaltung: { scene: "🎨", short: "Atelier", long: "Atelier & Studio", left: 47, top: 46 },
  gesundheit: { scene: "🏥", short: "Spital", long: "Spital & Praxis", left: 14, top: 57 },
  wirtschaft: { scene: "🛒", short: "Laden & Büro", long: "Laden & Büro", left: 73, top: 66 },
  soziales: { scene: "🏫", short: "Schule", long: "Schule & Betreuung", left: 30, top: 76 },
  gastro: { scene: "🍴", short: "Küche", long: "Küche & Restaurant", left: 53, top: 83 },
  koerper: { scene: "💇", short: "Salon", long: "Salon & Spa", left: 13, top: 85 },
};

interface Props {
  categories: CategoryWithCount[];
  selected: string;
  onSelect: (key: string) => void;
}

function Landscape() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="240" fill="url(#sky)" />
      <circle cx="705" cy="70" r="34" fill="#fde68a" />
      <ellipse cx="170" cy="70" rx="48" ry="20" fill="#ffffff" opacity="0.85" />
      <ellipse cx="210" cy="78" rx="34" ry="16" fill="#ffffff" opacity="0.85" />
      <ellipse cx="430" cy="48" rx="40" ry="17" fill="#ffffff" opacity="0.8" />

      {/* Hügel */}
      <path d="M0 240 Q200 150 420 230 T800 220 V260 H0 Z" fill="#a7f3d0" />
      <rect x="0" y="240" width="800" height="260" fill="url(#ground)" />

      {/* Fluss */}
      <path d="M-20 300 C150 280 220 360 360 350 C520 338 600 410 820 390 L820 430 C600 450 520 380 360 392 C220 402 150 330 -20 350 Z" fill="#7dd3fc" opacity="0.9" />

      {/* Strasse mit Mittellinie */}
      <path d="M120 500 C180 380 320 360 380 250 C430 165 560 150 700 90" fill="none" stroke="#64748b" strokeWidth="26" strokeLinecap="round" />
      <path d="M120 500 C180 380 320 360 380 250 C430 165 560 150 700 90" fill="none" stroke="#fde68a" strokeWidth="3" strokeDasharray="10 14" />

      {/* Bäume */}
      {[[60, 200], [760, 300], [250, 470], [620, 460]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 3} y={y} width="6" height="16" fill="#92400e" />
          <circle cx={x} cy={y - 6} r="16" fill="#34d399" />
        </g>
      ))}
    </svg>
  );
}

export function ProfessionMap({ categories, selected, onSelect }: Props) {
  const byKey = Object.fromEntries(categories.map((c) => [c.key, c]));

  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
        🗺️ Klick auf einen Ort, um die Berufe dort zu entdecken
      </p>

      {/* Szene (ab Tablet) */}
      <div className="relative hidden aspect-[16/10] w-full overflow-hidden rounded-3xl shadow-card sm:block">
        <Landscape />
        {Object.entries(PLACES).map(([key, p]) => {
          const c = byKey[key];
          if (!c) return null;
          const active = selected === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(active ? "" : key)}
              style={{ left: `${p.left}%`, top: `${p.top}%`, borderColor: active ? c.color : "transparent" }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl border-[3px] bg-white/95 px-2.5 py-1.5 shadow-card backdrop-blur transition hover:z-10 hover:scale-110 hover:shadow-cardlg dark:bg-slate-900/95"
            >
              <span className="text-2xl leading-none">{p.scene}</span>
              <span className="mt-0.5 text-xs font-extrabold leading-none">{p.short}</span>
              <span className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{c.count}</span>
            </button>
          );
        })}
      </div>

      {/* Kacheln (Handy) */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {categories.map((c) => {
          const p = PLACES[c.key];
          const active = selected === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onSelect(active ? "" : c.key)}
              style={{ borderColor: active ? c.color : "transparent" }}
              className="relative overflow-hidden rounded-2xl border-[3px] bg-white p-3 text-center shadow-card dark:bg-slate-900"
            >
              <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: c.color }} />
              <span className="block text-3xl">{p?.scene ?? c.emoji}</span>
              <span className="mt-1 block text-sm font-extrabold leading-tight">{p?.long ?? c.name}</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">{c.count} Berufe</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
