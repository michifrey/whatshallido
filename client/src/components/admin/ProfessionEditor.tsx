import { X } from "lucide-react";
import { useState } from "react";
import type { ProfessionInput } from "../../api/admin";
import { useTaxonomy } from "../../context/TaxonomyContext";
import type { Profession } from "../../types";
import { ImagePicker } from "./ImagePicker";

interface Props {
  token: string;
  initial?: Profession;
  onClose: () => void;
  onSave: (input: ProfessionInput) => void;
  saving?: boolean;
  error?: string | null;
}

export function ProfessionEditor({ token, initial, onClose, onSave, saving, error }: Props) {
  const { categories, dimensions } = useTaxonomy();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? categories[0].key);
  const [type, setType] = useState<"lehre" | "weiterfuehrend">(initial?.type ?? "lehre");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  const toggleTag = (key: string) =>
    setTags((t) => (t.includes(key) ? t.filter((x) => x !== key) : [...t, key]));

  const submit = () => {
    if (name.trim().length < 2) return alert("Bitte einen Namen eingeben.");
    if (tags.length === 0) return alert("Bitte mindestens ein Interessens-Tag wählen.");
    onSave({
      id: initial?.id,
      name: name.trim(),
      category,
      type,
      duration: duration || null,
      tags,
      description: description || null,
      imageUrl: imageUrl || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 animate-fade">
      <div className="w-full max-w-xl animate-pop rounded-2xl bg-white p-6 shadow-cardlg dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold">{isEdit ? "Beruf bearbeiten" : "Neuer Beruf"}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold">Kategorie</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Typ</span>
              <select value={type} onChange={(e) => setType(e.target.value as "lehre" | "weiterfuehrend")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
                <option value="lehre">Lehre (EFZ/EBA)</option>
                <option value="weiterfuehrend">Weiterführend</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Dauer</span>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="z.B. 3–4 Jahre"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          </label>

          <div>
            <span className="text-sm font-semibold">Interessens-Tags</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {dimensions.map((d) => (
                <button key={d.key} type="button" onClick={() => toggleTag(d.key)}
                  className={`chip ${tags.includes(d.key) ? "chip-active" : ""}`}>
                  {d.emoji} {d.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Beschreibung</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          </label>

          <div>
            <span className="text-sm font-semibold">Bild</span>
            <div className="mt-1">
              <ImagePicker token={token} value={imageUrl} defaultQuery={name || category} onChange={setImageUrl} />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950/40">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={submit} disabled={saving} className="btn-primary flex-1">
              {saving ? "Speichert …" : "Speichern"}
            </button>
            <button onClick={onClose} className="btn-soft">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  );
}
