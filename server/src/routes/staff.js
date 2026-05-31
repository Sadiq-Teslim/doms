import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

const SORTS = {
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  department_asc: { department: "asc" },
  terminal_asc: { terminal: "asc" },
};

// Staff directory list — search, sort, department/terminal filters, pagination.
router.get("/", async (req, res) => {
  const { q = "", sort = "name_asc", department, terminal } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 12);

  const where = { AND: [] };
  if (department) where.AND.push({ department });
  if (terminal) where.AND.push({ terminal });
  if (q) {
    where.AND.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
        { role: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const [total, rows, deptGroups] = await Promise.all([
    prisma.staff.count({ where }),
    prisma.staff.findMany({
      where,
      orderBy: SORTS[sort] || SORTS.name_asc,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.staff.groupBy({ by: ["department"] }),
  ]);

  res.json({
    page,
    pageSize,
    total,
    departments: deptGroups.map((g) => g.department).sort(),
    rows,
  });
});

export default router;
