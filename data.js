/* =========================================================================
   Berufs-Kompass Schweiz – Daten
   - Kategorien, Berufe (Lehrberufe EFZ/EBA) und Test-Fragen
   - Quellen / Inspiration:
       Lehre in der Schweiz (Berufe A–Z), berufsberatung.ch,
       ask! Beratungsdienste Aargau, Bildungssystem Schweiz
   - Jeder Beruf hat:
       tags  -> Interessens-Dimensionen (RIASEC-vereinfacht)
       info  -> weiterführende Infos (berufsberatung.ch Suche)
       video -> YouTube-Suche nach dem Berufsfilm (immer auffindbar)
   ========================================================================= */

/* Die 6 Interessens-Dimensionen (kindgerecht beschrieben) */
const DIMENSIONEN = {
  praktisch: { name: "Praktisch & Handwerklich", emoji: "🔧", farbe: "#f97316",
    text: "Du machst gerne etwas mit den Händen, baust, reparierst und packst an." },
  forschend: { name: "Forschend & Tüftlerisch", emoji: "🔬", farbe: "#0ea5e9",
    text: "Du willst verstehen, wie Dinge funktionieren, rechnest und löst Rätsel." },
  kreativ:   { name: "Kreativ & Gestaltend", emoji: "🎨", farbe: "#ec4899",
    text: "Du hast Ideen, gestaltest, zeichnest, fotografierst oder schreibst gern." },
  sozial:    { name: "Sozial & Helfend", emoji: "🤝", farbe: "#22c55e",
    text: "Du bist gern mit Menschen zusammen, hilfst, pflegst und erklärst." },
  fuehrend:  { name: "Führend & Verkaufend", emoji: "📣", farbe: "#a855f7",
    text: "Du überzeugst gern, organisierst, verkaufst und übernimmst Verantwortung." },
  ordnend:   { name: "Ordnend & Organisierend", emoji: "🗂️", farbe: "#14b8a6",
    text: "Du arbeitest gern genau, planst, ordnest Zahlen und behältst den Überblick." }
};

/* Berufs-Kategorien mit Farbe und Emoji */
const KATEGORIEN = {
  technik:    { name: "Technik & Mechanik",        emoji: "⚙️", farbe: "#f97316" },
  it:         { name: "Informatik & Digital",      emoji: "💻", farbe: "#0ea5e9" },
  gesundheit: { name: "Gesundheit & Pflege",       emoji: "🏥", farbe: "#ef4444" },
  soziales:   { name: "Soziales & Bildung",        emoji: "🤝", farbe: "#22c55e" },
  gestaltung: { name: "Gestaltung & Medien",       emoji: "🎨", farbe: "#ec4899" },
  wirtschaft: { name: "Verkauf & Wirtschaft",      emoji: "🛒", farbe: "#a855f7" },
  natur:      { name: "Natur, Tiere & Umwelt",     emoji: "🌱", farbe: "#84cc16" },
  gastro:     { name: "Gastronomie & Lebensmittel",emoji: "🍴", farbe: "#eab308" },
  bau:        { name: "Bau & Architektur",         emoji: "🏗️", farbe: "#78716c" },
  koerper:    { name: "Schönheit & Körperpflege",  emoji: "💇", farbe: "#14b8a6" }
};

/* Hilfsfunktionen für stabile, immer funktionierende Links */
function infoLink(name) {
  return "https://www.berufsberatung.ch/dyn/show/1893?search=" + encodeURIComponent(name);
}
function videoLink(name) {
  return "https://www.youtube.com/results?search_query=" +
    encodeURIComponent("Beruf " + name + " Lehre Schweiz Berufsfilm");
}

