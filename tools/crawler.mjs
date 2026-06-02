#!/usr/bin/env node
/* =========================================================================
   Berufs-Kompass Schweiz – Crawler / Auto-Abgleich
   -------------------------------------------------------------------------
   Was dieses Script tut:
     1. Hat eine grosse, eingebaute Basisliste echter Schweizer Berufe (SEED)
        -> funktioniert IMMER, auch ohne Internet.
     2. Versucht zusätzlich, die Live-Quelle (berufsberatung.ch) abzugleichen
        und neue Berufe zu ergänzen. Schlägt das fehl (z.B. kein Netz),
        wird sauber auf die Basisliste zurückgefallen.
     3. Ordnet jedem Beruf eine Kategorie + Interessens-Tags zu (Heuristik).
     4. Schreibt:
          berufe.json  -> kanonische Daten (für Diff/Admin)
          berufe.js    -> dasselbe als Browser-Script (window.BERUFE_DATA)

   Ausführen:   node tools/crawler.mjs
   Läuft automatisch via .github/workflows/berufe-sync.yml (GitHub Action).

   HINWEIS: Diese Datei darf bedenkenlos erweitert werden. Die Kategorien
   und Dimensionen müssen mit data.js übereinstimmen.
   ========================================================================= */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- Kategorien & Dimensionen (müssen zu data.js passen) ---------- */
const KATEGORIEN = ["technik","it","gesundheit","soziales","gestaltung",
                    "wirtschaft","natur","gastro","bau","koerper"];

/* Standard-Tags pro Kategorie (Interessens-Dimensionen) */
const KAT_DEFAULT_TAGS = {
  technik:    ["praktisch","forschend"],
  it:         ["forschend","praktisch"],
  gesundheit: ["sozial","praktisch"],
  soziales:   ["sozial","fuehrend"],
  gestaltung: ["kreativ","forschend"],
  wirtschaft: ["ordnend","fuehrend"],
  natur:      ["praktisch","forschend"],
  gastro:     ["kreativ","praktisch"],
  bau:        ["praktisch","forschend"],
  koerper:    ["kreativ","sozial"]
};

/* Kurzbeschreibung pro Kategorie (Fallback, wenn keine kuratierte vorhanden) */
const KAT_DESC = {
  technik:    "Technischer Beruf mit Maschinen, Werkzeugen und viel Präzision.",
  it:         "Digitaler Beruf rund um Computer, Software, Daten und Technik.",
  gesundheit: "Beruf im Gesundheitswesen – Menschen pflegen, betreuen, unterstützen.",
  soziales:   "Sozialer Beruf – Menschen begleiten, fördern und ihnen helfen.",
  gestaltung: "Kreativer Beruf rund um Gestaltung, Medien und Design.",
  wirtschaft: "Beruf in Büro, Handel oder Verkauf – mit Organisation und Kontakt.",
  natur:      "Beruf in der Natur, mit Pflanzen, Tieren oder Lebensmitteln.",
  gastro:     "Beruf rund um Essen, Trinken und Gastfreundschaft.",
  bau:        "Beruf am Bau – planen, bauen und Dinge entstehen lassen.",
  koerper:    "Beruf rund um Schönheit, Pflege und Wohlbefinden."
};

/* Schlüsselwörter -> zusätzliche Interessens-Tags (Heuristik) */
const KEYWORDS = [
  [/(kauf(mann|frau)|büro|administration|fachmann.*kundendialog|kundendialog)/i, ["ordnend","fuehrend"]],
  [/(detailhandel|verkauf|verkäufer)/i, ["fuehrend","sozial"]],
  [/(logistik|lager|transport)/i, ["ordnend","praktisch"]],
  [/(pflege|betreuung|gesundheit|sanitäter|therapeut|hebamme|assistent.*soziales)/i, ["sozial"]],
  [/(erzieh|lehr(er|person|kraft)|kinder|pädagog|spielgruppe)/i, ["sozial","kreativ"]],
  [/(grafik|design|gestalt|foto|werbe|polygraf|media|gold|keramik|tänz|musik|maler|coiffeur|kosmetik|floris)/i, ["kreativ"]],
  [/(informatik|entwickl|elektronik|automatik|konstrukteur|ingenieur|technolog|analytiker|geomatik|zeichner|planer)/i, ["forschend"]],
  [/(koch|köch|bäck|konditor|confiseur|restaurant|hotel|gastro|fleisch|metzg)/i, ["kreativ","praktisch"]],
  [/(restaurant|hotel|kundendialog|empfang|reise)/i, ["sozial"]],
  [/(landwirt|gärtner|forst|tier|pferd|winzer|obst|gemüse|natur|umwelt|recycl)/i, ["praktisch","forschend"]],
  [/(maurer|zimmer|dach|gerüst|strassen|bau|sanitär|heizung|spengler|gips|platten|boden|schreiner|metallbau)/i, ["praktisch","forschend"]]
];

