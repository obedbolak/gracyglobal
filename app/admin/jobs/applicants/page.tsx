import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Eye, Users, Briefcase } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";

export default async function JobApplicantsPage() {
  const applications = await prisma.jobApplication.findMany({
    orderBy: { appliedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      job: { select: { id: true, title: true, company: true } },
    },
  });

  const uniqueApplicants = new Set(applications.map((app) => app.user.id)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Job Applicants
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Review applicants across all job listings.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/jobs/categories"
            className="btn-secondary px-5 py-3 rounded-lg"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/jobs/create"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
          >
            <Briefcase className="w-5 h-5" />
            Post Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Applications"
          value={applications.length}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Unique Applicants"
          value={uniqueApplicants}
          icon={Briefcase}
          color="scarlet"
        />
        <StatsCard
          title="Open Positions"
          value={new Set(applications.map((app) => app.job.id)).size}
          icon={Eye}
          color="purple"
        />
      </div>

      {applications.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No applicants yet
          </h2>
          <p className="text-[var(--text-muted)]">
            Once candidates apply, they will appear here for review.
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--glass-bg-strong)] border-b border-[var(--divider)]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Applicant
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Job
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Applied
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)]">
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="hover:bg-[var(--glass-bg-subtle)] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {application.user.name || "Unknown"}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {application.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {application.job.title}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {application.job.company}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] uppercase font-semibold">
                    {application.status}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {new Date(application.appliedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${application.user.id}`}
                        className="btn-secondary px-4 py-2 rounded-lg text-sm"
                      >
                        Applicant
                      </Link>
                      <Link
                        href={`/jobs/${application.job.id}`}
                        className="btn-primary px-4 py-2 rounded-lg text-sm"
                      >
                        Job
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
