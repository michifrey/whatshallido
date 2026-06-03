import { Heart, Info, PlaySquare, Search } from "lucide-react";
import { useTaxonomy } from "../context/TaxonomyContext";
import { useMerkliste } from "../hooks/useMerkliste";
import { useProfessionModal } from "../context/ProfessionModal";
import type { Profession, RecommendedProfession } from "../types";
import { ProfessionImage } from "./ProfessionImage";
import { ZukunftBadge } from "./ZukunftBadge";

interface Props {
  profession: Profession | RecommendedProfession;
}

export function ProfessionCard({ profession }: Props) {
  const { getCategory, getDimension } = useTaxonomy();
  const { has, toggle } = useMerkliste();
  const { open } = useProfessionModal();
  const category = getCategory(profession.category);
  const gemerkt = has(profession.id);
  const match = "match" in profession ? profession.match : undefined;

  return (
    <article
      onClick={() => open(profession)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-cardlg dark:bg-slate-900"
    >
      <div className="relative h-28">
        <ProfessionImage category={category} imageUrl={profession.imageUrl} name={profession.name} />
        {match !== undefined && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-extrabold text-brand-600 shadow">
            {match}% Match
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(profession.id);
          }}
          aria-label="Merken"
          className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110 dark:bg-slate-800/90"
        >
          <Heart
            className={gemerkt ? "fill-brand-600 text-brand-600" : "text-slate-500"}
            size={18}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold leading-tight">{profession.name}</h3>
        <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {category.emoji} {category.name} · {profession.duration}
          {profession.type === "weiterfuehrend" && (
            <span className="ml-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              📚 weiterführend
            </span>
          )}
        </p>
        {profession.description && (
          <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">
            {profession.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {profession.tags.map((t) => {
            const d = getDimension(t);
            if (!d) return null;
            return (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {d.emoji} {d.name.split(" ")[0]}
              </span>
            );
          })}
        </div>

        {profession.zukunft && (
          <div className="mt-2">
            <ZukunftBadge zukunft={profession.zukunft} />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          {profession.videoUrl && (
            <a
              href={profession.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn flex-1 bg-slate-800 text-white hover:bg-slate-900"
            >
              <PlaySquare size={15} /> Video
            </a>
          )}
          {profession.infoUrl && (
            <a href={profession.infoUrl} target="_blank" rel="noopener noreferrer" className="btn-soft flex-1">
              <Info size={15} /> Infos
            </a>
          )}
          {profession.type !== "weiterfuehrend" && profession.lehrstelleUrl && (
            <a
              href={profession.lehrstelleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn flex-1 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
            >
              <Search size={15} /> Lehrstelle
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
