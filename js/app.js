/* App shell — home screen, trip workspace, navigation, export. */

const $app = document.getElementById("app");
let currentTrip = null;
let currentPageId = "cover"; // 'cover' | 'tc1' | 'tc2' | page.id

/* ---------- helpers ---------- */

function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

let saveTimer = null;
function autosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => Storage.saveTrip(currentTrip), 350);
  // live-rename the trip in the top bar as the cover is filled in
  const brand = document.querySelector(".topbar .brand");
  if (brand && currentTrip) {
    const name = tripName(currentTrip);
    brand.firstChild.nodeValue = name;
    document.title = name + " — Freezer Log";
  }
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/* Trip name: Owner_Skipper_DTFL_Freezer_SailingDate (built live from the cover) */
function tripName(trip) {
  const c = trip.cover;
  const parts = [c.vesselOwner, c.skipperName]
    .filter(v => v && v.trim())
    .map(s => s.trim().replace(/\s+/g, "_"));
  if (!parts.length && !c.sailingDate) return "New trip";
  parts.push("DTFL_Freezer");
  if (c.sailingDate) {
    const [y, m, d] = c.sailingDate.split("-");
    parts.push(`${d}_${m}_${y}`);
  }
  return parts.join("_");
}

/* ---------- HOME ---------- */

function showHome() {
  currentTrip = null;
  document.title = "Fishing Logbooks";
  const trips = Storage.listTrips();

  $app.innerHTML = `
    <header class="topbar">
      <div class="brand">Fishing Logbooks<small>Offline data collection</small></div>
      <div class="spacer"></div>
    </header>
    <main class="home">
      <h1 class="hello">Hello 👋</h1>
      <p class="hello-sub">What are we working on today?</p>
      <div class="tiles">
        <button class="tile freezer" id="tileFreezer">
          <span class="stripe"></span>
          <div><h3>Deepsea Trawl Fishing Log</h3><div class="variant">Freezer</div></div>
          <div class="meta">Start a new trip →</div>
        </button>
        <button class="tile wetfish disabled" disabled>
          <span class="stripe"></span>
          <div><h3>Deepsea Trawl Fishing Log</h3><div class="variant">Wetfish</div></div>
          <div class="meta">Coming soon</div>
        </button>
      </div>
      <div class="section-label">Trips</div>
      <div class="trip-list" id="tripList"></div>
    </main>
  `;

  document.getElementById("tileFreezer").addEventListener("click", () => {
    const trip = Storage.createTrip("freezer");
    openTrip(trip.id);
  });

  const list = document.getElementById("tripList");
  if (!trips.length) {
    list.innerHTML = `<div class="empty-note">No trips yet — tap a logbook above to start one.</div>`;
  } else {
    for (const t of trips) {
      const name = tripName(t);
      const nPages = t.pages.length;
      const row = el(`
        <button class="trip-row">
          <span class="dot"></span>
          <span>
            <div class="t-name">${esc(name)}</div>
            <div class="t-sub">Freezer log · ${nPages} sheet${nPages === 1 ? "" : "s"} · updated ${fmtDate(t.updatedAt)}</div>
          </span>
          <span class="spacer"></span>
          <span class="pill ${t.status === "submitted" ? "done" : ""}">${t.status === "submitted" ? "Submitted" : "In progress"}</span>
        </button>
      `);
      row.addEventListener("click", () => openTrip(t.id));
      list.appendChild(row);
    }
  }
}

/* ---------- TRIP WORKSPACE ---------- */

function openTrip(id, pageId = "cover") {
  currentTrip = Storage.getTrip(id);
  if (!currentTrip) return showHome();
  currentPageId = pageId;
  renderTrip();
}

function pageLabel(page, idx, counts) {
  return page.kind === "header"
    ? `Header ${counts.header.indexOf(page.id) + 1}`
    : `Catch ${counts.catch.indexOf(page.id) + 1}`;
}

const MAX_SHEET_TABS = 3; // beyond this the older sheets move into a dropdown

