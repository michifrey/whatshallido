import { Building2, FileDown, GraduationCap, ImagePlus, Languages, Lightbulb, Plus, Trash2, User, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LetterData } from "../lib/letter";
import { downloadResumeDocx } from "../lib/docx";
import {
  ACCENTS, buildResume, emptyEntry, emptyLanguage, emptyReference, emptyResumeExtras, splitSections, TEMPLATES,
  type LanguageEntry, type ReferenceEntry, type ResumeEntry, type ResumeExtras, type ResumeSection, type TemplateId,
} from "../lib/resume";
import { Field } from "./Field";

const KEY = "bk-lebenslauf";
const DESIGN_KEY = "bk-lebenslauf-design";

interface Design {
  template: TemplateId;
  accent: string;
}
const defaultDesign: Design = { template: "modern", accent: ACCENTS[0].hex };

function readExtras(): ResumeExtras {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...emptyResumeExtras, ...(JSON.parse(raw) as ResumeExtras) };
  } catch {
    /* ignorieren */
  }
  return structuredClone(emptyResumeExtras);
}

function readDesign(): Design {
  try {
    const raw = localStorage.getItem(DESIGN_KEY);
    if (raw) return { ...defaultDesign, ...(JSON.parse(raw) as Design) };
  } catch {
    /* ignorieren */
  }
  return { ...defaultDesign };
}

/** Skaliert ein hochgeladenes Bild auf 5:6 zu und liefert eine JPEG-Data-URL. */
function fileToPortrait(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const W = 300, H = 360;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas nicht verfügbar"));
        const scale = Math.max(W / img.width, H / img.height);
        const sw = W / scale, sh = H / scale;
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, W, H);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden"));
    reader.readAsDataURL(file);
  });
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

/** Ein Zeitraum-Eintrag in der Vorschau. */
function PreviewEntry({ e, muted, body }: { e: ResumeSection["eintraege"][number]; muted: string; body: string }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-2">
      <span className="text-[11px]" style={{ color: muted }}>{e.zeitraum}</span>
      <div>
        <p className="text-[13px] font-semibold" style={{ color: body }}>{e.titel}</p>
        {e.details.map((d, j) => <p key={j} className="text-[12px]" style={{ color: muted }}>{d}</p>)}
      </div>
    </div>
  );
}

