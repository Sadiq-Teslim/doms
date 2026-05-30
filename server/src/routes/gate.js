import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { writeAudit } from "../lib/audit.js";
import { createNotification } from "../lib/notify.js";

const router = Router();

router.use(authenticate, requireRole("GATE", "ADMIN"));

const CLEARABLE = ["WAYBILL_GENERATED", "OVERLOAD_APPROVED"];

// Trucks ready for gate clearance.
router.get("/queue", async (_req, res) => {
  const tickets = await prisma.ticket.findMany({
    where: { status: { in: CLEARABLE } },
    include: { truck: true, waybill: true },
    orderBy: { id: "asc" },
  });
  res.json(tickets);
});

// Gate officer clears a truck for exit using their PIN.
router.post("/:ticketId/clear", async (req, res) => {
  const ticketId = Number(req.params.ticketId);
  const { pin, notes } = req.body || {};
  if (!pin) return res.status(400).json({ error: "PIN required" });

  if (!req.user.pinHash) {
    return res.status(403).json({ error: "No PIN configured for your account" });
  }
  const pinOk = await bcrypt.compare(String(pin), req.user.pinHash);
  if (!pinOk) {
    await writeAudit({ actorId: req.user.id, action: "GATE_PIN_FAILED", entity: "Ticket", entityId: ticketId });
    return res.status(401).json({ error: "Invalid PIN" });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (!CLEARABLE.includes(ticket.status)) {
    return res.status(409).json({ error: `Truck not ready for exit (status: ${ticket.status})` });
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "GATE_CLEARED",
      gateClearance: { create: { clearedById: req.user.id, notes } },
    },
    include: { truck: true, waybill: true, gateClearance: { include: { clearedBy: { select: { id: true, name: true } } } } },
  });

  await writeAudit({ actorId: req.user.id, action: "GATE_CLEARED", entity: "Ticket", entityId: ticketId });
  await createNotification({ targetRole: "ADMIN", ticketId, type: "GATE_CLEARED", message: `Truck ${updated.truck.plateNumber} (${ticket.ticketNumber}) cleared the gate and exited.` });
  res.json(updated);
});

export default router;
