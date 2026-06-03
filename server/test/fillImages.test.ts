import { describe, expect, it } from "vitest";
import { imageQueryFor } from "../src/scripts/fill-images.js";

describe("imageQueryFor", () => {
  it("entfernt EFZ/EBA und Fachrichtungs-Slashes", () => {
    expect(imageQueryFor({ name: "Koch/Köchin EFZ" })).toBe("Koch Beruf");
    expect(imageQueryFor({ name: "Fachmann/-frau Gesundheit EFZ" })).toBe("Fachmann Gesundheit Beruf");
  });

  it("liefert immer einen nicht-leeren Suchbegriff mit Kontext", () => {
    const q = imageQueryFor({ name: "Informatiker/in EFZ Applikationsentwicklung" });
    expect(q.length).toBeGreaterThan(3);
    expect(q.endsWith("Beruf")).toBe(true);
  });
});
