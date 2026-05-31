import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { signToken, authenticate } from "../middleware/auth.js";
import { writeAudit } from "../lib/audit.js";

const router = Router();

// Department label (from sign-up UI) -> Role.
const DEPARTMENT_ROLES = {
  Dispatch: "DISPATCH",
  Logistics: "LOGISTICS",
  Safety: "SAFETY",
  Admin: "ADMIN",
  Security: "GATE",
};

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, username: u.username, role: u.role, active: u.active };
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const identifier = (email || "").trim();
  if (!identifier || !password) {
    return res.status(400).json({ error: "Username/email and password required" });
  }
  // The field accepts either a username or an email address.
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier }] },
  });
  if (!user || !user.active) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.post("/register", async (req, res) => {
  const { fullName, email, department, username, password } = req.body || {};
  const name = (fullName || "").trim();
  const mail = (email || "").trim().toLowerCase();
  const uname = (username || "").trim();

  if (!name || !mail || !department || !uname || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const role = DEPARTMENT_ROLES[department];
  if (!role) return res.status(400).json({ error: "Invalid department" });
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const clash = await prisma.user.findFirst({
    where: { OR: [{ email: mail }, { username: uname }] },
  });
  if (clash) {
    const field = clash.email === mail ? "Email" : "Username";
    return res.status(409).json({ error: `${field} is already taken` });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: mail, username: uname, role, passwordHash },
  });
  await writeAudit({ actorId: user.id, action: "USER_REGISTERED", entity: "User", entityId: String(user.id), details: { role, department } });

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
