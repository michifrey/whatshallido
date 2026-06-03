# Hintergrundbild der Berufe-Landkarte

Die Karte im Explorer (Ansicht "🗺️ Karte") nutzt ein illustriertes
Hintergrundbild. Lege dein Bild hier ab – **exakt** mit diesem Namen:

    client/public/career-map.jpg

- Empfohlenes Seitenverhältnis: **3:2** (z. B. 1536 × 1024 px), damit die Pins passen.
- Erlaubt sind `.jpg`/`.jpeg`. Für `.png` im Code den Pfad `/career-map.jpg`
  in `client/src/components/ProfessionMap.tsx` auf `/career-map.png` ändern.

Solange die Datei fehlt, zeigt die Karte einen Platzhalter-Verlauf –
die anklickbaren Pins funktionieren trotzdem.

Die Pin-Positionen stehen oben in `ProfessionMap.tsx` (Array `ZONES`,
Werte `left`/`top` in Prozent) und lassen sich dort feinjustieren.