function renderTrip() {
  const trip = currentTrip;
  const name = tripName(trip);
  document.title = name + " — Freezer Log";

  const counts = {
    header: trip.pages.filter(p => p.kind === "header").map(p => p.id),
    catch: trip.pages.filter(p => p.kind === "catch").map(p => p.id),
  };

  $app.innerHTML = `
    <header class="topbar">
      <button class="btn ghost back" id="btnBack">‹ Home</button>
      <div class="brand">${esc(name)}<small>Deepsea Trawl Fishing Log — Freezer</small></div>
      <div class="spacer"></div>
      <button class="btn" id="btnExcel">Export Excel</button>
      <button class="btn primary" id="btnPdf">Save PDF</button>
    </header>
    <div class="trip-shell">
      <nav class="pagestrip" id="pagestrip"></nav>
      <div class="sheet-scroller print-root" id="sheets"></div>
    </div>
    <button class="fab" id="fab" title="Add a sheet">+</button>
  `;

  // fixed tabs
  const strip = document.getElementById("pagestrip");
  const fixedTabs = [
    { id: "cover", label: "Trip Info" },
    { id: "tc1", label: "Instructions" },
    { id: "tc2", label: "Target Species" },
  ];
  for (const t of fixedTabs) {
    const b = el(`<button class="pagetab ${t.id === currentPageId ? "active" : ""}">${esc(t.label)}</button>`);
    b.addEventListener("click", () => { currentPageId = t.id; renderTrip(); });
    strip.appendChild(b);
  }

  // sheet tabs — show only the most recent few, the rest live in a dropdown
  const sheetTabs = trip.pages.map((p, i) => ({ id: p.id, label: pageLabel(p, i, counts) }));
  const visible = sheetTabs.slice(-MAX_SHEET_TABS);
  const overflow = sheetTabs.slice(0, -MAX_SHEET_TABS);

  if (overflow.length) {
    const sel = el(`<select class="pagetab pagetab-select" title="Earlier sheets"></select>`);
    sel.appendChild(el(`<option value="">Sheets 1–${overflow.length} ▾</option>`));
    for (const t of overflow) {
      const o = el(`<option value="${t.id}">${esc(t.label)}</option>`);
      sel.appendChild(o);
    }
    const activeInOverflow = overflow.some(t => t.id === currentPageId);
    if (activeInOverflow) { sel.value = currentPageId; sel.classList.add("active"); }
    sel.addEventListener("change", () => {
      if (sel.value) { currentPageId = sel.value; renderTrip(); }
    });
    strip.appendChild(sel);
  }
  for (const t of visible) {
    const b = el(`<button class="pagetab ${t.id === currentPageId ? "active" : ""}">${esc(t.label)}</button>`);
    b.addEventListener("click", () => { currentPageId = t.id; renderTrip(); });
    strip.appendChild(b);
  }

  // active sheet
  const sheets = document.getElementById("sheets");
  let paper;
  if (currentPageId === "cover") paper = renderCover(trip, autosave);
  else if (currentPageId === "tc1") paper = renderTC1();
  else if (currentPageId === "tc2") paper = renderTC2();
  else {
    const page = trip.pages.find(p => p.id === currentPageId);
    if (!page) { currentPageId = "cover"; return renderTrip(); }
    paper = page.kind === "header"
      ? renderHeaderPage(trip, page, autosave)
      : renderCatchPage(trip, page, autosave);
  }
  sheets.appendChild(paper);

  // Trip Info doubles as the trip's table of contents — every page reachable from here
  if (currentPageId === "cover") sheets.appendChild(renderTripContents(trip, counts));

  // live totals on catch sheets
  const page = trip.pages.find(p => p.id === currentPageId);
  if (page?.kind === "catch") refreshTotals(paper, page.data);

  // delete page action
  if (page) {
    const del = el(`<div class="page-actions"><button>Remove this sheet</button></div>`);
    del.querySelector("button").addEventListener("click", () => {
      if (!confirm("Remove this sheet? Its data will be lost.")) return;
      Storage.removePage(trip, page.id);
      currentPageId = "cover";
      renderTrip();
    });
    sheets.appendChild(del);
  }

  // wire chrome
  document.getElementById("btnBack").addEventListener("click", showHome);
  document.getElementById("fab").addEventListener("click", showAddSheet);
  document.getElementById("btnExcel").addEventListener("click", () => {
    const f = exportTripToExcel(trip);
    toast("Excel saved: " + f);
  });
  document.getElementById("btnPdf").addEventListener("click", printTrip);

  const activeTab = strip.querySelector(".pagetab.active");
  if (activeTab) activeTab.scrollIntoView({ inline: "center", block: "nearest" });
}

