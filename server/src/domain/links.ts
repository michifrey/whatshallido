/** Hilfsfunktionen zum Erzeugen stabiler IDs und externer Links. */

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function infoUrl(name: string): string {
  return "https://www.berufsberatung.ch/dyn/show/1893?search=" + encodeURIComponent(name);
}

export function videoUrl(name: string): string {
  return (
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent("Beruf " + name + " Lehre Schweiz Berufsfilm")
  );
}

export function lehrstelleUrl(name: string): string {
  return "https://www.yousty.ch/de-CH/lehrstellen?q=" + encodeURIComponent(name);
}
