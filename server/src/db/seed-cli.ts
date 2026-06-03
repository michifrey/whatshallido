import { sqlite } from "./index.js";
import { seedDatabase } from "./seed.js";

const count = seedDatabase();
console.log(`✅ Seed abgeschlossen: ${count} Berufe in die Datenbank geschrieben.`);
sqlite.close();
