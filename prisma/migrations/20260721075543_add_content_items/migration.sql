-- CreateEnum
CREATE TYPE "ContentPlatform" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('REEL', 'POST', 'CAROUSEL', 'STORY', 'LONG_FORM', 'SHORT', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentStage" AS ENUM ('IDEA', 'SCRIPT', 'SHOOT_PLANNED', 'SHOOTING', 'EDITING', 'CLIENT_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" "ContentPlatform" NOT NULL,
    "type" "ContentType" NOT NULL,
    "stage" "ContentStage" NOT NULL DEFAULT 'IDEA',
    "stageUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "scheduledDate" TIMESTAMP(3),
    "scriptUrl" TEXT,
    "rawFootageUrl" TEXT,
    "finalExportUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentItem_ownerId_idx" ON "ContentItem"("ownerId");

-- CreateIndex
CREATE INDEX "ContentItem_clientId_idx" ON "ContentItem"("clientId");

-- CreateIndex
CREATE INDEX "ContentItem_stage_idx" ON "ContentItem"("stage");

-- CreateIndex
CREATE INDEX "ContentItem_scheduledDate_idx" ON "ContentItem"("scheduledDate");

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
