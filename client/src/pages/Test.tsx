import { useQuery } from "@tanstack/react-query";
import { Check, Dumbbell, Gem, Puzzle, RotateCcw, Smile, Star, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../api";
import { ProfessionGrid } from "../components/ProfessionGrid";
import { useTaxonomy } from "../context/TaxonomyContext";
import type { DimensionKey, RecommendedProfession, ScaleOption, TestQuestion } from "../types";

type Answers = Record<number, number>;

function QuestionBlock({
  questions,
  scale,
  answers,
  onAnswer,
  numbered,
}: {
  questions: TestQuestion[];
  scale: ScaleOption[];
  answers: Answers;
  onAnswer: (i: number, v: number) => void;
  numbered?: boolean;
}) {
  const { getDimension } = useTaxonomy();
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} className="rounded-2xl bg-white p-4 shadow-card dark:bg-slate-900">
          <p className="mb-3 flex items-start gap-2 font-semibold">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
              {numbered ? i + 1 : getDimension(q.dim)?.emoji}
            </span>
            {q.text}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {scale.map((s) => {
              const active = answers[i] === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => onAnswer(i, s.value)}
                  className={`rounded-lg border-2 px-2 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-200 hover:border-brand-400 dark:border-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileBars({ values }: { values: Record<string, number> }) {
  const { getDimension } = useTaxonomy();
  const sorted = Object.entries(values).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2">
      {sorted.map(([dim, pct]) => {
        const d = getDimension(dim as DimensionKey);
        if (!d) return null;
        return (
          <div key={dim} className="grid grid-cols-[minmax(120px,200px)_1fr_44px] items-center gap-3">
            <span className="text-sm font-semibold">{d.emoji} {d.name}</span>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: d.color }} />
            </div>
            <span className="text-right text-sm font-bold">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export function Test() {
  const { getDimension } = useTaxonomy();
  const { data } = useQuery({ queryKey: ["test"], queryFn: api.test });
  const [interest, setInterest] = useState<Answers>({});
  const [ability, setAbility] = useState<Answers>({});
  const [result, setResult] = useState<{
    iPct: Record<string, number>;
    kPct: Record<string, number>;
    topDims: string[];
    both: string[];
  } | null>(null);
  const [recs, setRecs] = useState<RecommendedProfession[]>([]);

  const total = (data?.interestQuestions.length ?? 0) + (data?.abilityQuestions.length ?? 0);
  const answered = Object.keys(interest).length + Object.keys(ability).length;

  const evaluate = async () => {
    if (!data) return;
    if (answered < total) {
      alert("Bitte beantworte zuerst beide Teile.");
      return;
    }
    const dims = [...new Set(data.interestQuestions.map((q) => q.dim))];
    const iPct: Record<string, number> = {};
    const kPct: Record<string, number> = {};
    for (const d of dims) {
      const iQ = data.interestQuestions.map((q, idx) => ({ q, idx })).filter((x) => x.q.dim === d);
      const iSum = iQ.reduce((s, x) => s + (interest[x.idx] ?? 0), 0);
      iPct[d] = Math.round((iSum / (iQ.length * 3)) * 100);
      const aIdx = data.abilityQuestions.findIndex((q) => q.dim === d);
      kPct[d] = Math.round(((ability[aIdx] ?? 0) / 3) * 100);
    }
    const combo = Object.fromEntries(dims.map((d) => [d, Math.round(iPct[d] * 0.6 + kPct[d] * 0.4)]));
    const topDims = Object.entries(combo).sort((a, b) => b[1] - a[1]).slice(0, 2).map((x) => x[0]);
    const both = dims.filter((d) => iPct[d] >= 50 && kPct[d] >= 50).sort((a, b) => combo[b] - combo[a]);
    setResult({ iPct, kPct, topDims, both });
    setRecs(await api.recommend(topDims, 9));
    setTimeout(() => document.getElementById("ergebnis")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const reset = () => {
    setInterest({});
    setAbility({});
    setResult(null);
    setRecs([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const topI = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.iPct).sort((a, b) => b[1] - a[1]).slice(0, 2).map((x) => x[0]);
  }, [result]);

  if (!data) return <p className="py-12 text-center text-slate-400">Lädt …</p>;

  return (
    <div className="animate-fade space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-2xl">
          <Puzzle size={24} strokeWidth={1.75} className="text-brand-600" /> Stärken-Schwächen-Test
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Zwei kurze Teile: zuerst <b>was du gern machst</b>, dann <b>was du gut kannst</b>. Antworte einfach ehrlich.
        </p>
      </div>

      <div className="sticky top-[68px] z-10 rounded-xl bg-slate-100/90 py-2 backdrop-blur dark:bg-slate-950/90">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-brand-600 transition-all" style={{ width: `${Math.round((answered / total) * 100)}%` }} />
        </div>
        <span className="mt-1 block text-xs font-semibold text-slate-500">{answered} / {total} beantwortet</span>
      </div>

      <h3 className="flex items-center gap-2 border-b border-slate-200 pb-1.5 text-lg text-brand-600 dark:border-slate-800">
        <Smile size={18} strokeWidth={1.75} /> Teil 1 · Das mache ich gern
      </h3>
      <QuestionBlock questions={data.interestQuestions} scale={data.interestScale} answers={interest} numbered
        onAnswer={(i, v) => setInterest((p) => ({ ...p, [i]: v }))} />

      <h3 className="flex items-center gap-2 border-b border-slate-200 pb-1.5 text-lg text-brand-600 dark:border-slate-800">
        <Dumbbell size={18} strokeWidth={1.75} /> Teil 2 · Das kann ich gut
      </h3>
      <p className="text-sm text-slate-500">Wie gut kannst du das deiner Meinung nach schon?</p>
      <QuestionBlock questions={data.abilityQuestions} scale={data.abilityScale} answers={ability}
        onAnswer={(i, v) => setAbility((p) => ({ ...p, [i]: v }))} />

      <div className="flex flex-wrap gap-3">
        <button onClick={evaluate} className="btn-primary"><Check size={16} /> Auswerten</button>
        <button onClick={reset} className="btn-soft"><RotateCcw size={15} /> Zurücksetzen</button>
      </div>

      {result && (
        <div id="ergebnis" className="space-y-4 pt-4">
          <h2 className="flex items-center gap-2 text-2xl">
            <Trophy size={24} strokeWidth={1.75} className="text-brand-600" /> Dein Ergebnis
          </h2>
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2"><Smile size={18} strokeWidth={1.75} className="text-brand-600" /> Was du gern machst (Interessen)</h3>
            <ProfileBars values={result.iPct} />
          </div>
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2"><Dumbbell size={18} strokeWidth={1.75} className="text-brand-600" /> Was du gut kannst (Stärken)</h3>
            <ProfileBars values={result.kPct} />
          </div>

          <div className="flex gap-3 rounded-xl border-l-4 border-violet-500 bg-violet-50 p-4 dark:bg-violet-950/40">
            <Gem size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-violet-500" />
            <p>
              <b>Hier passt beides zusammen:</b>{" "}
              {result.both.length
                ? result.both.map((d) => getDimension(d as DimensionKey)?.name).join(", ") +
                  " – das machst du gern und kannst es gut. Hier kannst du richtig aufblühen!"
                : "Noch keine klare Überschneidung – probiere in einer Schnupperlehre aus, was dir liegt."}
            </p>
          </div>
          <div className="flex gap-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <Star size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-emerald-500" />
            <p>
              <b>Deine grössten Stärken:</b>{" "}
              {topI.map((d) => getDimension(d as DimensionKey)?.name).join(" und ")}.
            </p>
          </div>

          <h3 className="pt-2 text-xl font-bold">Berufe, die zu dir passen könnten</h3>
          <ProfessionGrid professions={recs} empty="Keine passenden Berufe gefunden." />
        </div>
      )}
    </div>
  );
}
