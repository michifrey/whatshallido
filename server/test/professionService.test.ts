import { beforeAll, describe, expect, it } from "vitest";
import { seedDatabase } from "../src/db/seed.js";
import {
  getMeta,
  getProfession,
  listProfessions,
  recommendByDimensions,
} from "../src/services/professionService.js";

beforeAll(() => {
  seedDatabase();
});

describe("professionService", () => {
  it("liefert alle Berufe", () => {
    expect(listProfessions().length).toBeGreaterThanOrEqual(150);
  });

  it("filtert nach Kategorie", () => {
    const it = listProfessions({ category: "it" });
    expect(it.length).toBeGreaterThan(0);
    expect(it.every((p) => p.category === "it")).toBe(true);
  });

  it("filtert nach Typ", () => {
    const weiter = listProfessions({ type: "weiterfuehrend" });
    expect(weiter.every((p) => p.type === "weiterfuehrend")).toBe(true);
  });

  it("findet per Suchbegriff", () => {
    const koch = listProfessions({ search: "koch" });
    expect(koch.some((p) => p.name.toLowerCase().includes("koch"))).toBe(true);
  });

  it("sortiert alphabetisch", () => {
    const list = listProfessions();
    const names = list.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "de")));
  });

  it("liefert einzelnen Beruf per id", () => {
    const all = listProfessions();
    const one = getProfession(all[0].id);
    expect(one?.id).toBe(all[0].id);
  });

  it("liefert undefined für unbekannte id", () => {
    expect(getProfession("gibt-es-nicht")).toBeUndefined();
  });

  it("empfiehlt Berufe nach Dimensionen mit Match-Score", () => {
    const recs = recommendByDimensions(["kreativ", "sozial"], 5);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(5);
    expect(recs[0].match).toBeGreaterThan(0);
    // sortiert nach Score absteigend
    for (const r of recs) expect(r.tags.some((t) => ["kreativ", "sozial"].includes(t))).toBe(true);
  });

  it("ignoriert ungültige Dimensionen", () => {
    expect(recommendByDimensions(["quatsch"]).length).toBe(0);
  });

  it("liefert konsistente Meta-Zahlen", () => {
    const meta = getMeta();
    expect(meta.total).toBe(meta.lehre + meta.weiterfuehrend);
    const sum = Object.values(meta.byCategory).reduce((a, b) => a + b, 0);
    expect(sum).toBe(meta.total);
  });
});
