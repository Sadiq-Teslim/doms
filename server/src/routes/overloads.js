import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { writeAudit } from "../lib/audit.js";
import { createNotification } from "../lib/notify.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

// List waybills with a pending overload (admin review queue).
router.get("/pending", async (_req, res) => {
  const waybills = await prisma.waybill.findMany({
    where: { overloadStatus: "PENDING" },
    include: {
      dispatchedBy: { select: { id: true, name: true } },
      ticket: { include: { truck: true } },
    },
    orderBy: { id: "asc" },
  });
  res.json(waybills);
});

// Admin approves or rejects an overload request.
router.post("/:waybillId/review", async (req, res) => {
  const waybillId = Number(req.params.waybillId);
  const { decision, reason } = req.body || {};
  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return res.status(400).json({ error: "decision must be APPROVED or REJECTED" });
  }
  const waybill = await prisma.waybill.findUnique({ where: { id: waybillId }, include: { ticket: { include: { truck: true } } } });
  if (!waybill) return res.status(404).json({ error: "Waybill not found" });
  if (waybill.overloadStatus !== "PENDING") {
    return res.status(409).json({ error: "Overload is not pending review" });
  }

  const newTicketStatus = decision === "APPROVED" ? "OVERLOAD_APPROVED" : "OVERLOAD_REJECTED";

  await prisma.$transaction([
    prisma.waybill.update({ where: { id: waybillId }, data: { overloadStatus: decision } }),
    prisma.overloadReview.create({ data: { waybillId, reviewedById: req.user.id, decision, reason } }),
    prisma.ticket.update({ where: { id: waybill.ticketId }, data: { status: newTicketStatus } }),
  ]);

  await writeAudit({ actorId: req.user.id, action: `OVERLOAD_${decision}`, entity: "Waybill", entityId: waybillId, details: { reason } });

  if (decision === "APPROVED") {
    await createNotification({ targetRole: "GATE", ticketId: waybill.ticketId, type: "READY_FOR_GATE", message: `Overload approved for ${waybill.ticket.ticketNumber} — ready for gate clearance.` });
  }
  await createNotification({ targetUserId: waybill.dispatchedById, ticketId: waybill.ticketId, type: `OVERLOAD_${decision}`, message: `Overload for ${waybill.ticket.ticketNumber} was ${decision.toLowerCase()}. ${reason || ""}`.trim() });

  const updated = await prisma.ticket.findUnique({
    where: { id: waybill.ticketId },
    include: { truck: true, waybill: { include: { overloadReview: true } } },
  });
  res.json(updated);
});

export default router;