export function Lebenslauf({ person }: { person: LetterData }) {
  const [extras, setExtras] = useState<ResumeExtras>(readExtras);
  const [design, setDesign] = useState<Design>(readDesign);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(extras)); }, [extras]);
  useEffect(() => { localStorage.setItem(DESIGN_KEY, JSON.stringify(design)); }, [design]);

  const set = (key: keyof ResumeExtras) => (v: string) => setExtras((e) => ({ ...e, [key]: v }));

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

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await fileToPortrait(file);
      setExtras((e) => ({ ...e, foto: url }));
    } catch {
      /* ignorieren */
    }
  };

  const resume = buildResume(person, extras);
  const fileBase = `Lebenslauf_${(`${person.vorname}_${person.nachname}`.trim() || "Vorlage").replace(/[^\wäöü]+/gi, "_")}`;
  const download = () =>
    downloadResumeDocx(resume, `${fileBase}.docx`, {
      template: design.template,
      accent: design.accent,
      foto: extras.foto || undefined,
    });

  const A = `#${design.accent}`;
  const { sidebar, main } = splitSections(resume.sections);
  const isKreativ = design.template === "kreativ";
  const isModern = design.template === "modern";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Formular */}
      <div className="space-y-5 no-print">
        {/* Design-Auswahl */}
        <section className="card space-y-4 p-5">
          <h3 className="flex items-center gap-2"><Lightbulb size={18} strokeWidth={1.75} className="text-brand-600" /> Vorlage & Design</h3>
          <div>
            <span className="text-sm font-semibold">Vorlage</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDesign((d) => ({ ...d, template: t.id }))}
                  className={`rounded-xl border p-2 text-left transition ${
                    design.template === t.id
                      ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600 dark:bg-brand-950/30"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">{t.beschreibung}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold">Akzentfarbe</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDesign((d) => ({ ...d, accent: c.hex }))}
                  title={c.name}
                  aria-label={c.name}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    design.accent === c.hex ? "border-slate-900 dark:border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: `#${c.hex}` }}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold">Bewerbungsfoto (optional)</span>
            <div className="mt-2 flex items-center gap-3">
              {extras.foto ? (
                <div className="relative">
                  <img src={extras.foto} alt="Foto-Vorschau" className="h-16 w-[3.33rem] rounded-md object-cover" />
                  <button
                    onClick={() => setExtras((e) => ({ ...e, foto: "" }))}
                    className="absolute -right-2 -top-2 rounded-full bg-red-600 p-0.5 text-white"
                    aria-label="Foto entfernen"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : null}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
              <button onClick={() => fileInput.current?.click()} className="btn-soft">
                <ImagePlus size={15} /> {extras.foto ? "Foto ersetzen" : "Foto hochladen"}
              </button>
            </div>
          </div>
        </section>

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

        {resume.sections.length === 0 && !resume.name ? (
          <div className="card p-6 text-sm text-slate-400">Fülle die Felder aus – dein Lebenslauf entsteht hier live.</div>
        ) : isKreativ ? (
          /* --- Kreativ: Seitenleiste + Hauptspalte --- */
          <div className="card grid grid-cols-[38%_1fr] overflow-hidden p-0 text-sm">
            <div className="space-y-3 p-4 text-white" style={{ backgroundColor: A }}>
              {extras.foto && <img src={extras.foto} alt="" className="mx-auto h-24 w-20 rounded-md object-cover" />}
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide">Kontakt</p>
                {resume.kontaktzeilen.map((z, i) => <p key={i} className="text-[12px] opacity-90">{z}</p>)}
                {resume.eckdaten.map((z, i) => <p key={i} className="text-[12px] opacity-90">{z}</p>)}
              </div>
              {sidebar.map((sec) => (
                <div key={sec.titel}>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide">{sec.titel}</p>
                  {sec.eintraege.map((e, i) => <p key={i} className="text-[12px] opacity-90">{e.titel}</p>)}
                </div>
              ))}
            </div>
            <div className="space-y-3 p-4">
              <p className="text-lg font-bold" style={{ color: A }}>{resume.name || "Dein Name"}</p>
              {main.map((sec) => (
                <div key={sec.titel}>
                  <p className="mb-1 border-b pb-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: A, borderColor: A }}>{sec.titel}</p>
                  <div className="space-y-2">
                    {sec.eintraege.map((e, i) => <PreviewEntry key={i} e={e} muted="#6B7280" body="#1F2937" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- Klassisch & Modern: einspaltig --- */
          <div className="card overflow-hidden p-0 text-sm">
            {isModern ? (
              <div className="flex items-center justify-between gap-3 p-5 text-white" style={{ backgroundColor: A }}>
                <div>
                  <p className="text-xl font-bold">{resume.name || "Dein Name"}</p>
                  {resume.kontaktzeilen.map((z, i) => <p key={i} className="text-[12px] opacity-90">{z}</p>)}
                  {resume.eckdaten.map((z, i) => <p key={i} className="text-[12px] opacity-90">{z}</p>)}
                </div>
                {extras.foto && <img src={extras.foto} alt="" className="h-20 w-[4.16rem] shrink-0 rounded-md object-cover" />}
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 p-5 pb-2">
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{resume.name || "Dein Name"}</p>
                  {resume.kontaktzeilen.map((z, i) => <p key={i} className="text-[12px] text-slate-500 dark:text-slate-400">{z}</p>)}
                  {resume.eckdaten.map((z, i) => <p key={i} className="text-[12px] text-slate-500 dark:text-slate-400">{z}</p>)}
                </div>
                {extras.foto && <img src={extras.foto} alt="" className="h-20 w-[4.16rem] shrink-0 rounded-md object-cover" />}
              </div>
            )}
            <div className="space-y-3 p-5 pt-3">
              {resume.sections.map((sec) => {
                const head = isModern ? A : undefined;
                return (
                  <div key={sec.titel}>
                    <p
                      className={`mb-1 border-b pb-0.5 text-[11px] font-bold uppercase tracking-wide ${isModern ? "" : "border-slate-400 text-slate-700 dark:text-slate-200"}`}
                      style={isModern ? { color: head, borderColor: head } : undefined}
                    >
                      {sec.titel}
                    </p>
                    <div className="space-y-2">
                      {sec.eintraege.map((e, i) => <PreviewEntry key={i} e={e} muted="#6B7280" body="#1F2937" />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
