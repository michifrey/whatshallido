import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// API-Port: folgt der PORT-Umgebungsvariable (gleiche, die der Server nutzt),
// sonst Standard 3001. So genügt ein PORT=... vor `npm run dev`, falls der Port belegt ist.
const apiPort = process.env.PORT ?? "3001";

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.CLIENT_PORT ?? 5173),
    proxy: {
      "/api": `http://localhost:${apiPort}`,
    },
  },
});
