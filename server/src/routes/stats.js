import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Start date for a chart period filter. null = all time.
function periodStart(period) {
  const now = new Date();
  if (period === "daily") return new Date(new Date().setHours(0, 0, 0, 0));
  if (period === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === "monthly") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  return null;
}

// Headline metrics + status counts for the dashboard cards.
router.get("/", async (_req, res) => {
  const grouped = await prisma.ticket.groupBy({ by: ["status"], _count: { _all: true } });
  const byStatus = {};
  for (const g of grouped) byStatus[g.status] = g._count._all;

  const [totalTickets, totalTrucks, totalWaybills, pendingOverloads, clearedToday, latest, approvedForLoading] =
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
      prisma.ticket.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
      prisma.ticket.count({ where: { status: { notIn: ["PENDING_SAFETY", "SAFETY_REJECTED"] } } }),
    ]);

  res.json({
    byStatus,
    totals: { totalTickets, totalTrucks, totalWaybills, pendingOverloads, clearedToday },
    metrics: {
      generatedTickets: totalTickets,
      pendingTickets: byStatus.PENDING_SAFETY || 0,
      approvedForLoading,
      trucksDispatched: totalWaybills,
      lastGeneratedAt: latest?.createdAt || null,
    },
  });
});

// Per-marketer chart data, filterable by product and period.
// Marketer == ticket.customer. trucks = ticket count, quantity = tons loaded.
router.get("/marketers", async (req, res) => {
  const { product, period } = req.query;

  const where = {};
  if (product) where.product = product;
  const start = periodStart(period);
  if (start) where.createdAt = { gte: start };

  const [tickets, productGroups] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: { customer: true, waybill: { select: { loadedQtyTons: true } } },
    }),
    prisma.ticket.groupBy({ by: ["product"] }),
  ]);

  const map = new Map();
  for (const t of tickets) {
    const name = t.customer || "Unknown";
    const e = map.get(name) || { name, trucks: 0, quantity: 0 };
    e.trucks += 1;
    if (t.waybill) e.quantity += t.waybill.loadedQtyTons || 0;
    map.set(name, e);
  }
  const perMarketer = [...map.values()].sort((a, b) => b.trucks - a.trucks);
  const products = productGroups.map((g) => g.product).filter(Boolean).sort();

  res.json({ products, perMarketer });
});

export default router;
