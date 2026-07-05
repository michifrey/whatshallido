import { Building2, FileDown, GraduationCap, Languages, Lightbulb, Plus, Trash2, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { LetterData } from "../lib/letter";
import { downloadResumeDocx } from "../lib/docx";
import {
  buildResume, emptyEntry, emptyLanguage, emptyReference, emptyResumeExtras,
  type LanguageEntry, type ReferenceEntry, type ResumeEntry, type ResumeExtras,
} from "../lib/resume";
import { Field } from "./Field";

const KEY = "bk-lebenslauf";

function readExtras(): ResumeExtras {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...emptyResumeExtras, ...(JSON.parse(raw) as ResumeExtras) };
  } catch {
    /* ignorieren */
  }
  return structuredClone(emptyResumeExtras);
}

/** Kleiner Editor für einen Zeitraum-Eintrag (Schulbildung / Erfahrung). */
function EntryEditor({
  entry, onChange, onRemove,
}: {
  entry: ResumeEntry; onChange: (e: ResumeEntry) => void; onRemove: () => void;
}) {
  const set = (k: keyof ResumeEntry) => (v: string) => onChange({ ...entry, [k]: v });
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Von" value={entry.von} onChange={set("von")} placeholder="z.B. 2021" />
        <Field label="Bis" value={entry.bis} onChange={set("bis")} placeholder="z.B. heute" />
      </div>
      <Field label="Bezeichnung" value={entry.titel} onChange={set("titel")} placeholder="z.B. Sekundarschule Aarau" />
      <Field label="Ort (optional)" value={entry.ort} onChange={set("ort")} placeholder="z.B. Aarau" />
      <Field label="Details (optional)" value={entry.beschreibung} onChange={set("beschreibung")} textarea
        placeholder="z.B. Schwerpunkt Mathematik & Informatik" />
      <button onClick={onRemove} className="btn-soft text-red-600"><Trash2 size={14} /> Eintrag entfernen</button>
    </div>
  );
}

