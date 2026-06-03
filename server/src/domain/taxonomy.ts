/**
 * Zentrale Fachlogik: Kategorien, Interessens-Dimensionen und Testfragen.
 * Wird über die API an das Frontend ausgeliefert (Single Source of Truth).
 */

export type DimensionKey =
  | "praktisch" | "forschend" | "kreativ" | "sozial" | "fuehrend" | "ordnend";

export interface Dimension {
  key: DimensionKey;
  name: string;
  emoji: string;
  color: string;
  text: string;
}

export interface Category {
  key: string;
  name: string;
  emoji: string;
  color: string;
}

export const dimensions: Dimension[] = [
  { key: "praktisch", name: "Praktisch & Handwerklich", emoji: "🔧", color: "#f97316",
    text: "Du machst gerne etwas mit den Händen, baust, reparierst und packst an." },
  { key: "forschend", name: "Forschend & Tüftlerisch", emoji: "🔬", color: "#0ea5e9",
    text: "Du willst verstehen, wie Dinge funktionieren, rechnest und löst Rätsel." },
  { key: "kreativ", name: "Kreativ & Gestaltend", emoji: "🎨", color: "#ec4899",
    text: "Du hast Ideen, gestaltest, zeichnest, fotografierst oder schreibst gern." },
  { key: "sozial", name: "Sozial & Helfend", emoji: "🤝", color: "#22c55e",
    text: "Du bist gern mit Menschen zusammen, hilfst, pflegst und erklärst." },
  { key: "fuehrend", name: "Führend & Verkaufend", emoji: "📣", color: "#a855f7",
    text: "Du überzeugst gern, organisierst, verkaufst und übernimmst Verantwortung." },
  { key: "ordnend", name: "Ordnend & Organisierend", emoji: "🗂️", color: "#14b8a6",
    text: "Du arbeitest gern genau, planst, ordnest Zahlen und behältst den Überblick." },
];

export const categories: Category[] = [
  { key: "technik", name: "Technik & Mechanik", emoji: "⚙️", color: "#f97316" },
  { key: "it", name: "Informatik & Digital", emoji: "💻", color: "#0ea5e9" },
  { key: "gesundheit", name: "Gesundheit & Pflege", emoji: "🏥", color: "#ef4444" },
  { key: "soziales", name: "Soziales & Bildung", emoji: "🤝", color: "#22c55e" },
  { key: "gestaltung", name: "Gestaltung & Medien", emoji: "🎨", color: "#ec4899" },
  { key: "wirtschaft", name: "Verkauf & Wirtschaft", emoji: "🛒", color: "#a855f7" },
  { key: "natur", name: "Natur, Tiere & Umwelt", emoji: "🌱", color: "#84cc16" },
  { key: "gastro", name: "Gastronomie & Lebensmittel", emoji: "🍴", color: "#eab308" },
  { key: "bau", name: "Bau & Architektur", emoji: "🏗️", color: "#78716c" },
  { key: "koerper", name: "Schönheit & Körperpflege", emoji: "💇", color: "#14b8a6" },
];

export interface TestQuestion {
  dim: DimensionKey;
  text: string;
}

export interface ScaleOption {
  value: number;
  label: string;
}

/** Teil 1 – «Was mache ich gern?» */
export const interestQuestions: TestQuestion[] = [
  { dim: "praktisch", text: "Ich repariere oder baue gerne Dinge mit meinen Händen." },
  { dim: "praktisch", text: "Maschinen, Werkzeuge oder Fahrzeuge finde ich spannend." },
  { dim: "praktisch", text: "Ich arbeite lieber draussen oder in einer Werkstatt als am Schreibtisch." },
  { dim: "forschend", text: "Ich will genau verstehen, wie und warum etwas funktioniert." },
  { dim: "forschend", text: "Knifflige Aufgaben, Rätsel oder Mathe machen mir Spass." },
  { dim: "forschend", text: "Ich probiere gern Neues aus und tüftle an Lösungen." },
  { dim: "kreativ", text: "Ich zeichne, gestalte, fotografiere oder schreibe gerne." },
  { dim: "kreativ", text: "Ich habe oft eigene Ideen und probiere sie aus." },
  { dim: "kreativ", text: "Schöne Farben, Formen und Design sind mir wichtig." },
  { dim: "sozial", text: "Ich helfe anderen Menschen gerne und höre ihnen zu." },
  { dim: "sozial", text: "Ich bin gern mit Kindern, älteren oder kranken Menschen zusammen." },
  { dim: "sozial", text: "Ich kann gut erklären und anderen etwas beibringen." },
  { dim: "fuehrend", text: "Ich überzeuge andere gern von meinen Ideen." },
  { dim: "fuehrend", text: "Ich übernehme gern die Leitung in einer Gruppe." },
  { dim: "fuehrend", text: "Verkaufen, präsentieren oder organisieren liegt mir." },
  { dim: "ordnend", text: "Ich arbeite gern genau, sauber und nach Plan." },
  { dim: "ordnend", text: "Mit Zahlen, Listen und Ordnung komme ich gut zurecht." },
  { dim: "ordnend", text: "Ich behalte auch bei vielen Aufgaben den Überblick." },
];

/** Teil 2 – «Was kann ich gut?» (eine Selbsteinschätzung pro Dimension) */
export const abilityQuestions: TestQuestion[] = [
  { dim: "praktisch", text: "Mit den Händen arbeiten, bauen oder reparieren" },
  { dim: "forschend", text: "Logisch denken, rechnen und Probleme lösen" },
  { dim: "kreativ", text: "Gestalten, zeichnen und kreative Ideen umsetzen" },
  { dim: "sozial", text: "Mit Menschen umgehen, zuhören und helfen" },
  { dim: "fuehrend", text: "Andere überzeugen, organisieren und präsentieren" },
  { dim: "ordnend", text: "Genau, ordentlich und strukturiert arbeiten" },
];

export const interestScale: ScaleOption[] = [
  { value: 0, label: "Gar nicht" },
  { value: 1, label: "Eher nicht" },
  { value: 2, label: "Eher ja" },
  { value: 3, label: "Voll und ganz" },
];

export const abilityScale: ScaleOption[] = [
  { value: 0, label: "Noch nicht" },
  { value: 1, label: "Ein wenig" },
  { value: 2, label: "Recht gut" },
  { value: 3, label: "Sehr gut" },
];

export const categoryKeys = categories.map((c) => c.key);
export const dimensionKeys = dimensions.map((d) => d.key);