/* =========================================================================
   BASISLISTE (SEED) – echte Schweizer Berufe, gruppiert nach Kategorie.
   typ: "lehre" (berufliche Grundbildung EFZ/EBA) – Standard.
   ========================================================================= */
const SEED = {
  technik: [
    "Polymechaniker/in EFZ","Produktionsmechaniker/in EFZ","Mechanikpraktiker/in EBA",
    "Automatiker/in EFZ","Automatikmonteur/in EFZ","Elektroniker/in EFZ",
    "Elektroinstallateur/in EFZ","Montage-Elektriker/in EFZ","Elektroplaner/in EFZ",
    "Netzelektriker/in EFZ","Konstrukteur/in EFZ","Anlagen- und Apparatebauer/in EFZ",
    "Anlagenführer/in EFZ","Kunststofftechnologe/-login EFZ","Automobil-Mechatroniker/in EFZ",
    "Automobil-Fachmann/-frau EFZ","Automobil-Assistent/in EBA","Carrosseriespengler/in EFZ",
    "Carrosserielackierer/in EFZ","Landmaschinenmechaniker/in EFZ","Baumaschinenmechaniker/in EFZ",
    "Motorradmechaniker/in EFZ","Fahrradmechaniker/in EFZ","Uhrmacher/in EFZ",
    "Mikromechaniker/in EFZ","Metallbauer/in EFZ","Metallbaukonstrukteur/in EFZ",
    "Schmied/in EFZ","Gusstechnologe/-login EFZ","Oberflächenbeschichter/in EFZ",
    "Kältesystem-Monteur/in EFZ","Seilbahn-Mechatroniker/in EFZ"
  ],
  it: [
    "Informatiker/in EFZ Applikationsentwicklung","Informatiker/in EFZ Plattformentwicklung",
    "Informatiker/in EFZ Betriebsinformatik","ICT-Fachmann/-frau EFZ","Mediamatiker/in EFZ",
    "Entwickler/in digitales Business EFZ"
  ],
  gesundheit: [
    "Fachmann/-frau Gesundheit EFZ","Assistent/in Gesundheit und Soziales EBA",
    "Medizinische/r Praxisassistent/in EFZ","Dentalassistent/in EFZ","Pharma-Assistent/in EFZ",
    "Drogist/in EFZ","Augenoptiker/in EFZ","Hörsystem-Akustiker/in EFZ","Podologe/-login EFZ",
    "Orthopädieschuhmacher/in EFZ","Zahntechniker/in EFZ"
  ],
  soziales: [
    "Fachmann/-frau Betreuung EFZ","Fachmann/-frau Betreuung EFZ Kinderbetreuung",
    "Fachmann/-frau Betreuung EFZ Behindertenbetreuung","Fachmann/-frau Betreuung EFZ Betagtenbetreuung",
    "Assistent/in Gesundheit und Soziales EBA "
  ],
  gestaltung: [
    "Grafiker/in EFZ","Polygraf/in EFZ","Drucktechnologe/-login EFZ","Printmedienverarbeiter/in EFZ",
    "Fotograf/in EFZ","Fotofachmann/-frau EFZ","Interactive Media Designer EFZ",
    "Gestalter/in Werbetechnik EFZ","Bekleidungsgestalter/in EFZ","Bekleidungsnäher/in EBA",
    "Goldschmied/in EFZ","Keramiker/in EFZ","Geigenbauer/in EFZ","Bühnentänzer/in EFZ"
  ],
  wirtschaft: [
    "Kaufmann/-frau EFZ","Büroassistent/in EBA","Detailhandelsfachmann/-frau EFZ",
    "Detailhandelsassistent/in EBA","Fachmann/-frau Kundendialog EFZ","Logistiker/in EFZ",
    "Logistiker/in EBA","Strassentransportfachmann/-frau EFZ","Buchhändler/in EFZ"
  ],
  natur: [
    "Landwirt/in EFZ","Agrarpraktiker/in EBA","Winzer/in EFZ","Weintechnologe/-login EFZ",
    "Obstfachmann/-frau EFZ","Gemüsegärtner/in EFZ","Gärtner/in EFZ Garten- und Landschaftsbau",
    "Gärtner/in EFZ Zierpflanzen","Gärtner/in EFZ Baumschule","Florist/in EFZ","Forstwart/in EFZ",
    "Tierpfleger/in EFZ","Pferdefachmann/-frau EFZ","Tiermedizinische/r Praxisassistent/in EFZ",
    "Recyclist/in EFZ"
  ],
  gastro: [
    "Koch/Köchin EFZ","Küchenangestellte/r EBA","Systemgastronomiefachmann/-frau EFZ",
    "Restaurantfachmann/-frau EFZ","Restaurantangestellte/r EBA","Hotelfachmann/-frau EFZ",
    "Hotellerieangestellte/r EBA","Hotel-Kommunikationsfachmann/-frau EFZ",
    "Bäcker/in-Konditor/in-Confiseur/in EFZ","Konditor/in-Confiseur/in EFZ",
    "Fleischfachmann/-frau EFZ","Fleischfachassistent/in EBA","Lebensmitteltechnologe/-login EFZ",
    "Milchtechnologe/-login EFZ"
  ],
  bau: [
    "Zeichner/in EFZ Architektur","Zeichner/in EFZ Ingenieurbau","Zeichner/in EFZ Innenarchitektur",
    "Geomatiker/in EFZ","Maurer/in EFZ","Baupraktiker/in EBA","Zimmermann/Zimmerin EFZ",
    "Holzbearbeiter/in EBA","Polybauer/in EFZ","Gerüstbauer/in EFZ","Strassenbauer/in EFZ",
    "Pflästerer/in EFZ","Gleisbauer/in EFZ","Plattenleger/in EFZ","Gipser/in-Trockenbauer/in EFZ",
    "Maler/in EFZ","Schreiner/in EFZ","Schreinerpraktiker/in EBA","Bodenleger/in EFZ",
    "Sanitärinstallateur/in EFZ","Heizungsinstallateur/in EFZ","Lüftungsanlagenbauer/in EFZ",
    "Spengler/in EFZ","Gebäudetechnikplaner/in EFZ","Steinmetz/in EFZ",
    "Flachglastechnologe/-login EFZ","Fachmann/-frau Betriebsunterhalt EFZ"
  ],
  koerper: [
    "Coiffeur/-euse EFZ","Coiffeur/-euse EBA","Kosmetiker/in EFZ"
  ]
};

