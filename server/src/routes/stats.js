import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Dashboard counts by ticket status + a few totals.
router.get("/", async (_req, res) => {
  const grouped = await prisma.ticket.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const byStatus = {};
  for (const g of grouped) byStatus[g.status] = g._count._all;

  const [totalTickets, totalTrucks, totalWaybills, pendingOverloads, clearedToday] =
    await Promise.all([
      prisma.ticket.count(),
      prisma.truck.count(),
      prisma.waybill.count(),
      prisma.waybill.count({ where: { overloadStatus: "PENDING" } }),
      prisma.ticket.count({
        where: {
          status: "GATE_CLEARED",
          gateClearance: { exitedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        },
      }),
    ]);

  res.json({
    byStatus,
    totals: { totalTickets, totalTrucks, totalWaybills, pendingOverloads, clearedToday },
  });
});

export default router;
