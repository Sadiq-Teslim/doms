import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

const SORTS = {
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  rep_asc: { representative: "asc" },
};

// Marketers' Records — search, sort, pagination.
router.get("/", async (req, res) => {
  const { q = "", sort = "name_asc" } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 12);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { representative: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const [total, rows] = await Promise.all([
    prisma.marketer.count({ where }),
    prisma.marketer.findMany({
      where,
      orderBy: SORTS[sort] || SORTS.name_asc,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({ page, pageSize, total, rows });
});

export default router;
