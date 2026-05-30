import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { signToken, authenticate } from "../middleware/auth.js";

const router = Router();

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active };
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.active) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
