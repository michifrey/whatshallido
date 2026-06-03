import { describe, expect, it } from "vitest";
import { computeZukunft } from "../src/domain/zukunft.js";

describe("computeZukunft", () => {
  it("liefert einen score 1–5 mit Label und Notiz", () => {
    const z = computeZukunft("Koch/Köchin EFZ", "gastro");
    expect(z.score).toBeGreaterThanOrEqual(1);
    expect(z.score).toBeLessThanOrEqual(5);
    expect(z.label.length).toBeGreaterThan(0);
    expect(z.note.length).toBeGreaterThan(0);
  });

  it("bewertet IT und Gesundheit hoch", () => {
    expect(computeZukunft("Informatiker/in EFZ Applikationsentwicklung", "it").score).toBe(5);
    expect(computeZukunft("Fachmann/-frau Gesundheit EFZ", "gesundheit").score).toBe(5);
  });

  it("zieht Detailhandel/Verkauf etwas ab", () => {
    const detail = computeZukunft("Detailhandelsfachmann/-frau EFZ", "wirtschaft");
    expect(detail.score).toBeLessThan(3);
  });
});
