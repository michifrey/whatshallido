# ---------- Build-Stage ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Build-Tools für native Module (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Abhängigkeiten zuerst (besseres Layer-Caching)
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci

# Quellcode kopieren und bauen (Server via tsup, Client via Vite)
COPY . .
RUN npm run build

# Dev-Abhängigkeiten für die Runtime entfernen
RUN npm prune --omit=dev

# ---------- Runtime-Stage ----------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/server/data/berufe.db
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/client/dist ./client/dist

RUN mkdir -p /app/server/data && chown -R node:node /app
USER node
WORKDIR /app/server

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Der Server seedet beim ersten Start automatisch und liefert das Frontend mit aus.
CMD ["node", "dist/index.js"]
