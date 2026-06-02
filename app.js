/* =========================================================================
   Berufs-Kompass Schweiz – App-Logik
   ========================================================================= */

/* ---------- kleine Helfer ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

/* Datenquelle: bevorzugt die vom Crawler erzeugte Liste (berufe.js),
   sonst die kuratierte Basisliste aus data.js. */
const DATEN = (window.BERUFE_DATA && window.BERUFE_DATA.length)
  ? window.BERUFE_DATA : BERUFE;
const META = window.BERUFE_META || null;

/* Eindeutige ID eines Berufs (berufe.js hat .id, data.js-Fallback nutzt Namen) */
const berufId = b => b.id || b.name;

/* ---------- Merkliste (Favoriten) – im Browser gespeichert ---------- */
const MERK_KEY = "berufskompass_merkliste";
let merkliste = new Set();
try { merkliste = new Set(JSON.parse(localStorage.getItem(MERK_KEY) || "[]")); } catch (_) {}
function merkSpeichern() {
  try { localStorage.setItem(MERK_KEY, JSON.stringify([...merkliste])); } catch (_) {}
}
function merkToggle(b) {
  const id = berufId(b);
  if (merkliste.has(id)) merkliste.delete(id); else merkliste.add(id);
  merkSpeichern();
  updateMerkBadge();
  if ($("#merkliste").classList.contains("active")) renderMerkliste();
}
function updateMerkBadge() {
  const badge = $("#merk-badge");
  if (!badge) return;
  badge.textContent = merkliste.size ? merkliste.size : "";
  badge.style.display = merkliste.size ? "inline-grid" : "none";
}

/* Link zur Lehrstellensuche (Schnupperlehre / Lehrstelle finden) */
function lehrstellenLink(name) {
  return "https://www.yousty.ch/de-CH/lehrstellen?q=" + encodeURIComponent(name);
}

/* ---------- Navigation zwischen den Ansichten ---------- */
function showView(id) {
  $$(".view").forEach(v => v.classList.remove("active"));
  $("#" + id).classList.add("active");
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === id));
  if (id === "merkliste") renderMerkliste();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Berufskarte (wiederverwendbar) ---------- */
function berufKarte(b, treffer) {
  const kat = KATEGORIEN[b.kat] || { emoji: "💼", name: "Beruf", farbe: "#64748b" };
  const card = el("article", "beruf-card");
  card.style.setProperty("--kat-farbe", kat.farbe);

  const tags = (b.tags || [])
    .filter(t => DIMENSIONEN[t])
    .map(t => `<span class="tag">${DIMENSIONEN[t].emoji} ${DIMENSIONEN[t].name.split(" ")[0]}</span>`)
    .join("");

  const match = treffer
    ? `<div class="match-badge">${treffer}% Match</div>`
    : "";

  const gemerkt = merkliste.has(berufId(b));
  const typBadge = b.typ === "weiterfuehrend"
    ? `<span class="typ-badge">📚 weiterführend</span>` : "";

  // "Lehrstelle finden" nur bei Lehrberufen
  const lehrstelle = (b.typ === "weiterfuehrend") ? "" :
    `<a class="btn btn-lehrstelle" href="${lehrstellenLink(b.name)}" target="_blank" rel="noopener">🔍 Lehrstelle</a>`;

  card.innerHTML = `
    ${match}
    <button class="herz ${gemerkt ? "on" : ""}" title="Zur Merkliste hinzufügen" aria-label="Merken">${gemerkt ? "❤️" : "🤍"}</button>
    <div class="beruf-head">
      <span class="beruf-emoji">${kat.emoji}</span>
      <div>
        <h3>${b.name}</h3>
        <span class="beruf-kat">${kat.name} · ${b.dauer || ""} ${typBadge}</span>
      </div>
    </div>
    <p class="beruf-desc">${b.desc || ""}</p>
    <div class="beruf-tags">${tags}</div>
    <div class="beruf-links">
      <a class="btn btn-video" href="${b.video}" target="_blank" rel="noopener">▶ Video</a>
      <a class="btn btn-info" href="${b.info}" target="_blank" rel="noopener">ℹ Infos</a>
      ${lehrstelle}
    </div>
  `;

  const herz = $(".herz", card);
  herz.addEventListener("click", () => {
    merkToggle(b);
    const on = merkliste.has(berufId(b));
    herz.classList.toggle("on", on);
    herz.textContent = on ? "❤️" : "🤍";
  });

  return card;
}

/* ---------- Merkliste-Ansicht ---------- */
function renderMerkliste() {
  const grid = $("#merkliste-grid");
  const leer = $("#merk-leer");
  const actions = $("#merk-actions");
  grid.innerHTML = "";
  const liste = DATEN.filter(b => merkliste.has(berufId(b)))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));

  if (!liste.length) {
    leer.style.display = "block";
    actions.style.display = "none";
    return;
  }
  leer.style.display = "none";
  actions.style.display = "flex";
  liste.forEach(b => grid.appendChild(berufKarte(b)));
}

/* =========================================================================
   1) BERUFS-EXPLORER  (A–Z, Suche + Filter)
   ========================================================================= */
