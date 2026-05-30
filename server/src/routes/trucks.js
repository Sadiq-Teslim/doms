import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { writeAudit } from "../lib/audit.js";

const router = Router();

router.use(authenticate);

// List trucks; optional ?plate= for autofill lookup (any authenticated user).
router.get("/", async (req, res) => {
  const { plate } = req.query;
  if (plate) {
    const truck = await prisma.truck.findUnique({
      where: { plateNumber: String(plate).toUpperCase() },
    });
    return res.json(truck ? [truck] : []);
  }
  const trucks = await prisma.truck.findMany({ orderBy: { plateNumber: "asc" } });
  res.json(trucks);
});

router.post("/", requireRole("LOGISTICS", "ADMIN"), async (req, res) => {
  const { plateNumber, driverName, driverPhone, transporter, defaultProduct, capacityTons } = req.body || {};
  if (!plateNumber || !driverName || capacityTons == null) {
    return res.status(400).json({ error: "plateNumber, driverName, capacityTons required" });
  }
  const exists = await prisma.truck.findUnique({ where: { plateNumber: plateNumber.toUpperCase() } });
  if (exists) return res.status(409).json({ error: "Truck already exists" });

  const truck = await prisma.truck.create({
    data: {
      plateNumber: plateNumber.toUpperCase(),
      driverName,
      driverPhone,
      transporter,
      defaultProduct,
      capacityTons: Number(capacityTons),
    },
  });
  await writeAudit({ actorId: req.user.id, action: "TRUCK_CREATED", entity: "Truck", entityId: truck.id, details: { plate: truck.plateNumber } });
  res.status(201).json(truck);
});

router.patch("/:id", requireRole("LOGISTICS", "ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const { driverName, driverPhone, transporter, defaultProduct, capacityTons } = req.body || {};
  const data = {};
  if (driverName != null) data.driverName = driverName;
  if (driverPhone !== undefined) data.driverPhone = driverPhone;
  if (transporter !== undefined) data.transporter = transporter;
  if (defaultProduct !== undefined) data.defaultProduct = defaultProduct;
  if (capacityTons != null) data.capacityTons = Number(capacityTons);
  try {
    const truck = await prisma.truck.update({ where: { id }, data });
    await writeAudit({ actorId: req.user.id, action: "TRUCK_UPDATED", entity: "Truck", entityId: id });
    res.json(truck);
  } catch {
    res.status(404).json({ error: "Truck not found" });
  }
});

export default router;
