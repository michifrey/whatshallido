import { Link } from "react-router-dom";

/** Ein Stück Strasse (Asphalt mit gestrichelter Mittellinie). */
function Road({ height = 44 }: { height?: number }) {
  return (
    <div className="mx-auto w-12 bg-slate-600 dark:bg-slate-700" style={{ height }}>
      <div
        className="mx-auto h-full w-[3px]"
        style={{ backgroundImage: "repeating-linear-gradient(#fbbf24 0 9px, transparent 9px 20px)" }}
      />
    </div>
  );
}

/** Y-Abzweigung der Strasse (gedreht für die Zusammenführung). */
function Fork({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className={`mx-auto block h-14 w-full max-w-md ${flip ? "rotate-180" : ""}`}
    >
      <g fill="none" strokeLinecap="round">
        <path d="M100 0 C100 36 50 24 50 60" stroke="#475569" strokeWidth="22" />
        <path d="M100 0 C100 36 150 24 150 60" stroke="#475569" strokeWidth="22" />
        <path d="M100 0 C100 36 50 24 50 60" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6 8" />
        <path d="M100 0 C100 36 150 24 150 60" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6 8" />
      </g>
    </svg>
  );
}

/** Meilenstein-Marke auf der Strasse. */
function Milestone({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-3xl shadow-cardlg">
        {emoji}
      </div>
      <p className="mt-2 font-extrabold">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

/** Wegweiser-Schild an einer Abzweigung. */
function Sign({ emoji, title, text, highlight }: { emoji: string; title: string; text: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 text-center shadow-card ${
        highlight
          ? "border-brand-300 bg-brand-50 dark:border-brand-900/60 dark:bg-brand-950/30"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <div className="text-3xl">{emoji}</div>
      <p className="mt-1 font-extrabold leading-tight">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

function ForkLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
      🔀 {children}
    </p>
  );
}

export function Bildungsweg() {
  return (
    <div className="animate-fade mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">🎓 Dein Bildungsweg in der Schweiz</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Folge der Strasse: Nach jeder Kreuzung kannst du abbiegen – und fast jeder Weg führt weiter.
          Keiner ist eine Sackgasse.
        </p>
      </div>

      <Milestone emoji="🏫" title="Obligatorische Schule" text="Volksschule – Primar- & Sekundarstufe I" />
      <Road />
      <ForkLabel>Berufswahl &amp; Schnupperlehre</ForkLabel>
      <Fork />
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
        <Sign highlight emoji="🔧" title="Berufslehre" text="EFZ (3–4 J.) oder EBA (2 J.) im Betrieb + Berufsfachschule. Optional mit Berufsmaturität." />
        <Sign emoji="📖" title="Gymnasium / FMS" text="Allgemeinbildung mit Matura – der Weg an die Hochschule." />
      </div>
      <Fork flip />

      <Road />
      <ForkLabel>Nach dem Abschluss geht es weiter</ForkLabel>
      <Fork />
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
        <Sign highlight emoji="🛠️" title="Höhere Berufsbildung" text="Höhere Fachschule (HF), eidg. Berufs- & höhere Fachprüfungen – baut auf der Lehre auf." />
        <Sign emoji="🎓" title="Hochschule" text="Fachhochschule (FH), Universität/ETH, Pädagogische Hochschule (PH)." />
      </div>
      <Fork flip />

      <Road />
      <Milestone emoji="🏁" title="Weiterbildung" text="Ein Leben lang lernen – Kurse, Nachholbildung, Umschulung" />

      <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
        💡 <b>Gut zu wissen:</b> Über die Berufsmaturität führt auch die Lehre an die Fachhochschule.
        Du legst dich jetzt nicht für immer fest – das System ist <b>durchlässig</b>.
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href="https://www.berufsberatung.ch/dyn/show/2881" target="_blank" rel="noopener noreferrer" className="btn-ghost">
          Mehr zum Bildungssystem ↗
        </a>
        <Link to="/explorer" className="btn-primary">🔎 Berufe der Lehre ansehen</Link>
      </div>
    </div>
  );
}