/* ---------- Trip contents (shown under Trip Info) ---------- */

function renderTripContents(trip, counts) {
  const box = el(`
    <div class="toc">
      <div class="toc-title">Trip contents</div>
      <div class="toc-list"></div>
    </div>
  `);
  const list = box.querySelector(".toc-list");

  const items = [
    { id: "tc1", icon: "📖", label: "Instructions", sub: "Front cover & log sheet guidance" },
    { id: "tc2", icon: "🎯", label: "Target Species", sub: "Primary & secondary species rules" },
    ...trip.pages.map((p, i) => {
      if (p.kind === "header") {
        const firstDate = p.data.periods.find(x => x.startDate)?.startDate;
        return { id: p.id, icon: "🧭", label: pageLabel(p, i, counts),
                 sub: "Header Information per Activity Period" + (firstDate ? " · " + firstDate : "") };
      }
      return { id: p.id, icon: "🐟", label: pageLabel(p, i, counts),
               sub: "Estimated Catch per Day – Freezer" + (p.data.date ? " · " + p.data.date : "") };
    }),
  ];

  for (const it of items) {
    const row = el(`
      <button class="toc-row">
        <span class="toc-ic">${it.icon}</span>
        <span><b>${esc(it.label)}</b><small>${esc(it.sub)}</small></span>
        <span class="toc-go">›</span>
      </button>
    `);
    row.addEventListener("click", () => { currentPageId = it.id; renderTrip(); });
    list.appendChild(row);
  }

  const hint = el(`<div class="toc-hint">Tap <b>+</b> to add a Header or Catch sheet — it will appear here.</div>`);
  box.appendChild(hint);
  return box;
}

/* ---------- add-sheet chooser ---------- */

function showAddSheet() {
  if (document.querySelector(".modal-back")) return; // one chooser at a time
  const back = el(`
    <div class="modal-back">
      <div class="modal">
        <h3>Add a sheet</h3>
        <p class="m-sub">Pick the form you want to fill in next — you can add as many as the trip needs.</p>
        <button class="choice" data-kind="header">
          <span class="ic">🧭</span>
          <span><b>Header Information per Activity Period</b>
          <span>Drag details — positions, times, depth, gear, catch volume (7 columns)</span></span>
        </button>
        <button class="choice" data-kind="catch">
          <span class="ic">🐟</span>
          <span><b>Estimated Catch per Day – Freezer</b>
          <span>Daily species masses — hake grades, fillets, bycatch, fuel</span></span>
        </button>
        <button class="btn ghost" data-cancel style="width:100%">Cancel</button>
      </div>
    </div>
  `);
  back.addEventListener("click", e => { if (e.target === back) back.remove(); });
  back.querySelector("[data-cancel]").addEventListener("click", () => back.remove());
  back.querySelectorAll(".choice").forEach(ch => {
    ch.addEventListener("click", () => {
      const pg = Storage.addPage(currentTrip, ch.dataset.kind);
      back.remove();
      currentPageId = pg.id;
      renderTrip();
    });
  });
  document.body.appendChild(back);
}

/* ---------- print / save PDF ---------- */
/* Renders EVERY page of the trip into the print root, prints, then restores. */

function printTrip() {
  const trip = currentTrip;
  const sheets = document.getElementById("sheets");
  const keep = currentPageId;

  sheets.innerHTML = "";
  const noop = () => {};
  sheets.appendChild(renderCover(trip, noop));
  sheets.appendChild(renderTC1());
  sheets.appendChild(renderTC2());
  for (const page of trip.pages) {
    const paper = page.kind === "header"
      ? renderHeaderPage(trip, page, noop)
      : renderCatchPage(trip, page, noop);
    sheets.appendChild(paper);
    if (page.kind === "catch") refreshTotals(paper, page.data);
  }

  const restore = () => {
    window.removeEventListener("afterprint", restore);
    currentPageId = keep;
    renderTrip();
  };
  window.addEventListener("afterprint", restore);
  // slight delay so signatures (async image load) land on canvas before printing
  setTimeout(() => window.print(), 250);
}

/* ---------- boot ---------- */
showHome();
