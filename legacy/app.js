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
  herz.addEventListener("click", e => {
    e.stopPropagation();
    merkToggle(b);
    const on = merkliste.has(berufId(b));
    herz.classList.toggle("on", on);
    herz.textContent = on ? "❤️" : "🤍";
  });

  // Klick auf die Karte (ausser Links/Herz) öffnet die Detail-Ansicht
  card.classList.add("klickbar");
  card.addEventListener("click", e => {
    if (e.target.closest("a") || e.target.closest(".herz")) return;
    openDetail(b);
  });

  return card;
}

/* ---------- Detail-Ansicht (Modal) ---------- */
function openDetail(b) {
  const kat = KATEGORIEN[b.kat] || { emoji: "💼", name: "Beruf", farbe: "#64748b" };
  const tagHtml = (b.tags || []).filter(t => DIMENSIONEN[t])
    .map(t => `<span class="tag">${DIMENSIONEN[t].emoji} ${DIMENSIONEN[t].name}</span>`).join("");
  const gemerkt = merkliste.has(berufId(b));
  const lehrstelle = b.typ === "weiterfuehrend" ? "" :
    `<a class="btn btn-lehrstelle" href="${lehrstellenLink(b.name)}" target="_blank" rel="noopener">🔍 Lehrstelle finden</a>`;

  const aehnlich = DATEN.filter(x => x.kat === b.kat && berufId(x) !== berufId(b))
    .sort(() => Math.random() - 0.5).slice(0, 5);
  const aehnlichHtml = aehnlich.length
    ? `<div class="detail-related"><h4>Ähnliche Berufe</h4><div class="related-list">` +
      aehnlich.map(x => `<button class="related-chip" data-id="${berufId(x)}">${(KATEGORIEN[x.kat] || {}).emoji || ""} ${x.name}</button>`).join("") +
      `</div></div>` : "";

  $("#detail-content").innerHTML = `
    <div class="detail-head" style="--kat-farbe:${kat.farbe}">
      <span class="beruf-emoji" style="font-size:2.6rem">${kat.emoji}</span>
      <div>
        <h2 id="d-name">${b.name}</h2>
        <span class="beruf-kat">${kat.name} · ${b.dauer || ""} ${b.typ === "weiterfuehrend" ? '<span class="typ-badge">📚 weiterführend</span>' : ""}</span>
      </div>
    </div>
    <p class="detail-desc">${b.desc || ""}</p>
    <div class="detail-tags"><b>Passt zu dir, wenn du das magst:</b><div class="beruf-tags" style="margin-top:.5rem">${tagHtml || "–"}</div></div>
    <div class="beruf-links detail-links">
      <a class="btn btn-video" href="${b.video}" target="_blank" rel="noopener">▶ Video ansehen</a>
      <a class="btn btn-info" href="${b.info}" target="_blank" rel="noopener">ℹ Mehr Infos</a>
      ${lehrstelle}
      <button class="btn ${gemerkt ? "btn-primary" : "btn-info"}" id="detail-merk">${gemerkt ? "❤️ Gemerkt" : "🤍 Merken"}</button>
    </div>
    ${aehnlichHtml}
  `;

  $("#detail-merk").addEventListener("click", () => { merkToggle(b); openDetail(b); });
  $$(".related-chip").forEach(chip => chip.addEventListener("click", () => {
    const ziel = DATEN.find(x => berufId(x) === chip.dataset.id);
    if (ziel) openDetail(ziel);
  }));

  const ov = $("#detail-overlay");
  ov.hidden = false;
  document.body.style.overflow = "hidden";
  ov.scrollTop = 0;
}
function closeDetail() {
  $("#detail-overlay").hidden = true;
  document.body.style.overflow = "";
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
const antworten = {}; // Teil 1 Interesse: index -> wert
const koennen = {};    // Teil 2 Können:   index -> wert
const TEST_TOTAL = FRAGEN.length + KOENNEN_FRAGEN.length;

function initTest() {
  // Teil 1 – «Das mache ich gern»
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

  // Teil 2 – «Das kann ich gut» (Selbsteinschätzung pro Dimension)
  const kbox = $("#test-koennen");
  KOENNEN_FRAGEN.forEach((f, i) => {
    const row = el("div", "frage");
    const skala = KOENNEN_SKALA.map(s => `
      <label class="skala-opt">
        <input type="radio" name="k${i}" value="${s.wert}">
        <span>${s.label}</span>
      </label>`).join("");
    row.innerHTML = `
      <p class="frage-text"><span class="frage-nr">${DIMENSIONEN[f.dim].emoji}</span>${f.text}</p>
      <div class="skala">${skala}</div>`;
    kbox.appendChild(row);
  });

  function fortschritt() {
    const n = Object.keys(antworten).length + Object.keys(koennen).length;
    $("#test-fortschritt").style.width = Math.round((n / TEST_TOTAL) * 100) + "%";
    $("#test-status").textContent = n + " / " + TEST_TOTAL + " beantwortet";
  }

  box.addEventListener("change", e => {
    if (e.target.name && e.target.name[0] === "f") { antworten[+e.target.name.slice(1)] = +e.target.value; fortschritt(); }
  });
  kbox.addEventListener("change", e => {
    if (e.target.name && e.target.name[0] === "k") { koennen[+e.target.name.slice(1)] = +e.target.value; fortschritt(); }
  });

  $("#test-auswerten").addEventListener("click", werteTestAus);
  $("#test-reset").addEventListener("click", () => {
    Object.keys(antworten).forEach(k => delete antworten[k]);
    Object.keys(koennen).forEach(k => delete koennen[k]);
    $$('input[type=radio]', box).forEach(r => (r.checked = false));
    $$('input[type=radio]', kbox).forEach(r => (r.checked = false));
    $("#test-fortschritt").style.width = "0%";
    $("#test-status").textContent = "0 / " + TEST_TOTAL + " beantwortet";
    $("#test-ergebnis").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* Profil-Balken rendern (target = Container, werte = {dim: prozent}) */
function renderProfil(target, werte) {
  target.innerHTML = "";
  Object.entries(werte).sort((a, b) => b[1] - a[1]).forEach(([d, pct]) => {
    const dim = DIMENSIONEN[d];
    const bar = el("div", "profil-row");
    bar.innerHTML = `
      <span class="profil-label">${dim.emoji} ${dim.name}</span>
      <div class="profil-bar"><div class="profil-fill" style="width:${pct}%;background:${dim.farbe}"></div></div>
      <span class="profil-pct">${pct}%</span>`;
    target.appendChild(bar);
  });
}

function werteTestAus() {
  if (Object.keys(antworten).length < FRAGEN.length || Object.keys(koennen).length < KOENNEN_FRAGEN.length) {
    alert("Bitte beantworte zuerst beide Teile 🙂");
    return;
  }
  // Interesse pro Dimension (max 9 -> Prozent)
  const iPct = {}; Object.keys(DIMENSIONEN).forEach(d => iPct[d] = 0);
  const iSum = {}; Object.keys(DIMENSIONEN).forEach(d => iSum[d] = 0);
  FRAGEN.forEach((f, i) => (iSum[f.dim] += antworten[i] || 0));
  Object.keys(iSum).forEach(d => iPct[d] = Math.round((iSum[d] / 9) * 100));

  // Können pro Dimension (max 3 -> Prozent)
  const kPct = {}; Object.keys(DIMENSIONEN).forEach(d => kPct[d] = 0);
  KOENNEN_FRAGEN.forEach((f, i) => kPct[f.dim] = Math.round(((koennen[i] || 0) / 3) * 100));

  renderProfil($("#profil"), iPct);
  renderProfil($("#profil-koennen"), kPct);

  // Kombiniert: Interesse 60 % + Können 40 %
  const combo = {}; Object.keys(DIMENSIONEN).forEach(d => combo[d] = Math.round(iPct[d] * 0.6 + kPct[d] * 0.4));
  const topDims = Object.entries(combo).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);

  // «Hier passt beides zusammen»: Interesse UND Können hoch
  const beides = Object.keys(DIMENSIONEN)
    .filter(d => iPct[d] >= 50 && kPct[d] >= 50)
    .sort((a, b) => combo[b] - combo[a]);
  $("#combo-text").innerHTML = beides.length
    ? beides.map(d => `${DIMENSIONEN[d].emoji} <b>${DIMENSIONEN[d].name}</b>`).join(", ") +
      " – das machst du gern <i>und</i> kannst es gut. Hier kannst du richtig aufblühen!"
    : "Noch keine klare Überschneidung – schau dir die Berufe unten trotzdem an und probiere in einer Schnupperlehre aus, was dir liegt.";

  // Stärken / Schwächen (nach Interesse)
  const iSort = Object.entries(iPct).sort((a, b) => b[1] - a[1]);
  const topI = iSort.slice(0, 2).map(x => x[0]);
  $("#staerken-text").innerHTML = "Du machst besonders gern: " +
    topI.map(d => `${DIMENSIONEN[d].emoji} <b>${DIMENSIONEN[d].name}</b>`).join(" und ") + ".";

  const schwach = iSort.filter(x => x[1] < 40);
  $("#schwaechen-text").innerHTML = schwach.length
    ? "Weniger reizt dich: " + schwach.map(x => DIMENSIONEN[x[0]].name).join(", ") +
      ". Das ist völlig okay – niemand muss alles mögen."
    : "Spannend: Dich sprechen viele Bereiche an! Du darfst ruhig breit ausprobieren.";

  // Empfehlungen nach kombinierten Top-Dimensionen
  const empf = DATEN
    .map(b => ({ b, score: (b.tags || []).filter(t => topDims.includes(t)).length }))
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

  // Detail-Fenster schliessen
  $("#detail-close").addEventListener("click", closeDetail);
  $("#detail-overlay").addEventListener("click", e => { if (e.target.id === "detail-overlay") closeDetail(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDetail(); });

  // Zufalls-Beruf
  $("#zufall").addEventListener("click", () => {
    if (DATEN.length) openDetail(DATEN[Math.floor(Math.random() * DATEN.length)]);
  });

  // Dark Mode
  const themeBtn = $("#theme-toggle");
  const istDunkel = () => document.documentElement.getAttribute("data-theme") === "dark";
  themeBtn.textContent = istDunkel() ? "☀️" : "🌙";
  themeBtn.addEventListener("click", () => {
    const dunkel = !istDunkel();
    document.documentElement.setAttribute("data-theme", dunkel ? "dark" : "light");
    try { localStorage.setItem("berufskompass_theme", dunkel ? "dark" : "light"); } catch (_) {}
    themeBtn.textContent = dunkel ? "☀️" : "🌙";
  });

  // Merkliste-Aktionen
  $("#merk-print").addEventListener("click", () => window.print());
  $("#merk-clear").addEventListener("click", () => {
    if (merkliste.size && confirm("Ganze Merkliste leeren?")) {
      merkliste.clear(); merkSpeichern(); updateMerkBadge(); renderMerkliste();
    }
  });

  showView("start");
});