/* Die Berufsliste (Auswahl der beliebtesten Schweizer Lehrberufe) */
const BERUFE = [
  // --- Technik & Mechanik ---
  { name: "Polymechaniker/in EFZ", kat: "technik", dauer: "4 Jahre", tags: ["praktisch","forschend"],
    desc: "Du fertigst und montierst Präzisionsteile aus Metall mit modernen Maschinen." },
  { name: "Automatiker/in EFZ", kat: "technik", dauer: "4 Jahre", tags: ["forschend","praktisch"],
    desc: "Du baust und programmierst Steuerungen für Maschinen und Anlagen." },
  { name: "Elektroinstallateur/in EFZ", kat: "technik", dauer: "4 Jahre", tags: ["praktisch","forschend"],
    desc: "Du installierst Strom-, Licht- und Datenleitungen in Gebäuden." },
  { name: "Konstrukteur/in EFZ", kat: "technik", dauer: "4 Jahre", tags: ["forschend","kreativ"],
    desc: "Du entwickelst am Computer technische Zeichnungen und 3D-Modelle." },
  { name: "Automobil-Mechatroniker/in EFZ", kat: "technik", dauer: "4 Jahre", tags: ["praktisch","forschend"],
    desc: "Du diagnostizierst und reparierst Fahrzeuge mit viel Elektronik." },

  // --- Informatik & Digital ---
  { name: "Informatiker/in EFZ", kat: "it", dauer: "4 Jahre", tags: ["forschend","praktisch"],
    desc: "Du programmierst Software oder betreust Netzwerke und Systeme." },
  { name: "Mediamatiker/in EFZ", kat: "it", dauer: "4 Jahre", tags: ["kreativ","forschend"],
    desc: "Mix aus IT, Gestaltung, Marketing und Administration – sehr vielseitig." },
  { name: "Entwickler/in digitales Business EFZ", kat: "it", dauer: "4 Jahre", tags: ["forschend","fuehrend"],
    desc: "Du verbindest Programmieren mit Wirtschaft und digitalen Projekten." },
  { name: "ICT-Fachmann/-frau EFZ", kat: "it", dauer: "3 Jahre", tags: ["praktisch","forschend"],
    desc: "Du richtest Geräte ein und hilfst Nutzer/innen bei IT-Problemen." },

  // --- Gesundheit & Pflege ---
  { name: "Fachmann/-frau Gesundheit EFZ (FaGe)", kat: "gesundheit", dauer: "3 Jahre", tags: ["sozial","praktisch"],
    desc: "Du pflegst und betreust kranke und ältere Menschen im Spital oder Heim." },
  { name: "Fachmann/-frau Betreuung EFZ (FaBe)", kat: "gesundheit", dauer: "3 Jahre", tags: ["sozial","ordnend"],
    desc: "Du begleitest Kinder, Menschen mit Behinderung oder Betagte im Alltag." },
  { name: "Medizinische/r Praxisassistent/in EFZ (MPA)", kat: "gesundheit", dauer: "3 Jahre", tags: ["sozial","ordnend"],
    desc: "Du unterstützt Ärzt/innen, machst Labor, Blut abnehmen und Administration." },
  { name: "Dentalassistent/in EFZ", kat: "gesundheit", dauer: "3 Jahre", tags: ["sozial","praktisch"],
    desc: "Du assistierst in der Zahnarztpraxis und betreust die Patient/innen." },
  { name: "Pharma-Assistent/in EFZ", kat: "gesundheit", dauer: "3 Jahre", tags: ["sozial","ordnend"],
    desc: "Du berätst in der Apotheke und gibst Medikamente ab." },

  // --- Soziales & Bildung ---
  { name: "Fachmann/-frau Betreuung Kind EFZ", kat: "soziales", dauer: "3 Jahre", tags: ["sozial","kreativ"],
    desc: "Du förderst und betreust Kinder in einer Kita oder Tagesstruktur." },
  { name: "Sozialpädagog/in (höhere Ausbildung)", kat: "soziales", dauer: "weiterführend", tags: ["sozial","fuehrend"],
    desc: "Du begleitest Menschen in schwierigen Lebenslagen – via Weiterbildung." },

  // --- Gestaltung & Medien ---
  { name: "Grafiker/in EFZ", kat: "gestaltung", dauer: "4 Jahre", tags: ["kreativ","forschend"],
    desc: "Du gestaltest Logos, Plakate, Webseiten und visuelle Botschaften." },
  { name: "Polygraf/in EFZ", kat: "gestaltung", dauer: "4 Jahre", tags: ["kreativ","ordnend"],
    desc: "Du bereitest Texte und Bilder für Print und digitale Medien auf." },
  { name: "Fotograf/in EFZ", kat: "gestaltung", dauer: "4 Jahre", tags: ["kreativ","praktisch"],
    desc: "Du fotografierst Menschen, Produkte oder Ereignisse und bearbeitest Bilder." },
  { name: "Gestalter/in Werbetechnik EFZ", kat: "gestaltung", dauer: "4 Jahre", tags: ["kreativ","praktisch"],
    desc: "Du fertigst Beschriftungen, Schilder und Werbe-Folien an." },
  { name: "Interactive Media Designer EFZ", kat: "gestaltung", dauer: "4 Jahre", tags: ["kreativ","forschend"],
    desc: "Du gestaltest Apps, Games und interaktive digitale Erlebnisse." },

  // --- Verkauf & Wirtschaft ---
  { name: "Kaufmann/-frau EFZ", kat: "wirtschaft", dauer: "3 Jahre", tags: ["ordnend","fuehrend"],
    desc: "Der beliebteste Beruf: Büro, Organisation, Kommunikation, Zahlen." },
  { name: "Detailhandelsfachmann/-frau EFZ", kat: "wirtschaft", dauer: "3 Jahre", tags: ["fuehrend","sozial"],
    desc: "Du berätst Kund/innen im Laden und kennst deine Produkte bestens." },
  { name: "Fachmann/-frau Kundendialog EFZ", kat: "wirtschaft", dauer: "3 Jahre", tags: ["fuehrend","sozial"],
    desc: "Du betreust Kund/innen am Telefon und über digitale Kanäle." },
  { name: "Logistiker/in EFZ", kat: "wirtschaft", dauer: "3 Jahre", tags: ["ordnend","praktisch"],
    desc: "Du lagerst, verteilst und transportierst Waren – Überblick gefragt." },

  // --- Natur, Tiere & Umwelt ---
  { name: "Landwirt/in EFZ", kat: "natur", dauer: "3 Jahre", tags: ["praktisch","forschend"],
    desc: "Du baust Pflanzen an, hältst Tiere und arbeitest in der Natur." },
  { name: "Tierpfleger/in EFZ", kat: "natur", dauer: "3 Jahre", tags: ["sozial","praktisch"],
    desc: "Du fütterst, pflegst und betreust Tiere im Zoo, Heim oder Labor." },
  { name: "Gärtner/in EFZ", kat: "natur", dauer: "3 Jahre", tags: ["praktisch","kreativ"],
    desc: "Du gestaltest Gärten oder ziehst Pflanzen in der Gärtnerei." },
  { name: "Forstwart/in EFZ", kat: "natur", dauer: "3 Jahre", tags: ["praktisch","forschend"],
    desc: "Du pflegst den Wald, fällst Bäume und schützt die Natur." },

  // --- Gastronomie & Lebensmittel ---
  { name: "Koch/Köchin EFZ", kat: "gastro", dauer: "3 Jahre", tags: ["kreativ","praktisch"],
    desc: "Du kochst kreative Gerichte und arbeitest im Team unter Zeitdruck." },
  { name: "Bäcker/in-Konditor/in-Confiseur/in EFZ", kat: "gastro", dauer: "3 Jahre", tags: ["kreativ","praktisch"],
    desc: "Du backst Brot, Patisserie und feine Süssigkeiten." },
  { name: "Restaurantfachmann/-frau EFZ", kat: "gastro", dauer: "3 Jahre", tags: ["sozial","fuehrend"],
    desc: "Du servierst, berätst Gäste und sorgst für tolle Erlebnisse." },
  { name: "Fleischfachmann/-frau EFZ", kat: "gastro", dauer: "3 Jahre", tags: ["praktisch","ordnend"],
    desc: "Du verarbeitest Fleisch zu Spezialitäten und berätst Kundschaft." },

  // --- Bau & Architektur ---
  { name: "Zeichner/in EFZ – Architektur", kat: "bau", dauer: "4 Jahre", tags: ["forschend","kreativ"],
    desc: "Du erstellst am Computer Baupläne für Häuser und Gebäude." },
  { name: "Maurer/in EFZ", kat: "bau", dauer: "3 Jahre", tags: ["praktisch","forschend"],
    desc: "Du baust Mauern, Wände und Fundamente – kräftig und genau." },
  { name: "Schreiner/in EFZ", kat: "bau", dauer: "4 Jahre", tags: ["praktisch","kreativ"],
    desc: "Du fertigst Möbel, Türen und Innenausbauten aus Holz." },
  { name: "Sanitärinstallateur/in EFZ", kat: "bau", dauer: "4 Jahre", tags: ["praktisch","forschend"],
    desc: "Du installierst Wasser-, Bad- und Heizungsanlagen." },
  { name: "Maler/in EFZ", kat: "bau", dauer: "3 Jahre", tags: ["praktisch","kreativ"],
    desc: "Du gestaltest Wände und Fassaden mit Farbe und Technik." },

  // --- Schönheit & Körperpflege ---
  { name: "Coiffeur/-euse EFZ", kat: "koerper", dauer: "3 Jahre", tags: ["kreativ","sozial"],
    desc: "Du schneidest, färbst und berätst – Handwerk trifft Menschen." },
  { name: "Kosmetiker/in EFZ", kat: "koerper", dauer: "3 Jahre", tags: ["sozial","kreativ"],
    desc: "Du pflegst Haut und sorgst für Wohlbefinden deiner Kundschaft." }
];

