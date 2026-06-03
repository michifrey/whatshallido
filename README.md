# 🧭 Berufs-Kompass Schweiz

Interaktive Berufswahl-Plattform für Jugendliche in der Schweiz – als **professionelle
Full-Stack-App**: Berufs-Explorer, Berufsentdecker und Stärken-Test mit ~400 echten
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
│       ├── pages/         Start, Explorer, Entdecker, Test, Bildungsweg,
│       │                  Lehrstellen-Finder, Bewerbungs-Helfer, Tracker, Merkliste, Admin
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

# 2. Datenbank befüllen (importiert die ~400 Berufe in SQLite)
npm run seed

# 3. Entwicklung starten (API auf :3001, Frontend auf :5173)
npm run dev
```

Dann **http://localhost:5173** öffnen. Das Frontend spricht über einen Vite-Proxy
mit der API auf Port 3001.

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
Konfiguration über Env-Variablen: `PORT` (Standard 3001), `DATABASE_PATH`
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
| GET  | `/api/cantons` | Liste der 26 Kantone |
| GET  | `/api/professions/:id/placements?canton=&mode=` | Such-Links zu Lehrstellen-Portalen |
| GET  | `/api/meta` | Statistik (Anzahl Berufe etc.) |
| GET  | `/api/health` | Health-Check |
| GET  | `/api/admin/check` | Token prüfen (Login) 🔒 |
| POST | `/api/admin/professions` | Beruf anlegen 🔒 |
| PUT  | `/api/admin/professions/:id` | Beruf bearbeiten 🔒 |
| DELETE | `/api/admin/professions/:id` | Beruf löschen 🔒 |
| GET  | `/api/admin/images?q=` | Foto-Vorschläge (Unsplash) 🔒 |

🔒 = erfordert Header `x-admin-token` (siehe Admin-Bereich).

## 📍 Lehrstellen-Finder & 📄 Bewerbungs-Helfer

- **Lehrstellen-/Schnupperstellen-Finder** (`/lehrstellen`): Beruf + Kanton wählen →
  gezielte, vorausgefüllte Links zu Yousty, Lehrstellennachweis (LENA), Gateway und
  einer Websuche, plus Tipps fürs Schnupperlehre-Finden. Da es keine offene Live-API
  für Lehrstellen gibt, führt der Finder zuverlässig zu den offiziellen Portalen.
- **Bewerbungs-Helfer** (`/bewerbung`): Formular für Schnupperlehre **und** Lehrstelle,
  erzeugt live einen vollständigen Bewerbungsbrief im Schweizer Stil – Kopieren,
  als **echtes PDF** (jsPDF, A4, auswählbarer Text), als Textdatei oder per Druckdialog.
  Läuft ohne KI/Schlüssel; alle Daten bleiben im Browser. Optional
  **«✨ mit KI verbessern»** (Claude API), wenn ein `ANTHROPIC_API_KEY` gesetzt ist.
- **Bewerbungs-Tracker** (`/tracker`): Behalte den Überblick über deine Bewerbungen
  (Firma, Beruf, Status: geplant/beworben/Schnuppern/Gespräch/Zusage/Absage). Wird
  gerätelokal im Browser gespeichert.

## 🔐 Admin-Bereich

Erreichbar unter **`/admin`** (Link im Footer). Login per Token aus der
Env-Variable `ADMIN_TOKEN`. Damit lassen sich Berufe **anlegen, bearbeiten und
löschen** sowie **Bilder zuweisen** – per URL oder über die integrierte
**Unsplash-Bildersuche**.

Die Bildersuche braucht einen kostenlosen **Unsplash Access Key**
(`UNSPLASH_ACCESS_KEY`, von <https://unsplash.com/developers>). Ohne Key bleibt
die App voll funktionsfähig, nur die Foto-Suche meldet, dass sie nicht
konfiguriert ist (Bild-URLs lassen sich weiterhin von Hand setzen).

## 🐳 Deployment (Docker)

```bash
# Image bauen und starten (Server + Frontend in einem Container)
cp .env.example .env        # ADMIN_TOKEN setzen, optional UNSPLASH_ACCESS_KEY
docker compose up --build
```

Die App läuft dann auf **http://localhost:3001**. Der Container **seedet die
Datenbank beim ersten Start automatisch** und legt sie auf einem Volume ab
(`bk-data`), sodass Admin-Änderungen Neustarts überleben.

Ohne Compose:
```bash
docker build -t berufs-kompass .
docker run -p 3001:3001 -e ADMIN_TOKEN=geheim -v bk-data:/app/server/data berufs-kompass
```

### Wichtige Env-Variablen
| Variable | Standard | Zweck |
|----------|----------|-------|
| `PORT` | `3001` | Server-Port |
| `DATABASE_PATH` | `./data/berufe.db` | Pfad zur SQLite-DB |
| `ADMIN_TOKEN` | `dev-admin-token` | Token für den Admin-Bereich (**in Produktion setzen!**) |
| `UNSPLASH_ACCESS_KEY` | – | optional, für die Foto-Suche |
| `ANTHROPIC_API_KEY` | – | optional, für «mit KI verbessern» im Bewerbungs-Helfer |
| `ANTHROPIC_MODEL` | `claude-opus-4-8` | optional, überschreibt das KI-Modell |

## ☁️ Öffentlich deployen (eigene URL)

Damit die App von überall (Handy der Tochter, Kalender-Abo der Berufsmessen)
erreichbar ist, braucht es eine öffentliche URL. Der Server liefert Frontend
**und** API in einem Container aus – ideal für einen einfachen Cloud-Dienst.

### Variante A – Render.com (empfohlen, kostenlos, in ~5 Min.)
1. Repo zu GitHub pushen (ist bereits der Fall).
2. Auf [render.com](https://render.com) mit GitHub anmelden.
3. **New → Blueprint** wählen und dieses Repo angeben – Render liest
   `render.yaml`, baut das `Dockerfile` und vergibt eine HTTPS-URL.
4. Fertig. Bei jedem Push auf den Branch deployt Render automatisch neu.
   Das `ADMIN_TOKEN` wird sicher generiert (im Dashboard einsehbar).

### Variante B – Fly.io
```bash
fly launch --no-deploy --copy-config   # übernimmt fly.toml
fly secrets set ADMIN_TOKEN=<geheim>
fly deploy
```

### Gut zu wissen
- **Datenbank:** Auf Gratis-Plänen ist der Speicher flüchtig. Das ist hier
  unkritisch – der Server befüllt die DB bei jedem Start automatisch aus den
  Seed-Daten (405 Berufe). Für dauerhafte Admin-Änderungen einen Plan mit
  Disk/Volume an `/app/server/data` hängen (siehe `render.yaml` / `fly.toml`).
- **Persönliche Daten** (Merkliste, Bewerbungs-Tracker) liegen im Browser
  (localStorage) – pro Gerät, nichts wird hochgeladen.
- **Kalender-Abo:** Nach dem Deployment funktioniert auf der Messen-Seite
  „Kalender abonnieren" (Feed `https://DEINE-URL/api/messen.ics`) auch auf
  fremden Geräten.

