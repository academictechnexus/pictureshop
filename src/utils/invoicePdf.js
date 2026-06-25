// src/utils/invoicePdf.js
// Generates a branded PDF invoice using jsPDF

import { fmtDate, fmtCurrency } from "./helpers";

export async function generateInvoice(event, studioProfile) {
  // Dynamic import so it doesn't slow initial load
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;

  // ── HEADER BAND ──────────────────────────────────────────
  doc.setFillColor(26, 20, 16); // #1a1410
  doc.rect(0, 0, W, 38, "F");

  doc.setTextColor(250, 247, 242);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(studioProfile?.studioName || "FramedForever Studio", margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(201, 168, 76); // gold
  doc.text("Wedding Photography & Videography", margin, 23);

  doc.setTextColor(160, 144, 128);
  const contactLine = [studioProfile?.phone, studioProfile?.email].filter(Boolean).join("  ·  ");
  if (contactLine) doc.text(contactLine, margin, 29);

  // INVOICE label top-right
  doc.setTextColor(250, 247, 242);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", W - margin, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 144, 128);
  const invoiceNo = `INV-${String(event.id || Date.now()).slice(-6)}`;
  doc.text(`No: ${invoiceNo}`, W - margin, 29, { align: "right" });

  // ── BILL TO ───────────────────────────────────────────────
  let y = 50;
  doc.setTextColor(138, 126, 117);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", margin, y);

  doc.setTextColor(26, 20, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(event.client || "—", margin, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 90, 82);
  if (event.phone) doc.text(`📱 ${event.phone}`, margin, y + 14);
  if (event.email) doc.text(`✉  ${event.email}`, margin, y + 20);

  // EVENT DETAILS right column
  doc.setTextColor(138, 126, 117);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("EVENT DETAILS", W / 2 + 10, y);

  const details = [
    ["Event Type", event.type || "—"],
    ["Event Date", fmtDate(event.date)],
    ["Venue", event.venue || "—"],
    ["Invoice Date", fmtDate(new Date().toISOString().slice(0, 10))],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  details.forEach(([label, val], i) => {
    doc.setTextColor(138, 126, 117);
    doc.text(label + ":", W / 2 + 10, y + 7 + i * 7);
    doc.setTextColor(26, 20, 16);
    doc.text(val, W / 2 + 40, y + 7 + i * 7);
  });

  // ── DIVIDER ───────────────────────────────────────────────
  y += 42;
  doc.setDrawColor(229, 221, 213);
  doc.setLineWidth(0.4);
  doc.line(margin, y, W - margin, y);

  // ── ITEMS TABLE ───────────────────────────────────────────
  y += 6;
  const packageNote = event.notes || "Photography & Videography Package";

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Description", "Amount"]],
    body: [
      ["1", packageNote, fmtCurrency(event.amountTotal || 0)],
    ],
    headStyles: {
      fillColor: [26, 20, 16],
      textColor: [201, 168, 76],
      fontSize: 9,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: { fontSize: 10, textColor: [26, 20, 16] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 130 },
      2: { cellWidth: 30, halign: "right" },
    },
    alternateRowStyles: { fillColor: [250, 247, 242] },
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── SUMMARY BOX ───────────────────────────────────────────
  const boxX = W - margin - 72;
  const amountDue = (event.amountTotal || 0) - (event.amountPaid || 0);

  const rows = [
    ["Total", fmtCurrency(event.amountTotal || 0)],
    ["Amount Paid", fmtCurrency(event.amountPaid || 0)],
  ];

  doc.setFontSize(9);
  rows.forEach(([label, val], i) => {
    doc.setTextColor(100, 90, 82);
    doc.text(label, boxX, y + i * 8);
    doc.setTextColor(26, 20, 16);
    doc.setFont("helvetica", "bold");
    doc.text(val, W - margin, y + i * 8, { align: "right" });
    doc.setFont("helvetica", "normal");
  });

  y += rows.length * 8 + 2;
  doc.setDrawColor(196, 113, 90);
  doc.setLineWidth(0.6);
  doc.line(boxX, y, W - margin, y);
  y += 6;

  doc.setFillColor(196, 113, 90);
  doc.roundedRect(boxX - 2, y - 5, W - margin - boxX + 4, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Balance Due", boxX + 2, y + 3);
  doc.text(fmtCurrency(amountDue), W - margin - 2, y + 3, { align: "right" });

  y += 20;

  // ── PAYMENT DETAILS ───────────────────────────────────────
  if (studioProfile?.upiId) {
    doc.setFillColor(244, 241, 234);
    doc.roundedRect(margin, y, W - margin * 2, 18, 3, 3, "F");
    doc.setTextColor(138, 126, 117);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT DETAILS", margin + 4, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 20, 16);
    doc.text(`UPI: ${studioProfile.upiId}`, margin + 4, y + 13);
    y += 24;
  }

  // ── THANK YOU FOOTER ─────────────────────────────────────
  doc.setFillColor(26, 20, 16);
  doc.rect(0, 280, W, 17, "F");
  doc.setTextColor(201, 168, 76);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Thank you for choosing us to capture your special day 📷", W / 2, 290, { align: "center" });
  doc.setTextColor(138, 126, 117);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(studioProfile?.studioName || "FramedForever Studio", W / 2, 294, { align: "center" });

  doc.save(`Invoice_${(event.client || "client").replace(/\s+/g, "_")}_${invoiceNo}.pdf`);
}
