/* Renders each paper page (cover, T&C, header sheet, catch sheet) as DOM,
   binds inputs to the trip object and autosaves via onChange().          */

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* Bind one input to obj[key]; autosave on input. */
function bind(input, obj, key, onChange) {
  input.value = obj[key] ?? "";
  input.addEventListener("input", () => {
    obj[key] = input.value;
    onChange();
  });
}

/* =============== COVER PAGE =============== */

function renderCover(trip, onChange) {
  const c = trip.cover;
  const root = el(`<div class="paper blue cover"></div>`);

  root.appendChild(el(`
    <div class="cov-head">
      <div class="cov-dept">
        <div class="logo">forestry, fisheries<small>&amp; the environment</small></div>
        <div style="margin-top:6px">Department:<br>${FORM_META.department}<br><b>${FORM_META.country}</b></div>
      </div>
      <div class="cov-dept" style="text-align:left">
        <b>Branch: ${FORM_META.branch}</b><br>${FORM_META.address.join("<br>")}
      </div>
      <div class="cov-form-no">Form: &nbsp;${FORM_META.formCode}</div>
    </div>
    <div class="cov-title">${FORM_META.title}</div>
    <div class="cov-sub">${FORM_META.subtitle}</div>
  `));

  // DEEPSEA permit / quota-year table
  const permits = el(`
    <table class="ptable" style="width:280px;margin-bottom:14px">
      <tr><th class="lbl" colspan="2">DEEPSEA</th></tr>
      <tr><th class="lbl" style="width:50%">Permit Numbers</th><th class="lbl">Quota Year</th></tr>
      <tr><td class="cell-in"><input data-k="permit1" inputmode="numeric"></td><td class="cell-in"><input data-k="quotaYear1" inputmode="numeric"></td></tr>
      <tr><td class="cell-in"><input data-k="permit2" inputmode="numeric"></td><td class="cell-in"><input data-k="quotaYear2" inputmode="numeric"></td></tr>
    </table>
  `);
  root.appendChild(permits);

  // Main identity table
  const main = el(`
    <table class="ptable" style="margin-bottom:14px">
      <tr><td class="lbl" style="width:34%">Voyage Number</td><td class="cell-in"><input data-k="voyageNumber"></td>
          <td class="lbl" style="width:12%">Code</td><td class="cell-in" style="width:16%"><input data-k="voyageCode"></td></tr>
      <tr><td class="lbl">Registered Vessel Owner</td><td class="cell-in" colspan="3"><input data-k="vesselOwner"></td></tr>
      <tr><td class="lbl">Vessel Name</td><td class="cell-in" colspan="3"><input data-k="vesselName"></td></tr>
      <tr><td class="lbl">Rights Application Number/s</td><td class="cell-in" colspan="3"><input data-k="rightsNumbers"></td></tr>
      <tr><td class="lbl">Skipper's Name</td><td class="cell-in" colspan="3"><input data-k="skipperName"></td></tr>
      <tr><td class="lbl">Skipper's Contact Number</td><td class="cell-in" colspan="3"><input data-k="skipperContact" inputmode="tel"></td></tr>
      <tr><td class="lbl">Observer's Name &amp; Signature</td><td class="cell-in" colspan="3"><input data-k="observerName"></td></tr>
    </table>
  `);
  root.appendChild(main);

  // Previous Landing / Sailing / Docking / Discharge
  const sail = el(`
    <table class="ptable" style="margin-bottom:14px">
      <tr>
        <th class="lbl" style="width:16%"></th>
        <th class="lbl">Previous Landing</th><th class="lbl">Sailing</th>
        <th class="lbl">Docking</th><th class="lbl">Discharge</th>
      </tr>
      <tr><td class="lbl">Date</td>
        <td class="cell-in"><input type="date" data-k="prevLandingDate"></td>
        <td class="cell-in"><input type="date" data-k="sailingDate"></td>
        <td class="cell-in"><input type="date" data-k="dockingDate"></td>
        <td class="cell-in"><input type="date" data-k="dischargeDate"></td></tr>
      <tr><td class="lbl">Time</td>
        <td class="cell-in"><input type="time" data-k="prevLandingTime"></td>
        <td class="cell-in"><input type="time" data-k="sailingTime"></td>
        <td class="cell-in"><input type="time" data-k="dockingTime"></td>
        <td class="cell-in"><input type="time" data-k="dischargeTime"></td></tr>
    </table>
  `);
  root.appendChild(sail);

  const port = el(`
    <table class="ptable" style="margin-bottom:4px">
      <tr><td class="lbl" style="width:34%">Discharge Port</td><td class="cell-in"><input data-k="dischargePort"></td>
          <td class="lbl" style="width:12%">Factory</td><td class="cell-in" style="width:22%"><input data-k="factory"></td></tr>
    </table>
  `);
  root.appendChild(port);

  root.appendChild(el(`<div class="units-note">PLEASE INDICATE: &nbsp; CATCH RETAINED ESTIMATED IN</div>`));
  const units = el(`
    <table class="ptable" style="margin-bottom:6px">
      <tr>
        <td class="lbl" style="width:12%">Bins</td><td class="cell-in" style="width:13%"><input data-k="binsKg" inputmode="decimal"></td><td class="lbl" style="width:6%">kg</td>
        <td class="lbl" style="width:12%">Boxes</td><td class="cell-in" style="width:13%"><input data-k="boxesKg" inputmode="decimal"></td><td class="lbl" style="width:6%">kg</td>
      </tr>
      <tr>
        <td class="lbl">Baskets</td><td class="cell-in"><input data-k="basketsKg" inputmode="decimal"></td><td class="lbl">kg</td>
        <td class="lbl">Cartons</td><td class="cell-in"><input data-k="cartonsKg" inputmode="decimal"></td><td class="lbl">kg</td>
      </tr>
    </table>
  `);
  root.appendChild(units);
  root.appendChild(el(`<div class="official-note">The unit of weighing applicable to your vessel: enter the unit value (e.g. if 50kg bins are used, enter 50 next to Bins).</div>`));

  // FOR OFFICIAL USE ONLY — completed onshore; kept for paper fidelity
  root.appendChild(el(`
    <div class="official">
      <h4>FOR OFFICIAL USE ONLY</h4>
      <div class="row"><b>Date &amp; Place Received</b><span class="line"></span></div>
      <div class="row"><b>Sector</b>
        <span class="opt">CT</span><span class="opt">MB</span><span class="opt">PE</span>
        <span style="flex:1"></span>
        <span class="opt">In</span><span class="opt">Off</span>
      </div>
      <div class="row"><b>Number of drags</b><span class="line" style="max-width:110px"></span>
        <b style="min-width:auto">Type</b>
        <span class="opt">Bot</span><span class="opt">Mid</span><span class="opt">Both</span></div>
      <div class="row"><b>Landing Captured by</b><span class="line"></span><b style="min-width:auto">Date</b><span class="line" style="max-width:130px"></span></div>
      <div class="row"><b>Landing Validated by</b><span class="line"></span><b style="min-width:auto">Date</b><span class="line" style="max-width:130px"></span></div>
      <div class="row"><b>Drags Captured by</b><span class="line"></span><b style="min-width:auto">Date</b><span class="line" style="max-width:130px"></span></div>
      <div class="official-note">This section is completed onshore by the Department.</div>
    </div>
  `));

  root.querySelectorAll("input[data-k]").forEach(inp => bind(inp, c, inp.dataset.k, onChange));
  return root;
}

