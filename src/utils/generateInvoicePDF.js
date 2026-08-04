import jsPDF from "jspdf";
import { formatPKR } from "../data/garments";

// Generates and triggers a download of a simple, clean invoice PDF for a
// completed purchase. `purchase` matches the shape built in Cart.jsx —
// see buildPurchaseObject() there for the exact fields.
export function generateInvoicePDF(purchase) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  // --- Header / "logo" (wordmark, since we don't have a bitmap logo to
  // embed) ---------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text("LIBAS-E-NAZAR", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("AI Virtual Try-On — Final Year Project", marginX, y + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text("INVOICE", pageWidth - marginX, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Order ID: ${purchase.orderId}`, pageWidth - marginX, y + 14, {
    align: "right",
  });
  doc.text(`${purchase.date}  ${purchase.time}`, pageWidth - marginX, y + 26, {
    align: "right",
  });

  y += 48;
  doc.setDrawColor(200, 170, 110);
  doc.setLineWidth(1.2);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 28;

  // --- Customer -----------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("BILLED TO", marginX, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(purchase.userName || "Guest", marginX, y);
  y += 15;

  const shipTo = purchase.shipping_details;
  if (shipTo) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    if (purchase.userEmail) {
      doc.text(purchase.userEmail, marginX, y);
      y += 12;
    }
    if (shipTo.phone) {
      doc.text(shipTo.phone, marginX, y);
      y += 12;
    }
    const addressLine = [shipTo.address, shipTo.apartment]
      .filter(Boolean)
      .join(", ");
    if (addressLine) {
      doc.text(addressLine, marginX, y, { maxWidth: 260 });
      y += 12;
    }
    const cityLine = [shipTo.city, shipTo.postalCode, shipTo.country]
      .filter(Boolean)
      .join(", ");
    if (cityLine) {
      doc.text(cityLine, marginX, y);
      y += 12;
    }
  }
  y += 15;

  // --- Items table header ---------------------------------------------
  const col = {
    item: marginX,
    role: marginX + 230,
    qty: marginX + 320,
    price: marginX + 380,
    lineTotal: pageWidth - marginX,
  };

  doc.setFillColor(30, 28, 26);
  doc.rect(marginX, y, pageWidth - marginX * 2, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(245, 240, 230);
  doc.text("ITEM", col.item + 8, y + 16);
  doc.text("TYPE", col.role, y + 16);
  doc.text("QTY", col.qty, y + 16);
  doc.text("PRICE", col.price, y + 16);
  doc.text("TOTAL", col.lineTotal, y + 16, { align: "right" });
  y += 24;

  // --- Items rows -------------------------------------------------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  purchase.items.forEach((line, i) => {
    const rowH = 26;
    if (i % 2 === 1) {
      doc.setFillColor(247, 244, 237);
      doc.rect(marginX, y, pageWidth - marginX * 2, rowH, "F");
    }
    doc.setTextColor(30, 28, 26);
    doc.text(line.name, col.item + 8, y + 17, { maxWidth: 210 });
    doc.setTextColor(110, 110, 110);
    doc.text(line.role || "-", col.role, y + 17);
    doc.text(String(line.qty), col.qty, y + 17);
    doc.text(formatPKR(line.price), col.price, y + 17);
    doc.setTextColor(30, 28, 26);
    doc.text(formatPKR(line.price * line.qty), col.lineTotal, y + 17, {
      align: "right",
    });
    y += rowH;
  });

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.75);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;

  // --- Totals -------------------------------------------------------------
  const totalsX = pageWidth - marginX - 180;
  const printTotalsRow = (label, value, bold) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(bold ? 20 : 90, bold ? 20 : 90, bold ? 20 : 90);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - marginX, y, { align: "right" });
    y += bold ? 20 : 16;
  };
  printTotalsRow("Subtotal", formatPKR(purchase.subtotal));
  printTotalsRow(
    "Shipping",
    purchase.shipping === 0 ? "Free" : formatPKR(purchase.shipping),
  );
  printTotalsRow("Tax", formatPKR(purchase.tax));
  y += 4;
  doc.setDrawColor(200, 170, 110);
  doc.line(totalsX, y - 14, pageWidth - marginX, y - 14);
  printTotalsRow("Grand Total", formatPKR(purchase.grandTotal), true);

  // --- Thank you ------------------------------------------------------
  y += 40;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(180, 140, 60);
  doc.text("Thank you for shopping with Libas-e-Nazar!", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "This is a demo receipt generated for a Final Year Project — no real payment was processed.",
    marginX,
    y + 16,
  );

  doc.save(`${purchase.orderId}-invoice.pdf`);
}
