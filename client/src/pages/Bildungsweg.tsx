import { Link } from "react-router-dom";

function Stufe({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card dark:bg-slate-900">
      <div className="bg-brand-600 px-5 py-2.5 font-extrabold text-white">{num} · {title}</div>
      <div className="grid gap-4 p-5">{children}</div>
    </div>
  );
}

function Box({ title, text, highlight }: { title: string; text: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-brand-200 bg-brand-50 dark:border-brand-900/60 dark:bg-brand-950/30"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
      }`}
    >
      <b className="mb-1 block">{title}</b>
      <span className="text-sm text-slate-500 dark:text-slate-400">{text}</span>
    </div>
  );
}

const Pfeil = ({ children }: { children: React.ReactNode }) => (
  <p className="py-2 text-center text-sm font-bold text-slate-400">▼ {children}</p>
);

export function Bildungsweg() {
  return (
    <div className="animate-fade mx-auto max-w-3xl space-y-1">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold">🎓 Dein Bildungsweg in der Schweiz</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Nach der obligatorischen Schule hast du viele Wege offen – und fast keiner ist eine Sackgasse.
        </p>
      </div>

      <Stufe num="1" title="Obligatorische Schule">
        <Box title="Volksschule" text="Primar- und Sekundarstufe I – für alle, bis ca. 15 Jahre." />
      </Stufe>
      <Pfeil>Berufswahl &amp; Schnupperlehre</Pfeil>

      <Stufe num="2" title="Sekundarstufe II">
        <div className="grid gap-4 sm:grid-cols-2">
          <Box highlight title="Berufliche Grundbildung 🔧" text="Lehre im Betrieb + Berufsfachschule. EFZ (3–4 J.) oder EBA (2 J.). Optional mit Berufsmaturität." />
          <Box title="Allgemeinbildung 📖" text="Gymnasium (Matura), Fachmittelschule (FMS) – als Weg an die Hochschule." />
        </div>
      </Stufe>
      <Pfeil>mit Lehrabschluss / Maturität geht es weiter</Pfeil>

      <Stufe num="3" title="Tertiärstufe">
        <div className="grid gap-4 sm:grid-cols-2">
          <Box highlight title="Höhere Berufsbildung 🛠️" text="Höhere Fachschule (HF), eidg. Berufs- & höhere Fachprüfungen – praxisnah, baut auf der Lehre auf." />
          <Box title="Hochschulen 🎓" text="Fachhochschule (FH), Universität/ETH, Pädagogische Hochschule (PH)." />
        </div>
      </Stufe>
      <Pfeil>ein Leben lang</Pfeil>

      <Stufe num="4" title="Weiterbildung">
        <Box title="Lebenslanges Lernen" text="Kurse, Nachholbildung, Umschulung – Wechsel sind jederzeit möglich. Das System ist durchlässig." />
      </Stufe>

      <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
        💡 <b>Wichtig:</b> Auch mit einer Lehre stehen dir später alle Türen offen – über die
        Berufsmaturität sogar der Weg an die Fachhochschule. Du musst dich jetzt nicht für immer festlegen.
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
