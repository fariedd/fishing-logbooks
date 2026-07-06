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

/* ---------- shared UI: bin button + confirm modal + typewriter ---------- */

function binButton() {
  const bin = Storage.listBin();
  const btn = el(`
    <button class="binbtn" id="binBtn" title="Bin">
      <span class="bin-ic">🗑️</span>
      ${bin.length ? `<span class="bin-badge">${bin.length}</span>` : ""}
    </button>
  `);
  btn.addEventListener("click", showBin);
  return btn;
}

function shakeBin() {
  const b = document.getElementById("binBtn");
  if (!b) return;
  b.classList.remove("shake");
  void b.offsetWidth; // restart the animation
  b.classList.add("shake");
  setTimeout(() => b.classList.remove("shake"), 700);
}

/* Promise-based confirmation dialog. */
function confirmModal({ title, message, confirmLabel = "Confirm", danger = false }) {
  return new Promise(resolve => {
    const back = el(`
      <div class="modal-back">
        <div class="modal confirm">
          <h3>${esc(title)}</h3>
          <p class="m-sub">${esc(message)}</p>
          <div class="confirm-actions">
            <button class="btn ghost" data-no>Cancel</button>
            <button class="btn ${danger ? "danger" : "primary"}" data-yes>${esc(confirmLabel)}</button>
          </div>
        </div>
      </div>
    `);
    const done = v => { back.remove(); resolve(v); };
    back.addEventListener("click", e => { if (e.target === back) done(false); });
    back.querySelector("[data-no]").addEventListener("click", () => done(false));
    back.querySelector("[data-yes]").addEventListener("click", () => done(true));
    document.body.appendChild(back);
  });
}

