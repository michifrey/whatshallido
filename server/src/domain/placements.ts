import { cantons } from "./cantons.js";

export type PlacementMode = "lehrstelle" | "schnupperlehre";

export interface PlacementLink {
  provider: string;
  label: string;
  description: string;
  url: string;
}

function cantonName(code?: string): string | undefined {
  if (!code) return undefined;
  return cantons.find((c) => c.code === code)?.name;
}

/** Beruf ohne Abkürzungen/Fachrichtungen für die Suche. */
function cleanName(name: string): string {
  return name
    .replace(/\b(EFZ|EBA|HF|FH|PH)\b/g, "")
    .replace(/\bmit eidg\.?\s*(FA|Diplom)\b/gi, "")
    .replace(/\bNDS\b/g, "")
    .replace(/\/[^\s]*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Baut gezielte Links zu den offiziellen Lehrstellen-/Schnupperlehre-Portalen,
 * vorbefüllt mit Beruf und (optional) Kanton.
 */
export function buildPlacementLinks(
  name: string,
  canton: string | undefined,
  mode: PlacementMode,
): PlacementLink[] {
  const beruf = cleanName(name);
  const q = encodeURIComponent(beruf);
  const kanton = cantonName(canton);
  const modeWord = mode === "schnupperlehre" ? "Schnupperlehre" : "Lehrstelle";
  const websuche = encodeURIComponent(`${modeWord} ${beruf} ${kanton ?? "Schweiz"}`);

  return [
    {
      provider: "yousty",
      label: "Yousty",
      description: "Grösste Lehrstellen-Plattform der Schweiz – mit Schnupperlehren.",
      url: `https://www.yousty.ch/de-CH/lehrstellen?q=${q}`,
    },
    {
      provider: "berufsberatung",
      label: "Lehrstellennachweis (LENA)",
      description: "Offizielle, von den Kantonen gepflegte Lehrstellenliste.",
      url: `https://www.berufsberatung.ch/dyn/show/2930?search=${q}`,
    },
    {
      provider: "gateway",
      label: "Gateway Junior",
      description: "Lehrstellen und Schnupperangebote vieler Firmen.",
      url: `https://www.gateway.one/de/lehrstellen?searchterm=${q}`,
    },
    {
      provider: "websuche",
      label: `Websuche: ${modeWord}`,
      description: `Direkte Suche nach "${modeWord} ${beruf}${kanton ? " " + kanton : ""}".`,
      url: `https://www.google.com/search?q=${websuche}`,
    },
  ];
}
