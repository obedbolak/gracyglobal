// app/admin/jobs/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import JobsAdminGrid from "@/components/admin/JobsAdminGrid";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true },
      },
      jobCategory: {
        select: { id: true, name: true, slug: true, color: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Job Listings
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage job opportunities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/jobs/categories"
            className="btn-secondary px-5 py-3 rounded-lg"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/jobs/applicants"
            className="btn-secondary flex items-center gap-2 px-5 py-3 rounded-lg"
          >
            <Users className="w-5 h-5" />
            Applicants
          </Link>
          <Link
            href="/admin/jobs/create"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Post Job
          </Link>
        </div>
      </div>

      <JobsAdminGrid initialJobs={jobs} />
    </div>
  );
}
