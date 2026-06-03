import { useQuery } from "@tanstack/react-query";
import { ArrowRight, type LucideIcon, Puzzle, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";

const features: { to: string; title: string; text: string; icon: LucideIcon }[] = [
  { to: "/explorer", title: "Berufs-Explorer", text: "Stöbere durch alle Berufe von A–Z, suche und filtere nach Bereichen – mit Video zu jedem Beruf.", icon: Search },
  { to: "/entdecker", title: "Berufsentdecker", text: "Klick an, was dir Spass macht – und bekomme sofort passende Berufe vorgeschlagen.", icon: Sparkles },
  { to: "/test", title: "Stärken-Test", text: "«Was mache ich gern? Was kann ich gut?» Finde es heraus – mit Profil und Berufstipps.", icon: Puzzle },
];

const steps = [
  { n: 1, t: "Test machen", d: "Beantworte ein paar Fragen zu dir." },
  { n: 2, t: "Profil ansehen", d: "Entdecke deine Stärken und Interessen." },
  { n: 3, t: "Berufe erkunden", d: "Schau dir passende Berufe und Videos an." },
  { n: 4, t: "Schnuppern", d: "Frag nach einer Schnupperlehre in deiner Region." },
];

export function Home() {
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: api.meta });

  return (
    <div className="animate-fade space-y-12">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-14">
        <span className="eyebrow">Für Jugendliche in der Schweiz</span>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.08] sm:text-5xl">
          Welcher Beruf passt zu dir?
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Über 500 Lehrberufe gibt es in der Schweiz. Hier kannst du{" "}
          <b className="font-semibold text-brand-600">{meta?.total ?? "viele"} Berufe</b> entdecken –
          der Berufs-Kompass hilft dir, deine Stärken zu finden und Berufe zu entdecken, die wirklich
          zu dir passen. Mit Videos und Infos zum Weiterklicken.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/test" className="btn-primary">
            <Puzzle size={16} /> Stärken-Test starten
          </Link>
          <Link to="/explorer" className="btn-ghost">
            <Search size={16} /> Berufe durchstöbern
          </Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group card p-6 transition hover:-translate-y-0.5 hover:shadow-cardlg">
            <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <f.icon size={22} strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-xl">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.text}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-brand-600 transition-all group-hover:gap-2.5">
              Los geht's <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>

      <section>
        <span className="eyebrow">So gehst du vor</span>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card p-5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 font-display text-sm font-bold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                {s.n}
              </div>
              <p className="mt-3 font-display font-semibold">{s.t}</p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
