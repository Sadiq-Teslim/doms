import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { writeAudit } from "../lib/audit.js";
import { createNotification } from "../lib/notify.js";
import { nextTicketNumber, nextWaybillNumber } from "../lib/ids.js";
import { buildTicketPdf, buildWaybillPdf } from "../lib/pdf.js";

const router = Router();

const ticketInclude = {
  truck: true,
  createdBy: { select: { id: true, name: true, role: true } },
  inspection: { include: { inspector: { select: { id: true, name: true } } } },
  waybill: { include: { dispatchedBy: { select: { id: true, name: true } }, overloadReview: true } },
  gateClearance: { include: { clearedBy: { select: { id: true, name: true } } } },
};

router.use(authenticate);

// List tickets with optional ?status= filter (comma-separated allowed).
router.get("/", async (req, res) => {
  const { status } = req.query;
  let where = {};
  if (status) {
    const list = String(status).split(",").map((s) => s.trim());
    where = { status: { in: list } };
  }
  const tickets = await prisma.ticket.findMany({
    where,
    include: ticketInclude,
    orderBy: { id: "desc" },
  });
  res.json(tickets);
});

router.get("/:id", async (req, res) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(req.params.id) },
    include: ticketInclude,
  });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket);
});

// Logistics creates a loading ticket.
router.post("/", requireRole("LOGISTICS", "ADMIN"), async (req, res) => {
  const { truckId, product, requestedQtyTons, destination, customer, notes } = req.body || {};
  if (!truckId || !product || requestedQtyTons == null || !destination || !customer) {
    return res.status(400).json({ error: "truckId, product, requestedQtyTons, destination, customer required" });
  }
  const truck = await prisma.truck.findUnique({ where: { id: Number(truckId) } });
  if (!truck) return res.status(400).json({ error: "Truck not found" });

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: await nextTicketNumber(),
      truckId: truck.id,
      product,
      requestedQtyTons: Number(requestedQtyTons),
      destination,
      customer,
      notes,
      createdById: req.user.id,
      status: "PENDING_SAFETY",
    },
    include: ticketInclude,
  });

  await writeAudit({ actorId: req.user.id, action: "TICKET_CREATED", entity: "Ticket", entityId: ticket.id, details: { ticketNumber: ticket.ticketNumber } });
  await createNotification({
    targetRole: "SAFETY",
    ticketId: ticket.id,
    type: "TICKET_PENDING_SAFETY",
    message: `New loading ticket ${ticket.ticketNumber} (${truck.plateNumber}) awaiting safety inspection.`,
  });
  res.status(201).json(ticket);
});

// Safety officer inspects: submit checklist + approve/reject.
router.post("/:id/inspect", requireRole("SAFETY", "ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const { checklist, result, remarks } = req.body || {};
  if (!["APPROVED", "REJECTED"].includes(result)) {
    return res.status(400).json({ error: "result must be APPROVED or REJECTED" });
  }
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { truck: true } });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (ticket.status !== "PENDING_SAFETY") {
    return res.status(409).json({ error: `Ticket is not awaiting inspection (status: ${ticket.status})` });
  }

  const newStatus = result === "APPROVED" ? "SAFETY_APPROVED" : "SAFETY_REJECTED";
  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: newStatus,
      inspection: {
        create: {
          inspectorId: req.user.id,
          checklist: checklist ?? [],
          result,
          remarks,
        },
      },
    },
    include: ticketInclude,
  });

  await writeAudit({ actorId: req.user.id, action: `SAFETY_${result}`, entity: "Ticket", entityId: id, details: { remarks } });
  if (result === "APPROVED") {
    await createNotification({ targetRole: "DISPATCH", ticketId: id, type: "TICKET_APPROVED", message: `Ticket ${ticket.ticketNumber} approved by safety — ready for dispatch.` });
  } else {
    await createNotification({ targetUserId: ticket.createdById, ticketId: id, type: "TICKET_REJECTED", message: `Ticket ${ticket.ticketNumber} was rejected by safety. ${remarks || ""}`.trim() });
  }
  res.json(updated);
});

// Dispatch generates a waybill after loading. Overload auto-detected vs truck capacity.
router.post("/:id/waybill", requireRole("DISPATCH", "ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const { loadedQtyTons } = req.body || {};
  if (loadedQtyTons == null) return res.status(400).json({ error: "loadedQtyTons required" });

  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { truck: true, waybill: true } });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (ticket.status !== "SAFETY_APPROVED") {
    return res.status(409).json({ error: `Ticket must be safety-approved to dispatch (status: ${ticket.status})` });
  }
  if (ticket.waybill) return res.status(409).json({ error: "Waybill already exists" });

  const loaded = Number(loadedQtyTons);
  const overload = loaded > ticket.truck.capacityTons;
  const overloadStatus = overload ? "PENDING" : "NONE";
  const newStatus = overload ? "OVERLOAD_PENDING" : "WAYBILL_GENERATED";

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status: newStatus,
      waybill: {
        create: {
          waybillNumber: await nextWaybillNumber(),
          dispatchedById: req.user.id,
          loadedQtyTons: loaded,
          overload,
          overloadStatus,
        },
      },
    },
    include: ticketInclude,
  });

  await writeAudit({ actorId: req.user.id, action: "WAYBILL_GENERATED", entity: "Ticket", entityId: id, details: { loaded, overload } });
  if (overload) {
    await createNotification({ targetRole: "ADMIN", ticketId: id, type: "OVERLOAD_PENDING", message: `Overload on ${ticket.ticketNumber}: loaded ${loaded}t vs capacity ${ticket.truck.capacityTons}t — needs admin approval.` });
  } else {
    await createNotification({ targetRole: "GATE", ticketId: id, type: "READY_FOR_GATE", message: `Waybill issued for ${ticket.ticketNumber} (${ticket.truck.plateNumber}) — ready for gate clearance.` });
  }
  res.json(updated);
});

async function streamPdf(req, res, kind) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(req.params.id) },
    include: ticketInclude,
  });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (kind === "waybill" && !ticket.waybill) {
    return res.status(409).json({ error: "No waybill generated yet" });
  }
  const filename = kind === "waybill" ? `${ticket.waybill.waybillNumber}.pdf` : `${ticket.ticketNumber}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  if (kind === "waybill") buildWaybillPdf(ticket, res);
  else buildTicketPdf(ticket, res);
}

router.get("/:id/ticket.pdf", (req, res) => streamPdf(req, res, "ticket"));
router.get("/:id/waybill.pdf", (req, res) => streamPdf(req, res, "waybill"));

export default router;
