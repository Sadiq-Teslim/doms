import prisma from "../prisma.js";

function datePart() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/** Generates a sequential ticket number like TKT-20260529-0001. */
export async function nextTicketNumber() {
  const prefix = `TKT-${datePart()}-`;
  const count = await prisma.ticket.count({
    where: { ticketNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

/** Generates a sequential waybill number like WB-20260529-0001. */
export async function nextWaybillNumber() {
  const prefix = `WB-${datePart()}-`;
  const count = await prisma.waybill.count({
    where: { waybillNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}
