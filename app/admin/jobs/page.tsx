// app/admin/jobs/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Edit, Trash2, Plus, Eye, Briefcase } from "lucide-react";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Job Listings
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage job opportunities
          </p>
        </div>

        <Link
          href="/admin/jobs/create"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Post Job
        </Link>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="glass rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {job.company}
                  </p>
                </div>
                {job.companyLogo && (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge-purple px-3 py-1 rounded-full text-xs font-medium">
                    {job.category}
                  </span>
                  <span className="badge-blue px-3 py-1 rounded-full text-xs font-medium">
                    {job.type}
                  </span>
                </div>

                {job.salaryMin && job.salaryMax && (
                  <p className="text-sm text-[var(--text-secondary)]">
                    {job.salaryMin.toLocaleString()} -{" "}
                    {job.salaryMax.toLocaleString()} XAF
                  </p>
                )}

                <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                  {job.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--divider)]">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Briefcase className="w-4 h-4" />
                  {job._count.applications} applications
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      job.active ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs text-[var(--text-muted)]">
                    {job.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link
                  href={`/admin/jobs/${job.id}/edit`}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No jobs posted yet
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              Post your first job listing
            </p>
            <Link
              href="/admin/jobs/create"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Post Job
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
