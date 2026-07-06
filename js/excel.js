/* Excel export — builds a workbook from a trip using SheetJS (vendored, offline). */

function exportTripToExcel(trip) {
  const wb = XLSX.utils.book_new();
  const c = trip.cover;

  /* ---- Sheet 1: Trip Info ---- */
  const info = [
    ["DEEPSEA TRAWL FISHING LOG — FREEZER", ""],
    ["Form", FORM_META.formCode],
    [],
    ["Voyage Number", c.voyageNumber || ""],
    ["Voyage Code", c.voyageCode || ""],
    ["Registered Vessel Owner", c.vesselOwner || ""],
    ["Vessel Name", c.vesselName || ""],
    ["Rights Application Number/s", c.rightsNumbers || ""],
    ["Skipper's Name", c.skipperName || ""],
    ["Skipper's Contact Number", c.skipperContact || ""],
    ["Observer's Name", c.observerName || ""],
    [],
    ["Permit Number 1", c.permit1 || "", "Quota Year", c.quotaYear1 || ""],
    ["Permit Number 2", c.permit2 || "", "Quota Year", c.quotaYear2 || ""],
    [],
    ["Previous Landing", fmtDT(c.prevLandingDate, c.prevLandingTime)],
    ["Sailing", fmtDT(c.sailingDate, c.sailingTime)],
    ["Docking", fmtDT(c.dockingDate, c.dockingTime)],
    ["Discharge", fmtDT(c.dischargeDate, c.dischargeTime)],
    ["Discharge Port", c.dischargePort || ""],
    ["Factory", c.factory || ""],
    [],
    ["Catch retained estimated in:"],
    ["Bins (kg)", c.binsKg || "", "Boxes (kg)", c.boxesKg || ""],
    ["Baskets (kg)", c.basketsKg || "", "Cartons (kg)", c.cartonsKg || ""],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(info);
  wsInfo["!cols"] = [{ wch: 28 }, { wch: 26 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Trip Info");

  /* ---- Sheet 2: Activity Periods (one row per period) ---- */
  const hdrCols = [
    "Sheet No", "Period", ...HEADER_ROWS.map(r => (r.group ? r.group + " " : "") + r.label),
  ];
  const hdrRows = [hdrCols];
  let sheetNo = 0;
  for (const page of trip.pages) {
    if (page.kind !== "header") continue;
    sheetNo++;
    page.data.periods.forEach((per, i) => {
      const hasData = Object.values(per).some(v => v !== "" && v != null);
      if (!hasData) return;
      hdrRows.push([sheetNo, i + 1, ...HEADER_ROWS.map(r => numOrText(per[r.key]))]);
    });
  }
  const wsHdr = XLSX.utils.aoa_to_sheet(hdrRows);
  wsHdr["!cols"] = hdrCols.map(h => ({ wch: Math.max(10, Math.min(18, h.length + 2)) }));
  XLSX.utils.book_append_sheet(wb, wsHdr, "Activity Periods");

  /* ---- Sheet 3: Catch (long format, one row per species line) ---- */
  const catchRows = [["Sheet No", "Date", "Species", "Weight-Grade", "Category-Code", "Mass (kg)"]];
  let catchNo = 0;
  for (const page of trip.pages) {
    if (page.kind !== "catch") continue;
    catchNo++;
    const d = page.data;
    for (const r of CATCH_ALL_ROWS) {
      if (r.kind !== "entry") continue;
      const v = d.masses[r.key];
      if (v === undefined || v === null || String(v).trim() === "") continue;
      catchRows.push([catchNo, d.date || "", r.species, r.detail || r.label, r.code || "", numOrText(v)]);
    }
    (d.others || []).forEach(o => {
      if (!o || (!o.species && !o.mass)) return;
      catchRows.push([catchNo, d.date || "", o.species || "", "", o.category || "", numOrText(o.mass)]);
    });
    if (d.fuel) catchRows.push([catchNo, d.date || "", "TOTAL FUEL USED", "", "", d.fuel]);
  }
  const wsCatch = XLSX.utils.aoa_to_sheet(catchRows);
  wsCatch["!cols"] = [{ wch: 9 }, { wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsCatch, "Catch");

  /* ---- Sheet 4: Daily Totals (auto-computed) ---- */
  const totRows = [["Sheet No", "Date", "Total", "Mass (kg)"]];
  let totNo = 0;
  for (const page of trip.pages) {
    if (page.kind !== "catch") continue;
    totNo++;
    for (const r of CATCH_ALL_ROWS) {
      if (r.kind !== "total") continue;
      const v = computeTotal(r.key, page.data);
      if (v) totRows.push([totNo, page.data.date || "", r.label, +v.toFixed(2)]);
    }
  }
  const wsTot = XLSX.utils.aoa_to_sheet(totRows);
  wsTot["!cols"] = [{ wch: 9 }, { wch: 12 }, { wch: 28 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsTot, "Daily Totals");

  const fname = ["DeepseaTrawl_Freezer", c.vesselName, c.voyageNumber]
    .filter(Boolean).join("_").replace(/[^\w\-]+/g, "_") + ".xlsx";
  XLSX.writeFile(wb, fname);
  return fname;
}

function fmtDT(date, time) {
  return [date, time].filter(Boolean).join(" ");
}

function numOrText(v) {
  if (v === undefined || v === null || String(v).trim() === "") return "";
  const n = parseFloat(String(v).replace(",", "."));
  return !isNaN(n) && /^[\d.,\s-]+$/.test(String(v).trim()) ? n : v;
}
