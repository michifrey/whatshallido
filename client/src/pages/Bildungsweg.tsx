import {
  BookOpen,
  Flag,
  GraduationCap,
  Hammer,
  Lightbulb,
  type LucideIcon,
  Route,
  School,
  Search,
  Split,
  Wrench,
} from "lucide-react";
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
function Milestone({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-white shadow-card">
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <p className="mt-2 font-semibold">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

/** Wegweiser-Schild an einer Abzweigung. */
function Sign({ icon: Icon, title, text, highlight }: { icon: LucideIcon; title: string; text: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center shadow-card ${
        highlight
          ? "border-brand-300 bg-brand-50 dark:border-brand-900/60 dark:bg-brand-950/30"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <Icon size={26} strokeWidth={1.75} className="mx-auto text-brand-600 dark:text-brand-400" />
      <p className="mt-2 font-semibold leading-tight">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

function ForkLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
      <Split size={14} strokeWidth={2} /> {children}
    </p>
  );
}

export function Bildungsweg() {
  return (
    <div className="animate-fade mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl">
          <Route size={24} strokeWidth={1.75} className="text-brand-600" /> Dein Bildungsweg in der Schweiz
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Folge der Strasse: Nach jeder Kreuzung kannst du abbiegen – und fast jeder Weg führt weiter.
          Keiner ist eine Sackgasse.
        </p>
      </div>

      <Milestone icon={School} title="Obligatorische Schule" text="Volksschule – Primar- & Sekundarstufe I" />
      <Road />
      <ForkLabel>Berufswahl &amp; Schnupperlehre</ForkLabel>
      <Fork />
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
        <Sign highlight icon={Wrench} title="Berufslehre" text="EFZ (3–4 J.) oder EBA (2 J.) im Betrieb + Berufsfachschule. Optional mit Berufsmaturität." />
        <Sign icon={BookOpen} title="Gymnasium / FMS" text="Allgemeinbildung mit Matura – der Weg an die Hochschule." />
      </div>
      <Fork flip />

      <Road />
      <ForkLabel>Nach dem Abschluss geht es weiter</ForkLabel>
      <Fork />
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
        <Sign highlight icon={Hammer} title="Höhere Berufsbildung" text="Höhere Fachschule (HF), eidg. Berufs- & höhere Fachprüfungen – baut auf der Lehre auf." />
        <Sign icon={GraduationCap} title="Hochschule" text="Fachhochschule (FH), Universität/ETH, Pädagogische Hochschule (PH)." />
      </div>
      <Fork flip />

      <Road />
      <Milestone icon={Flag} title="Weiterbildung" text="Ein Leben lang lernen – Kurse, Nachholbildung, Umschulung" />

      <div className="mt-6 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
        <Lightbulb size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" />
        <p>
          <b>Gut zu wissen:</b> Über die Berufsmaturität führt auch die Lehre an die Fachhochschule.
          Du legst dich jetzt nicht für immer fest – das System ist <b>durchlässig</b>.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href="https://www.berufsberatung.ch/dyn/show/2881" target="_blank" rel="noopener noreferrer" className="btn-ghost">
          Mehr zum Bildungssystem ↗
        </a>
        <Link to="/explorer" className="btn-primary">
          <Search size={16} /> Berufe der Lehre ansehen
        </Link>
      </div>
    </div>
  );
}