/* Weiterführende Berufe (typ: "weiterfuehrend") – Auswahl HF/FH/PH */
const WEITERFUEHREND = {
  gesundheit: ["Pflegefachmann/-frau HF","Dipl. Rettungssanitäter/in HF",
               "Biomedizinische/r Analytiker/in HF","Fachmann/-frau Operationstechnik HF",
               "Physiotherapeut/in FH","Ergotherapeut/in FH","Hebamme FH","Ernährungsberater/in FH"],
  soziales:   ["Sozialpädagoge/-gin HF","Kindheitspädagoge/-gin HF","Primarlehrer/in PH","Sekundarlehrer/in PH"],
  technik:    ["Maschineningenieur/in FH","Elektroingenieur/in FH"],
  it:         ["Informatik-Ingenieur/in FH","Wirtschaftsinformatiker/in FH"],
  wirtschaft: ["Betriebsökonom/in FH","Immobilienbewirtschafter/in mit eidg. FA"],
  bau:        ["Architekt/in FH","Bauingenieur/in FH"],
  gestaltung: ["Kommunikationsdesigner/in FH"],
  natur:      ["Förster/in HF","Umweltingenieur/in FH"]
};

/* Kuratierte Beschreibungen/Tags für die wichtigsten Berufe (bessere Qualität) */
const CURATED = {
  "Polymechaniker/in EFZ": { desc: "Du fertigst und montierst Präzisionsteile aus Metall mit modernen Maschinen.", tags: ["praktisch","forschend"] },
  "Automatiker/in EFZ": { desc: "Du baust und programmierst Steuerungen für Maschinen und Anlagen.", tags: ["forschend","praktisch"] },
  "Elektroinstallateur/in EFZ": { desc: "Du installierst Strom-, Licht- und Datenleitungen in Gebäuden.", tags: ["praktisch","forschend"] },
  "Konstrukteur/in EFZ": { desc: "Du entwickelst am Computer technische Zeichnungen und 3D-Modelle.", tags: ["forschend","kreativ"] },
  "Automobil-Mechatroniker/in EFZ": { desc: "Du diagnostizierst und reparierst Fahrzeuge mit viel Elektronik.", tags: ["praktisch","forschend"] },
  "Informatiker/in EFZ Applikationsentwicklung": { desc: "Du programmierst Software, Apps und Webanwendungen.", tags: ["forschend","praktisch"] },
  "Informatiker/in EFZ Betriebsinformatik": { desc: "Du betreust Netzwerke, Server und IT-Systeme einer Firma.", tags: ["forschend","praktisch"] },
  "Mediamatiker/in EFZ": { desc: "Mix aus IT, Gestaltung, Marketing und Administration – sehr vielseitig.", tags: ["kreativ","forschend"] },
  "Entwickler/in digitales Business EFZ": { desc: "Du verbindest Programmieren mit Wirtschaft und digitalen Projekten.", tags: ["forschend","fuehrend"] },
  "ICT-Fachmann/-frau EFZ": { desc: "Du richtest Geräte ein und hilfst Nutzer/innen bei IT-Problemen.", tags: ["praktisch","forschend"] },
  "Fachmann/-frau Gesundheit EFZ": { desc: "Du pflegst und betreust kranke und ältere Menschen im Spital oder Heim.", tags: ["sozial","praktisch"] },
  "Fachmann/-frau Betreuung EFZ": { desc: "Du begleitest Kinder, Menschen mit Behinderung oder Betagte im Alltag.", tags: ["sozial","ordnend"] },
  "Medizinische/r Praxisassistent/in EFZ": { desc: "Du unterstützt Ärzt/innen, machst Labor, Blut abnehmen und Administration.", tags: ["sozial","ordnend"] },
  "Dentalassistent/in EFZ": { desc: "Du assistierst in der Zahnarztpraxis und betreust die Patient/innen.", tags: ["sozial","praktisch"] },
  "Pharma-Assistent/in EFZ": { desc: "Du berätst in der Apotheke und gibst Medikamente ab.", tags: ["sozial","ordnend"] },
  "Grafiker/in EFZ": { desc: "Du gestaltest Logos, Plakate, Webseiten und visuelle Botschaften.", tags: ["kreativ","forschend"] },
  "Polygraf/in EFZ": { desc: "Du bereitest Texte und Bilder für Print und digitale Medien auf.", tags: ["kreativ","ordnend"] },
  "Fotograf/in EFZ": { desc: "Du fotografierst Menschen, Produkte oder Ereignisse und bearbeitest Bilder.", tags: ["kreativ","praktisch"] },
  "Interactive Media Designer EFZ": { desc: "Du gestaltest Apps, Games und interaktive digitale Erlebnisse.", tags: ["kreativ","forschend"] },
  "Kaufmann/-frau EFZ": { desc: "Der beliebteste Beruf: Büro, Organisation, Kommunikation, Zahlen.", tags: ["ordnend","fuehrend"] },
  "Detailhandelsfachmann/-frau EFZ": { desc: "Du berätst Kund/innen im Laden und kennst deine Produkte bestens.", tags: ["fuehrend","sozial"] },
  "Fachmann/-frau Kundendialog EFZ": { desc: "Du betreust Kund/innen am Telefon und über digitale Kanäle.", tags: ["fuehrend","sozial"] },
  "Logistiker/in EFZ": { desc: "Du lagerst, verteilst und transportierst Waren – Überblick gefragt.", tags: ["ordnend","praktisch"] },
  "Landwirt/in EFZ": { desc: "Du baust Pflanzen an, hältst Tiere und arbeitest in der Natur.", tags: ["praktisch","forschend"] },
  "Tierpfleger/in EFZ": { desc: "Du fütterst, pflegst und betreust Tiere im Zoo, Heim oder Labor.", tags: ["sozial","praktisch"] },
  "Gärtner/in EFZ Garten- und Landschaftsbau": { desc: "Du gestaltest und pflegst Gärten und Aussenräume.", tags: ["praktisch","kreativ"] },
  "Forstwart/in EFZ": { desc: "Du pflegst den Wald, fällst Bäume und schützt die Natur.", tags: ["praktisch","forschend"] },
  "Koch/Köchin EFZ": { desc: "Du kochst kreative Gerichte und arbeitest im Team unter Zeitdruck.", tags: ["kreativ","praktisch"] },
  "Bäcker/in-Konditor/in-Confiseur/in EFZ": { desc: "Du backst Brot, Patisserie und feine Süssigkeiten.", tags: ["kreativ","praktisch"] },
  "Restaurantfachmann/-frau EFZ": { desc: "Du servierst, berätst Gäste und sorgst für tolle Erlebnisse.", tags: ["sozial","fuehrend"] },
  "Fleischfachmann/-frau EFZ": { desc: "Du verarbeitest Fleisch zu Spezialitäten und berätst Kundschaft.", tags: ["praktisch","ordnend"] },
  "Zeichner/in EFZ Architektur": { desc: "Du erstellst am Computer Baupläne für Häuser und Gebäude.", tags: ["forschend","kreativ"] },
  "Maurer/in EFZ": { desc: "Du baust Mauern, Wände und Fundamente – kräftig und genau.", tags: ["praktisch","forschend"] },
  "Schreiner/in EFZ": { desc: "Du fertigst Möbel, Türen und Innenausbauten aus Holz.", tags: ["praktisch","kreativ"] },
  "Sanitärinstallateur/in EFZ": { desc: "Du installierst Wasser-, Bad- und Heizungsanlagen.", tags: ["praktisch","forschend"] },
  "Maler/in EFZ": { desc: "Du gestaltest Wände und Fassaden mit Farbe und Technik.", tags: ["praktisch","kreativ"] },
  "Coiffeur/-euse EFZ": { desc: "Du schneidest, färbst und berätst – Handwerk trifft Menschen.", tags: ["kreativ","sozial"] },
  "Kosmetiker/in EFZ": { desc: "Du pflegst Haut und sorgst für Wohlbefinden deiner Kundschaft.", tags: ["sozial","kreativ"] }
};

