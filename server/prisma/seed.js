import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "password123";
const GATE_PIN = "1234";

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
let seq = 0;
const tkt = () => `TKT-${dateStamp()}-${String(++seq).padStart(4, "0")}`;
let wseq = 0;
const wbn = () => `WB-${dateStamp()}-${String(++wseq).padStart(4, "0")}`;

async function reset() {
  // Clear in dependency order for a clean, professional starting state.
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.gateClearance.deleteMany();
  await prisma.overloadReview.deleteMany();
  await prisma.waybill.deleteMany();
  await prisma.safetyInspection.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Preparing depot data…");
  await reset();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const pinHash = await bcrypt.hash(GATE_PIN, 10);

  const people = [
    { name: "Adebayo Okonkwo", email: "logistics@apexdepot.com", role: "LOGISTICS" },
    { name: "Chioma Eze", email: "safety@apexdepot.com", role: "SAFETY" },
    { name: "Ibrahim Lawal", email: "dispatch@apexdepot.com", role: "DISPATCH" },
    { name: "Emeka Nwosu", email: "gate@apexdepot.com", role: "GATE", pinHash },
    { name: "Funmilayo Adeyemi", email: "admin@apexdepot.com", role: "ADMIN", pinHash },
    { name: "Sani Abubakar", email: "driver@apexdepot.com", role: "DRIVER" },
  ];

  const U = {};
  for (const p of people) {
    const u = await prisma.user.create({
      data: { name: p.name, email: p.email, role: p.role, passwordHash, pinHash: p.pinHash ?? null },
    });
    U[p.role] = u;
  }

  const trucksData = [
    { plateNumber: "LSR-482-XA", driverName: "Musa Bello", driverPhone: "08031234501", transporter: "Swift Haulage Ltd", defaultProduct: "PMS (Petrol)", capacityTons: 33 },
    { plateNumber: "AGL-913-KB", driverName: "Tunde Bakare", driverPhone: "08031234502", transporter: "Northern Lines", defaultProduct: "AGO (Diesel)", capacityTons: 45 },
    { plateNumber: "KJA-205-CD", driverName: "Peter Obiora", driverPhone: "08031234503", transporter: "Delta Movers", defaultProduct: "DPK (Kerosene)", capacityTons: 30 },
    { plateNumber: "FST-770-LG", driverName: "Yusuf Danjuma", driverPhone: "08031234504", transporter: "Apex Fleet", defaultProduct: "PMS (Petrol)", capacityTons: 40 },
  ];
  const T = {};
  for (const t of trucksData) T[t.plateNumber] = await prisma.truck.create({ data: t });

  const goodChecklist = [
    { item: "Fire extinguisher present & charged", ok: true },
    { item: "No fuel/oil leaks observed", ok: true },
    { item: "Tyres in good condition", ok: true },
    { item: "Brake lights & indicators working", ok: true },
    { item: "Driver has valid license & PPE", ok: true },
  ];

  // 1) Fresh ticket awaiting safety
  const t1 = await prisma.ticket.create({
    data: { ticketNumber: tkt(), truckId: T["LSR-482-XA"].id, product: "PMS (Petrol)", requestedQtyTons: 30, destination: "Ibadan Terminal", customer: "Ardova Plc", createdById: U.LOGISTICS.id, status: "PENDING_SAFETY" },
  });

  // 2) Safety-approved, ready for dispatch
  const t2 = await prisma.ticket.create({
    data: {
      ticketNumber: tkt(), truckId: T["AGL-913-KB"].id, product: "AGO (Diesel)", requestedQtyTons: 42, destination: "Abuja Depot", customer: "Mobil", createdById: U.LOGISTICS.id, status: "SAFETY_APPROVED",
      inspection: { create: { inspectorId: U.SAFETY.id, checklist: goodChecklist, result: "APPROVED", remarks: "All checks passed." } },
    },
  });

  // 3) Waybill generated (within capacity), ready for gate
  const t3 = await prisma.ticket.create({
    data: {
      ticketNumber: tkt(), truckId: T["KJA-205-CD"].id, product: "DPK (Kerosene)", requestedQtyTons: 28, destination: "Ilorin", customer: "Conoil", createdById: U.LOGISTICS.id, status: "WAYBILL_GENERATED",
      inspection: { create: { inspectorId: U.SAFETY.id, checklist: goodChecklist, result: "APPROVED", remarks: "Cleared." } },
      waybill: { create: { waybillNumber: wbn(), dispatchedById: U.DISPATCH.id, loadedQtyTons: 29, overload: false, overloadStatus: "NONE" } },
    },
  });

  // 4) Overload pending admin review
  const t4 = await prisma.ticket.create({
    data: {
      ticketNumber: tkt(), truckId: T["KJA-205-CD"].id, product: "PMS (Petrol)", requestedQtyTons: 30, destination: "Lagos Island", customer: "NIPCO", createdById: U.LOGISTICS.id, status: "OVERLOAD_PENDING",
      inspection: { create: { inspectorId: U.SAFETY.id, checklist: goodChecklist, result: "APPROVED", remarks: "Cleared." } },
      waybill: { create: { waybillNumber: wbn(), dispatchedById: U.DISPATCH.id, loadedQtyTons: 34, overload: true, overloadStatus: "PENDING" } },
    },
  });

  // 5) Completed — gate cleared / exited
  const t5 = await prisma.ticket.create({
    data: {
      ticketNumber: tkt(), truckId: T["FST-770-LG"].id, product: "PMS (Petrol)", requestedQtyTons: 38, destination: "Benin City", customer: "Total Energies", createdById: U.LOGISTICS.id, status: "GATE_CLEARED",
      inspection: { create: { inspectorId: U.SAFETY.id, checklist: goodChecklist, result: "APPROVED", remarks: "Cleared." } },
      waybill: { create: { waybillNumber: wbn(), dispatchedById: U.DISPATCH.id, loadedQtyTons: 38, overload: false, overloadStatus: "NONE" } },
      gateClearance: { create: { clearedById: U.GATE.id, notes: "Documents verified. Exited 14:22." } },
    },
  });

  // 6) Rejected by safety
  const t6 = await prisma.ticket.create({
    data: {
      ticketNumber: tkt(), truckId: T["LSR-482-XA"].id, product: "AGO (Diesel)", requestedQtyTons: 20, destination: "Jos", customer: "Oando", createdById: U.LOGISTICS.id, status: "SAFETY_REJECTED",
      inspection: { create: { inspectorId: U.SAFETY.id, checklist: [...goodChecklist.slice(0, 3), { item: "Driver has valid license & PPE", ok: false, note: "License expired" }], result: "REJECTED", remarks: "Driver license expired — load held." } },
    },
  });

  await prisma.notification.createMany({
    data: [
      { targetRole: "SAFETY", ticketId: t1.id, type: "TICKET_PENDING_SAFETY", message: `New loading ticket ${t1.ticketNumber} (${T["LSR-482-XA"].plateNumber}) awaiting safety inspection.` },
      { targetRole: "DISPATCH", ticketId: t2.id, type: "TICKET_APPROVED", message: `Ticket ${t2.ticketNumber} approved by safety — ready for dispatch.` },
      { targetRole: "GATE", ticketId: t3.id, type: "READY_FOR_GATE", message: `Waybill issued for ${t3.ticketNumber} (${T["KJA-205-CD"].plateNumber}) — ready for gate clearance.` },
      { targetRole: "ADMIN", ticketId: t4.id, type: "OVERLOAD_PENDING", message: `Overload on ${t4.ticketNumber}: loaded 34t vs capacity 30t — needs admin approval.` },
      { targetRole: "ADMIN", ticketId: t5.id, type: "GATE_CLEARED", message: `Truck ${T["FST-770-LG"].plateNumber} (${t5.ticketNumber}) cleared the gate and exited.` },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      { actorId: U.LOGISTICS.id, action: "TICKET_CREATED", entity: "Ticket", entityId: String(t1.id) },
      { actorId: U.LOGISTICS.id, action: "TICKET_CREATED", entity: "Ticket", entityId: String(t2.id) },
      { actorId: U.SAFETY.id, action: "SAFETY_APPROVED", entity: "Ticket", entityId: String(t2.id) },
      { actorId: U.DISPATCH.id, action: "WAYBILL_GENERATED", entity: "Ticket", entityId: String(t3.id) },
      { actorId: U.DISPATCH.id, action: "WAYBILL_GENERATED", entity: "Ticket", entityId: String(t4.id), details: { overload: true } },
      { actorId: U.GATE.id, action: "GATE_CLEARED", entity: "Ticket", entityId: String(t5.id) },
      { actorId: U.SAFETY.id, action: "SAFETY_REJECTED", entity: "Ticket", entityId: String(t6.id) },
    ],
  });

  console.log("Done.");
  console.log(`  Users : ${people.length}  ·  Trucks : ${trucksData.length}  ·  Tickets : 6`);
  console.log(`  Sign-in password: ${PASSWORD}  ·  Gate PIN: ${GATE_PIN}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
