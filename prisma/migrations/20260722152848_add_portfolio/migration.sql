-- CreateEnum
CREATE TYPE "PortfolioVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "isPortfolio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "portfolioVisibility" "PortfolioVisibility" NOT NULL DEFAULT 'PRIVATE';
