-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "posterId" TEXT;

-- CreateTable
CREATE TABLE "job_seekers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "category" "JobCategory" NOT NULL,
    "type" "JobType" NOT NULL,
    "expectedSalary" INTEGER,
    "location" TEXT,
    "skills" TEXT[],
    "experience" TEXT NOT NULL,
    "portfolio" TEXT,
    "resume" TEXT,
    "availability" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_seekers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_seekers_userId_key" ON "job_seekers"("userId");

-- CreateIndex
CREATE INDEX "job_seekers_userId_idx" ON "job_seekers"("userId");

-- CreateIndex
CREATE INDEX "job_seekers_category_type_idx" ON "job_seekers"("category", "type");

-- CreateIndex
CREATE INDEX "job_seekers_active_idx" ON "job_seekers"("active");

-- AddForeignKey
ALTER TABLE "job_seekers" ADD CONSTRAINT "job_seekers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