let heroTyped = false; // typewriter runs once per app load
function typeWriter(node, text) {
  node.textContent = "";
  node.classList.add("typing");
  let i = 0;
  (function step() {
    if (i <= text.length) {
      node.textContent = text.slice(0, i++);
      setTimeout(step, 45);
    } else {
      node.classList.remove("typing");
    }
  })();
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
      <div class="hello-wrap">
        <img class="hello-logo" src="assets/imvelo-icon.png" alt="Imvelo Blue Environment">
        <h1 class="hello">Hello Observer...</h1>
      </div>
      <p class="hello-sub" id="helloSub">What are we working on today</p>
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

  // bin button lives top-right, always visible
  document.querySelector(".topbar").insertBefore(binButton(), null);

  // typewriter subheading — once per app load
  const sub = document.getElementById("helloSub");
  if (!heroTyped) { heroTyped = true; typeWriter(sub, "What are we working on today"); }

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
        <div class="trip-row">
          <span class="dot"></span>
          <span class="t-main">
            <div class="t-name">${esc(name)}</div>
            <div class="t-sub">Freezer log · ${nPages} sheet${nPages === 1 ? "" : "s"} · updated ${fmtDate(t.updatedAt)}</div>
          </span>
          <span class="spacer"></span>
          <span class="pill ${t.status === "submitted" ? "done" : ""}">${t.status === "submitted" ? "Submitted" : "In progress"}</span>
          <button class="trip-del" title="Delete trip">🗑️</button>
        </div>
      `);
      row.querySelector(".t-main").addEventListener("click", () => openTrip(t.id));
      row.querySelector(".dot").addEventListener("click", () => openTrip(t.id));
      row.querySelector(".trip-del").addEventListener("click", async e => {
        e.stopPropagation();
        const ok = await confirmModal({
          title: "Delete this trip?",
          message: "Are you sure? This cannot be undone.",
          confirmLabel: "Delete",
          danger: true,
        });
        if (!ok) return;
        Storage.binTrip(t.id);
        showHome(); // re-render first so the bin button (with new count) exists…
        toast("Done. It will be stored in the bin for 7 days.");
        shakeBin(); // …then shake it for feedback
      });
      list.appendChild(row);
    }
  }
}

/* ---------- BIN ---------- */

function timeLeft(purgeAt) {
  const ms = purgeAt - Date.now();
  if (ms <= 0) return "expiring";
  const dayMs = 24 * 3600 * 1000;
  if (ms >= dayMs) {
    const days = Math.round(ms / dayMs); // fresh deletion reads "7 days left"
    return `${days} day${days === 1 ? "" : "s"} left`;
  }
  const hours = Math.max(1, Math.ceil(ms / (3600 * 1000)));
  return `${hours} hour${hours === 1 ? "" : "s"} left`;
}

function showBin() {
  currentTrip = null;
  document.title = "Bin — Fishing Logbooks";
  const binned = Storage.listBin();

  $app.innerHTML = `
    <header class="topbar">
      <button class="btn ghost back" id="btnBack">‹ Home</button>
      <div class="brand">Bin<small>Deleted trips are kept for 7 days</small></div>
      <div class="spacer"></div>
    </header>
    <main class="home">
      <div class="section-label">In the bin</div>
      <div class="trip-list" id="binList"></div>
    </main>
  `;
  document.getElementById("btnBack").addEventListener("click", showHome);

  const list = document.getElementById("binList");
  if (!binned.length) {
    list.innerHTML = `<div class="empty-note">The bin is empty.</div>`;
    return;
  }
  for (const t of binned) {
    const name = tripName(t);
    const row = el(`
      <div class="trip-row bin-row">
        <span class="dot bin-dot"></span>
        <span class="t-main">
          <div class="t-name">${esc(name)}</div>
          <div class="t-sub">Deleted ${fmtDate(t.deletedAt)} · <b class="t-left">${timeLeft(t.purgeAt)}</b></div>
        </span>
        <span class="spacer"></span>
        <button class="btn" data-restore>Restore</button>
        <button class="btn danger" data-purge>Delete permanently</button>
      </div>
    `);
    row.querySelector("[data-restore]").addEventListener("click", () => {
      Storage.restoreTrip(t.id);
      toast("Trip restored.");
      showBin();
    });
    row.querySelector("[data-purge]").addEventListener("click", async () => {
      const ok = await confirmModal({
        title: "Delete permanently?",
        message: "Are you sure? This cannot be undone.",
        confirmLabel: "Delete permanently",
        danger: true,
      });
      if (!ok) return;
      Storage.purgeTrip(t.id);
      toast("Permanently deleted.");
      showBin();
    });
    list.appendChild(row);
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

  const inOverview = currentPageId === "overview";

  $app.innerHTML = `
    <header class="topbar">
      <button class="btn ghost back" id="btnBack">‹ Home</button>
      <div class="brand">${esc(name)}<small>Deepsea Trawl Fishing Log — Freezer</small></div>
      <div class="spacer"></div>
      <button class="btn ${inOverview ? "primary" : ""}" id="btnOverview" title="Scroll through every page of this trip">⧉ Trip Overview</button>
      <button class="btn" id="btnExcel">Export Excel</button>
      <button class="btn primary" id="btnPdf">Save PDF</button>
    </header>
    <div class="trip-shell">
      <nav class="pagestrip" id="pagestrip"></nav>
      <div class="sheet-scroller print-root ${inOverview ? "overview" : ""}" id="sheets"></div>
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

  const sheets = document.getElementById("sheets");

  if (inOverview) {
    // continuous, full-size, editable scroll of the whole trip
    renderOverview(trip, sheets);
  } else {
    // single active sheet
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
  }

  // wire chrome
  document.getElementById("btnBack").addEventListener("click", showHome);
  document.getElementById("fab").addEventListener("click", showAddSheet);
  document.getElementById("btnOverview").addEventListener("click", () => {
    currentPageId = inOverview ? "cover" : "overview";
    renderTrip();
  });
  document.getElementById("btnExcel").addEventListener("click", () => {
    const f = exportTripToExcel(trip);
    toast("Excel saved: " + f);
  });
  document.getElementById("btnPdf").addEventListener("click", printTrip);

  const activeTab = strip.querySelector(".pagetab.active");
  if (activeTab) activeTab.scrollIntoView({ inline: "center", block: "nearest" });

  // if we just added a page while in overview, scroll it into view
  if (inOverview && scrollToPageId) {
    const target = sheets.querySelector(`[data-overview-page="${scrollToPageId}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollToPageId = null;
  }
}

/* ---------- Trip Overview: every page, full size, stacked & editable ---------- */

let scrollToPageId = null;

function renderOverview(trip, sheets) {
  const add = (label, node, pageId) => {
    const sec = el(`<div class="ov-section"${pageId ? ` data-overview-page="${pageId}"` : ""}></div>`);
    sec.appendChild(el(`<div class="ov-label">${esc(label)}</div>`));
    sec.appendChild(node);
    sheets.appendChild(sec);
  };

  add("Trip Info", renderCover(trip, autosave), "cover");
  add("Instructions", renderTC1(), "tc1");
  add("Target Species", renderTC2(), "tc2");

  const counts = {
    header: trip.pages.filter(p => p.kind === "header").map(p => p.id),
    catch: trip.pages.filter(p => p.kind === "catch").map(p => p.id),
  };
  for (const page of trip.pages) {
    const label = pageLabel(page, 0, counts) + " · " +
      (page.kind === "header" ? "Header Information per Activity Period" : "Estimated Catch per Day – Freezer");
    const paper = page.kind === "header"
      ? renderHeaderPage(trip, page, autosave)
      : renderCatchPage(trip, page, autosave);
    add(label, paper, page.id);
    if (page.kind === "catch") refreshTotals(paper, page.data);
  }

  if (!trip.pages.length) {
    sheets.appendChild(el(`<div class="ov-empty">No sheets yet — tap <b>+</b> to add a Header or Catch sheet. It will appear here in order.</div>`));
  }
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
      // in Overview, keep scrolling context and jump to the new page; otherwise open it
      if (currentPageId === "overview") scrollToPageId = pg.id;
      else currentPageId = pg.id;
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