/* ------------------------------- Helfer ------------------------------- */
function slug(s) {
  return s.toLowerCase()
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function dauerFor(name, typ) {
  if (typ === "weiterfuehrend") return "weiterführend";
  if (/EBA/.test(name)) return "2 Jahre";
  return "3–4 Jahre";
}
function inferTags(name, kat) {
  const scores = {};
  (KAT_DEFAULT_TAGS[kat] || []).forEach(d => scores[d] = (scores[d] || 0) + 2);
  for (const [re, dims] of KEYWORDS) {
    if (re.test(name)) dims.forEach(d => scores[d] = (scores[d] || 0) + 2);
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const tags = sorted.slice(0, 3);
  return tags.length >= 2 ? tags : (KAT_DEFAULT_TAGS[kat] || ["praktisch","forschend"]);
}
function infoLink(name) {
  return "https://www.berufsberatung.ch/dyn/show/1893?search=" + encodeURIComponent(name);
}
function videoLink(name) {
  return "https://www.youtube.com/results?search_query=" +
    encodeURIComponent("Beruf " + name + " Lehre Schweiz Berufsfilm");
}

function buildRecord(name, kat, typ) {
  name = name.trim();
  const cur = CURATED[name];
  return {
    id: slug(name),
    name,
    kat,
    typ,
    dauer: dauerFor(name, typ),
    tags: cur ? cur.tags : inferTags(name, kat),
    desc: cur ? cur.desc : (KAT_DESC[kat] || ""),
    info: infoLink(name),
    video: videoLink(name),
    quelle: cur ? "kuratiert" : "seed"
  };
}

/* ----------------------- Datensatz aus SEED bauen ----------------------- */
function buildFromSeed() {
  const out = new Map(); // id -> record (dedupe)
  for (const [kat, namen] of Object.entries(SEED)) {
    for (const n of namen) {
      const r = buildRecord(n, kat, "lehre");
      out.set(r.id, r);
    }
  }
  for (const [kat, namen] of Object.entries(WEITERFUEHREND)) {
    for (const n of namen) {
      const r = buildRecord(n, kat, "weiterfuehrend");
      if (!out.has(r.id)) out.set(r.id, r);
    }
  }
  return out;
}

/* ----------------- Live-Abgleich (best effort, optional) -----------------
   Versucht, von berufsberatung.ch zusätzliche Berufsnamen zu lesen.
   Die Seitenstruktur kann sich ändern – darum defensiv: Fehler werden
   geloggt und ignoriert, der Lauf bleibt erfolgreich (Basisliste greift).
*/
const LIVE_URLS = [
  "https://www.berufsberatung.ch/dyn/show/1893"
];
function guessKat(name) {
  const n = name.toLowerCase();
  for (const [re, _] of KEYWORDS) { /* unused */ }
  if (/(informatik|ict|mediamatik|digital)/.test(n)) return "it";
  if (/(pflege|gesundheit|dental|pharma|optik|podolog|zahn)/.test(n)) return "gesundheit";
  if (/(betreuung|sozial|pädagog|kinder)/.test(n)) return "soziales";
  if (/(grafik|design|foto|polygraf|media|gestalt|gold|keramik)/.test(n)) return "gestaltung";
  if (/(kauf|detailhandel|logistik|büro|verkauf|kundendialog)/.test(n)) return "wirtschaft";
  if (/(landwirt|gärtner|forst|tier|pferd|winzer|florist|recycl)/.test(n)) return "natur";
  if (/(koch|köch|bäck|konditor|fleisch|restaurant|hotel|lebensmittel|milch)/.test(n)) return "gastro";
  if (/(maurer|zimmer|bau|sanitär|heizung|spengler|gips|schreiner|maler|boden|platten|gerüst|zeichner|geomatik)/.test(n)) return "bau";
  if (/(coiffeur|kosmetik)/.test(n)) return "koerper";
  return "technik";
}
async function liveAbgleich(map) {
  let neu = 0;
  for (const url of LIVE_URLS) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "BerufsKompass/1.0 (+education)" }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) { console.warn(`  ⚠ ${url} -> HTTP ${res.status} (übersprungen)`); continue; }
      const html = await res.text();
      // Berufsnamen heuristisch aus Linktexten ziehen (z.B. "... EFZ"/"... EBA")
      const treffer = html.match(/>([A-ZÄÖÜ][^<>]{3,60}(?:EFZ|EBA))</g) || [];
      const namen = [...new Set(treffer.map(t => t.replace(/^>|<$/g, "").trim()))];
      for (const name of namen) {
        const id = slug(name);
        if (map.has(id)) continue;
        const kat = guessKat(name);
        map.set(id, { ...buildRecord(name, kat, "lehre"), quelle: "live" });
        neu++;
      }
      console.log(`  ✓ ${url}: ${namen.length} Namen erkannt, ${neu} neu`);
    } catch (e) {
      console.warn(`  ⚠ ${url} nicht erreichbar (${e.message}). Basisliste wird verwendet.`);
    }
  }
  return neu;
}

