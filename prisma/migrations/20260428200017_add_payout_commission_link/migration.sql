/*
  Warnings:

  - You are about to drop the column `commission` on the `affiliate_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `referredId` on the `affiliate_referrals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referredUserId]` on the table `affiliate_referrals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referredUserId` to the `affiliate_referrals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- DropIndex
DROP INDEX "affiliate_referrals_referredId_key";

-- AlterTable
ALTER TABLE "affiliate_referrals" DROP COLUMN "commission",
DROP COLUMN "referredId",
ADD COLUMN     "referredUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "affiliates" ADD COLUMN     "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20;

-- CreateTable
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "payoutId" TEXT,
    "paymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_commissions_paymentId_key" ON "affiliate_commissions"("paymentId");

-- CreateIndex
CREATE INDEX "affiliate_commissions_affiliateId_status_idx" ON "affiliate_commissions"("affiliateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_referrals_referredUserId_key" ON "affiliate_referrals"("referredUserId");

-- AddForeignKey
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "affiliate_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "affiliate_referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
