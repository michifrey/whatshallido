import { describe, expect, it } from "vitest";
import { buildLetter, type LetterData } from "../src/lib/letter";

const base: LetterData = {
  vorname: "Lena",
  nachname: "Frey",
  strasse: "Musterweg 1",
  plz: "5000",
  ort: "Aarau",
  telefon: "079 000 00 00",
  email: "lena@example.com",
  firma: "Muster AG",
  ansprechperson: "Frau Meier",
  firmaStrasse: "Industriestr. 5",
  firmaPlz: "5000",
  firmaOrt: "Aarau",
  beruf: "Informatikerin EFZ",
  zeitraum: "in den Frühlingsferien",
  motivation: "",
  staerken: "Genauigkeit und Teamfähigkeit",
  schule: "die 3. Sek in Aarau",
  hobbys: "programmiere ich kleine Spiele",
};

const fixedDate = new Date(2026, 5, 3); // 3. Juni 2026

describe("buildLetter", () => {
  it("Schnupperlehre: Betreff, Name, Datum und Anrede", () => {
    const text = buildLetter(base, "schnupperlehre", fixedDate);
    expect(text).toContain("Bewerbung für eine Schnupperlehre als Informatikerin EFZ");
    expect(text).toContain("Guten Tag Frau Meier");
    expect(text).toContain("3. Juni 2026");
    expect(text).toContain("Lena Frey");
    expect(text).toContain("in den Frühlingsferien");
  });

  it("Lehrstelle: anderer Betreff und Beilagen", () => {
    const text = buildLetter(base, "lehrstelle", fixedDate);
    expect(text).toContain("Bewerbung um eine Lehrstelle als Informatikerin EFZ");
    expect(text).toContain("Beilagen:");
    expect(text).toContain("Lebenslauf");
  });

  it("ohne Ansprechperson: neutrale Anrede", () => {
    const text = buildLetter({ ...base, ansprechperson: "" }, "schnupperlehre", fixedDate);
    expect(text).toContain("Sehr geehrte Damen und Herren");
  });

  it("nutzt Fallback-Motivation, wenn leer", () => {
    const text = buildLetter(base, "schnupperlehre", fixedDate);
    expect(text.toLowerCase()).toContain("reizt mich");
  });
});
