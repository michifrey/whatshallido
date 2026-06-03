import { ListChecks, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useBewerbungen } from "../hooks/useBewerbungen";
import type { Bewerbung, BewerbungStatus } from "../types";

const STATUS: { key: BewerbungStatus; label: string; classes: string }[] = [
  { key: "geplant", label: "Geplant", classes: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  { key: "beworben", label: "Beworben", classes: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" },
  { key: "schnuppern", label: "Am Schnuppern", classes: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  { key: "gespraech", label: "Gespräch", classes: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300" },
  { key: "zusage", label: "Zusage", classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  { key: "absage", label: "Absage", classes: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
];
const statusOf = (k: BewerbungStatus) => STATUS.find((s) => s.key === k)!;
const today = () => new Date().toISOString().slice(0, 10);

export function Tracker() {
  const { items, add, update, remove } = useBewerbungen();
  const [editing, setEditing] = useState<Bewerbung | "new" | null>(null);

  const save = (data: Omit<Bewerbung, "id">) => {
    if (editing && editing !== "new") update(editing.id, data);
    else add(data);
    setEditing(null);
  };

  return (
    <div className="animate-fade space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl">
          <ListChecks size={24} strokeWidth={1.75} className="text-brand-600" /> Bewerbungs-Tracker
        </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Behalte den Überblick: wo du dich beworben hast und wie es steht. Bleibt auf diesem Gerät gespeichert.
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary ml-auto">
          <Plus size={16} /> Bewerbung hinzufügen
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STATUS.map((s) => (
          <div key={s.key} className="card p-3 text-center">
            <div className="text-xl font-extrabold">{items.filter((b) => b.status === s.key).length}</div>
            <div className="text-[11px] font-semibold text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
          Noch keine Bewerbungen erfasst. Klick auf «Bewerbung hinzufügen», um zu starten.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <div key={b.id} className="card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-[160px] flex-1">
                <p className="font-bold">{b.firma || "—"}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {b.typ === "schnupperlehre" ? "Schnupperlehre" : "Lehrstelle"}
                  {b.beruf ? ` · ${b.beruf}` : ""} · {b.datum}
                </p>
                {b.notiz && <p className="mt-1 text-sm text-slate-500">{b.notiz}</p>}
              </div>
              <select
                value={b.status}
                onChange={(e) => update(b.id, { status: e.target.value as BewerbungStatus })}
                className={`rounded-full border-0 px-3 py-1.5 text-sm font-semibold ${statusOf(b.status).classes}`}
              >
                {STATUS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <button onClick={() => setEditing(b)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800">
                <Pencil size={15} />
              </button>
              <button onClick={() => confirm("Bewerbung löschen?") && remove(b.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Editor
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function Editor({
  initial, onClose, onSave,
}: {
  initial?: Bewerbung;
  onClose: () => void;
  onSave: (data: Omit<Bewerbung, "id">) => void;
}) {
  const [firma, setFirma] = useState(initial?.firma ?? "");
  const [beruf, setBeruf] = useState(initial?.beruf ?? "");
  const [typ, setTyp] = useState(initial?.typ ?? "lehrstelle");
  const [status, setStatus] = useState<BewerbungStatus>(initial?.status ?? "geplant");
  const [datum, setDatum] = useState(initial?.datum ?? today());
  const [kontakt, setKontakt] = useState(initial?.kontakt ?? "");
  const [notiz, setNotiz] = useState(initial?.notiz ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 animate-fade">
      <div className="w-full max-w-md animate-pop rounded-2xl bg-white p-6 shadow-cardlg dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold">{initial ? "Bewerbung bearbeiten" : "Neue Bewerbung"}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <label className="block"><span className="text-sm font-semibold">Firma</span>
            <input value={firma} onChange={(e) => setFirma(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" /></label>
          <label className="block"><span className="text-sm font-semibold">Beruf</span>
            <input value={beruf} onChange={(e) => setBeruf(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm font-semibold">Art</span>
              <select value={typ} onChange={(e) => setTyp(e.target.value as Bewerbung["typ"])} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                <option value="lehrstelle">Lehrstelle</option>
                <option value="schnupperlehre">Schnupperlehre</option>
              </select></label>
            <label className="block"><span className="text-sm font-semibold">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as BewerbungStatus)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900">
                {STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm font-semibold">Datum</span>
              <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" /></label>
            <label className="block"><span className="text-sm font-semibold">Kontakt (optional)</span>
              <input value={kontakt} onChange={(e) => setKontakt(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" /></label>
          </div>
          <label className="block"><span className="text-sm font-semibold">Notiz (optional)</span>
            <textarea value={notiz} onChange={(e) => setNotiz(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900" /></label>
          <div className="flex gap-3 pt-1">
            <button onClick={() => onSave({ firma, beruf, typ, status, datum, kontakt, notiz })} className="btn-primary flex-1">Speichern</button>
            <button onClick={onClose} className="btn-soft">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  );
}
