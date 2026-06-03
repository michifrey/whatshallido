import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Header } from "./Header";

const quellen = [
  { name: "Lehre in der Schweiz – Berufe A–Z", url: "https://www.lehre-in-der-schweiz.ch/" },
  { name: "berufsberatung.ch – Übersicht Berufe", url: "https://www.berufsberatung.ch/dyn/show/1893" },
  { name: "ask! Beratungsdienste Aargau", url: "https://www.beratungsdienste.ch/" },
  { name: "Bildungssystem Schweiz", url: "https://www.berufsberatung.ch/dyn/show/2881" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: api.meta });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="bg-slate-900 px-4 py-8 text-slate-300 no-print sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-3 font-bold text-white">Offizielle Quellen</h3>
          <div className="flex flex-col gap-1.5">
            {quellen.map((q) => (
              <a key={q.url} href={q.url} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-300 hover:underline">
                {q.name} ↗
              </a>
            ))}
          </div>
          {meta && (
            <p className="mt-4 text-xs text-slate-500">
              📊 {meta.total} Berufe in der Datenbank ({meta.lehre} Lehre, {meta.weiterfuehrend} weiterführend)
            </p>
          )}
          <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-500">
            Privates, kostenloses Hilfsmittel für die Berufswahl – ersetzt keine professionelle
            Berufsberatung. Für eine persönliche Beratung wende dich an die Berufsberatung deines
            Kantons (z.B. ask! im Aargau).{" "}
            <Link to="/admin" className="text-slate-500 hover:text-sky-300">⚙️ Admin</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