/* =============== T&C PAGES =============== */

function renderTC1() {
  const root = el(`<div class="paper tc"></div>`);
  let html = `<h3>${TC_PAGE_1.title}</h3>`;
  for (const s of TC_PAGE_1.sections) {
    if (s.heading) html += `<h4>${s.heading}</h4>`;
    html += `<ol>` + s.items.map(i => `<li>${i}</li>`).join("") + `</ol>`;
  }
  html += `<p class="note">${TC_PAGE_1.note}</p>`;
  root.innerHTML += html;
  return root;
}

function renderTC2() {
  const root = el(`<div class="paper tc"></div>`);
  let html = `<h3 style="text-decoration:none;font-weight:700">${TC_PAGE_2.title}</h3>`;
  html += `<p>${TC_PAGE_2.intro}</p>`;
  for (const s of TC_PAGE_2.sections) {
    html += `<h5>${s.heading}</h5>`;
    if (s.body) html += `<p>${s.body}</p>`;
    if (s.items) html += `<ul>` + s.items.map(i => `<li>${i}</li>`).join("") + `</ul>`;
  }
  root.innerHTML += html;
  return root;
}

/* =============== HEADER INFORMATION SHEET =============== */

function renderHeaderPage(trip, page, onChange) {
  const d = page.data;
  const root = el(`<div class="paper hdr"></div>`);
  root.appendChild(el(`<div class="sheet-title">Header Information per Activity Period</div>`));

  const wrap = el(`<div class="hdr-wrap"></div>`);
  const table = document.createElement("table");
  table.className = "hdr-table";

  // Fixed column widths: thin group column, label column, then 7 equal period columns
  let cols = `<colgroup><col class="c-group"><col class="c-label">`;
  for (let p = 1; p <= MAX_PERIODS; p++) cols += `<col class="c-period">`;
  cols += `</colgroup>`;

  // Head row: Activity Period | 1..7
  let thead = `<thead><tr><th class="rowlbl" colspan="2" style="text-align:left">Activity Period</th>`;
  for (let p = 1; p <= MAX_PERIODS; p++) thead += `<th>${p}</th>`;
  thead += `</tr></thead>`;
  table.innerHTML = cols + thead;

  const tbody = document.createElement("tbody");

  // Build rows with vertical group labels (Start / End / etc.) using rowspans
  let i = 0;
  while (i < HEADER_ROWS.length) {
    const row = HEADER_ROWS[i];
    if (row.group) {
      // count group size
      let n = 0;
      while (i + n < HEADER_ROWS.length && HEADER_ROWS[i + n].group === row.group) n++;
      for (let j = 0; j < n; j++) {
        const r = HEADER_ROWS[i + j];
        const tr = document.createElement("tr");
        if (j === 0) tr.innerHTML += `<td class="grouplbl" rowspan="${n}">${esc(row.group)}</td>`;
        tr.innerHTML += `<td class="sublbl">${esc(r.label)}</td>`;
        for (let p = 0; p < MAX_PERIODS; p++) {
          tr.innerHTML += `<td class="pcell"><input data-p="${p}" data-k="${r.key}" ${inputAttrs(r.type)}></td>`;
        }
        tbody.appendChild(tr);
      }
      i += n;
    } else {
      const tr = document.createElement("tr");
      if (row.emph) tr.className = "emph";
      tr.innerHTML = `<td class="rowlbl" colspan="2">${esc(row.label)}</td>`;
      for (let p = 0; p < MAX_PERIODS; p++) {
        tr.innerHTML += `<td class="pcell"><input data-p="${p}" data-k="${row.key}" ${inputAttrs(row.type)}></td>`;
      }
      tbody.appendChild(tr);
      i++;
    }
  }
  table.appendChild(tbody);
  wrap.appendChild(table);
  root.appendChild(wrap);

  root.appendChild(el(`
    <div class="hdr-note">
      Please complete one column of the above <b>Header Information Table</b> for each <b>Activity Period</b>.<br>
      Where the Activity was trawling, please enter the catch details in the corresponding column of the <b>Catch Sheet</b> (facing page).
    </div>
  `));

  // Legend code tables
  const codes = el(`<div class="codes-wrap"></div>`);
  const tbl = document.createElement("table");
  tbl.className = "codes";
  let ch = `<tr><th colspan="2">Activity Code</th><th colspan="2">Retained Species</th><th colspan="2">Bird Scaring Line Codes</th><th colspan="2">Bird Mortality</th></tr>`;
  const rows = Math.max(ACTIVITY_CODES.length, RETAINED_SPECIES_CODES.length, BIRD_SCARING_CODES.length, BIRD_MORTALITY_CODES.length);
  for (let r = 0; r < rows; r++) {
    const a = ACTIVITY_CODES[r] || ["",""], s = RETAINED_SPECIES_CODES[r] || ["",""],
          b = BIRD_SCARING_CODES[r] || ["",""], m = BIRD_MORTALITY_CODES[r] || ["",""];
    ch += `<tr><td class="cnum">${a[0]}</td><td>${a[1]}</td><td class="cnum">${s[0]}</td><td>${s[1]}</td><td class="cnum">${b[0]}</td><td>${b[1]}</td><td class="cnum">${m[0]}</td><td>${m[1]}</td></tr>`;
  }
  tbl.innerHTML = ch;
  codes.appendChild(tbl);
  root.appendChild(codes);

  // Remarks + declaration + signature
  const remarks = el(`
    <div class="remarks">
      <label>REMARKS</label>
      <textarea data-remarks rows="3"></textarea>
    </div>
  `);
  root.appendChild(remarks);

  root.appendChild(el(`
    <div class="declaration"><b>DECLARATION</b>: ${DECLARATION_TEXT}<br><b style="text-decoration:none">SIGNATURE</b></div>
  `));

  const sig = el(`
    <div class="sig-row">
      <span class="who">Skipper</span>
      <span style="font-weight:600">Name:</span>
      <span class="name-line"><input data-skipname placeholder=""></span>
      <span style="font-weight:600">Sign:</span>
      <span class="sigpad" data-sigpad>
        <button class="clear-sig" title="Clear signature" type="button">×</button>
        <canvas width="260" height="70"></canvas>
      </span>
    </div>
  `);
  root.appendChild(sig);

  // ---- bindings ----
  root.querySelectorAll("input[data-p]").forEach(inp => {
    const p = +inp.dataset.p, k = inp.dataset.k;
    inp.value = d.periods[p][k] ?? "";
    inp.addEventListener("input", () => { d.periods[p][k] = inp.value; onChange(); });
  });
  const ta = root.querySelector("[data-remarks]");
  ta.value = d.remarks ?? "";
  ta.addEventListener("input", () => { d.remarks = ta.value; onChange(); });

  const nameInp = root.querySelector("[data-skipname]");
  nameInp.value = d.skipperName || trip.cover.skipperName || "";
  nameInp.addEventListener("input", () => { d.skipperName = nameInp.value; onChange(); });

  setupSignaturePad(root.querySelector("[data-sigpad]"), d, onChange);
  return root;
}

