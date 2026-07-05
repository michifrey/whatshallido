import type { LetterData } from "./letter";

/** Ein Zeitraum-Eintrag (Schulbildung, Praktika/Schnupperlehren). */
export interface ResumeEntry {
  von: string;
  bis: string;
  titel: string;
  ort: string;
  beschreibung: string;
}

/** Ein Sprachkenntnis-Eintrag. */
export interface LanguageEntry {
  sprache: string;
  niveau: string;
}

/** Eine Referenz-/Auskunftsperson. */
export interface ReferenceEntry {
  name: string;
  funktion: string;
  kontakt: string;
}

/** Lebenslauf-spezifische Felder (die persönlichen Angaben kommen aus {@link LetterData}). */
export interface ResumeExtras {
  geburtsdatum: string;
  nationalitaet: string;
  bildung: ResumeEntry[];
  erfahrung: ResumeEntry[];
  sprachen: LanguageEntry[];
  kenntnisse: string;
  hobbys: string;
  referenzen: ReferenceEntry[];
  /** Optionales Bewerbungsfoto als Data-URL (auf 5:6 zugeschnitten). */
  foto: string;
}

/** Verfügbare Design-Vorlagen für den Lebenslauf. */
export type TemplateId = "klassisch" | "modern" | "kreativ";

export const TEMPLATES: { id: TemplateId; name: string; beschreibung: string }[] = [
  { id: "modern", name: "Modern", beschreibung: "Farbige Akzente, einspaltig" },
  { id: "kreativ", name: "Kreativ", beschreibung: "Farbige Seitenleiste, zweispaltig" },
  { id: "klassisch", name: "Klassisch", beschreibung: "Schlicht, schwarz-weiss" },
];

/** Wählbare Akzentfarben (Hex ohne #). */
export const ACCENTS: { id: string; name: string; hex: string }[] = [
  { id: "blau", name: "Blau", hex: "2563EB" },
  { id: "gruen", name: "Grün", hex: "059669" },
  { id: "bordeaux", name: "Bordeaux", hex: "9F1239" },
  { id: "anthrazit", name: "Anthrazit", hex: "334155" },
  { id: "violett", name: "Violett", hex: "7C3AED" },
];

/** Abschnitte, die in der «Kreativ»-Vorlage in die Seitenleiste wandern. */
export const SIDEBAR_SECTIONS = ["Sprachkenntnisse", "Weitere Kenntnisse", "Hobbys & Interessen"];

export const emptyEntry: ResumeEntry = { von: "", bis: "", titel: "", ort: "", beschreibung: "" };
export const emptyLanguage: LanguageEntry = { sprache: "", niveau: "" };
export const emptyReference: ReferenceEntry = { name: "", funktion: "", kontakt: "" };

export const emptyResumeExtras: ResumeExtras = {
  geburtsdatum: "",
  nationalitaet: "",
  bildung: [{ ...emptyEntry }],
  erfahrung: [{ ...emptyEntry }],
  sprachen: [{ ...emptyLanguage }],
  kenntnisse: "",
  hobbys: "",
  referenzen: [],
  foto: "",
};

/** Ein aufbereiteter Zeitraum-Eintrag: Zeitspanne links, Inhalt rechts. */
export interface RenderedEntry {
  zeitraum: string;
  titel: string;
  details: string[];
}

/** Ein Abschnitt des Lebenslaufs (z. B. «Schulbildung»). */
export interface ResumeSection {
  titel: string;
  eintraege: RenderedEntry[];
}

/** Der fertig aufbereitete Lebenslauf, unabhängig vom Ausgabeformat (DOCX, Vorschau …). */
export interface RenderedResume {
  name: string;
  kontaktzeilen: string[];
  eckdaten: string[];
  sections: ResumeSection[];
}

function clean(s: string): string {
  return s.trim();
}

function zeitraum(e: ResumeEntry): string {
  const von = clean(e.von);
  const bis = clean(e.bis);
  if (von && bis) return `${von} – ${bis}`;
  return von || bis;
}

function hasEntry(e: ResumeEntry): boolean {
  return Boolean(clean(e.von) || clean(e.bis) || clean(e.titel) || clean(e.ort) || clean(e.beschreibung));
}

function renderEntries(entries: ResumeEntry[]): RenderedEntry[] {
  return entries
    .filter(hasEntry)
    .map((e) => ({
      zeitraum: zeitraum(e),
      titel: clean(e.titel),
      details: [clean(e.ort), clean(e.beschreibung)].filter(Boolean),
    }));
}

/** Fügt persönliche Angaben und Lebenslauf-Felder zu einem druckfertigen Lebenslauf zusammen. */
export function buildResume(person: LetterData, extras: ResumeExtras): RenderedResume {
  const name = `${clean(person.vorname)} ${clean(person.nachname)}`.trim();

  const adresse = [clean(person.strasse), `${clean(person.plz)} ${clean(person.ort)}`.trim()]
    .filter(Boolean)
    .join(", ");
  const kontaktzeilen = [adresse, clean(person.telefon), clean(person.email)].filter(Boolean);

  const eckdaten: string[] = [];
  if (clean(extras.geburtsdatum)) eckdaten.push(`Geburtsdatum: ${clean(extras.geburtsdatum)}`);
  if (clean(extras.nationalitaet)) eckdaten.push(`Nationalität: ${clean(extras.nationalitaet)}`);

  const sections: ResumeSection[] = [];

  const bildung = renderEntries(extras.bildung);
  if (bildung.length) sections.push({ titel: "Schulbildung", eintraege: bildung });

  const erfahrung = renderEntries(extras.erfahrung);
  if (erfahrung.length) sections.push({ titel: "Praktische Erfahrungen", eintraege: erfahrung });

  const sprachen = extras.sprachen
    .filter((s) => clean(s.sprache))
    .map((s) => ({
      zeitraum: "",
      titel: clean(s.niveau) ? `${clean(s.sprache)} – ${clean(s.niveau)}` : clean(s.sprache),
      details: [] as string[],
    }));
  if (sprachen.length) sections.push({ titel: "Sprachkenntnisse", eintraege: sprachen });

  if (clean(extras.kenntnisse)) {
    sections.push({
      titel: "Weitere Kenntnisse",
      eintraege: [{ zeitraum: "", titel: clean(extras.kenntnisse), details: [] }],
    });
  }

  if (clean(extras.hobbys)) {
    sections.push({
      titel: "Hobbys & Interessen",
      eintraege: [{ zeitraum: "", titel: clean(extras.hobbys), details: [] }],
    });
  }

  const referenzen = extras.referenzen
    .filter((r) => clean(r.name) || clean(r.funktion) || clean(r.kontakt))
    .map((r) => ({
      zeitraum: "",
      titel: [clean(r.name), clean(r.funktion)].filter(Boolean).join(", "),
      details: [clean(r.kontakt)].filter(Boolean),
    }));
  if (referenzen.length) sections.push({ titel: "Referenzen", eintraege: referenzen });

  return { name, kontaktzeilen, eckdaten, sections };
}

/** Teilt die Abschnitte für die zweispaltige «Kreativ»-Vorlage in Seitenleiste und Hauptspalte. */
export function splitSections(sections: ResumeSection[]): { sidebar: ResumeSection[]; main: ResumeSection[] } {
  return {
    sidebar: sections.filter((s) => SIDEBAR_SECTIONS.includes(s.titel)),
    main: sections.filter((s) => !SIDEBAR_SECTIONS.includes(s.titel)),
  };
}
