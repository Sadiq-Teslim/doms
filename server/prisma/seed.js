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
  await prisma.marketer.deleteMany();
  await prisma.staff.deleteMany();
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

const goodChecklist = [
  { item: "Fire extinguisher present & charged", ok: true },
  { item: "No fuel/oil leaks observed", ok: true },
  { item: "Tyres in good condition", ok: true },
  { item: "Brake lights & indicators working", ok: true },
  { item: "Driver has valid license & PPE", ok: true },
];
const badChecklist = [
  { item: "Fire extinguisher present & charged", ok: true },
  { item: "No fuel/oil leaks observed", ok: false, note: "Minor diesel seep at valve" },
  { item: "Tyres in good condition", ok: true },
  { item: "Driver has valid license & PPE", ok: false, note: "License expired" },
];

async function main() {
  console.log("Preparing depot data…");
  await reset();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const pinHash = await bcrypt.hash(GATE_PIN, 10);

  const people = [
    { name: "Adebayo Okonkwo", email: "logistics@apexdepot.com", username: "adebayo", role: "LOGISTICS" },
    { name: "Chioma Eze", email: "safety@apexdepot.com", username: "chioma", role: "SAFETY" },
    { name: "Ibrahim Lawal", email: "dispatch@apexdepot.com", username: "ibrahim", role: "DISPATCH" },
    { name: "Emeka Nwosu", email: "gate@apexdepot.com", username: "emeka", role: "GATE", pinHash },
    { name: "Olayinka Fagboore", email: "admin@apexdepot.com", username: "olayinka", role: "ADMIN", pinHash },
    { name: "Sani Abubakar", email: "driver@apexdepot.com", username: "sani", role: "DRIVER" },
  ];
  const U = {};
  for (const p of people) {
    U[p.role] = await prisma.user.create({
      data: { name: p.name, email: p.email, username: p.username, role: p.role, passwordHash, pinHash: p.pinHash ?? null },
    });
  }

  // capacityTons holds litres (legacy column name). truckType: INTERNAL | MARKETER | INDUSTRIAL.
  const trucksData = [
    { plateNumber: "BDJ-590-XA", driverName: "Musa Bello", driverPhone: "08031234501", transporter: "BOVAS Fleet", truckType: "INTERNAL", defaultProduct: "PMS (Petrol)", capacityTons: 45000 },
    { plateNumber: "AGL-913-KB", driverName: "Tunde Bakare", driverPhone: "08031234502", transporter: "Northern Lines", truckType: "MARKETER", defaultProduct: "AGO (Diesel)", capacityTons: 33000 },
    { plateNumber: "KJA-205-CD", driverName: "Peter Obiora", driverPhone: "08031234503", transporter: "Delta Movers", truckType: "INDUSTRIAL", defaultProduct: "DPK (Kerosene)", capacityTons: 60000 },
    { plateNumber: "FST-770-LG", driverName: "Yusuf Danjuma", driverPhone: "08031234504", transporter: "BOVAS Fleet", truckType: "INTERNAL", defaultProduct: "PMS (Petrol)", capacityTons: 40000 },
    { plateNumber: "EKY-118-AB", driverName: "Chuka Ifeanyi", driverPhone: "08031234505", transporter: "Swift Haulage Ltd", truckType: "MARKETER", defaultProduct: "AGO (Diesel)", capacityTons: 50000 },
    { plateNumber: "OYO-634-MN", driverName: "Rasheed Aliyu", driverPhone: "08031234506", transporter: "Delta Movers", truckType: "INDUSTRIAL", defaultProduct: "PMS (Petrol)", capacityTons: 36000 },
    { plateNumber: "ABJ-991-QR", driverName: "Gabriel Eze", driverPhone: "08031234507", transporter: "BOVAS Fleet", truckType: "INTERNAL", defaultProduct: "DPK (Kerosene)", capacityTons: 45000 },
    { plateNumber: "PHC-307-ST", driverName: "Ngozi Udeh", driverPhone: "08031234508", transporter: "Apex Fleet", truckType: "MARKETER", defaultProduct: "AGO (Diesel)", capacityTons: 30000 },
  ];
  const trucks = [];
  for (const t of trucksData) trucks.push(await prisma.truck.create({ data: t }));

  // Marketers (== ticket.customer) with how many trucks each ran.
  const marketers = [
    ["BOVAS", 9], ["Fatgbems", 6], ["Forte", 7], ["Conoil", 5],
    ["Ardova", 8], ["NIPCO", 3], ["Total", 4], ["Mobil", 2],
  ];
  const products = ["PMS (Petrol)", "AGO (Diesel)", "DPK (Kerosene)"];
  const stations = [
    "Babatunde Ishola Filling Station, Ilorin, Kwara State",
    "Akobo 1 (30,000L) / Akobo 2 (15,000L)",
    "BOVAS Mega Station, Challenge, Ibadan",
    "Forte Filling Station, Garki, Abuja",
    "Conoil Station, Benin City, Edo State",
    "Local",
    "Total Energies, Lekki, Lagos",
    "NIPCO Station, Sabon Gari, Kano",
  ];
  const terminals = ["Terminal 1", "Terminal 2"];
  // Weighted status mix (most loads complete; a few in earlier stages).
  const statusPattern = [
    "GATE_CLEARED", "GATE_CLEARED", "WAYBILL_GENERATED", "GATE_CLEARED", "SAFETY_APPROVED",
    "GATE_CLEARED", "PENDING_SAFETY", "GATE_CLEARED", "OVERLOAD_PENDING", "WAYBILL_GENERATED",
    "SAFETY_REJECTED", "GATE_CLEARED",
  ];

  async function makeTicket({ customer, product, qty, status, daysAgo, truck, idx }) {
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - (idx % 11) * 3600000);
    const data = {
      ticketNumber: tkt(), truckId: truck.id, product, requestedQtyTons: qty,
      destination: stations[idx % stations.length], terminal: terminals[idx % terminals.length],
      customer, createdById: U.LOGISTICS.id, status, createdAt,
    };
    const inspected = ["SAFETY_APPROVED", "WAYBILL_GENERATED", "OVERLOAD_PENDING", "GATE_CLEARED"].includes(status);
    if (inspected) {
      data.inspection = { create: { inspectorId: U.SAFETY.id, checklist: goodChecklist, result: "APPROVED", remarks: "All checks passed.", inspectedAt: createdAt } };
    } else if (status === "SAFETY_REJECTED") {
      data.inspection = { create: { inspectorId: U.SAFETY.id, checklist: badChecklist, result: "REJECTED", remarks: "Load held — defects found.", inspectedAt: createdAt } };
    }
    if (["WAYBILL_GENERATED", "OVERLOAD_PENDING", "GATE_CLEARED"].includes(status)) {
      const overload = status === "OVERLOAD_PENDING";
      const loaded = overload ? truck.capacityTons + 500 : Math.min(qty, truck.capacityTons);
      data.waybill = { create: { waybillNumber: wbn(), dispatchedById: U.DISPATCH.id, loadedQtyTons: loaded, overload, overloadStatus: overload ? "PENDING" : "NONE", createdAt } };
    }
    if (status === "GATE_CLEARED") {
      data.gateClearance = { create: { clearedById: U.GATE.id, notes: "Documents verified — exited.", exitedAt: daysAgo === 0 ? new Date() : createdAt } };
    }
    return prisma.ticket.create({ data });
  }

  let idx = 0;
  const tickets = [];
  for (const [customer, n] of marketers) {
    for (let k = 0; k < n; k++) {
      const status = statusPattern[idx % statusPattern.length];
      const product = products[idx % products.length];
      const truck = trucks[idx % trucks.length];
      const qty = truck.capacityTons - [0, 0, 5000][idx % 3]; // full or slightly under (litres)
      const daysAgo = idx % 30; // spread across the last month; some land today
      tickets.push(await makeTicket({ customer, product, qty, status, daysAgo, truck, idx }));
      idx++;
    }
  }

  // Notifications (unread) so the bell + dropdown are populated per role.
  const overloads = tickets.filter((t) => t.status === "OVERLOAD_PENDING");
  const cleared = tickets.filter((t) => t.status === "GATE_CLEARED").slice(0, 3);
  const pending = tickets.filter((t) => t.status === "PENDING_SAFETY").slice(0, 3);
  const approved = tickets.filter((t) => t.status === "SAFETY_APPROVED").slice(0, 2);
  const waybills = tickets.filter((t) => t.status === "WAYBILL_GENERATED").slice(0, 2);

  const notifications = [
    ...overloads.map((t) => ({ targetRole: "ADMIN", ticketId: t.id, type: "OVERLOAD_PENDING", message: `Overload on ${t.ticketNumber} (${t.customer}) — needs admin approval.` })),
    ...cleared.map((t) => ({ targetRole: "ADMIN", ticketId: t.id, type: "GATE_CLEARED", message: `Truck for ${t.ticketNumber} (${t.customer}) cleared the gate and exited.` })),
    ...pending.map((t) => ({ targetRole: "SAFETY", ticketId: t.id, type: "TICKET_PENDING_SAFETY", message: `New ticket ${t.ticketNumber} (${t.customer}) awaiting safety inspection.` })),
    ...approved.map((t) => ({ targetRole: "DISPATCH", ticketId: t.id, type: "TICKET_APPROVED", message: `Ticket ${t.ticketNumber} approved — ready for dispatch.` })),
    ...waybills.map((t) => ({ targetRole: "GATE", ticketId: t.id, type: "READY_FOR_GATE", message: `Waybill issued for ${t.ticketNumber} — ready for gate clearance.` })),
  ];
  await prisma.notification.createMany({ data: notifications });

  // Audit history.
  const audit = [];
  for (const t of tickets) {
    audit.push({ actorId: U.LOGISTICS.id, action: "TICKET_CREATED", entity: "Ticket", entityId: String(t.id), createdAt: t.createdAt });
    if (["SAFETY_APPROVED", "WAYBILL_GENERATED", "OVERLOAD_PENDING", "GATE_CLEARED"].includes(t.status))
      audit.push({ actorId: U.SAFETY.id, action: "SAFETY_APPROVED", entity: "Ticket", entityId: String(t.id), createdAt: t.createdAt });
    if (["WAYBILL_GENERATED", "OVERLOAD_PENDING", "GATE_CLEARED"].includes(t.status))
      audit.push({ actorId: U.DISPATCH.id, action: "WAYBILL_GENERATED", entity: "Ticket", entityId: String(t.id), createdAt: t.createdAt });
    if (t.status === "GATE_CLEARED")
      audit.push({ actorId: U.GATE.id, action: "GATE_CLEARED", entity: "Ticket", entityId: String(t.id), createdAt: t.createdAt });
    if (t.status === "SAFETY_REJECTED")
      audit.push({ actorId: U.SAFETY.id, action: "SAFETY_REJECTED", entity: "Ticket", entityId: String(t.id), createdAt: t.createdAt });
  }
  await prisma.auditLog.createMany({ data: audit });

  // Staff directory (broader than login accounts) for Staff Management.
  const leadership = [
    { name: "Olayinka Fagboore", department: "Admin", role: "Senior Depot Manager", terminal: "Terminal 2" },
    { name: "Abdulmalik Gafar", department: "Admin", role: "Depot Manager", terminal: "Terminal 1" },
    { name: "Doris Shitta", department: "Admin", role: "Deputy Depot Manager", terminal: "Terminal 1" },
    { name: "Malomo Olusegun", department: "Safety", role: "Chief", terminal: "Terminal 2" },
    { name: "Aiyedun Olawale", department: "Safety", role: "Team Member", terminal: "Terminal 1" },
    { name: "Bello Samson", department: "Loading", role: "Chief", terminal: "Terminal 1" },
  ];
  const firstNames = ["Adaeze", "Chidi", "Ngozi", "Tunde", "Funke", "Sola", "Ibrahim", "Yusuf", "Aisha", "Emeka", "Ifeoma", "Bashir", "Halima", "Segun", "Bunmi", "Kelechi", "Uche", "Rita", "Dele", "Femi", "Gbenga", "Hauwa", "Nneka", "Obinna", "Tope", "Wale", "Zainab", "Bola", "Chinedu", "Damilola", "Grace", "Hassan", "Ireti", "Joseph", "Kemi", "Lanre", "Maryam", "Nasir", "Opeyemi", "Rasaq"];
  const lastNames = ["Okafor", "Balogun", "Eze", "Adeyemi", "Mohammed", "Okoro", "Adebayo", "Ibrahim", "Nwankwo", "Ogundipe", "Bello", "Lawal", "Obi", "Olawale", "Danjuma", "Akinola", "Uche", "Musa", "Ojo", "Chukwu", "Yakubu", "Afolabi", "Onyeka", "Sani", "Ekwueme", "Aliyu", "Idris", "Ogunleye", "Madu", "Shittu"];
  const departments = ["Safety", "Loading", "Logistics", "Dispatch", "Tank Farm", "Lab. & QA", "Maintenance", "Admin"];
  const titles = ["Chief", "Team Member", "Team Member", "Supervisor", "Team Member", "Operator"];
  const staff = [...leadership];
  for (let i = 0; i < 50; i++) {
    staff.push({
      name: `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`,
      department: departments[i % departments.length],
      role: titles[i % titles.length],
      terminal: i % 2 === 0 ? "Terminal 1" : "Terminal 2",
    });
  }
  await prisma.staff.createMany({ data: staff });

  // Marketers' Records — 15 distinct marketers.
  const marketerRecords = [
    { name: "Feasible Path", representative: "Elizabeth Fadenipo", phone: "08104205202", email: "elizabethfadenipo@gmail.com" },
    { name: "BOVAS", representative: "Adewale Ogunsanya", phone: "08031110022", email: "adewale.ogunsanya@bovas.com" },
    { name: "Fatgbems", representative: "Bola Fadairo", phone: "08032220033", email: "bola.fadairo@fatgbems.com" },
    { name: "Forte Oil", representative: "Chinedu Okeke", phone: "08033330044", email: "chinedu.okeke@forteoil.com" },
    { name: "Conoil", representative: "Ngozi Umeh", phone: "08034440055", email: "ngozi.umeh@conoil.com" },
    { name: "Ardova", representative: "Yusuf Bello", phone: "08035550066", email: "yusuf.bello@ardova.com" },
    { name: "NIPCO", representative: "Halima Sani", phone: "08036660077", email: "halima.sani@nipco.com" },
    { name: "Total Energies", representative: "Femi Adeyemi", phone: "08037770088", email: "femi.adeyemi@totalenergies.com" },
    { name: "Mobil", representative: "Grace Okon", phone: "08038880099", email: "grace.okon@mobil.com" },
    { name: "Oando", representative: "Ibrahim Lawal", phone: "08039990100", email: "ibrahim.lawal@oando.com" },
    { name: "Rainoil", representative: "Tunde Bakare", phone: "08041110111", email: "tunde.bakare@rainoil.com" },
    { name: "MRS", representative: "Kemi Adebola", phone: "08042220122", email: "kemi.adebola@mrs.com" },
    { name: "Eterna", representative: "Samuel Eze", phone: "08043330133", email: "samuel.eze@eterna.com" },
    { name: "AYM Shafa", representative: "Aisha Mohammed", phone: "08044440144", email: "aisha.mohammed@aymshafa.com" },
    { name: "Matrix Energy", representative: "Daniel Obi", phone: "08045550155", email: "daniel.obi@matrixenergy.com" },
  ];
  await prisma.marketer.createMany({ data: marketerRecords });

  console.log("Done.");
  console.log(`  Users: ${people.length}  ·  Trucks: ${trucks.length}  ·  Tickets: ${tickets.length}  ·  Staff: ${staff.length}`);
  console.log(`  Notifications: ${notifications.length}  ·  Audit entries: ${audit.length}`);
  console.log(`  Sign-in password: ${PASSWORD}  ·  Gate PIN: ${GATE_PIN}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
