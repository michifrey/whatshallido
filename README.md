# 🧭 Berufs-Kompass Schweiz

Interaktive Berufswahl-Plattform für Jugendliche in der Schweiz – als **professionelle
Full-Stack-App**: Berufs-Explorer, Berufsentdecker und Stärken-Test mit ~200 echten
Schweizer Berufen, Videos, Bildern und Lehrstellen-Links.

## 🧱 Tech-Stack

| Bereich   | Technologie |
|-----------|-------------|
| Frontend  | **React 18** · **Vite** · **TypeScript** · **Tailwind CSS** · TanStack Query · React Router · lucide-react |
| Backend   | **Node.js** · **TypeScript** · **Express** · **Drizzle ORM** · **SQLite** · Zod |
| Struktur  | npm-Workspaces-Monorepo (`client/` + `server/`) |

## 📁 Projektstruktur

```
.
├── client/            # React-Frontend (Vite + Tailwind)
│   └── src/
│       ├── pages/         Start, Explorer, Entdecker, Test, Bildungsweg, Merkliste
│       ├── components/     Karten, Modal, Bild (SVG/Foto), Header, Layout
│       ├── context/        Taxonomie- & Modal-Provider
│       ├── hooks/          Merkliste, Theme (Dark Mode)
│       └── api.ts          typisierter API-Client
├── server/            # Express-API (TypeScript)
│   └── src/
│       ├── db/             Drizzle-Schema, Verbindung, Seed
│       ├── domain/         Kategorien, Dimensionen, Testfragen (Single Source of Truth)
│       ├── routes/         /api/professions, /api/taxonomy …
│       └── services/       Geschäftslogik (Filter, Empfehlungen)
├── legacy/            # ursprünglicher statischer Prototyp (Referenz) + Crawler
└── package.json       # Workspaces & Skripte
```

## 🚀 Schnellstart

Voraussetzung: **Node.js ≥ 20**.

```bash
# 1. Abhängigkeiten installieren (alle Workspaces)
npm install

# 2. Datenbank befüllen (importiert die ~200 Berufe in SQLite)
npm run seed

# 3. Entwicklung starten (API auf :3000, Frontend auf :5173)
npm run dev
```

Dann **http://localhost:5173** öffnen. Das Frontend spricht über einen Vite-Proxy
mit der API auf Port 3000.

### Einzeln starten
```bash
npm run dev:server   # nur API
npm run dev:client   # nur Frontend
```

## 📦 Produktion

```bash
npm run build        # baut server (tsup) und client (vite)
npm run seed         # DB einmalig befüllen
node server/dist/index.js
```

Der Server liefert in Produktion automatisch das gebaute Frontend aus
`client/dist` aus (inkl. SPA-Routing) – ein einziger Prozess genügt also.
Konfiguration über Env-Variablen: `PORT` (Standard 3000), `DATABASE_PATH`
(Standard `server/data/berufe.db`).

## 🔌 API-Überblick

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET  | `/api/professions?search=&category=&type=` | Berufe (gefiltert) |
| GET  | `/api/professions/:id` | einzelner Beruf |
| POST | `/api/professions/recommend` | Empfehlungen zu `{ dimensions: string[] }` |
| GET  | `/api/categories` | Kategorien inkl. Anzahl |
| GET  | `/api/taxonomy` | Kategorien & Interessens-Dimensionen |
| GET  | `/api/test` | Fragen & Skalen für den Stärken-Test |
| GET  | `/api/meta` | Statistik (Anzahl Berufe etc.) |
| GET  | `/api/health` | Health-Check |

## 🖼️ Bilder

Kombiniertes Konzept: Jeder Beruf hat ein optionales Foto-Feld (`imageUrl`).
Ist keines gesetzt, rendert das Frontend eine generierte **SVG-Illustration** mit
dem Kategorie-Farbverlauf und Emoji – funktioniert offline und überall.

## 🗄️ Datenbank & Seed

- Schema: `server/src/db/schema.ts` (Drizzle, Tabelle `professions`).
- Seed-Quelle: `server/src/data/berufe.seed.json` (Snapshot der 200 Berufe).
- Migrationen: `npm run db:generate --workspace server` (drizzle-kit).

Die Seed-Daten stammen aus dem Crawler im Prototyp (`legacy/tools/crawler.mjs`),
der weiterhin per GitHub Action gepflegt wird (`legacy/berufe.json`). Um neue
Crawler-Daten zu übernehmen, `legacy/berufe.json` nach
`server/src/data/berufe.seed.json` kopieren und `npm run seed` ausführen.

## 📜 Legacy-Prototyp

Der ursprüngliche statische Prototyp (reines HTML/CSS/JS) liegt unter `legacy/`
und bleibt als Referenz lauffähig (`legacy/index.html` im Browser öffnen).

## Quellen

Lehre in der Schweiz · berufsberatung.ch · ask! Beratungsdienste Aargau · Bildungssystem Schweiz.

> Privates, kostenloses Hilfsmittel für die Berufswahl – ersetzt keine
> professionelle Berufsberatung.
