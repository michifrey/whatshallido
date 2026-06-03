import { createApp } from "./app.js";
import { ensureSchema } from "./db/index.js";
import { countProfessions, seedDatabase } from "./db/seed.js";

const PORT = Number(process.env.PORT ?? 3000);

if (!process.env.ADMIN_TOKEN) {
  console.warn(
    "⚠  ADMIN_TOKEN nicht gesetzt – Admin-Login nutzt Standard 'dev-admin-token'. Für Produktion bitte setzen!",
  );
}

ensureSchema();

// Auto-Seed: Wenn die Datenbank leer ist (z.B. frischer Container), befüllen.
if (countProfessions() === 0) {
  const n = seedDatabase();
  console.log(`🌱 Datenbank war leer – ${n} Berufe automatisch geladen.`);
}

const app = createApp();
app.listen(PORT, () => {
  console.log(`🧭 Berufs-Kompass API läuft auf http://localhost:${PORT}`);
});