let aktiveKategorie = "alle";
let aktiverTyp = "alle";

function initExplorer() {
  // Typ-Filter (Lehre / weiterführend), nur wenn die Daten typ enthalten
  const hatTyp = DATEN.some(b => b.typ);
  if (hatTyp) {
    const typBox = $("#typ-filter");
    [["alle", "Alle"], ["lehre", "🎓 Lehre (EFZ/EBA)"], ["weiterfuehrend", "📚 Weiterführend"]]
      .forEach(([val, label], i) => {
        const b = el("button", "seg" + (i === 0 ? " active" : ""), label);
        b.dataset.typ = val;
        typBox.appendChild(b);
      });
    typBox.addEventListener("click", e => {
      const seg = e.target.closest(".seg");
      if (!seg) return;
      aktiverTyp = seg.dataset.typ;
      $$(".seg", typBox).forEach(s => s.classList.toggle("active", s === seg));
      renderExplorer();
    });
  }

  const filterBox = $("#kat-filter");
  // "Alle"-Button
  const alle = el("button", "chip active", "🔎 Alle Berufe");
  alle.dataset.kat = "alle";
  filterBox.appendChild(alle);
  // Kategorie-Buttons
  Object.entries(KATEGORIEN).forEach(([key, k]) => {
    const c = el("button", "chip", `${k.emoji} ${k.name}`);
    c.dataset.kat = key;
    c.style.setProperty("--chip-farbe", k.farbe);
    filterBox.appendChild(c);
  });

  filterBox.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    aktiveKategorie = chip.dataset.kat;
    $$(".chip", filterBox).forEach(c => c.classList.toggle("active", c === chip));
    renderExplorer();
  });

  $("#suche").addEventListener("input", renderExplorer);
  renderExplorer();
}

function renderExplorer() {
  const q = $("#suche").value.trim().toLowerCase();
  const grid = $("#explorer-grid");
  grid.innerHTML = "";

  let liste = DATEN.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
  if (aktiverTyp !== "alle") liste = liste.filter(b => (b.typ || "lehre") === aktiverTyp);
  if (aktiveKategorie !== "alle") liste = liste.filter(b => b.kat === aktiveKategorie);
  if (q) liste = liste.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.desc.toLowerCase().includes(q) ||
    KATEGORIEN[b.kat].name.toLowerCase().includes(q));

  $("#explorer-count").textContent =
    liste.length + (liste.length === 1 ? " Beruf" : " Berufe");

  if (!liste.length) {
    grid.appendChild(el("p", "leer", "Keine Berufe gefunden. Versuch einen anderen Suchbegriff."));
    return;
  }
  liste.forEach(b => grid.appendChild(berufKarte(b)));
}

/* =========================================================================
   2) BERUFSENTDECKER  (Interessen anklicken -> Vorschläge)
   ========================================================================= */
const gewaehlteDims = new Set();

function initEntdecker() {
  const box = $("#dim-wahl");
  Object.entries(DIMENSIONEN).forEach(([key, d]) => {
    const card = el("button", "dim-card");
    card.dataset.dim = key;
    card.style.setProperty("--dim-farbe", d.farbe);
    card.innerHTML = `
      <span class="dim-emoji">${d.emoji}</span>
      <span class="dim-name">${d.name}</span>
      <span class="dim-text">${d.text}</span>
      <span class="dim-check">✓</span>
    `;
    card.addEventListener("click", () => {
      card.classList.toggle("selected");
      if (gewaehlteDims.has(key)) gewaehlteDims.delete(key);
      else gewaehlteDims.add(key);
      renderEntdecker();
    });
    box.appendChild(card);
  });
  renderEntdecker();
}

