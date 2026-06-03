/* =========================================================================
   Berufs-Kompass – Admin-Logik
   Lädt die Berufsdaten, erlaubt Bearbeiten, Abgleich (Import + Diff) und Export.
   Alles läuft im Browser; Speichern = Dateien exportieren und committen.
   ========================================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

const DIM_KEYS = Object.keys(DIMENSIONEN);
const KAT_KEYS = Object.keys(KATEGORIEN);
const TYPEN = [["lehre", "Lehre (EFZ/EBA)"], ["weiterfuehrend", "Weiterführend"]];

/* Arbeitskopie der Daten */
let daten = (window.BERUFE_DATA && window.BERUFE_DATA.length)
  ? structuredClone(window.BERUFE_DATA)
  : structuredClone(typeof BERUFE !== "undefined" ? BERUFE : []);

/* Online die frischeste berufe.json laden (falls nicht file://) */
async function ladeFrisch() {
  try {
    const res = await fetch("berufe.json", { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      if (j.berufe && j.berufe.length) { daten = j.berufe; toast("Aktuelle berufe.json geladen"); }
    }
  } catch (_) { /* file:// blockiert fetch – dann nutzen wir berufe.js */ }
  renderAll();
}

/* ----------------------------- Hilfen ----------------------------- */
function slug(s) {
  return s.toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function infoLink(name) { return "https://www.berufsberatung.ch/dyn/show/1893?search=" + encodeURIComponent(name); }
function videoLink(name) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent("Beruf " + name + " Lehre Schweiz Berufsfilm"); }
function toast(msg) {
  const t = el("div", "toast", msg); document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* --------------------------- Statistik --------------------------- */
function renderStats() {
  const lehre = daten.filter(b => (b.typ || "lehre") === "lehre").length;
  const weiter = daten.filter(b => b.typ === "weiterfuehrend").length;
  const ohneTags = daten.filter(b => !b.tags || b.tags.length < 2).length;
  const stand = window.BERUFE_META && window.BERUFE_META.generatedAt
    ? new Date(window.BERUFE_META.generatedAt).toLocaleDateString("de-CH") : "–";

  $("#stats").innerHTML = `
    <div class="stat"><div class="big">${daten.length}</div><div class="lbl">Berufe total</div></div>
    <div class="stat"><div class="big">${lehre}</div><div class="lbl">Lehrberufe</div></div>
    <div class="stat"><div class="big">${weiter}</div><div class="lbl">Weiterführend</div></div>
    <div class="stat"><div class="big">${ohneTags}</div><div class="lbl">ohne Tags ⚠</div></div>
    <div class="stat"><div class="big" style="font-size:1rem">${stand}</div><div class="lbl">letzter Abgleich</div></div>`;

  const counts = {};
  KAT_KEYS.forEach(k => counts[k] = daten.filter(b => b.kat === k).length);
  $("#kat-stats").innerHTML = KAT_KEYS.map(k =>
    `<span class="kat-pill" style="background:${KATEGORIEN[k].farbe}">${KATEGORIEN[k].emoji} ${KATEGORIEN[k].name}: ${counts[k]}</span>`
  ).join("");
}

/* ---------------------------- Tabelle ---------------------------- */
function renderTable() {
  const q = ($("#admin-suche").value || "").trim().toLowerCase();
  const tbody = $("#berufe-tbody");
  tbody.innerHTML = "";
  const liste = daten
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => !q || b.name.toLowerCase().includes(q) ||
      (KATEGORIEN[b.kat] && KATEGORIEN[b.kat].name.toLowerCase().includes(q)))
    .sort((a, z) => a.b.name.localeCompare(z.b.name, "de"));

  $("#row-count").textContent = daten.length;

  liste.forEach(({ b, i }) => {
    const tr = el("tr");

    const katOpts = KAT_KEYS.map(k =>
      `<option value="${k}" ${b.kat === k ? "selected" : ""}>${KATEGORIEN[k].emoji} ${KATEGORIEN[k].name}</option>`).join("");
    const typOpts = TYPEN.map(([v, l]) =>
      `<option value="${v}" ${(b.typ || "lehre") === v ? "selected" : ""}>${l}</option>`).join("");

    tr.innerHTML = `
      <td class="col-name"><input data-f="name" value="${escapeAttr(b.name)}"></td>
      <td><select data-f="kat">${katOpts}</select></td>
      <td><select data-f="typ">${typOpts}</select></td>
      <td><input data-f="dauer" value="${escapeAttr(b.dauer || "")}"></td>
      <td class="col-tags"><input data-f="tags" value="${escapeAttr((b.tags || []).join(", "))}" title="Erlaubt: ${DIM_KEYS.join(", ")}"></td>
      <td class="col-desc"><textarea data-f="desc">${escapeHtml(b.desc || "")}</textarea></td>
      <td><button class="del-btn" title="Löschen">✕</button></td>`;

    // Bearbeiten
    $$("[data-f]", tr).forEach(inp => {
      inp.addEventListener("change", () => {
        const f = inp.dataset.f;
        if (f === "tags") {
          const tags = inp.value.split(",").map(s => s.trim()).filter(Boolean);
          const ungueltig = tags.some(t => !DIM_KEYS.includes(t));
          inp.classList.toggle("tag-invalid", ungueltig);
          b.tags = tags;
        } else {
          b[f] = inp.value;
          if (f === "name") { b.info = infoLink(b.name); b.video = videoLink(b.name); }
        }
        renderStats();
      });
    });
    // Löschen
    $(".del-btn", tr).addEventListener("click", () => {
      if (confirm(`"${b.name}" wirklich löschen?`)) {
        daten.splice(i, 1); renderAll(); toast("Beruf gelöscht");
      }
    });

    tbody.appendChild(tr);
  });
}

function escapeAttr(s) { return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
function escapeHtml(s) { return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* --------------------------- Hinzufügen --------------------------- */
function addBeruf() {
  const name = prompt("Name des neuen Berufs (z.B. «Drohnenpilot/in EFZ»):");
  if (!name) return;
  const kat = prompt("Kategorie-Schlüssel (" + KAT_KEYS.join(", ") + "):", "technik");
  if (!KAT_KEYS.includes(kat)) { alert("Unbekannte Kategorie."); return; }
  const neu = {
    id: slug(name), name: name.trim(), kat, typ: "lehre",
    dauer: /EBA/.test(name) ? "2 Jahre" : "3–4 Jahre",
    tags: KATEGORIEN[kat] ? defaultTags(kat) : ["praktisch", "forschend"],
    desc: "", info: infoLink(name), video: videoLink(name), quelle: "manuell"
  };
  daten.unshift(neu); renderAll(); toast("Beruf hinzugefügt – bitte Tags/Beschreibung prüfen");
}
function defaultTags(kat) {
  const map = { technik:["praktisch","forschend"], it:["forschend","praktisch"], gesundheit:["sozial","praktisch"],
    soziales:["sozial","fuehrend"], gestaltung:["kreativ","forschend"], wirtschaft:["ordnend","fuehrend"],
    natur:["praktisch","forschend"], gastro:["kreativ","praktisch"], bau:["praktisch","forschend"], koerper:["kreativ","sozial"] };
  return map[kat] || ["praktisch","forschend"];
}

/* ----------------------- Abgleich / Import ----------------------- */
function importDatei(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let neu;
    try {
      const j = JSON.parse(reader.result);
      neu = Array.isArray(j) ? j : j.berufe;
      if (!Array.isArray(neu)) throw new Error("Kein berufe-Array gefunden");
    } catch (e) { alert("Datei konnte nicht gelesen werden: " + e.message); return; }
    zeigeDiff(neu);
  };
  reader.readAsText(file, "utf8");
}

function zeigeDiff(neu) {
  const altMap = new Map(daten.map(b => [b.id || slug(b.name), b]));
  const neuMap = new Map(neu.map(b => [b.id || slug(b.name), b]));

  const hinzu = neu.filter(b => !altMap.has(b.id || slug(b.name)));
  const entfernt = daten.filter(b => !neuMap.has(b.id || slug(b.name)));
  const geaendert = neu.filter(b => {
    const a = altMap.get(b.id || slug(b.name));
    return a && (a.kat !== b.kat || a.typ !== b.typ || (a.tags || []).join() !== (b.tags || []).join());
  });

  const box = $("#diff-result");
  box.innerHTML = `
    <div class="diff-box diff-new"><b>➕ Neu (${hinzu.length})</b>
      <ul>${hinzu.slice(0,50).map(b => `<li>${b.name}</li>`).join("") || "<li>keine</li>"}</ul></div>
    <div class="diff-box diff-changed"><b>✏️ Geändert (${geaendert.length})</b>
      <ul>${geaendert.slice(0,50).map(b => `<li>${b.name}</li>`).join("") || "<li>keine</li>"}</ul></div>
    <div class="diff-box diff-removed"><b>➖ Nicht mehr in neuer Liste (${entfernt.length})</b>
      <ul>${entfernt.slice(0,50).map(b => `<li>${b.name}</li>`).join("") || "<li>keine</li>"}</ul></div>
    <div class="action-row" style="margin-top:1rem">
      <button id="merge-add" class="btn btn-primary">Nur neue Berufe übernehmen (+${hinzu.length})</button>
      <button id="merge-replace" class="btn btn-ghost">Komplett ersetzen (${neu.length} Berufe)</button>
    </div>`;

  $("#merge-add").addEventListener("click", () => {
    daten = daten.concat(hinzu); renderAll(); box.innerHTML = ""; toast(hinzu.length + " neue Berufe übernommen");
  });
  $("#merge-replace").addEventListener("click", () => {
    if (confirm("Komplette Liste durch die importierte ersetzen?")) {
      daten = neu; renderAll(); box.innerHTML = ""; toast("Liste ersetzt");
    }
  });
}

/* ----------------------------- Export ----------------------------- */
function baueMeta() {
  const proKat = {};
  KAT_KEYS.forEach(k => proKat[k] = daten.filter(b => b.kat === k).length);
  return {
    generatedAt: new Date().toISOString(),
    total: daten.length,
    lehre: daten.filter(b => (b.typ || "lehre") === "lehre").length,
    weiterfuehrend: daten.filter(b => b.typ === "weiterfuehrend").length,
    proKategorie: proKat,
    quelle: "Admin-Export"
  };
}
function download(name, inhalt, typ) {
  const blob = new Blob([inhalt], { type: typ });
  const a = el("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  toast(name + " heruntergeladen");
}
function exportJson() {
  const sorted = daten.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
  download("berufe.json", JSON.stringify({ meta: baueMeta(), berufe: sorted }, null, 2) + "\n", "application/json");
}
function exportJs() {
  const sorted = daten.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
  const js = "/* AUTOMATISCH GENERIERT (Admin-Export) – nicht von Hand bearbeiten. */\n" +
    "window.BERUFE_DATA = " + JSON.stringify(sorted) + ";\n" +
    "window.BERUFE_META = " + JSON.stringify(baueMeta()) + ";\n";
  download("berufe.js", js, "application/javascript");
}

/* ----------------------------- Render ----------------------------- */
function renderAll() { renderStats(); renderTable(); }

document.addEventListener("DOMContentLoaded", () => {
  $("#admin-suche").addEventListener("input", renderTable);
  $("#add-beruf").addEventListener("click", addBeruf);
  $("#export-json").addEventListener("click", exportJson);
  $("#export-js").addEventListener("click", exportJs);
  $("#import-file").addEventListener("change", e => { if (e.target.files[0]) importDatei(e.target.files[0]); });
  renderAll();
  ladeFrisch();
});
