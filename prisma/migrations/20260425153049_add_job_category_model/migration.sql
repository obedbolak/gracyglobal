-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "jobCategoryId" TEXT;

-- CreateTable
CREATE TABLE "job_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_name_key" ON "job_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_slug_key" ON "job_categories"("slug");

-- CreateIndex
CREATE INDEX "job_categories_active_idx" ON "job_categories"("active");

-- CreateIndex
CREATE INDEX "job_categories_slug_idx" ON "job_categories"("slug");

-- CreateIndex
CREATE INDEX "jobs_jobCategoryId_idx" ON "jobs"("jobCategoryId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "job_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
