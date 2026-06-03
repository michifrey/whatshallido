import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles, Puzzle } from "lucide-react";
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
      <section className="relative overflow-hidden rounded-3xl border-2 border-ink bg-ink p-8 text-white shadow-pop sm:p-12">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-500/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-28 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
        <span className="eyebrow text-sun">Für Jugendliche in der Schweiz 🇨🇭</span>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.02] sm:text-6xl">
          Welcher Beruf <span className="text-brand-500">passt zu dir?</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Über 500 Lehrberufe gibt es in der Schweiz. Hier kannst du{" "}
          <b className="text-sun">{meta?.total ?? "viele"} Berufe</b> entdecken – der
          Berufs-Kompass hilft dir, deine Stärken zu finden und Berufe zu entdecken, die wirklich zu
          dir passen. Mit Videos und Infos zum Weiterklicken.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/test" className="btn-pop">🧩 Stärken-Test starten</Link>
          <Link to="/explorer" className="btn-ghost border-white text-white hover:bg-white hover:text-ink">
            🔎 Berufe durchstöbern
          </Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group card p-6 transition hover:-translate-y-1 hover:border-ink hover:shadow-pop dark:hover:border-white"
          >
            <span className="text-4xl">{f.emoji}</span>
            <h3 className="mt-3 text-xl">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
            <span className="mt-3 inline-block font-display font-bold text-brand-600 transition group-hover:translate-x-1">
              Los geht's →
            </span>
          </Link>
        ))}
      </section>

      <section>
        <span className="eyebrow">So gehst du vor</span>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="card p-5">
              <div
                className="grid h-9 w-9 place-items-center rounded-full font-display text-base font-extrabold"
                style={{ background: ["#e11d48", "#2f6df6", "#13c296", "#f7c948"][i], color: i === 3 ? "#17141b" : "#fff" }}
              >
                {s.n}
              </div>
              <p className="mt-3 font-display font-bold">{s.t}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
