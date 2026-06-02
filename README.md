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
| `data.js` | Alle Berufe, Kategorien und Test-Fragen (hier leicht erweiterbar) |
| `app.js` | Logik für Suche, Filter, Entdecker und Test-Auswertung |

### Berufe ergänzen
In `data.js` im Array `BERUFE` einen Eintrag hinzufügen:

```js
{ name: "Neuer Beruf EFZ", kat: "technik", dauer: "4 Jahre",
  tags: ["praktisch","forschend"],
  desc: "Kurze Beschreibung des Berufs." }
```

`kat` muss einer der Schlüssel aus `KATEGORIEN` sein, `tags` einer oder mehrere
aus `DIMENSIONEN`. Video- und Info-Links werden automatisch erzeugt.

## Quellen & Inspiration

- [Lehre in der Schweiz – Berufe A–Z](https://www.lehre-in-der-schweiz.ch/)
- [berufsberatung.ch – Übersicht Berufe](https://www.berufsberatung.ch/dyn/show/1893)
- [ask! Beratungsdienste für Ausbildung und Beruf, Aargau](https://www.beratungsdienste.ch/)
- [Bildungssystem Schweiz](https://www.berufsberatung.ch/dyn/show/2881)

> ⚠️ Hinweis: Die Seite ist ein privates, kostenloses Hilfsmittel und ersetzt
> keine professionelle Berufsberatung. Die Berufsauswahl ist ein Ausschnitt –
> die vollständige Liste findest du auf berufsberatung.ch.