function inputAttrs(type) {
  if (type === "date") return `type="date"`;
  if (type === "time") return `type="time"`;
  if (type === "number") return `type="text" inputmode="decimal"`;
  return `type="text"`;
}

/* Signature pad: draws to canvas, stores dataURL in data.signature */
function setupSignaturePad(padEl, data, onChange) {
  const canvas = padEl.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#06255c";

  if (data.signature) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = data.signature;
  }

  let drawing = false;
  const pos = e => {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)];
  };
  canvas.addEventListener("pointerdown", e => {
    drawing = true; canvas.setPointerCapture(e.pointerId);
    const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y);
  });
  canvas.addEventListener("pointermove", e => {
    if (!drawing) return;
    const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke();
  });
  const end = () => {
    if (!drawing) return;
    drawing = false;
    data.signature = canvas.toDataURL();
    onChange();
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  padEl.querySelector(".clear-sig").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.signature = "";
    onChange();
  });
}

/* =============== CATCH SHEET =============== */

function renderCatchPage(trip, page, onChange) {
  const d = page.data;
  const root = el(`<div class="paper catch"></div>`);
  root.appendChild(el(`<div class="sheet-title" style="text-decoration:underline">Estimated Catch per Day – Freezer</div>`));

  // Date (needed to tie the day's catch to the header sheet / Excel export)
  const dateRow = el(`
    <div class="catch-date-row"><label>Date:</label><input type="date" data-date></div>
  `);
  root.appendChild(dateRow);

  const cols = el(`<div class="catch-cols"></div>`);
  cols.appendChild(buildCatchTable(CATCH_LEFT, d, onChange, "left"));
  cols.appendChild(buildCatchRight(d, onChange));
  root.appendChild(cols);

  const dateInp = dateRow.querySelector("[data-date]");
  dateInp.value = d.date ?? "";
  dateInp.addEventListener("input", () => { d.date = dateInp.value; onChange(); });

  return root;
}

