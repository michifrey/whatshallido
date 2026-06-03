# Hintergrundbild der Berufe-Landkarte

Die Karte im Explorer (Ansicht "🗺️ Karte") nutzt ein illustriertes
Hintergrundbild. Lege dein Bild hier ab – **exakt** mit diesem Namen:

    client/public/karte.png

- Empfohlenes Seitenverhältnis: **3:2** (z. B. 1536 × 1024 px), damit die Pins passen.
- Solange die Datei fehlt, zeigt die Karte einen Platzhalter-Verlauf –
  die anklickbaren Pins funktionieren trotzdem.

Die Pin-Positionen stehen in `client/src/components/ProfessionMap.tsx`
(Array `ZONES`, Werte `left`/`top` in Prozent) und lassen sich dort feinjustieren.