/* -------------------------------- Main -------------------------------- */
async function main() {
  console.log("🧭 Berufs-Kompass – Auto-Abgleich startet …");
  const map = buildFromSeed();
  console.log(`  Basisliste: ${map.size} Berufe`);

  console.log("  Live-Abgleich (berufsberatung.ch) …");
  const neu = await liveAbgleich(map);

  const berufe = [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
  const proKat = {};
  KATEGORIEN.forEach(k => proKat[k] = berufe.filter(b => b.kat === k).length);
  const meta = {
    generatedAt: new Date().toISOString(),
    total: berufe.length,
    lehre: berufe.filter(b => b.typ === "lehre").length,
    weiterfuehrend: berufe.filter(b => b.typ === "weiterfuehrend").length,
    neuVomLiveAbgleich: neu,
    proKategorie: proKat,
    quelle: "Basisliste + berufsberatung.ch"
  };

  // berufe.json (kanonisch)
  writeFileSync(join(ROOT, "berufe.json"),
    JSON.stringify({ meta, berufe }, null, 2) + "\n", "utf8");

  // berufe.js (für Browser, auch unter file://)
  const js =
    "/* AUTOMATISCH GENERIERT von tools/crawler.mjs – nicht von Hand bearbeiten. */\n" +
    "window.BERUFE_DATA = " + JSON.stringify(berufe) + ";\n" +
    "window.BERUFE_META = " + JSON.stringify(meta) + ";\n";
  writeFileSync(join(ROOT, "berufe.js"), js, "utf8");

  console.log(`✅ Fertig: ${berufe.length} Berufe ` +
    `(${meta.lehre} Lehre, ${meta.weiterfuehrend} weiterführend, ${neu} neu vom Live-Abgleich).`);
  console.log("   → berufe.json und berufe.js geschrieben.");
}

main().catch(e => { console.error("❌ Fehler:", e); process.exit(1); });
