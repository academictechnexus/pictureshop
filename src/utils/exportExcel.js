// src/utils/exportExcel.js
import { fmtDate } from "./helpers";
import { STAGES } from "./constants";

export async function exportToExcel(events, studioName) {
  const { utils, writeFile } = await import("xlsx");

  // ── BOOKINGS SHEET ────────────────────────────────────────
  const bookingRows = events.map((ev, i) => ({
    "#": i + 1,
    "Client Name": ev.client || "",
    "Event Type": ev.type || "",
    "Event Date": fmtDate(ev.date),
    "Venue": ev.venue || "",
    "Phone": ev.phone || "",
    "Email": ev.email || "",
    "Stage": STAGES[ev.stage]?.name || "",
    "Package Total (₹)": ev.amountTotal || 0,
    "Amount Paid (₹)": ev.amountPaid || 0,
    "Balance Due (₹)": (ev.amountTotal || 0) - (ev.amountPaid || 0),
    "Staff Assigned": (ev.staff || []).join(", "),
    "Follow-ups Sent": ev.followupCount || 0,
    "Gallery Link": ev.galleryLink || "",
    "Final Link": ev.finalLink || "",
    "Notes": ev.notes || "",
  }));

  // ── REVENUE SUMMARY SHEET ─────────────────────────────────
  const monthMap = {};
  events.forEach((ev) => {
    if (!ev.date) return;
    const key = ev.date.slice(0, 7); // YYYY-MM
    if (!monthMap[key]) monthMap[key] = { month: key, bookings: 0, revenue: 0, collected: 0, due: 0 };
    monthMap[key].bookings += 1;
    monthMap[key].revenue += ev.amountTotal || 0;
    monthMap[key].collected += ev.amountPaid || 0;
    monthMap[key].due += (ev.amountTotal || 0) - (ev.amountPaid || 0);
  });
  const summaryRows = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).map((r) => ({
    "Month": r.month,
    "Bookings": r.bookings,
    "Total Revenue (₹)": r.revenue,
    "Collected (₹)": r.collected,
    "Pending (₹)": r.due,
  }));
  summaryRows.push({
    "Month": "TOTAL",
    "Bookings": events.length,
    "Total Revenue (₹)": events.reduce((s, e) => s + (e.amountTotal || 0), 0),
    "Collected (₹)": events.reduce((s, e) => s + (e.amountPaid || 0), 0),
    "Pending (₹)": events.reduce((s, e) => s + ((e.amountTotal || 0) - (e.amountPaid || 0)), 0),
  });

  // ── PENDING PAYMENTS SHEET ────────────────────────────────
  const pendingRows = events
    .filter((e) => (e.amountTotal || 0) > (e.amountPaid || 0))
    .map((ev) => ({
      "Client": ev.client,
      "Event Date": fmtDate(ev.date),
      "Type": ev.type,
      "Phone": ev.phone || "",
      "Total (₹)": ev.amountTotal || 0,
      "Paid (₹)": ev.amountPaid || 0,
      "Due (₹)": (ev.amountTotal || 0) - (ev.amountPaid || 0),
      "Stage": STAGES[ev.stage]?.name || "",
    }));

  // ── BUILD WORKBOOK ────────────────────────────────────────
  const wb = utils.book_new();

  const wsBookings = utils.json_to_sheet(bookingRows);
  wsBookings["!cols"] = [4,18,14,12,16,14,22,18,14,14,14,18,10,28,28,24].map((w) => ({ wch: w }));
  utils.book_append_sheet(wb, wsBookings, "All Bookings");

  const wsSummary = utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [10,10,18,16,14].map((w) => ({ wch: w }));
  utils.book_append_sheet(wb, wsSummary, "Monthly Summary");

  const wsPending = utils.json_to_sheet(pendingRows);
  wsPending["!cols"] = [18,12,14,14,12,10,10,18].map((w) => ({ wch: w }));
  utils.book_append_sheet(wb, wsPending, "Pending Payments");

  const fileName = `${(studioName || "FramedForever").replace(/\s+/g, "_")}_Events_${new Date().toISOString().slice(0, 10)}.xlsx`;
  writeFile(wb, fileName);
}
