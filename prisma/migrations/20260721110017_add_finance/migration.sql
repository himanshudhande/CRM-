-- CreateEnum
CREATE TYPE "IncomeStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "IncomeEntry" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "receivedDate" TIMESTAMP(3),
    "status" "IncomeStatus" NOT NULL DEFAULT 'PENDING',
    "isRetainer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "IncomeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseEntry" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ExpenseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncomeEntry_ownerId_idx" ON "IncomeEntry"("ownerId");

-- CreateIndex
CREATE INDEX "IncomeEntry_clientId_idx" ON "IncomeEntry"("clientId");

-- CreateIndex
CREATE INDEX "IncomeEntry_projectId_idx" ON "IncomeEntry"("projectId");

-- CreateIndex
CREATE INDEX "IncomeEntry_expectedDate_idx" ON "IncomeEntry"("expectedDate");

-- CreateIndex
CREATE INDEX "IncomeEntry_status_idx" ON "IncomeEntry"("status");

-- CreateIndex
CREATE INDEX "ExpenseEntry_ownerId_idx" ON "ExpenseEntry"("ownerId");

-- CreateIndex
CREATE INDEX "ExpenseEntry_date_idx" ON "ExpenseEntry"("date");

-- AddForeignKey
ALTER TABLE "IncomeEntry" ADD CONSTRAINT "IncomeEntry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeEntry" ADD CONSTRAINT "IncomeEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeEntry" ADD CONSTRAINT "IncomeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseEntry" ADD CONSTRAINT "ExpenseEntry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
