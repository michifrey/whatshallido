export type LetterMode = "schnupperlehre" | "lehrstelle";

export interface LetterData {
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  firma: string;
  ansprechperson: string;
  firmaStrasse: string;
  firmaPlz: string;
  firmaOrt: string;
  beruf: string;
  zeitraum: string;
  motivation: string;
  staerken: string;
  schule: string;
  hobbys: string;
}

const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function formatDate(d: Date): string {
  return `${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
}

function val(s: string, fallback: string): string {
  return s.trim() ? s.trim() : fallback;
}

/** Erzeugt einen vollständigen Bewerbungsbrief im Schweizer Stil. */
export function buildLetter(data: LetterData, mode: LetterMode, today = new Date()): string {
  const name = `${val(data.vorname, "Vorname")} ${val(data.nachname, "Nachname")}`.trim();
  const beruf = val(data.beruf, "[Beruf]");
  const firma = val(data.firma, "[Firma]");
  const ortDatum = `${val(data.ort, data.firmaOrt.trim() || "Ort")}, ${formatDate(today)}`;

  const absender = [
    name,
    val(data.strasse, "Strasse Nr."),
    `${val(data.plz, "PLZ")} ${val(data.ort, "Ort")}`,
    val(data.telefon, "Telefon"),
    val(data.email, "E-Mail"),
  ].join("\n");

  const empfaenger = [
    firma,
    data.ansprechperson.trim(),
    data.firmaStrasse.trim(),
    `${data.firmaPlz.trim()} ${data.firmaOrt.trim()}`.trim(),
  ]
    .filter((l) => l.trim())
    .join("\n");

  const anrede = data.ansprechperson.trim()
    ? `Guten Tag ${data.ansprechperson.trim()}`
    : "Sehr geehrte Damen und Herren";

  const gruss = "Freundliche Grüsse";
  const istSchnupper = mode === "schnupperlehre";

  const betreff = istSchnupper
    ? `Bewerbung für eine Schnupperlehre als ${beruf}`
    : `Bewerbung um eine Lehrstelle als ${beruf}`;

  const absätze: string[] = [];

  if (istSchnupper) {
    absätze.push(
      `Der Beruf ${beruf} interessiert mich sehr. Um herauszufinden, ob er wirklich zu mir passt, ` +
        `möchte ich ihn gerne in einer Schnupperlehre bei Ihnen kennenlernen` +
        (data.zeitraum.trim() ? `, idealerweise ${data.zeitraum.trim()}.` : "."),
    );
  } else {
    absätze.push(
      `Mit grossem Interesse bewerbe ich mich um eine Lehrstelle als ${beruf} in Ihrem Betrieb. ` +
        `Der Beruf begeistert mich, und ich möchte mein Wissen und Können in einer fundierten Ausbildung bei Ihnen aufbauen.`,
    );
  }

  absätze.push(
    val(
      data.motivation,
      `Am Beruf ${beruf} reizt mich besonders die Abwechslung und dass ich praktisch arbeiten und immer Neues dazulernen kann.`,
    ),
  );

  const persönlich: string[] = [];
  if (data.schule.trim()) persönlich.push(`Zurzeit besuche ich ${data.schule.trim()}.`);
  if (data.staerken.trim()) persönlich.push(`Zu meinen Stärken zählen ${data.staerken.trim()}.`);
  if (data.hobbys.trim()) persönlich.push(`In meiner Freizeit ${data.hobbys.trim()}.`);
  if (persönlich.length) absätze.push(persönlich.join(" "));

  if (istSchnupper) {
    absätze.push(
      `Über die Gelegenheit, Sie und den Beruf näher kennenzulernen, freue ich mich sehr. ` +
        `Sie erreichen mich unter ${val(data.telefon, "[Telefon]")} oder ${val(data.email, "[E-Mail]")}.`,
    );
  } else {
    absätze.push(
      `Gerne stelle ich mich Ihnen in einem persönlichen Gespräch vor und bin auch für eine ` +
        `Schnupperlehre offen. Sie erreichen mich unter ${val(data.telefon, "[Telefon]")} oder ${val(data.email, "[E-Mail]")}.`,
    );
  }

  const beilagen = istSchnupper
    ? ""
    : "\n\nBeilagen:\n– Lebenslauf\n– Kopien der letzten Schulzeugnisse\n– allfällige Schnupperlehrberichte";

  return (
    `${absender}\n\n\n${empfaenger || firma}\n\n\n${ortDatum}\n\n\n` +
    `${betreff}\n\n` +
    `${anrede}\n\n` +
    `${absätze.join("\n\n")}\n\n` +
    `${gruss}\n\n${name}` +
    beilagen
  );
}
