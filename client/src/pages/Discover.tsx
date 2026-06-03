import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import { ProfessionGrid } from "../components/ProfessionGrid";
import { useTaxonomy } from "../context/TaxonomyContext";

export function Discover() {
  const { dimensions } = useTaxonomy();
  const [selected, setSelected] = useState<string[]>([]);

  const { data: recommendations = [] } = useQuery({
    queryKey: ["recommend", selected],
    queryFn: () => api.recommend(selected, 30),
    enabled: selected.length > 0,
  });

  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="animate-fade space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">✨ Berufsentdecker</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Was macht dir Spass? Klick alles an, was auf dich zutrifft – wir zeigen dir passende Berufe.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dimensions.map((d) => {
          const active = selected.includes(d.key);
          return (
            <button
              key={d.key}
              onClick={() => toggle(d.key)}
              className="relative rounded-2xl border-[3px] bg-white p-5 text-left transition hover:-translate-y-1 dark:bg-slate-900"
              style={{ borderColor: active ? d.color : "transparent", boxShadow: active ? `0 0 0 1px ${d.color}` : undefined }}
            >
              <span className="text-3xl">{d.emoji}</span>
              <p className="mt-2 font-extrabold">{d.name}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d.text}</p>
              {active && (
                <span
                  className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-white"
                  style={{ background: d.color }}
                >
                  <Check size={16} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
          👆 Wähle oben mindestens einen Bereich aus, der dir gefällt.
        </div>
      ) : (
        <ProfessionGrid professions={recommendations} empty="Noch keine Treffer – wähle weitere Bereiche." />
      )}
    </div>
  );
}
