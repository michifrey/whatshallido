import { createApp } from "./app.js";
import { ensureSchema } from "./db/index.js";

const PORT = Number(process.env.PORT ?? 3000);

ensureSchema();

const app = createApp();
app.listen(PORT, () => {
  console.log(`🧭 Berufs-Kompass API läuft auf http://localhost:${PORT}`);
});
