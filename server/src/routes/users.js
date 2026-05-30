import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { writeAudit } from "../lib/audit.js";

const router = Router();
const ROLES = ["LOGISTICS", "SAFETY", "DISPATCH", "GATE", "ADMIN", "DRIVER"];

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
    hasPin: !!u.pinHash,
    createdAt: u.createdAt,
  };
}

router.use(authenticate, requireRole("ADMIN"));

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  res.json(users.map(publicUser));
});

router.post("/", async (req, res) => {
  const { name, email, password, role, pin } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password, role required" });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return res.status(409).json({ error: "Email already in use" });

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role,
      pinHash: pin ? await bcrypt.hash(String(pin), 10) : null,
    },
  });
  await writeAudit({ actorId: req.user.id, action: "USER_CREATED", entity: "User", entityId: user.id, details: { email: user.email, role } });
  res.status(201).json(publicUser(user));
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, role, active, password, pin } = req.body || {};
  const data = {};
  if (name != null) data.name = name;
  if (role != null) {
    if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });
    data.role = role;
  }
  if (active != null) data.active = !!active;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  if (pin !== undefined) data.pinHash = pin ? await bcrypt.hash(String(pin), 10) : null;

  try {
    const user = await prisma.user.update({ where: { id }, data });
    await writeAudit({ actorId: req.user.id, action: "USER_UPDATED", entity: "User", entityId: id, details: Object.keys(data) });
    res.json(publicUser(user));
  } catch {
    res.status(404).json({ error: "User not found" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: "Cannot deactivate yourself" });
  try {
    const user = await prisma.user.update({ where: { id }, data: { active: false } });
    await writeAudit({ actorId: req.user.id, action: "USER_DEACTIVATED", entity: "User", entityId: id });
    res.json(publicUser(user));
  } catch {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
