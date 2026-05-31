import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

const TYPE_LABEL = { INTERNAL: "Internal", MARKETER: "Marketer", INDUSTRIAL: "Industrial" };
const shortProduct = (p = "") => p.split(" ")[0];

const STATUS_GROUPS = {
  Completed: ["GATE_CLEARED"],
  Pending: ["PENDING_SAFETY", "SAFETY_APPROVED", "WAYBILL_GENERATED", "OVERLOAD_PENDING", "OVERLOAD_APPROVED"],
  Failed: ["SAFETY_REJECTED", "OVERLOAD_REJECTED"],
};
const SORTS = {
  date_desc: { createdAt: "desc" },
  date_asc: { createdAt: "asc" },
  qty_desc: { requestedQtyTons: "desc" },
  qty_asc: { requestedQtyTons: "asc" },
  customer_asc: { customer: "asc" },
};

function periodStart(period) {
  const now = new Date();
  if (period === "today") return new Date(new Date().setHours(0, 0, 0, 0));
  if (period === "week") { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
  if (period === "month") { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
  return null;
}

// Activity report: headline totals + a detailed loads table (filterable).
router.get("/activity", async (req, res) => {
  const { tab = "all", q = "", period = "all", sort = "date_desc", status, product } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 10);

  // Reports cover trucks that actually loaded (have a waybill) — "Loaded trucks".
  const where = { AND: [{ waybill: { isNot: null } }] };
  if (tab && tab !== "all") where.AND.push({ truck: { truckType: tab.toUpperCase() } });
  const start = periodStart(period);
  if (start) where.AND.push({ createdAt: { gte: start } });
  if (status && STATUS_GROUPS[status]) where.AND.push({ status: { in: STATUS_GROUPS[status] } });
  if (product) where.AND.push({ product: { contains: product, mode: "insensitive" } });
  if (q) {
    where.AND.push({
      OR: [
        { customer: { contains: q, mode: "insensitive" } },
        { destination: { contains: q, mode: "insensitive" } },
        { product: { contains: q, mode: "insensitive" } },
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { truck: { plateNumber: { contains: q, mode: "insensitive" } } },
      ],
    });
  }

  // Summary over the whole filtered set.
  const summaryRows = await prisma.ticket.findMany({
    where,
    select: { requestedQtyTons: true, createdAt: true, waybill: { select: { loadedQtyTons: true } } },
  });
  const requested = summaryRows.reduce((s, t) => s + t.requestedQtyTons, 0);
  const loaded = summaryRows.reduce((s, t) => s + (t.waybill?.loadedQtyTons || 0), 0);
  const lastGeneratedAt = summaryRows.reduce((m, t) => (t.createdAt > m ? t.createdAt : m), new Date(0));

  const [total, rows] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      include: {
        truck: true,
        waybill: { select: { waybillNumber: true, loadedQtyTons: true } },
        gateClearance: { select: { exitedAt: true } },
      },
      orderBy: SORTS[sort] || SORTS.date_desc,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({
    summary: {
      requested,
      loaded,
      variance: loaded - requested,
      lastGeneratedAt: summaryRows.length ? lastGeneratedAt : null,
    },
    page,
    pageSize,
    total,
    rows: rows.map((t) => ({
      id: t.id,
      loadingTicketId: t.ticketNumber,
      waybillId: t.waybill?.waybillNumber || null,
      customer: t.customer,
      truckType: TYPE_LABEL[t.truck.truckType] || t.truck.truckType,
      truckNumber: t.truck.plateNumber,
      product: shortProduct(t.product),
      requested: t.requestedQtyTons,
      loaded: t.waybill?.loadedQtyTons ?? null,
      destination: t.destination,
      timeIn: t.createdAt,
      timeOut: t.gateClearance?.exitedAt || null,
    })),
  });
});

export default router;
