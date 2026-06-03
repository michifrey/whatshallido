import { describe, expect, it } from "vitest";
import { cantons } from "../src/domain/cantons.js";
import { buildPlacementLinks } from "../src/domain/placements.js";

describe("cantons", () => {
  it("enthält alle 26 Kantone", () => {
    expect(cantons.length).toBe(26);
    expect(cantons.find((c) => c.code === "AG")?.name).toBe("Aargau");
  });
});

describe("buildPlacementLinks", () => {
  it("liefert mehrere Portale", () => {
    const links = buildPlacementLinks("Koch/Köchin EFZ", undefined, "lehrstelle");
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.map((l) => l.provider)).toContain("yousty");
  });

  it("bereinigt den Berufsnamen (ohne EFZ und Fachrichtung)", () => {
    const links = buildPlacementLinks("Koch/Köchin EFZ", undefined, "lehrstelle");
    const yousty = links.find((l) => l.provider === "yousty")!;
    expect(decodeURIComponent(yousty.url)).toContain("Koch");
    expect(yousty.url).not.toContain("EFZ");
  });

  it("nimmt Kanton und Modus in die Websuche auf", () => {
    const links = buildPlacementLinks("Informatiker/in EFZ", "ZH", "schnupperlehre");
    const websuche = links.find((l) => l.provider === "websuche")!;
    const decoded = decodeURIComponent(websuche.url);
    expect(decoded).toContain("Schnupperlehre");
    expect(decoded).toContain("Zürich");
  });
});
