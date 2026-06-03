import { useQuery } from "@tanstack/react-query";
import { Compass, Search, Sparkles, Puzzle } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";

const features = [
  { to: "/explorer", emoji: "🔎", title: "Berufs-Explorer", text: "Stöbere durch alle Berufe von A–Z, suche und filtere nach Bereichen – mit Video zu jedem Beruf.", icon: Search },
  { to: "/entdecker", emoji: "✨", title: "Berufsentdecker", text: "Klick an, was dir Spass macht – und bekomme sofort passende Berufe vorgeschlagen.", icon: Sparkles },
  { to: "/test", emoji: "🧩", title: "Stärken-Test", text: "«Was mache ich gern? Was kann ich gut?» Finde es heraus – mit Profil und Berufstipps.", icon: Puzzle },
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
    <div className="animate-fade space-y-10">
      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-8 shadow-card dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 sm:p-12">
        <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          Für Jugendliche in der Schweiz 🇨🇭
        </span>
        <h1 className="mt-4 flex items-center gap-3 text-3xl font-extrabold sm:text-5xl">
          <Compass className="hidden text-brand-600 sm:block" size={48} />
          Welcher Beruf passt zu dir?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Über 500 Lehrberufe gibt es in der Schweiz. Hier kannst du{" "}
          <b className="text-brand-600">{meta?.total ?? "viele"} Berufe</b> entdecken – der
          Berufs-Kompass hilft dir, deine Stärken zu finden und Berufe zu entdecken, die wirklich zu
          dir passen. Mit Videos und Infos zum Weiterklicken.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/test" className="btn-primary">🧩 Stärken-Test starten</Link>
          <Link to="/explorer" className="btn-ghost">🔎 Berufe durchstöbern</Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group rounded-2xl bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-cardlg dark:bg-slate-900"
          >
            <span className="text-4xl">{f.emoji}</span>
            <h3 className="mt-3 text-xl font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
            <span className="mt-3 inline-block font-bold text-brand-600 transition group-hover:translate-x-1">
              Los geht's →
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl bg-white p-5 shadow-card dark:bg-slate-900">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 font-extrabold text-white">
              {s.n}
            </div>
            <p className="mt-3 font-bold">{s.t}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