## 🧪 Tests & CI

```bash
npm test            # alle Tests (server + client) via Vitest
```

- **Backend** (`server/test/`): Service-Logik (Filter, Empfehlungen, Meta) und
  API-Integrationstests (öffentliche Endpoints + Admin-CRUD, Auth, Validierung)
  gegen eine isolierte SQLite-Test-DB.
- **Frontend** (`client/test/`): Komponenten- und Hook-Tests
  (Vitest + Testing Library, jsdom).
- **GitHub Action** `.github/workflows/ci.yml` führt bei jedem Push/PR
  Typecheck, Tests und Build aus.

## 🖼️ Bilder

Kombiniertes Konzept: Jeder Beruf hat ein optionales Foto-Feld (`imageUrl`).
Ist keines gesetzt, rendert das Frontend eine generierte **SVG-Illustration** mit
dem Kategorie-Farbverlauf und Emoji – funktioniert offline und überall.

Fotos lassen sich einzeln im Admin setzen oder automatisch befüllen:

```bash
npm run fill-images -- --dry-run   # zeigt, welche Fotos gewählt würden
npm run fill-images                # weist allen Berufen ohne Bild ein Foto zu
npm run fill-images -- --force     # überschreibt auch vorhandene Bilder
```

Benötigt `UNSPLASH_ACCESS_KEY`; das Script schont das Unsplash-Rate-Limit.

## 🗄️ Datenbank & Seed

- Schema: `server/src/db/schema.ts` (Drizzle, Tabelle `professions`).
- Seed-Quelle: `server/src/data/berufe.seed.json` (Snapshot der ~400 Berufe).
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
