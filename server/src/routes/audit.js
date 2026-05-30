import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/", async (req, res) => {
  const take = Math.min(Number(req.query.take) || 100, 500);
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { id: true, name: true, role: true } } },
    orderBy: { id: "desc" },
    take,
  });
  res.json(logs);
});

export default router;
