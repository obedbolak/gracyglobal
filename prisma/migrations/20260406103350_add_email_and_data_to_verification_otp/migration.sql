/*
  Warnings:

  - Added the required column `email` to the `verification_otps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "verification_otps" ADD COLUMN     "data" JSONB,
ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;
