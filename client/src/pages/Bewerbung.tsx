import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { buildLetter, type LetterData, type LetterMode } from "../lib/letter";

const emptyData: LetterData = {
  vorname: "", nachname: "", strasse: "", plz: "", ort: "", telefon: "", email: "",
  firma: "", ansprechperson: "", firmaStrasse: "", firmaPlz: "", firmaOrt: "",
  beruf: "", zeitraum: "", motivation: "", staerken: "", schule: "", hobbys: "",
};

function Field({
  label, value, onChange, placeholder, textarea, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        />
      )}
      {hint && <span className="mt-0.5 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function Bewerbung() {
  const [params] = useSearchParams();
  const { data: professions = [] } = useQuery({ queryKey: ["professions", "all"], queryFn: () => api.professions() });

  const [mode, setMode] = useState<LetterMode>(
    params.get("mode") === "schnupperlehre" ? "schnupperlehre" : "lehrstelle",
  );
  const [data, setData] = useState<LetterData>({ ...emptyData });
  const [copied, setCopied] = useState(false);

  // Beruf aus der URL vorbefüllen, sobald die Liste da ist
  const prefillId = params.get("beruf");
  useEffect(() => {
    if (prefillId) {
      const p = professions.find((x) => x.id === prefillId);
      if (p) setData((d) => (d.beruf ? d : { ...d, beruf: p.name }));
    }
  }, [prefillId, professions]);

  const set = (key: keyof LetterData) => (v: string) => setData((d) => ({ ...d, [key]: v }));
  const letter = buildLetter(data, mode);

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const download = () => {
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Bewerbung_${(data.beruf || "Beruf").replace(/[^\wäöü]+/gi, "_")}.txt`;
    a.click();
  };

  return (
    <div className="animate-fade space-y-5">
      <div className="no-print">
        <h2 className="text-2xl font-extrabold">📄 Bewerbungs-Helfer</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Fülle die Felder aus – rechts entsteht dein Bewerbungsbrief live. Am Schluss kopieren,
          als Datei speichern oder als PDF drucken.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-full bg-slate-200 p-1 no-print dark:bg-slate-800">
        {(["lehrstelle", "schnupperlehre"] as LetterMode[]).map((m) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formular */}
        <div className="space-y-5 no-print">
          <section className="card space-y-3 p-5">
            <h3 className="font-bold">👤 Über dich</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vorname" value={data.vorname} onChange={set("vorname")} />
              <Field label="Nachname" value={data.nachname} onChange={set("nachname")} />
            </div>
            <Field label="Strasse / Nr." value={data.strasse} onChange={set("strasse")} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="PLZ" value={data.plz} onChange={set("plz")} />
              <Field label="Ort" value={data.ort} onChange={set("ort")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefon" value={data.telefon} onChange={set("telefon")} />
              <Field label="E-Mail" value={data.email} onChange={set("email")} />
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <h3 className="font-bold">🏢 Firma / Betrieb</h3>
            <Field label="Firmenname" value={data.firma} onChange={set("firma")} />
            <Field label="Ansprechperson (optional)" value={data.ansprechperson} onChange={set("ansprechperson")} placeholder="z.B. Frau Meier" />
            <Field label="Strasse / Nr. (optional)" value={data.firmaStrasse} onChange={set("firmaStrasse")} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="PLZ (optional)" value={data.firmaPlz} onChange={set("firmaPlz")} />
              <Field label="Ort (optional)" value={data.firmaOrt} onChange={set("firmaOrt")} />
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <h3 className="font-bold">✍️ Zur Bewerbung</h3>
            <Field label="Beruf" value={data.beruf} onChange={set("beruf")} placeholder="z.B. Informatikerin EFZ" />
            {mode === "schnupperlehre" && (
              <Field label="Wunsch-Zeitraum" value={data.zeitraum} onChange={set("zeitraum")} placeholder="z.B. in den Frühlingsferien" />
            )}
            <Field label="Warum dieser Beruf? (Motivation)" value={data.motivation} onChange={set("motivation")} textarea
              hint="Leer lassen für einen Vorschlagstext." />
            <Field label="Deine Stärken" value={data.staerken} onChange={set("staerken")} placeholder="z.B. Genauigkeit, Teamfähigkeit" />
            <Field label="Schule (optional)" value={data.schule} onChange={set("schule")} placeholder="z.B. die 3. Sek in Aarau" />
            <Field label="Hobbys (optional)" value={data.hobbys} onChange={set("hobbys")} placeholder="z.B. spiele ich Handball" />
          </section>
        </div>

        {/* Vorschau */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-2 flex flex-wrap gap-2 no-print">
            <button onClick={copy} className="btn-soft">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Kopiert!" : "Kopieren"}
            </button>
            <button onClick={download} className="btn-soft"><Download size={16} /> Als Datei</button>
            <button onClick={() => window.print()} className="btn-soft"><Printer size={16} /> Drucken / PDF</button>
          </div>
          <pre className="print-area card whitespace-pre-wrap p-6 font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-100">
            {letter}
          </pre>
        </div>
      </div>
    </div>
  );
}
