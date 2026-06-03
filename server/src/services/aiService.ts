import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "KI-Funktion nicht konfiguriert: Setze ANTHROPIC_API_KEY (Schlüssel von console.anthropic.com).",
    );
    (err as { status?: number }).status = 503;
    throw err;
  }
  if (!cached) cached = new Anthropic({ apiKey });
  return cached;
}

const SYSTEM_PROMPT =
  "Du bist eine erfahrene Schweizer Berufsberaterin und hilfst Jugendlichen, ihren " +
  "Bewerbungsbrief für eine Schnupperlehre oder Lehrstelle zu verbessern. " +
  "Schreibe in natürlichem, höflichem Schweizer Hochdeutsch (verwende 'ss' statt 'ß'). " +
  "Behalte alle Fakten – Namen, Firma, Daten, Telefon, E-Mail – unverändert bei und erfinde " +
  "nichts dazu. Verbessere Sprache, Aufbau, Höflichkeit und Überzeugungskraft, halte den Brief " +
  "altersgerecht, ehrlich und bescheiden (keine übertriebenen Behauptungen). " +
  "Behalte die Schweizer Briefstruktur bei (Absender, Empfänger, Ort/Datum, Betreff, Anrede, " +
  "Text, Gruss, Name). Gib NUR den fertigen Brieftext zurück – ohne Erklärungen, ohne Markdown.";

/** Verbessert einen Bewerbungsbrief mit Claude. Benötigt ANTHROPIC_API_KEY. */
export async function improveLetter(
  letter: string,
  mode: "lehrstelle" | "schnupperlehre",
): Promise<string> {
  const client = getClient();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
  const ziel = mode === "schnupperlehre" ? "Schnupperlehre" : "Lehrstelle";

  const message = await client.messages.create({
    model,
    max_tokens: 2000,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `Bitte verbessere diesen Bewerbungsbrief für eine ${ziel}:\n\n${letter}`,
      },
    ],
  });

  return message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
