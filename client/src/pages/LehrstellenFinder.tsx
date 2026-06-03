import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useTaxonomy } from "../context/TaxonomyContext";
import type { PlacementMode } from "../types";

const tipps = [
  "Frag in deinem Umfeld: Eltern, Verwandte, Nachbarn kennen oft Betriebe.",
  "Ruf Betriebe direkt an – viele Schnupperlehren werden gar nicht ausgeschrieben.",
  "Schau auf den Webseiten von Firmen in deiner Region unter «Lehrstellen» oder «Jobs».",
  "Die Berufsberatung deines Kantons (z.B. ask! im Aargau) hilft kostenlos weiter.",
];

export function LehrstellenFinder() {
  const { getCategory } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const { data: professions = [] } = useQuery({ queryKey: ["professions", "all"], queryFn: () => api.professions() });
  const { data: cantons = [] } = useQuery({ queryKey: ["cantons"], queryFn: api.cantons });

  const [berufId, setBerufId] = useState(params.get("beruf") ?? "");
  const [suche, setSuche] = useState("");
  const [canton, setCanton] = useState("");
  const [mode, setMode] = useState<PlacementMode>("lehrstelle");

  const selected = professions.find((p) => p.id === berufId);

  // berufId aus der URL übernehmen, sobald die Liste geladen ist
  useEffect(() => {
    const fromUrl = params.get("beruf");
    if (fromUrl && fromUrl !== berufId) setBerufId(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const vorschläge = useMemo(() => {
    const q = suche.trim().toLowerCase();
    if (!q) return [];
    return professions.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [suche, professions]);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["placements", berufId, canton, mode],
    queryFn: () => api.placements(berufId, canton || undefined, mode),
    enabled: berufId.length > 0,
  });

  const pick = (id: string) => {
    setBerufId(id);
    setSuche("");
    setParams({ beruf: id });
  };

  return (
    <div className="animate-fade space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">🔎 Lehrstellen- &amp; Schnupperstellen-Finder</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Wähle einen Beruf und deinen Kanton – wir bringen dich direkt zu den passenden
          Such-Portalen mit vorausgefülltem Beruf.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        {/* Modus */}
        <div className="inline-flex flex-wrap gap-1 rounded-full bg-slate-200 p-1 dark:bg-slate-800">
          {(["lehrstelle", "schnupperlehre"] as PlacementMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                mode === m ? "bg-white text-brand-600 shadow dark:bg-slate-900" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {m === "lehrstelle" ? "🎓 Lehrstelle" : "🌱 Schnupperlehre"}
            </button>
          ))}
        </div>

        {/* Berufsauswahl */}
        <div className="relative">
          <label className="mb-1 block text-sm font-semibold">Beruf</label>
          {selected ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600">
              <span>{getCategory(selected.category).emoji}</span>
              <span className="flex-1 font-semibold">{selected.name}</span>
              <button onClick={() => { setBerufId(""); setParams({}); }} className="text-sm text-brand-600 hover:underline">
                ändern
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
                <Search size={16} className="text-slate-400" />
                <input
                  value={suche}
                  onChange={(e) => setSuche(e.target.value)}
                  placeholder="Beruf suchen … z.B. Informatiker, Koch"
                  className="w-full bg-transparent outline-none"
                />
              </div>
              {vorschläge.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-cardlg dark:border-slate-700 dark:bg-slate-900">
                  {vorschläge.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => pick(p.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {getCategory(p.category).emoji} {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Kanton */}
        <div>
          <label className="mb-1 block text-sm font-semibold">
            <MapPin size={14} className="mr-1 inline" /> Kanton (optional)
          </label>
          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">Ganze Schweiz</option>
            {cantons.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ergebnis-Links */}
      {selected && (
        <div className="space-y-3">
          <h3 className="font-bold">
            Stellen finden für <span className="text-brand-600">{selected.name}</span>
          </h3>
          {isLoading ? (
            <p className="text-slate-400">Lädt …</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {links.map((l) => (
                <a
                  key={l.provider}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-cardlg dark:bg-slate-900"
                >
                  <ExternalLink size={18} className="mt-0.5 text-brand-600" />
                  <div>
                    <p className="font-bold">{l.label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{l.description}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
          <Link to={`/bewerbung?beruf=${selected.id}&mode=${mode}`} className="btn-primary mt-2 inline-flex">
            <FileText size={16} /> Bewerbung für diesen Beruf schreiben
          </Link>
        </div>
      )}

      {/* Tipps */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
        <h3 className="mb-2 font-bold text-sky-900 dark:text-sky-200">💡 So findest du eine Schnupperlehre</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-sky-900/90 dark:text-sky-200/90">
          {tipps.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
