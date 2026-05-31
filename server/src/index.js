import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import staffRoutes from "./routes/staff.js";
import marketerRoutes from "./routes/marketers.js";
import truckRoutes from "./routes/trucks.js";
import ticketRoutes from "./routes/tickets.js";
import overloadRoutes from "./routes/overloads.js";
import gateRoutes from "./routes/gate.js";
import notificationRoutes from "./routes/notifications.js";
import auditRoutes from "./routes/audit.js";
import statsRoutes from "./routes/stats.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "DOMS API" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/marketers", marketerRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/overloads", overloadRoutes);
app.use("/api/gate", gateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/stats", statsRoutes);

// Fallback error handler — async route errors land here (via express-async-errors).
app.use((err, _req, res, _next) => {
  const code = err?.code || err?.name || "";
  const dbDown =
    code === "P1001" || // Prisma: can't reach database server
    code === "P1002" || // Prisma: timed out
    code === "PrismaClientInitializationError" ||
    /reach database server/i.test(err?.message || "");
  if (dbDown) {
    console.error("Database unavailable:", err.message?.split("\n")[0]);
    return res.status(503).json({ error: "Database is waking up, please retry in a moment." });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`DOMS API running on http://localhost:${PORT}`);
});

// Last-resort guards so a transient DB/network blip never takes the server down.
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e?.message || e));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e?.message || e));
