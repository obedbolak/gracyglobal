// app/admin/jobs/categories/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  EyeOff,
  Users,
  Briefcase,
  BarChart3,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import DeleteJobCategoryButton from "./_components/DeleteJobCategoryButton";

export default async function JobCategoriesPage() {
  const [categories, totalApplications, jobsWithApplicants] = await Promise.all(
    [
      prisma.jobCategoryModel.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { jobs: true },
          },
          jobs: {
            select: {
              _count: {
                select: { applications: true },
              },
            },
          },
        },
      }),
      prisma.jobApplication.count(),
      prisma.job.count({
        where: {
          applications: {
            some: {},
          },
        },
      }),
    ],
  );

  const categoriesWithApplicants = categories.filter((category) =>
    category.jobs.some((job) => job._count.applications > 0),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/jobs"
          className="p-2 hover:bg-[var(--glass-bg-hover)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Link>

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Job Categories
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage categories used for job listings.
          </p>
        </div>

        <Link
          href="/admin/jobs/categories/create"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Applicants"
          value={totalApplications}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Jobs with Applicants"
          value={jobsWithApplicants}
          icon={Briefcase}
          color="scarlet"
        />
        <StatsCard
          title="Categories with Applicants"
          value={categoriesWithApplicants}
          icon={BarChart3}
          color="purple"
        />
      </div>

      <div className="hidden lg:block glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--glass-bg-strong)] border-b border-[var(--divider)]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Order
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Category
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Slug
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Jobs
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Applicants
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Status
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--divider)]">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-[var(--glass-bg-subtle)] transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--glass-bg-strong)] text-[var(--text-primary)] font-semibold text-sm">
                    {category.sortOrder}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {category.icon ? (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{
                          background: category.color
                            ? `${category.color}20`
                            : "var(--glass-bg-strong)",
                        }}
                      >
                        {category.icon}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--glass-bg-strong)]" />
                    )}
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {category.name}
                      </p>
                      {category.color && (
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-4 h-4 rounded border border-[var(--divider)]"
                            style={{ background: category.color }}
                          />
                          <span className="text-xs text-[var(--text-muted)]">
                            {category.color}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-sm">
                  {category.slug}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--purple-faint)] text-[var(--purple)]">
                    {category._count.jobs} jobs
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--blue-faint)] text-[var(--blue)]">
                    {category.jobs.reduce(
                      (count, job) => count + job._count.applications,
                      0,
                    )}{" "}
                    appl.
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      category.active
                        ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                        : "bg-[var(--error-bg)] text-[var(--error-text)]"
                    }`}
                  >
                    {category.active ? (
                      "Active"
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hidden
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/jobs/categories/${category.id}/edit`}
                      className="p-2 hover:bg-[var(--purple-faint)] text-[var(--purple)] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteJobCategoryButton
                      id={category.id}
                      name={category.name}
                      jobCount={category._count.jobs}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)]">No categories found</p>
            <Link
              href="/admin/jobs/categories/create"
              className="inline-block mt-4 text-[var(--purple)] hover:underline"
            >
              Create your first category
            </Link>
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="glass rounded-xl p-4 hover:bg-[var(--glass-bg-subtle)] transition-colors"
          >
            <div className="flex items-start gap-4">
              {category.icon ? (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: category.color
                      ? `${category.color}20`
                      : "var(--glass-bg-strong)",
                  }}
                >
                  {category.icon}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[var(--glass-bg-strong)] flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)] text-lg">
                      {category.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                      {category.slug}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--glass-bg-strong)] text-[var(--text-primary)] font-semibold text-sm flex-shrink-0">
                    {category.sortOrder}
                  </span>
                </div>

                {category.color && (
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-4 h-4 rounded border border-[var(--divider)]"
                      style={{ background: category.color }}
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      {category.color}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--purple-faint)] text-[var(--purple)]">
                      {category._count.jobs} jobs
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--blue-faint)] text-[var(--blue)]">
                      {category.jobs.reduce(
                        (count, job) => count + job._count.applications,
                        0,
                      )}{" "}
                      applicants
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.active
                          ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                          : "bg-[var(--error-bg)] text-[var(--error-text)]"
                      }`}
                    >
                      {category.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/jobs/categories/${category.id}/edit`}
                      className="p-2 hover:bg-[var(--purple-faint)] text-[var(--purple)] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteJobCategoryButton
                      id={category.id}
                      name={category.name}
                      jobCount={category._count.jobs}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="glass rounded-xl text-center py-12">
            <p className="text-[var(--text-muted)]">No categories found</p>
            <Link
              href="/admin/jobs/categories/create"
              className="inline-block mt-4 text-[var(--purple)] hover:underline"
            >
              Create your first category
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
