-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LOGISTICS', 'SAFETY', 'DISPATCH', 'GATE', 'ADMIN', 'DRIVER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING_SAFETY', 'SAFETY_APPROVED', 'SAFETY_REJECTED', 'WAYBILL_GENERATED', 'OVERLOAD_PENDING', 'OVERLOAD_APPROVED', 'OVERLOAD_REJECTED', 'GATE_CLEARED');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OverloadStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "pinHash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" SERIAL NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT,
    "transporter" TEXT,
    "defaultProduct" TEXT,
    "capacityTons" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "truckId" INTEGER NOT NULL,
    "product" TEXT NOT NULL,
    "requestedQtyTons" DOUBLE PRECISION NOT NULL,
    "destination" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "notes" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING_SAFETY',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyInspection" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "inspectorId" INTEGER NOT NULL,
    "checklist" JSONB NOT NULL,
    "result" "InspectionResult" NOT NULL,
    "remarks" TEXT,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waybill" (
    "id" SERIAL NOT NULL,
    "waybillNumber" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "dispatchedById" INTEGER NOT NULL,
    "loadedQtyTons" DOUBLE PRECISION NOT NULL,
    "overload" BOOLEAN NOT NULL DEFAULT false,
    "overloadStatus" "OverloadStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waybill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverloadReview" (
    "id" SERIAL NOT NULL,
    "waybillId" INTEGER NOT NULL,
    "reviewedById" INTEGER NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "reason" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverloadReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateClearance" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "clearedById" INTEGER NOT NULL,
    "notes" TEXT,
    "exitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateClearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "targetRole" "Role",
    "targetUserId" INTEGER,
    "ticketId" INTEGER,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "actorId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Truck_plateNumber_key" ON "Truck"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyInspection_ticketId_key" ON "SafetyInspection"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Waybill_waybillNumber_key" ON "Waybill"("waybillNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Waybill_ticketId_key" ON "Waybill"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "OverloadReview_waybillId_key" ON "OverloadReview"("waybillId");

-- CreateIndex
CREATE UNIQUE INDEX "GateClearance_ticketId_key" ON "GateClearance"("ticketId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyInspection" ADD CONSTRAINT "SafetyInspection_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyInspection" ADD CONSTRAINT "SafetyInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waybill" ADD CONSTRAINT "Waybill_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waybill" ADD CONSTRAINT "Waybill_dispatchedById_fkey" FOREIGN KEY ("dispatchedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverloadReview" ADD CONSTRAINT "OverloadReview_waybillId_fkey" FOREIGN KEY ("waybillId") REFERENCES "Waybill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverloadReview" ADD CONSTRAINT "OverloadReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateClearance" ADD CONSTRAINT "GateClearance_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateClearance" ADD CONSTRAINT "GateClearance_clearedById_fkey" FOREIGN KEY ("clearedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
