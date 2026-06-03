import { useQuery } from "@tanstack/react-query";
import { Dices, List, Map as MapIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import { ProfessionGrid } from "../components/ProfessionGrid";
import { ProfessionMap } from "../components/ProfessionMap";
import { useProfessionModal } from "../context/ProfessionModal";
import { useTaxonomy } from "../context/TaxonomyContext";
import type { ProfessionType } from "../types";

const typFilter: { value: "" | ProfessionType; label: string }[] = [
  { value: "", label: "Alle" },
  { value: "lehre", label: "🎓 Lehre" },
  { value: "weiterfuehrend", label: "📚 Weiterführend" },
];

export function Explorer() {
  const { categories } = useTaxonomy();
  const { open } = useProfessionModal();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"" | ProfessionType>("");
  const [view, setView] = useState<"karte" | "liste">("karte");

  const { data: categoryCounts = [] } = useQuery({ queryKey: ["categories"], queryFn: api.categories });
  const { data: professions = [], isLoading } = useQuery({
    queryKey: ["professions", { search, category, type }],
    queryFn: () => api.professions({ search: search || undefined, category: category || undefined, type: type || undefined }),
  });

  const countFor = (key: string) => categoryCounts.find((c) => c.key === key)?.count ?? 0;

  const surprise = () => {
    if (professions.length) open(professions[Math.floor(Math.random() * professions.length)]);
  };

  return (
    <div className="animate-fade space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold">🔎 Berufs-Explorer</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Such einen Beruf oder filtere nach einem Bereich. Tipp auf eine Karte für Details.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          placeholder="Beruf suchen … z.B. Koch, Informatik, Pflege"
          className="min-w-[220px] flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
        <button onClick={surprise} className="btn-ghost">
          <Dices size={16} /> Überrasch mich
        </button>
        <span className="text-sm font-semibold text-slate-500">{professions.length} Berufe</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-full bg-slate-200 p-1 dark:bg-slate-800">
          {typFilter.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                type === t.value ? "bg-white text-brand-600 shadow dark:bg-slate-900" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto inline-flex gap-1 rounded-full bg-slate-200 p-1 dark:bg-slate-800">
          {([["karte", "Karte", MapIcon], ["liste", "Liste", List]] as const).map(([v, label, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                view === v ? "bg-white text-brand-600 shadow dark:bg-slate-900" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {view === "karte" ? (
        <ProfessionMap categories={categoryCounts} selected={category} onSelect={setCategory} />
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory("")} className={`chip ${category === "" ? "chip-active" : ""}`}>
            🔎 Alle
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key === category ? "" : c.key)}
              className={`chip ${category === c.key ? "chip-active" : ""}`}
            >
              {c.emoji} {c.name} <span className="opacity-60">({countFor(c.key)})</span>
            </button>
          ))}
        </div>
      )}

      {category && (
        <h3 className="font-bold">
          {categories.find((c) => c.key === category)?.emoji}{" "}
          {categories.find((c) => c.key === category)?.name}{" "}
          <button onClick={() => setCategory("")} className="ml-1 text-sm font-semibold text-brand-600 hover:underline">
            · alle Felder
          </button>
        </h3>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-slate-400">Lädt …</p>
      ) : view === "karte" && !category && !search ? (
        <p className="py-8 text-center text-slate-400">Wähle oben ein Feld auf der Karte 🗺️</p>
      ) : (
        <ProfessionGrid professions={professions} empty="Keine Berufe gefunden. Versuch einen anderen Suchbegriff." />
      )}
    </div>
  );
}