export function Lebenslauf({ person }: { person: LetterData }) {
  const [extras, setExtras] = useState<ResumeExtras>(readExtras);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(extras));
  }, [extras]);

  const set = (key: keyof ResumeExtras) => (v: string) => setExtras((e) => ({ ...e, [key]: v }));

  // Helfer für die Listen-Abschnitte.
  const updateList = <T,>(key: "bildung" | "erfahrung" | "sprachen" | "referenzen") => ({
    update: (i: number, val: T) =>
      setExtras((e) => ({ ...e, [key]: (e[key] as T[]).map((x, j) => (j === i ? val : x)) })),
    add: (val: T) => setExtras((e) => ({ ...e, [key]: [...(e[key] as T[]), val] })),
    remove: (i: number) => setExtras((e) => ({ ...e, [key]: (e[key] as T[]).filter((_, j) => j !== i) })),
  });

  const bildung = updateList<ResumeEntry>("bildung");
  const erfahrung = updateList<ResumeEntry>("erfahrung");
  const sprachen = updateList<LanguageEntry>("sprachen");
  const referenzen = updateList<ReferenceEntry>("referenzen");

  const resume = buildResume(person, extras);
  const fileBase = `Lebenslauf_${(`${person.vorname}_${person.nachname}`.trim() || "Vorlage").replace(/[^\wäöü]+/gi, "_")}`;
  const download = () => downloadResumeDocx(resume, `${fileBase}.docx`);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Formular */}
      <div className="space-y-5 no-print">
        <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2"><User size={18} strokeWidth={1.75} className="text-brand-600" /> Persönliche Angaben</h3>
          <p className="text-xs text-slate-400">
            Name, Adresse und Kontakt werden aus dem Bewerbungsbrief übernommen. Hier nur ergänzen:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Geburtsdatum" value={extras.geburtsdatum} onChange={set("geburtsdatum")} placeholder="z.B. 12.03.2009" />
            <Field label="Nationalität" value={extras.nationalitaet} onChange={set("nationalitaet")} placeholder="z.B. Schweiz" />
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2"><GraduationCap size={18} strokeWidth={1.75} className="text-brand-600" /> Schulbildung</h3>
          {extras.bildung.map((e, i) => (
            <EntryEditor key={i} entry={e} onChange={(v) => bildung.update(i, v)} onRemove={() => bildung.remove(i)} />
          ))}
          <button onClick={() => bildung.add({ ...emptyEntry })} className="btn-soft"><Plus size={14} /> Schule hinzufügen</button>
        </section>

        <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2"><Building2 size={18} strokeWidth={1.75} className="text-brand-600" /> Praktische Erfahrungen</h3>
          <p className="text-xs text-slate-400">Schnupperlehren, Praktika, Ferienjobs …</p>
          {extras.erfahrung.map((e, i) => (
            <EntryEditor key={i} entry={e} onChange={(v) => erfahrung.update(i, v)} onRemove={() => erfahrung.remove(i)} />
          ))}
          <button onClick={() => erfahrung.add({ ...emptyEntry })} className="btn-soft"><Plus size={14} /> Erfahrung hinzufügen</button>
        </section>

        <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2"><Languages size={18} strokeWidth={1.75} className="text-brand-600" /> Sprachkenntnisse</h3>
          {extras.sprachen.map((s, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="grid flex-1 grid-cols-2 gap-3">
                <Field label="Sprache" value={s.sprache} onChange={(v) => sprachen.update(i, { ...s, sprache: v })} placeholder="z.B. Deutsch" />
                <Field label="Niveau" value={s.niveau} onChange={(v) => sprachen.update(i, { ...s, niveau: v })} placeholder="z.B. Muttersprache" />
              </div>
              <button onClick={() => sprachen.remove(i)} className="btn-soft mb-0.5 text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => sprachen.add({ ...emptyLanguage })} className="btn-soft"><Plus size={14} /> Sprache hinzufügen</button>
        </section>

        <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2"><Lightbulb size={18} strokeWidth={1.75} className="text-brand-600" /> Weiteres</h3>
          <Field label="Weitere Kenntnisse" value={extras.kenntnisse} onChange={set("kenntnisse")} textarea
            placeholder="z.B. gute PC-Kenntnisse (Word, Excel), Programmieren" />
          <Field label="Hobbys & Interessen" value={extras.hobbys} onChange={set("hobbys")} textarea
            placeholder="z.B. Fussball im Verein, Lesen, Velofahren" />
        </section>

        <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2"><Users size={18} strokeWidth={1.75} className="text-brand-600" /> Referenzen (optional)</h3>
          {extras.referenzen.map((r, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={r.name} onChange={(v) => referenzen.update(i, { ...r, name: v })} placeholder="z.B. Frau Meier" />
                <Field label="Funktion" value={r.funktion} onChange={(v) => referenzen.update(i, { ...r, funktion: v })} placeholder="z.B. Klassenlehrerin" />
              </div>
              <Field label="Kontakt" value={r.kontakt} onChange={(v) => referenzen.update(i, { ...r, kontakt: v })} placeholder="z.B. 079 000 00 00" />
              <button onClick={() => referenzen.remove(i)} className="btn-soft text-red-600"><Trash2 size={14} /> Referenz entfernen</button>
            </div>
          ))}
          <button onClick={() => referenzen.add({ ...emptyReference })} className="btn-soft"><Plus size={14} /> Referenz hinzufügen</button>
        </section>
      </div>

      {/* Vorschau */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-2 flex flex-wrap gap-2 no-print">
          <button onClick={download} className="btn-primary"><FileDown size={16} /> Als Word (.docx)</button>
        </div>
        <div className="print-area card space-y-4 p-6 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
          <div>
            <p className="text-xl font-bold text-brand-600">{resume.name || "Dein Name"}</p>
            {resume.kontaktzeilen.map((z, i) => <p key={i} className="text-xs text-slate-500 dark:text-slate-400">{z}</p>)}
            {resume.eckdaten.map((z, i) => <p key={i} className="text-xs text-slate-500 dark:text-slate-400">{z}</p>)}
          </div>
          {resume.sections.length === 0 && (
            <p className="text-slate-400">Fülle die Felder aus – dein Lebenslauf entsteht hier live.</p>
          )}
          {resume.sections.map((sec) => (
            <div key={sec.titel}>
              <p className="mb-1 border-b border-brand-600/40 pb-0.5 text-xs font-bold uppercase tracking-wide text-brand-600">
                {sec.titel}
              </p>
              <div className="space-y-2">
                {sec.eintraege.map((e, i) => (
                  <div key={i} className="grid grid-cols-[7rem_1fr] gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{e.zeitraum}</span>
                    <div>
                      <p className="font-semibold">{e.titel}</p>
                      {e.details.map((d, j) => <p key={j} className="text-slate-600 dark:text-slate-300">{d}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
