import { describe, expect, it } from "vitest";
import type { LetterData } from "../src/lib/letter";
import { buildResume, emptyResumeExtras, splitSections, type ResumeExtras } from "../src/lib/resume";

const person: LetterData = {
  vorname: "Lena", nachname: "Frey", strasse: "Musterweg 1", plz: "5000", ort: "Aarau",
  telefon: "079 000 00 00", email: "lena@example.com",
  firma: "", ansprechperson: "", firmaStrasse: "", firmaPlz: "", firmaOrt: "",
  beruf: "", zeitraum: "", motivation: "", staerken: "", schule: "", hobbys: "",
};

const extras: ResumeExtras = {
  ...emptyResumeExtras,
  geburtsdatum: "12.03.2009",
  nationalitaet: "Schweiz",
  bildung: [{ von: "2021", bis: "heute", titel: "Sekundarschule Aarau", ort: "Aarau", beschreibung: "" }],
  erfahrung: [{ von: "2025", bis: "", titel: "Schnupperlehre Informatik", ort: "Muster AG", beschreibung: "3 Tage" }],
  sprachen: [{ sprache: "Deutsch", niveau: "Muttersprache" }, { sprache: "", niveau: "" }],
  kenntnisse: "Word, Excel",
  hobbys: "Handball",
  referenzen: [],
};

describe("buildResume", () => {
  it("setzt Name und Kontaktzeilen aus den persönlichen Angaben zusammen", () => {
    const r = buildResume(person, extras);
    expect(r.name).toBe("Lena Frey");
    expect(r.kontaktzeilen).toContain("Musterweg 1, 5000 Aarau");
    expect(r.kontaktzeilen).toContain("079 000 00 00");
    expect(r.eckdaten).toContain("Geburtsdatum: 12.03.2009");
  });

  it("erzeugt Abschnitte nur für ausgefüllte Bereiche", () => {
    const r = buildResume(person, extras);
    const titel = r.sections.map((s) => s.titel);
    expect(titel).toEqual([
      "Schulbildung",
      "Praktische Erfahrungen",
      "Sprachkenntnisse",
      "Weitere Kenntnisse",
      "Hobbys & Interessen",
    ]);
  });

  it("formatiert Zeiträume und ignoriert leere Einträge", () => {
    const r = buildResume(person, extras);
    const schule = r.sections.find((s) => s.titel === "Schulbildung");
    expect(schule?.eintraege[0].zeitraum).toBe("2021 – heute");
    const sprachen = r.sections.find((s) => s.titel === "Sprachkenntnisse");
    expect(sprachen?.eintraege).toHaveLength(1);
    expect(sprachen?.eintraege[0].titel).toBe("Deutsch – Muttersprache");
  });

  it("liefert für leere Eingaben keine Abschnitte", () => {
    const r = buildResume(person, emptyResumeExtras);
    expect(r.sections).toHaveLength(0);
  });

  it("splitSections trennt Seitenleiste (Sprachen/Kenntnisse/Hobbys) von der Hauptspalte", () => {
    const r = buildResume(person, extras);
    const { sidebar, main } = splitSections(r.sections);
    expect(sidebar.map((s) => s.titel)).toEqual(["Sprachkenntnisse", "Weitere Kenntnisse", "Hobbys & Interessen"]);
    expect(main.map((s) => s.titel)).toEqual(["Schulbildung", "Praktische Erfahrungen"]);
  });
});
