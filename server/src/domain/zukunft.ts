/**
 * Einschätzung der Zukunftssicherheit / Nachfrage eines Berufs.
 *
 * WICHTIG: Das ist eine transparente, regelbasierte Orientierung – keine Garantie
 * und keine Echtzeit-Lehrstellenzahl. Aktuelle Lehrstellen findest du über die
 * Portale (Yousty / Lehrstellennachweis), verlinkt im Lehrstellen-Finder.
 *
 * score: 1 (schwierig) … 5 (sehr gut)
 */
export interface Zukunft {
  score: number;
  label: string;
  note: string;
}

/** Basiswert pro Branche (1–5). */
const CATEGORY_BASE: Record<string, number> = {
  it: 5,
  gesundheit: 5,
  technik: 4,
  bau: 4,
  soziales: 4,
  natur: 3,
  gastro: 3,
  wirtschaft: 3,
  gestaltung: 3,
  koerper: 3,
};

/** Schlüsselwort-Anpassungen (Trends). */
const RULES: [RegExp, number][] = [
  [/informatik|ict|cyber|entwickl|digital|mediamatik|automatik|elektronik|mechatronik|technolog/i, 1],
  [/pflege|gesundheit|betreuung|dental|pharma|therapeut|hebamme|medizin|rettung|fage|fabe/i, 1],
  [/gebäudetechnik|sanitär|heizung|lüftung|elektroinstall|solar|spengler|isolier|gebäudeinformatik/i, 1],
  [/detailhandel|verkäufer|kassa/i, -1],
];

function labelFor(score: number): string {
  return score >= 5 ? "sehr gut" : score === 4 ? "gut" : score === 3 ? "solide" : score === 2 ? "im Wandel" : "schwierig";
}

function noteFor(score: number): string {
  if (score >= 5) return "Stark gefragt – meist viele offene Lehrstellen und ausgezeichnete Zukunftsaussichten.";
  if (score === 4) return "Gute Nachfrage und solide Zukunftsaussichten.";
  if (score === 3) return "Stabiler Beruf mit beständiger Nachfrage.";
  return "Beruf im Wandel – informiere dich über die aktuelle Entwicklung und Lehrstellenlage.";
}

/** Berechnet die Zukunftssicherheit aus Branche + Trend-Schlüsselwörtern. */
export function computeZukunft(name: string, category: string): Zukunft {
  let score = CATEGORY_BASE[category] ?? 3;
  for (const [re, delta] of RULES) {
    if (re.test(name)) score += delta;
  }
  score = Math.max(1, Math.min(5, score));
  return { score, label: labelFor(score), note: noteFor(score) };
}