function renderEntdecker() {
  const grid = $("#entdecker-grid");
  const hint = $("#entdecker-hint");
  grid.innerHTML = "";

  if (!gewaehlteDims.size) {
    hint.style.display = "block";
    return;
  }
  hint.style.display = "none";

  const treffer = DATEN
    .map(b => {
      const score = b.tags.filter(t => gewaehlteDims.has(t)).length;
      return { b, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.b.name.localeCompare(b.b.name, "de"));

  treffer.forEach(x => {
    const prozent = Math.round((x.score / gewaehlteDims.size) * 100);
    grid.appendChild(berufKarte(x.b, prozent));
  });
}

/* =========================================================================
   3) STÄRKEN-SCHWÄCHEN-TEST
   ========================================================================= */
const antworten = {}; // index -> wert

function initTest() {
  const box = $("#test-fragen");
  FRAGEN.forEach((f, i) => {
    const row = el("div", "frage");
    const skala = SKALA.map(s => `
      <label class="skala-opt">
        <input type="radio" name="f${i}" value="${s.wert}">
        <span>${s.label}</span>
      </label>`).join("");
    row.innerHTML = `
      <p class="frage-text"><span class="frage-nr">${i + 1}</span>${f.text}</p>
      <div class="skala">${skala}</div>`;
    box.appendChild(row);
  });

  box.addEventListener("change", e => {
    if (e.target.name && e.target.name.startsWith("f")) {
      antworten[+e.target.name.slice(1)] = +e.target.value;
      const beantwortet = Object.keys(antworten).length;
      $("#test-fortschritt").style.width =
        Math.round((beantwortet / FRAGEN.length) * 100) + "%";
      $("#test-status").textContent = beantwortet + " / " + FRAGEN.length + " beantwortet";
    }
  });

  $("#test-auswerten").addEventListener("click", werteTestAus);
  $("#test-reset").addEventListener("click", () => {
    Object.keys(antworten).forEach(k => delete antworten[k]);
    $$('input[type=radio]', box).forEach(r => (r.checked = false));
    $("#test-fortschritt").style.width = "0%";
    $("#test-status").textContent = "0 / " + FRAGEN.length + " beantwortet";
    $("#test-ergebnis").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function werteTestAus() {
  if (Object.keys(antworten).length < FRAGEN.length) {
    alert("Bitte beantworte zuerst alle Fragen 🙂");
    return;
  }
  // Punkte pro Dimension summieren
  const punkte = {};
  Object.keys(DIMENSIONEN).forEach(d => (punkte[d] = 0));
  FRAGEN.forEach((f, i) => (punkte[f.dim] += antworten[i] || 0));

  const maxProDim = 9; // 3 Fragen * max 3
  const sortiert = Object.entries(punkte).sort((a, b) => b[1] - a[1]);

  // Profil-Balken (Stärken & Schwächen sichtbar)
  const profil = $("#profil");
  profil.innerHTML = "";
  sortiert.forEach(([d, p]) => {
    const dim = DIMENSIONEN[d];
    const pct = Math.round((p / maxProDim) * 100);
    const bar = el("div", "profil-row");
    bar.innerHTML = `
      <span class="profil-label">${dim.emoji} ${dim.name}</span>
      <div class="profil-bar"><div class="profil-fill" style="width:${pct}%;background:${dim.farbe}"></div></div>
      <span class="profil-pct">${pct}%</span>`;
    profil.appendChild(bar);
  });

  // Stärken (Top 2) und Schwächen (unterste, < 40%)
  const topDims = sortiert.slice(0, 2).map(x => x[0]);
  const staerkenTxt = topDims.map(d => `${DIMENSIONEN[d].emoji} <b>${DIMENSIONEN[d].name}</b>`).join(" und ");
  $("#staerken-text").innerHTML =
    `Deine grössten Stärken liegen im Bereich ${staerkenTxt}. ` +
    `Das sind die Dinge, die du gern machst und gut kannst – super, darauf kannst du aufbauen!`;

  const schwach = sortiert.filter(x => Math.round((x[1] / maxProDim) * 100) < 40);
  $("#schwaechen-text").innerHTML = schwach.length
    ? "Weniger angesprochen fühlst du dich von: " +
      schwach.map(x => DIMENSIONEN[x[0]].name).join(", ") +
      ". Das ist völlig okay – niemand muss alles gleich gern mögen."
    : "Spannend: Dich sprechen viele verschiedene Bereiche an! Du darfst ruhig breit ausprobieren.";

  // Berufs-Empfehlungen anhand der Top-Dimensionen
  const empf = DATEN
    .map(b => ({ b, score: b.tags.filter(t => topDims.includes(t)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.b.name.localeCompare(b.b.name, "de"))
    .slice(0, 9);

  const grid = $("#empfehlungen");
  grid.innerHTML = "";
  empf.forEach(x => grid.appendChild(berufKarte(x.b, Math.round((x.score / topDims.length) * 100))));

  $("#test-ergebnis").style.display = "block";
  $("#test-ergebnis").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================================================================
   Quellen rendern + Start
   ========================================================================= */
function initQuellen() {
  const box = $("#quellen-liste");
  QUELLEN.forEach(q => {
    const a = el("a", "quelle", q.name + " ↗");
    a.href = q.url;
    a.target = "_blank";
    a.rel = "noopener";
    box.appendChild(a);
  });
}

function showMeta() {
  // Anzahl Berufe auf der Startseite dynamisch einsetzen
  const span = $("#anzahl-berufe");
  if (span) span.textContent = DATEN.length;
  // Stand des letzten Abgleichs im Footer
  const box = $("#meta-info");
  if (box && META && META.generatedAt) {
    const d = new Date(META.generatedAt);
    box.textContent = `📊 ${META.total} Berufe erfasst · letzter Abgleich: ` +
      d.toLocaleDateString("de-CH") + ` ${d.toLocaleTimeString("de-CH", {hour:"2-digit",minute:"2-digit"})}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $$(".nav-btn").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
  $$("[data-goto]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); showView(b.dataset.goto); }));
  initExplorer();
  initEntdecker();
  initTest();
  initQuellen();
  showMeta();
  updateMerkBadge();

  // Merkliste-Aktionen
  $("#merk-print").addEventListener("click", () => window.print());
  $("#merk-clear").addEventListener("click", () => {
    if (merkliste.size && confirm("Ganze Merkliste leeren?")) {
      merkliste.clear(); merkSpeichern(); updateMerkBadge(); renderMerkliste();
    }
  });

  showView("start");
});
