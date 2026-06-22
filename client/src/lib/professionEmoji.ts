import type { Category } from "../types";

/** Normalisiert einen Namen für robustes Matching (Umlaute, Kleinschreibung). */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

/**
 * Stichwort → Emoji. Reihenfolge = Priorität: spezifischere Muster zuerst,
 * damit z. B. "Tierpfleger" 🐾 trifft und nicht das allgemeine "pfleg" 🩺.
 */
const RULES: Array<[RegExp, string]> = [
  // Gesundheit & Soziales
  [/zahn|dental/, "🦷"],
  [/augenoptik|optometr|orthoptist/, "👓"],
  [/hoersystem|akustik/, "👂"],
  [/podolog|orthopaedieschuh|fuss/, "🦶"],
  [/hebamme/, "🤰"],
  [/rettungssanitaeter|notfall|ambulanz/, "🚑"],
  [/radiologie|roentgen/, "🩻"],
  [/labor|analytik/, "🔬"],
  [/apotheke|pharma|drogist/, "💊"],
  [/ernaehrung|diaet/, "🥗"],
  [/physiotherap|ergotherap|osteopath|masseur|massage/, "💆"],
  [/bewegungs|gesundheitsfoerderung|fitness/, "🏋️"],
  [/kinder|kita|kindheit|kindergarten/, "🧸"],
  [/lehr(er|person)|primar|sekundar|paedagog|schule|ausbild|berufsbildner/, "🧑‍🏫"],
  [/logopaed|psychomotor/, "🗣️"],
  [/pflege|gesundheit|betreuung|betagt|langzeit|aktivierung|behinderten/, "🩺"],
  [/sozial|animator|gemeinde|arbeitsagog/, "🤝"],
  [/polizist/, "👮"],
  [/feuerwehr/, "🚒"],

  // Tiere & Natur
  [/tier|pferd|hufschmied|wildhueter|gefluegel/, "🐾"],
  [/florist/, "💐"],
  [/garten|gaertner|landschaft|baumpfleg|baumschule|stauden|zierpflanz|friedhof/, "🌱"],
  [/forst|wald|holzbearbeiter/, "🌲"],
  [/winzer|wein|oenolog|rebe/, "🍇"],
  [/obst/, "🍎"],
  [/gemuese/, "🥕"],
  [/landwirt|agrar|agronom|agrotechnik|baeuerin|bauer/, "🚜"],
  [/recycl|umwelt/, "♻️"],
  [/berg/, "🏔️"],

  // Gastro & Lebensmittel
  [/baeck|konditor|confiseur/, "🥐"],
  [/koch|koech|kueche|gastronomie/, "🍳"],
  [/fleisch|metzg/, "🥩"],
  [/milch/, "🧀"],
  [/mueller|getreide/, "🌾"],
  [/getraenke/, "🥤"],
  [/sommelier/, "🍷"],
  [/restaurant|service|hotel|hotellerie|tourismus|reception|reise|flugbegleiter/, "🍽️"],
  [/lebensmittel/, "🍱"],

  // Bau & Holz
  [/maurer|baupraktiker|hochbau|polier/, "🧱"],
  [/zimmer|holzbau|holztechnik|schreiner|drechsler|parkett/, "🪵"],
  [/maler|theatermaler/, "🎨"],
  [/gipser|trockenbau|stuckatur/, "🧰"],
  [/sanitaer|spengler|installateur.*sanitaer/, "🚿"],
  [/heizung|lueftung|klima|kaeltesystem/, "🌡️"],
  [/dach|abdicht|polybauer|gerüst|geruest|isolier/, "🏠"],
  [/strasse|gleis|tiefbau|pflaesterer|grundbauer/, "🛣️"],
  [/platten|boden|stein|steinmetz|steinwerker|steinbildhauer/, "⬜"],
  [/architekt|innenarchit|zeichner|geomat|raumplaner|bautechnik|baufuehrer|bauleiter|bauingenieur/, "📐"],
  [/elektroinstall|montage-elektrik|netzelektrik|elektroplaner/, "💡"],
  [/solar/, "☀️"],
  [/kaminfeger/, "🧹"],
  [/store|gebaeudereiniger|betriebsunterhalt|hauswart|unterhalt/, "🧽"],
  [/glas/, "🪟"],

  // Technik
  [/auto|carrosserie|fahrzeug|mechatronik/, "🚗"],
  [/motorrad|fahrrad|velo/, "🚲"],
  [/flug|pilot|luftverkehr|flugverkehr/, "✈️"],
  [/lok|zug|bahn|oeffentlicher verkehr/, "🚆"],
  [/lastwagen|transport|chauffeur|logistik|lager/, "🚚"],
  [/seilbahn/, "🚠"],
  [/boot/, "⛵"],
  [/uhr/, "⏱️"],
  [/schmied|metallbau|schweiss/, "⚒️"],
  [/polymechanik|mechanik|maschinen|konstrukteur|anlagen|apparat|werkzeug/, "⚙️"],
  [/automatik|roboter/, "🤖"],
  [/elektro|elektronik|telematik|multimedia/, "🔌"],
  [/chemie|galvanik|oberflaechen|kunststoff|verpackung/, "⚗️"],
  [/textil|bekleidung|naeh|modist|schneider/, "🧵"],
  [/optik|feinwerk|mikro/, "🔍"],

  // IT & Medien
  [/informatik|ict|cyber|software|applikation|plattform|netzwerk|digital/, "💻"],
  [/mediamatik/, "🖥️"],
  [/grafik|design|gestalt|werbetechnik|kommunikationsdesign|produktdesign/, "🎨"],
  [/foto/, "📷"],
  [/druck|polygraf|printmedien|buchbind|redaktor/, "🖨️"],
  [/film|schauspiel|musical|buehnen|taenz|theater|veranstaltung/, "🎭"],
  [/musik|geige|klavier|orgel|blasinstrument/, "🎵"],
  [/gold|schmuck/, "💍"],
  [/keramik|hafner/, "🏺"],
  [/sattler|schuhmacher|leder/, "👜"],
  [/buch/, "📚"],

  // Körper
  [/coiffeur/, "💇"],
  [/kosmetik/, "💄"],

  // Wirtschaft
  [/bank|finanz|treuhand|steuer|buchhalt|rechnungswesen|wirtschaftspruef|versicherung|sozialversicherung/, "💰"],
  [/verkauf|detailhandel|kundendialog|marketing/, "🛒"],
  [/kaufmann|buero|administration|direktionsassistent|organisator|immobilien|zoll|aussenhandel|hr-fach|personal/, "📊"],
];

/**
 * Wählt ein zum Beruf passendes Emoji anhand des Namens. Findet sich kein
 * Treffer, wird das Kategorie-Emoji als Fallback verwendet (kein Beruf bleibt
 * ohne Symbol). Rein clientseitig und offline.
 */
export function professionEmoji(name: string, category: Category): string {
  const n = normalize(name);
  for (const [re, emoji] of RULES) {
    if (re.test(n)) return emoji;
  }
  return category.emoji;
}
