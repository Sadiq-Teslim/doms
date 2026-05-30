import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Notifications targeted at the current user or their role.
router.get("/", async (req, res) => {
  const notes = await prisma.notification.findMany({
    where: {
      OR: [{ targetUserId: req.user.id }, { targetRole: req.user.role }],
    },
    orderBy: { id: "desc" },
    take: 50,
  });
  res.json(notes);
});

router.post("/:id/read", async (req, res) => {
  const id = Number(req.params.id);
  const note = await prisma.notification.findUnique({ where: { id } });
  if (!note) return res.status(404).json({ error: "Not found" });
  if (note.targetUserId !== req.user.id && note.targetRole !== req.user.role) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
  res.json(updated);
});

router.post("/read-all", async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      read: false,
      OR: [{ targetUserId: req.user.id }, { targetRole: req.user.role }],
    },
    data: { read: true },
  });
  res.json({ ok: true });
});

export default router;