/* Links/Quellen sauber ergänzen */
BERUFE.forEach(function (b) {
  b.info = infoLink(b.name);
  b.video = videoLink(b.name);
});

/* =======================  Stärken-Schwächen-Test  =======================
   18 Aussagen, je 3 pro Dimension. Antwort-Skala 0–3.
   "Stärken" und "Interessen" werden zusammen erfasst ("mag ich / kann ich").
*/
const FRAGEN = [
  // praktisch
  { dim: "praktisch", text: "Ich repariere oder baue gerne Dinge mit meinen Händen." },
  { dim: "praktisch", text: "Maschinen, Werkzeuge oder Fahrzeuge finde ich spannend." },
  { dim: "praktisch", text: "Ich arbeite lieber draussen oder in einer Werkstatt als am Schreibtisch." },
  // forschend
  { dim: "forschend", text: "Ich will genau verstehen, wie und warum etwas funktioniert." },
  { dim: "forschend", text: "Knifflige Aufgaben, Rätsel oder Mathe machen mir Spass." },
  { dim: "forschend", text: "Ich probiere gern Neues aus und tüftle an Lösungen." },
  // kreativ
  { dim: "kreativ", text: "Ich zeichne, gestalte, fotografiere oder schreibe gerne." },
  { dim: "kreativ", text: "Ich habe oft eigene Ideen und probiere sie aus." },
  { dim: "kreativ", text: "Schöne Farben, Formen und Design sind mir wichtig." },
  // sozial
  { dim: "sozial", text: "Ich helfe anderen Menschen gerne und höre ihnen zu." },
  { dim: "sozial", text: "Ich bin gern mit Kindern, älteren oder kranken Menschen zusammen." },
  { dim: "sozial", text: "Ich kann gut erklären und anderen etwas beibringen." },
  // fuehrend
  { dim: "fuehrend", text: "Ich überzeuge andere gern von meinen Ideen." },
  { dim: "fuehrend", text: "Ich übernehme gern die Leitung in einer Gruppe." },
  { dim: "fuehrend", text: "Verkaufen, präsentieren oder organisieren liegt mir." },
  // ordnend
  { dim: "ordnend", text: "Ich arbeite gern genau, sauber und nach Plan." },
  { dim: "ordnend", text: "Mit Zahlen, Listen und Ordnung komme ich gut zurecht." },
  { dim: "ordnend", text: "Ich behalte auch bei vielen Aufgaben den Überblick." }
];

const SKALA = [
  { wert: 0, label: "Gar nicht" },
  { wert: 1, label: "Eher nicht" },
  { wert: 2, label: "Eher ja" },
  { wert: 3, label: "Voll und ganz" }
];

/* Quellen für die Seite */
const QUELLEN = [
  { name: "Lehre in der Schweiz – Berufe A–Z entdecken", url: "https://www.lehre-in-der-schweiz.ch/" },
  { name: "berufsberatung.ch – Übersicht Berufe", url: "https://www.berufsberatung.ch/dyn/show/1893" },
  { name: "ask! Beratungsdienste Aargau", url: "https://www.beratungsdienste.ch/" },
  { name: "Bildungssystem Schweiz", url: "https://www.berufsberatung.ch/dyn/show/2881" }
];
