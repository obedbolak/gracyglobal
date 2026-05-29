-- AlterTable: Add cancelReason and updatedAt to orders (safe for existing rows)
ALTER TABLE "orders" ADD COLUMN "cancelReason" TEXT;

-- Step 1: Add updatedAt as nullable
ALTER TABLE "orders" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Step 2: Backfill existing rows
UPDATE "orders" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;

-- Step 3: Enforce NOT NULL
ALTER TABLE "orders" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable: Add phone to verification_otps
ALTER TABLE "verification_otps" ADD COLUMN "phone" TEXT;