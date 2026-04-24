-- AlterTable
ALTER TABLE "services" ADD COLUMN     "sellerId" TEXT;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
