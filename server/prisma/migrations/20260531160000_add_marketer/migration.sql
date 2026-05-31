-- CreateTable
CREATE TABLE "Marketer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "representative" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Marketer_pkey" PRIMARY KEY ("id")
);
