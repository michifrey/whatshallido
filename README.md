# 🧭 Berufs-Kompass Schweiz

Eine interaktive Webseite, die Jugendlichen bei der **Berufswahl in der Schweiz** hilft.
Gebaut für meine Tochter – aber für alle nutzbar. 🇨🇭

## Was kann die Seite?

Die Seite hat drei interaktive Werkzeuge:

1. **🔎 Berufs-Explorer** – Berufe von A–Z durchstöbern, durchsuchen und nach
   Bereichen (Technik, Gesundheit, IT, Gestaltung, Natur …) filtern. Zu jedem
   Beruf gibt es einen **Video-Link** (Berufsfilm) und einen **Info-Link**.
2. **✨ Berufsentdecker** – Interessen anklicken («Was macht mir Spass?») und
   sofort passende Berufe vorgeschlagen bekommen, inkl. Match-Anzeige in %.
3. **🧩 Stärken-Schwächen-Test** – 18 kurze Fragen («Was mache ich gern? Was
   kann ich gut? Was nicht?»). Ergebnis: ein persönliches Interessen-Profil
   mit Balken, deine Stärken/Schwächen und konkrete Berufsvorschläge.
4. **❤️ Merkliste** – interessante Berufe per Herz-Klick sammeln (bleibt auf dem
   Gerät gespeichert), als PDF drucken oder wieder leeren.
5. **🎓 Bildungsweg** – verständliche Übersicht über das Schweizer Bildungssystem
   (Volksschule → Lehre/Gymnasium → HF/FH → Weiterbildung).

Zu jedem Beruf gibt es ausserdem einen Link **«🔍 Lehrstelle finden»** (Lehrstellen-/
Schnupperlehre-Suche), neben Video und Infos.

## So benutzt du die Seite

**Variante A – einfach öffnen (offline):**
`index.html` doppelklicken. Fertig – läuft direkt im Browser, ohne Internet
(nur die Video-/Info-Links brauchen Internet).

**Variante B – im Netz veröffentlichen (gratis mit GitHub Pages):**
1. In den Repo-Einstellungen auf GitHub → **Settings → Pages**
2. Bei *Branch* den Branch wählen (z.B. `main`) und `/ (root)` → **Save**
3. Nach ~1 Minute ist die Seite unter
   `https://<dein-name>.github.io/whatshallido/` erreichbar.

## Aufbau (für Technik-Interessierte)

| Datei | Inhalt |
|-------|--------|
| `index.html` | Struktur der Seite (Start, Explorer, Entdecker, Test) |
| `styles.css` | Gestaltung, responsiv für Handy & Desktop |
| `app.js` | Logik für Suche, Filter, Entdecker und Test-Auswertung |
| `data.js` | Kategorien, Interessens-Dimensionen, Test-Fragen + kuratierte Basis-Berufe (Fallback) |
| **`berufe.json`** | **Kanonische Berufsdaten** (vom Crawler erzeugt) – für Abgleich/Diff |
| **`berufe.js`** | Dieselben Daten als Browser-Script (`window.BERUFE_DATA`) – lädt auch offline |
| `admin.html` / `admin.js` / `admin.css` | **Admin-Seite** zum Verwalten & Abgleichen |
| `tools/crawler.mjs` | **Crawler / Auto-Abgleich** (Node) – baut `berufe.json` + `berufe.js` |
| `.github/workflows/berufe-sync.yml` | **GitHub Action** – führt den Crawler automatisch aus |

Die Seite lädt bevorzugt `berufe.js` (alle erfassten Berufe). Fehlt diese Datei,
greift automatisch die kuratierte Basisliste aus `data.js`.

## 🔄 Crawler / Auto-Abgleich

Aktuell sind **~160 echte Schweizer Berufe** erfasst (Lehrberufe + weiterführende).
Der Crawler hält sie aktuell und ergänzt neue:

```bash
node tools/crawler.mjs        # erzeugt berufe.json + berufe.js neu
```

Der Crawler hat eine grosse, eingebaute Basisliste (funktioniert **immer**, auch
ohne Internet) und versucht zusätzlich, `berufsberatung.ch` live abzugleichen, um
neue Berufe zu ergänzen. Ist die Live-Quelle nicht erreichbar, wird sauber auf die
Basisliste zurückgefallen.

**Automatik:** Die GitHub Action `Berufe Auto-Abgleich` läuft jeden Montag (und auf
Knopfdruck im *Actions*-Tab → *Run workflow*), führt den Crawler aus und committet
Änderungen automatisch. Dafür muss in den Repo-*Settings → Actions → General →
Workflow permissions* die Option **„Read and write permissions"** aktiviert sein.

## ⚙️ Admin-Seite (`admin.html`)

Erreichbar über den Link im Footer. Damit kannst du:

- alle Berufe in einer Tabelle **bearbeiten** (Name, Kategorie, Typ, Dauer, Tags, Beschreibung),
- neue Berufe **hinzufügen** oder löschen,
- eine frische `berufe.json` **einspielen und abgleichen** (zeigt neu/geändert/entfernt),
- die aktualisierten Dateien **exportieren** (`berufe.json` / `berufe.js`) zum Committen.

> Da die Seite ohne Server läuft, werden Änderungen **im Browser** gemacht und am
> Schluss als Datei exportiert. Diese Dateien dann ins Repo committen.

### Berufe von Hand ergänzen
Am einfachsten über die Admin-Seite. Alternativ in `tools/crawler.mjs` in der
`SEED`-Liste einen Namen ergänzen und den Crawler neu laufen lassen. Kategorie
und Tags werden automatisch zugeordnet (Heuristik), Video-/Info-Links erzeugt.

## Quellen & Inspiration

- [Lehre in der Schweiz – Berufe A–Z](https://www.lehre-in-der-schweiz.ch/)
- [berufsberatung.ch – Übersicht Berufe](https://www.berufsberatung.ch/dyn/show/1893)
- [ask! Beratungsdienste für Ausbildung und Beruf, Aargau](https://www.beratungsdienste.ch/)
- [Bildungssystem Schweiz](https://www.berufsberatung.ch/dyn/show/2881)

> ⚠️ Hinweis: Die Seite ist ein privates, kostenloses Hilfsmittel und ersetzt
> keine professionelle Berufsberatung. Die Berufsauswahl ist ein Ausschnitt –
> die vollständige Liste findest du auf berufsberatung.ch.
