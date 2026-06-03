import { useQuery } from "@tanstack/react-query";
import { Heart, Printer, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { ProfessionGrid } from "../components/ProfessionGrid";
import { useMerkliste } from "../hooks/useMerkliste";

export function Merkliste() {
  const { ids, clear } = useMerkliste();
  const { data: all = [] } = useQuery({ queryKey: ["professions", "all"], queryFn: () => api.professions() });

  const gemerkt = all.filter((p) => ids.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name, "de"));

  return (
    <div className="animate-fade space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-2xl">
          <Heart size={24} strokeWidth={1.75} className="text-brand-600" /> Meine Merkliste
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Berufe, die dich interessieren – tipp bei jedem Beruf auf das Herz, um ihn hier zu sammeln.
          Die Liste bleibt auf diesem Gerät gespeichert.
        </p>
      </div>

      {gemerkt.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
          Noch keine Berufe gemerkt. Stöbere im{" "}
          <Link to="/explorer" className="font-bold underline">Explorer</Link> oder mach den{" "}
          <Link to="/test" className="font-bold underline">Stärken-Test</Link> und tipp auf das Herz.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 no-print">
            <button onClick={() => window.print()} className="btn-soft">
              <Printer size={16} /> Drucken / als PDF speichern
            </button>
            <button onClick={() => confirm("Ganze Merkliste leeren?") && clear()} className="btn-soft">
              <Trash2 size={16} /> Liste leeren
            </button>
          </div>
          <ProfessionGrid professions={gemerkt} />
        </>
      )}
    </div>
  );
}
