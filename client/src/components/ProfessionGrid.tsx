import type { Profession, RecommendedProfession } from "../types";
import { ProfessionCard } from "./ProfessionCard";

export function ProfessionGrid({
  professions,
  empty = "Keine Berufe gefunden.",
}: {
  professions: (Profession | RecommendedProfession)[];
  empty?: string;
}) {
  if (!professions.length) {
    return <p className="py-12 text-center text-slate-400">{empty}</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {professions.map((p) => (
        <ProfessionCard key={p.id} profession={p} />
      ))}
    </div>
  );
}