/* Rotated side-bands on the left table, mirroring the paper:
   "Hake" + Headed & Gutted / Deep Skinned Fillets / Skinless (Shallow) Fillets */
const LEFT_BANDS = {
  "Headed & Gutted": { first: "Hake" },
  "Deep Skinned Fillets": {},
  "Skinless (Shallow) Fillets": {},
};

function buildCatchTable(rows, d, onChange, side) {
  const table = document.createElement("table");
  table.className = "catch-t";
  const nCols = side === "left" ? 5 : 4;
  table.innerHTML = side === "left"
    ? `<thead><tr><th colspan="2" style="width:22%">Species</th><th>Weight</th><th style="width:20%">Sea Harvest</th><th style="width:74px">Mass</th></tr></thead>`
    : `<thead><tr><th style="width:24%">Species</th><th>Category</th><th></th><th style="width:74px">Mass</th></tr></thead>`;
  const tbody = document.createElement("tbody");

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const tr = document.createElement("tr");
    if (r.kind === "sub") {
      tr.className = "subhead";
      tr.innerHTML = `<td colspan="${nCols}">${esc(r.label)}</td>`;
    } else if (r.kind === "total") {
      tr.className = "total" + (r.grand ? " grand" : "");
      tr.innerHTML = `<td colspan="${nCols - 1}" style="text-align:center">${esc(r.label)}</td><td class="mass"><div class="tval" data-total="${r.key}"></div></td>`;
    } else {
      if (r.shaded) tr.className = "shaded";
      let lead = "";
      if (side === "left") {
        const band = LEFT_BANDS[r.section];
        if (band) {
          const isFirst = i === 0 || rows[i - 1].section !== r.section;
          if (isFirst) {
            // count rows in this band
            let n = 0;
            while (rows[i + n] && rows[i + n].section === r.section && rows[i + n].kind === "entry") n++;
            if (band.first) {
              // paper: "Hake" on the first row, rotated band beside the rest
              lead = `<td class="sp">${esc(band.first)}</td>`;
              tr.dataset.bandNext = JSON.stringify({ label: r.section, span: n - 1 });
            } else {
              lead = `<td class="bandlbl" rowspan="${n}">${esc(r.section)}</td>`;
            }
          } else {
            const prev = tbody.lastElementChild;
            if (prev?.dataset.bandNext) {
              const b = JSON.parse(prev.dataset.bandNext);
              delete prev.dataset.bandNext;
              lead = `<td class="bandlbl" rowspan="${b.span}">${esc(b.label)}</td>`;
            }
          }
        } else {
          lead = ``; // species rows below carry their own label; span the band column
        }
      }
      const spCell = side === "left" && !LEFT_BANDS[r.section] && lead === ""
        ? `<td class="sp" colspan="2">${esc(r.label)}</td>`
        : `${lead}<td class="sp">${esc(r.label)}</td>`;
      tr.innerHTML =
        spCell +
        `<td class="dt">${esc(r.detail)}</td><td class="cd">${esc(r.code)}</td>` +
        `<td class="mass"><input inputmode="decimal" data-mass="${r.key}"></td>`;
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  // bindings + live totals
  table.querySelectorAll("input[data-mass]").forEach(inp => {
    const k = inp.dataset.mass;
    inp.value = d.masses[k] ?? "";
    inp.addEventListener("input", () => {
      d.masses[k] = inp.value;
      onChange();
      refreshTotals(inp.closest(".paper"), d);
    });
  });
  return table;
}

function buildCatchRight(d, onChange) {
  const container = document.createElement("div");
  const table = buildCatchTable(CATCH_RIGHT, d, onChange, "right");

  // Others (Please specify)
  const tbody = table.querySelector("tbody");
  const head = document.createElement("tr");
  head.className = "catch-others-head";
  head.innerHTML = `<td colspan="4">Others (Please specify)</td>`;
  tbody.appendChild(head);
  const sub = document.createElement("tr");
  sub.className = "catch-others-head";
  sub.innerHTML = `<td></td><td>Species</td><td>Category</td><td>Mass</td>`;
  tbody.appendChild(sub);
  for (let i = 0; i < OTHERS_ROWS; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td class="cnum" style="text-align:center;width:24px">${i + 1}</td>` +
      `<td class="cell-in" style="padding:0"><input data-other="species" data-i="${i}"></td>` +
      `<td class="cell-in" style="padding:0"><input data-other="category" data-i="${i}"></td>` +
      `<td class="mass"><input inputmode="decimal" data-other="mass" data-i="${i}"></td>`;
    tbody.appendChild(tr);
  }

  container.appendChild(table);

  const fuel = el(`
    <div class="fuel-row"><label>Total Fuel used</label><input data-fuel placeholder="Specify litres or tons"></div>
  `);
  container.appendChild(fuel);
  container.appendChild(el(`<div class="catch-note">${esc(CATCH_FOOTNOTE)}</div>`));

  container.querySelectorAll("input[data-other]").forEach(inp => {
    const i = +inp.dataset.i, f = inp.dataset.other;
    inp.value = d.others[i]?.[f] ?? "";
    inp.addEventListener("input", () => {
      d.others[i] = d.others[i] || {};
      d.others[i][f] = inp.value;
      onChange();
    });
  });
  const fuelInp = fuel.querySelector("[data-fuel]");
  fuelInp.value = d.fuel ?? "";
  fuelInp.addEventListener("input", () => { d.fuel = fuelInp.value; onChange(); });

  return container;
}

/* Recompute all total rows on a catch paper */
function computeTotal(key, d, seen = new Set()) {
  if (seen.has(key)) return 0;
  seen.add(key);
  const row = CATCH_ROW_BY_KEY[key];
  if (!row) return 0;
  if (row.kind === "entry") {
    const v = parseFloat(String(d.masses[key] ?? "").replace(",", "."));
    return isNaN(v) ? 0 : v;
  }
  if (row.kind === "total") {
    return row.sums.reduce((acc, k) => acc + computeTotal(k, d, seen), 0);
  }
  return 0;
}

function refreshTotals(paperEl, d) {
  if (!paperEl) return;
  paperEl.querySelectorAll("[data-total]").forEach(div => {
    const v = computeTotal(div.dataset.total, d);
    div.textContent = v ? +v.toFixed(2) : "";
  });
}
