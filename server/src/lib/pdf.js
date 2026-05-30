import PDFDocument from "pdfkit";

const BRAND = "#1d4ed8";
const MUTED = "#6b7280";

function header(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 90).fill(BRAND);
  doc
    .fillColor("white")
    .fontSize(22)
    .text("DOMS", 50, 28)
    .fontSize(10)
    .fillColor("#dbeafe")
    .text("Depot Operations Management System", 50, 56);
  doc
    .fillColor("white")
    .fontSize(16)
    .text(title, 0, 34, { align: "right", width: doc.page.width - 50 });
  if (subtitle) {
    doc
      .fontSize(10)
      .fillColor("#dbeafe")
      .text(subtitle, 0, 58, { align: "right", width: doc.page.width - 50 });
  }
  doc.fillColor("black").moveDown(4);
  doc.y = 120;
}

function field(doc, label, value) {
  const x = doc.x;
  doc.fontSize(9).fillColor(MUTED).text(label.toUpperCase(), { continued: false });
  doc.fontSize(12).fillColor("black").text(value == null || value === "" ? "—" : String(value));
  doc.moveDown(0.6);
  doc.x = x;
}

function twoColRow(doc, leftLabel, leftVal, rightLabel, rightVal) {
  const top = doc.y;
  const colW = (doc.page.width - 100) / 2;
  doc.fontSize(9).fillColor(MUTED).text(leftLabel.toUpperCase(), 50, top, { width: colW });
  doc.fontSize(12).fillColor("black").text(leftVal == null || leftVal === "" ? "—" : String(leftVal), 50, top + 12, { width: colW });
  doc.fontSize(9).fillColor(MUTED).text(rightLabel.toUpperCase(), 50 + colW, top, { width: colW });
  doc.fontSize(12).fillColor("black").text(rightVal == null || rightVal === "" ? "—" : String(rightVal), 50 + colW, top + 12, { width: colW });
  doc.y = top + 44;
  doc.x = 50;
}

function sectionTitle(doc, text) {
  doc.moveDown(0.5);
  doc.fontSize(13).fillColor(BRAND).text(text, 50);
  doc
    .moveTo(50, doc.y + 2)
    .lineTo(doc.page.width - 50, doc.y + 2)
    .strokeColor("#e5e7eb")
    .stroke();
  doc.moveDown(0.8);
  doc.fillColor("black");
}

function footer(doc) {
  doc
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      `Generated ${new Date().toLocaleString()} · DOMS`,
      50,
      doc.page.height - 50,
      { align: "center", width: doc.page.width - 100 }
    );
}

/**
 * Streams a loading-ticket PDF to the given writable stream (res).
 */
export function buildTicketPdf(ticket, stream) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(stream);

  header(doc, "LOADING TICKET", ticket.ticketNumber);

  sectionTitle(doc, "Truck & Driver");
  twoColRow(doc, "Plate Number", ticket.truck?.plateNumber, "Driver", ticket.truck?.driverName);
  twoColRow(doc, "Transporter", ticket.truck?.transporter, "Driver Phone", ticket.truck?.driverPhone);
  twoColRow(doc, "Truck Capacity (t)", ticket.truck?.capacityTons, "Status", ticket.status);

  sectionTitle(doc, "Load Details");
  twoColRow(doc, "Product", ticket.product, "Requested Qty (t)", ticket.requestedQtyTons);
  twoColRow(doc, "Customer", ticket.customer, "Destination", ticket.destination);
  field(doc, "Notes", ticket.notes);

  sectionTitle(doc, "Origination");
  twoColRow(doc, "Created By", ticket.createdBy?.name, "Created At", new Date(ticket.createdAt).toLocaleString());

  if (ticket.inspection) {
    sectionTitle(doc, "Safety Inspection");
    twoColRow(
      doc,
      "Result",
      ticket.inspection.result,
      "Inspected At",
      new Date(ticket.inspection.inspectedAt).toLocaleString()
    );
    field(doc, "Remarks", ticket.inspection.remarks);
  }

  footer(doc);
  doc.end();
}

/**
 * Streams a waybill PDF to the given writable stream (res).
 */
export function buildWaybillPdf(ticket, stream) {
  const wb = ticket.waybill;
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(stream);

  header(doc, "WAYBILL", wb?.waybillNumber);

  sectionTitle(doc, "Reference");
  twoColRow(doc, "Ticket Number", ticket.ticketNumber, "Issued At", wb ? new Date(wb.createdAt).toLocaleString() : "—");

  sectionTitle(doc, "Truck & Driver");
  twoColRow(doc, "Plate Number", ticket.truck?.plateNumber, "Driver", ticket.truck?.driverName);
  twoColRow(doc, "Transporter", ticket.truck?.transporter, "Driver Phone", ticket.truck?.driverPhone);

  sectionTitle(doc, "Consignment");
  twoColRow(doc, "Product", ticket.product, "Customer", ticket.customer);
  twoColRow(doc, "Destination", ticket.destination, "Truck Capacity (t)", ticket.truck?.capacityTons);
  twoColRow(doc, "Loaded Qty (t)", wb?.loadedQtyTons, "Overload", wb?.overload ? `YES (${wb.overloadStatus})` : "No");

  sectionTitle(doc, "Authorization");
  twoColRow(doc, "Dispatched By", wb?.dispatchedBy?.name, "Status", ticket.status);

  doc.moveDown(2);
  const sigW = (doc.page.width - 100) / 2;
  const sy = doc.y + 30;
  doc.moveTo(50, sy).lineTo(50 + sigW - 30, sy).strokeColor("#9ca3af").stroke();
  doc.moveTo(50 + sigW, sy).lineTo(50 + 2 * sigW - 30, sy).strokeColor("#9ca3af").stroke();
  doc.fontSize(9).fillColor(MUTED).text("Dispatch Officer", 50, sy + 4);
  doc.text("Driver", 50 + sigW, sy + 4);

  footer(doc);
  doc.end();
}
