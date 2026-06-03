import { useQuery } from "@tanstack/react-query";
import { FileText, Heart, Info, MapPin, PlaySquare, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useMerkliste } from "../hooks/useMerkliste";
import { categoryIcon, dimIcon } from "../lib/icons";
import type { Profession } from "../types";
import { ProfessionImage } from "../components/ProfessionImage";
import { ZukunftDetail } from "../components/ZukunftBadge";
import { useTaxonomy } from "./TaxonomyContext";

interface ModalValue {
  open: (p: Profession) => void;
  close: () => void;
}

const ModalContext = createContext<ModalValue | null>(null);

export function ProfessionModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Profession | null>(null);
  const open = useCallback((p: Profession) => setCurrent(p), []);
  const close = useCallback(() => setCurrent(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {current && <ProfessionModal profession={current} onClose={close} onSelect={setCurrent} />}
    </ModalContext.Provider>
  );
}

export function useProfessionModal(): ModalValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useProfessionModal muss innerhalb des Providers verwendet werden");
  return ctx;
}

function ProfessionModal({
  profession,
  onClose,
  onSelect,
}: {
  profession: Profession;
  onClose: () => void;
  onSelect: (p: Profession) => void;
}) {
  const { getCategory, getDimension } = useTaxonomy();
  const { has, toggle } = useMerkliste();
  const category = getCategory(profession.category);
  const CatIcon = categoryIcon(profession.category);
  const gemerkt = has(profession.id);

  const { data: all = [] } = useQuery({
    queryKey: ["professions", "all"],
    queryFn: () => api.professions(),
    staleTime: 5 * 60 * 1000,
  });
  const similar = all
    .filter((p) => p.category === profession.category && p.id !== profession.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 animate-fade sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl animate-pop rounded-2xl bg-white shadow-cardlg dark:bg-slate-900">
        <button
          onClick={onClose}
          aria-label="Schliessen"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-slate-100 dark:bg-slate-800/90 dark:text-slate-200"
        >
          <X size={18} />
        </button>

        <div className="h-40 overflow-hidden rounded-t-2xl">
          <ProfessionImage category={category} imageUrl={profession.imageUrl} name={profession.name} />
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-semibold leading-tight">{profession.name}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <CatIcon size={15} strokeWidth={1.75} /> {category.name} · {profession.duration}
            {profession.type === "weiterfuehrend" && <span>· weiterführend</span>}
          </p>

          {profession.description && (
            <p className="mt-4 text-slate-700 dark:text-slate-200">{profession.description}</p>
          )}

          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-sm font-semibold">Passt zu dir, wenn du das magst:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profession.tags.map((t) => {
                const d = getDimension(t);
                if (!d) return null;
                const DimI = dimIcon(t);
                return (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    <DimI size={13} strokeWidth={2} /> {d.name}
                  </span>
                );
              })}
            </div>
          </div>

          {profession.zukunft && (
            <div className="mt-4">
              <ZukunftDetail zukunft={profession.zukunft} />
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {profession.videoUrl && (
              <a href={profession.videoUrl} target="_blank" rel="noopener noreferrer" className="btn flex-1 bg-slate-800 text-white hover:bg-slate-900">
                <PlaySquare size={16} /> Video ansehen
              </a>
            )}
            {profession.infoUrl && (
              <a href={profession.infoUrl} target="_blank" rel="noopener noreferrer" className="btn-soft flex-1">
                <Info size={16} /> Mehr Infos
              </a>
            )}
            <button
              onClick={() => toggle(profession.id)}
              className={gemerkt ? "btn-primary flex-1" : "btn-soft flex-1"}
            >
              <Heart size={16} className={gemerkt ? "fill-current" : ""} />
              {gemerkt ? "Gemerkt" : "Merken"}
            </button>
          </div>

          {profession.type !== "weiterfuehrend" && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to={`/lehrstellen?beruf=${profession.id}`} onClick={onClose} className="btn flex-1 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                <MapPin size={16} /> Lehrstelle finden
              </Link>
              <Link to={`/bewerbung?beruf=${profession.id}`} onClick={onClose} className="btn-soft flex-1">
                <FileText size={16} /> Bewerbung schreiben
              </Link>
            </div>
          )}

          {similar.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 font-bold">Ähnliche Berufe</h4>
              <div className="flex flex-wrap gap-2">
                {similar.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    {getCategory(p.category).emoji} {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
