"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Edit, Eye, Trash2 } from "lucide-react";

export interface JobAdminItem {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  description: string;
  category: string;
  type: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  active: boolean;
  featured: boolean;
  createdAt: string;
  jobCategory?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
  _count: {
    applications: number;
  };
}

interface JobsAdminGridProps {
  initialJobs: JobAdminItem[];
}

export default function JobsAdminGrid({ initialJobs }: JobsAdminGridProps) {
  const [jobs, setJobs] = useState<JobAdminItem[]>(initialJobs);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    setDeleting(jobId);

    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete job");
      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error(error);
      alert("Unable to delete job. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (jobs.length === 0) {
    return (
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
            <span className="w-5 h-5" />
            Post Job
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="glass rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-1">
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

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-purple px-3 py-1 rounded-full text-xs font-medium">
                  {job.jobCategory?.name ?? job.category.replace("_", " ")}
                </span>
                <span className="badge-blue px-3 py-1 rounded-full text-xs font-medium">
                  {job.type}
                </span>
              </div>

              {job.salaryMin != null && job.salaryMax != null ? (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                  {job.salaryMin.toLocaleString()} -{" "}
                  {job.salaryMax.toLocaleString()} XAF
                </p>
              ) : null}

              <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                {job.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--divider)] text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {job._count.applications} applications
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${job.active ? "bg-green-500" : "bg-gray-400"}`}
                />
                <span>{job.active ? "Active" : "Inactive"}</span>
              </div>
            </div>

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
              <button
                type="button"
                onClick={() => handleDelete(job.id)}
                disabled={deleting === job.id}
                className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
