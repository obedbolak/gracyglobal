/*
  Warnings:

  - Changed the column `role` on the `users` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "UserRole"[] USING ARRAY["role"]::"UserRole"[];
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT ARRAY['USER']::"UserRole"[];
