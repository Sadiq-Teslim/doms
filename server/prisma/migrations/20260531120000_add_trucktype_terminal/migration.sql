-- AlterTable
ALTER TABLE "Truck" ADD COLUMN "truckType" TEXT NOT NULL DEFAULT 'INTERNAL';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "terminal" TEXT NOT NULL DEFAULT 'Terminal 1';
