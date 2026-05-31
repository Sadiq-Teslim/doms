import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

const TYPE_LABEL = { INTERNAL: "Internal", MARKETER: "Marketer", INDUSTRIAL: "Industrial" };
const shortProduct = (p = "") => p.split(" ")[0];

function loadStatus(s) {
  if (s === "GATE_CLEARED") return "Completed";
  if (s === "SAFETY_REJECTED" || s === "OVERLOAD_REJECTED") return "Failed";
  return "Pending";
}

function periodStart(period) {
  const now = new Date();
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  return null;
}

// Raw action log (kept for completeness).
router.get("/", async (req, res) => {
  const take = Math.min(Number(req.query.take) || 100, 500);
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { id: true, name: true, role: true } } },
    orderBy: { id: "desc" },
    take,
  });
  res.json(logs);
});

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

// Loading-activity list (the Audit Log table).
router.get("/loads", async (req, res) => {
  const { tab = "all", q = "", period = "all", year, sort = "date_desc", status, product } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 10);

  const where = { AND: [] };
  if (tab && tab !== "all") where.AND.push({ truck: { truckType: tab.toUpperCase() } });
  const start = periodStart(period);
  if (start) where.AND.push({ createdAt: { gte: start } });
  if (year) {
    const y = Number(year);
    where.AND.push({ createdAt: { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) } });
  }
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

  const [total, rows] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      include: { truck: true, waybill: { select: { loadedQtyTons: true } } },
      orderBy: SORTS[sort] || SORTS.date_desc,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({
    page,
    pageSize,
    total,
    rows: rows.map((t) => ({
      id: t.id,
      customer: t.customer,
      truckType: TYPE_LABEL[t.truck.truckType] || t.truck.truckType,
      truckNumber: t.truck.plateNumber,
      product: shortProduct(t.product),
      quantity: t.waybill ? t.waybill.loadedQtyTons : t.requestedQtyTons,
      destination: t.destination,
      status: loadStatus(t.status),
    })),
  });
});

// Single load detail.
router.get("/loads/:id", async (req, res) => {
  const id = Number(req.params.id);
  const t = await prisma.ticket.findUnique({
    where: { id },
    include: {
      truck: true,
      createdBy: { select: { name: true } },
      inspection: { include: { inspector: { select: { name: true } } } },
      waybill: { include: { dispatchedBy: { select: { name: true } }, overloadReview: { include: { reviewedBy: { select: { name: true } } } } } },
      gateClearance: { include: { clearedBy: { select: { name: true } } } },
    },
  });
  if (!t) return res.status(404).json({ error: "Not found" });

  const requested = t.requestedQtyTons;
  const actual = t.waybill ? t.waybill.loadedQtyTons : null;
  const variance = actual != null ? actual - requested : null;
  const overloaded = !!t.waybill?.overload;
  const status = loadStatus(t.status);

  let reason = null;
  if (status === "Failed") reason = t.inspection?.remarks || "Load did not pass clearance.";
  else if (t.status === "OVERLOAD_PENDING") reason = "Awaiting approval from admin due to overloading.";

  res.json({
    id: t.id,
    title: `${t.truck.plateNumber} — ${new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} | ${t.terminal}`,
    status,
    reason,
    truck: {
      type: TYPE_LABEL[t.truck.truckType] || t.truck.truckType,
      number: t.truck.plateNumber,
      product: shortProduct(t.product),
      capacity: t.truck.capacityTons,
    },
    loadingSummary: { requested, actual, variance, overloaded, withinLimit: actual != null && !overloaded },
    ticketDetails: { loadingTicketId: t.ticketNumber, waybillId: t.waybill?.waybillNumber || null },
    timeline: {
      loadingTicketCreated: t.createdAt,
      safety: t.inspection?.inspectedAt || null,
      waybillCreated: t.waybill?.createdAt || null,
      gateCleared: t.gateClearance?.exitedAt || null,
    },
    staff: {
      logistics: t.createdBy?.name || null,
      safety: t.inspection?.inspector?.name || null,
      dispatch: t.waybill?.dispatchedBy?.name || null,
      gate: t.gateClearance?.clearedBy?.name || null,
    },
    overloadApprovedBy: t.waybill?.overloadReview?.reviewedBy?.name || null,
  });
});

export default router;
