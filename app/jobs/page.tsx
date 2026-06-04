"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useCurrency } from "@/hooks/useCurrency";
import ShareButton from "@/components/shared/ShareButton";

// ─── Types ───────────────────────────────────────────────────────────────────

export type JobCategory =
  | "TECH"
  | "MARKETING"
  | "DESIGN"
  | "CUSTOMER_SERVICE"
  | "WRITING"
  | "FINANCE"
  | "EDUCATION"
  | "HEALTH"
  | "OTHER";

export type JobType = "REMOTE" | "HYBRID" | "CONTRACT" | "FREELANCE";

type PageView = "jobs" | "post-job" | "job-seeker" | "applied";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  category: JobCategory;
  type: JobType;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  skills: string[];
  featured: boolean;
  createdAt: string;
  expiresAt?: string;
  posterId?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  coverNote?: string;
  status: string;
  createdAt: string;
  job: Job;
}

export interface JobCategory_Model {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  active: boolean;
  sortOrder: number;
  _count?: { jobs: number };
}

export interface JobPostPayload {
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  category: JobCategory;
  jobCategoryId?: string;
  type: JobType;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  skills: string[];
  featured?: boolean;
  expiresAt?: string;
}

export interface JobSeekerPayload {
  name: string;
  email: string;
  phone?: string;
  category: JobCategory;
  type: JobType;
  expectedSalary?: number;
  location?: string;
  skills: string[];
  experience: string;
  portfolio?: string;
  resume?: string;
  availability?: string;
}

export interface JobFilters {
  category?: JobCategory | "ALL";
  type?: JobType | "ALL";
  featured?: boolean;
}

interface JobPostForm {
  title: string;
  company: string;
  companyLogo: string;
  description: string;
  category: JobCategory;
  jobCategoryId: string;
  type: JobType;
  salaryMin: string;
  salaryMax: string;
  location: string;
  skills: string;
  featured: boolean;
}

interface JobSeekerForm {
  name: string;
  email: string;
  phone: string;
  category: JobCategory;
  type: JobType;
  expectedSalary: string;
  location: string;
  skills: string;
  experience: string;
  portfolio: string;
  resume: string;
  availability: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: { value: JobCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Categories" },
  { value: "TECH", label: "Tech" },
  { value: "MARKETING", label: "Marketing" },
  { value: "DESIGN", label: "Design" },
  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
  { value: "WRITING", label: "Writing" },
  { value: "FINANCE", label: "Finance" },
  { value: "EDUCATION", label: "Education" },
  { value: "HEALTH", label: "Health" },
  { value: "OTHER", label: "Other" },
];

const JOB_TYPES: { value: JobType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
];

const TYPE_COLORS: Record<JobType, string> = {
  REMOTE: "badge-blue",
  HYBRID: "badge-purple",
  CONTRACT: "badge-scarlet",
  FREELANCE: "badge-neutral",
};

const CATEGORY_ICONS: Record<JobCategory, string> = {
  TECH: "💻",
  MARKETING: "📣",
  DESIGN: "🎨",
  CUSTOMER_SERVICE: "🎧",
  WRITING: "✍️",
  FINANCE: "💰",
  EDUCATION: "📚",
  HEALTH: "❤️",
  OTHER: "🌐",
};

// ─── Fetcher ─────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ─── useJobs Hook ─────────────────────────────────────────────────────────────

function buildJobsKey(filters: JobFilters): string {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "ALL")
    params.set("category", filters.category);
  if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
  if (filters.featured) params.set("featured", "true");
  const qs = params.toString();
  return `/api/jobs${qs ? `?${qs}` : ""}`;
}

function useJobs(filters: JobFilters = {}) {
  const { data: session } = useSession();
  const jobsKey = buildJobsKey(filters);

  const {
    data: jobsData,
    error: jobsError,
    isLoading: jobsLoading,
    mutate: mutateJobs,
  } = useSWR<{ jobs: Job[] }>(jobsKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const {
    data: appliedData,
    error: appliedError,
    isLoading: appliedLoading,
    mutate: mutateApplied,
  } = useSWR<{ applications: JobApplication[] }>(
    session?.user ? "/api/jobs/applied" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const appliedIds = new Set(
    (appliedData?.applications || []).map((app) => app.jobId),
  );

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR<{ categories: JobCategory_Model[] }>(
    "/api/jobs/job-categories",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  );

  const categories = categoriesData?.categories || [];

  const postJob = useCallback(
    async (payload: JobPostPayload): Promise<Job> => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post job");
      await mutateJobs();
      return data.job;
    },
    [mutateJobs],
  );

  const applyToJob = useCallback(
    async (jobId: string, coverNote?: string): Promise<JobApplication> => {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply");
      await mutateApplied();
      return data.application;
    },
    [mutateApplied],
  );

  const submitJobSeekerProfile = useCallback(
    async (payload: JobSeekerPayload) => {
      const res = await fetch("/api/jobs/job-seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit profile");
      return data.profile;
    },
    [],
  );

  const deleteJob = useCallback(
    async (jobId: string) => {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete job");
      await mutateJobs();
    },
    [mutateJobs],
  );

  const updateJob = useCallback(
    async (jobId: string, payload: Partial<JobPostPayload>): Promise<Job> => {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update job");
      await mutateJobs();
      return data.job;
    },
    [mutateJobs],
  );

  const refreshJobs = useCallback(() => mutateJobs(), [mutateJobs]);
  const refreshApplied = useCallback(() => mutateApplied(), [mutateApplied]);

  return {
    jobs: jobsData?.jobs || [],
    applications: appliedData?.applications || [],
    appliedIds,
    jobsLoading,
    appliedLoading,
    jobsError,
    appliedError,
    postJob,
    applyToJob,
    submitJobSeekerProfile,
    deleteJob,
    updateJob,
    refreshJobs,
    refreshApplied,
    categories,
    categoriesLoading,
    categoriesError,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function useFormatSalary() {
  const { convert } = useCurrency();
  return (min?: number, max?: number): string | null => {
    if (!min && !max) return null;
    if (min && max) return `${convert(min)} – ${convert(max)}`;
    if (min) return `From ${convert(min)}`;
    return `Up to ${convert(max!)}`;
  };
}

// ─── Shared Form Field ────────────────────────────────────────────────────────

function FormField({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}{" "}
        {required && <span style={{ color: "var(--error-text)" }}>*</span>}
        {optional && (
          <span style={{ color: "var(--text-muted)" }}>(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

// ─── Post Job Form ────────────────────────────────────────────────────────────

interface PostJobFormProps {
  onBack: () => void;
  onSuccess: () => void;
  postJob: (payload: JobPostPayload) => Promise<Job>;
  categories: JobCategory_Model[];
  categoriesLoading: boolean;
}

function PostJobForm({
  onBack,
  onSuccess,
  postJob,
  categories,
  categoriesLoading,
}: PostJobFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobPostForm>({
    title: "",
    company: "",
    companyLogo: "",
    description: "",
    category: "TECH",
    jobCategoryId: "",
    type: "REMOTE",
    salaryMin: "",
    salaryMax: "",
    location: "",
    skills: "",
    featured: false,
  });

  const update = (field: keyof JobPostForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await postJob({
        ...form,
        companyLogo: form.companyLogo || undefined,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-8"
      style={{ animation: "fade-up 0.35s ease both" }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        ← Back to Jobs
      </button>

      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Post a Job
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Fill in the details below to create a new job listing
        </p>
      </div>

      <div className="glass p-8 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic Info */}
          <div className="flex flex-col gap-1">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Basic Information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Job Title" required>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
              <FormField label="Company Name" required>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
            </div>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Job Details */}
          <div className="flex flex-col gap-1">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Job Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Category">
                <select
                  value={form.jobCategoryId}
                  onChange={(e) => {
                    const selectedCategory = categories.find(
                      (category) => category.id === e.target.value,
                    );
                    update("jobCategoryId", e.target.value);
                    if (selectedCategory) {
                      update(
                        "category",
                        selectedCategory.slug
                          .toUpperCase()
                          .replace(/-/g, "_") as JobCategory,
                      );
                    }
                  }}
                  className="glass-input px-3 py-2.5 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categoriesLoading
                    ? CATEGORIES.filter((c) => c.value !== "ALL").map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))
                    : categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                </select>
              </FormField>
              <FormField label="Job Type">
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value as JobType)}
                  className="glass-input px-3 py-2.5 text-sm"
                >
                  {JOB_TYPES.filter((t) => t.value !== "ALL").map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Location" optional>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
            </div>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Compensation */}
          <div className="flex flex-col gap-1">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Compensation
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Min Salary ($)" optional>
                <input
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) => update("salaryMin", e.target.value)}
                  placeholder="e.g. 80000"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
              <FormField label="Max Salary ($)" optional>
                <input
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) => update("salaryMax", e.target.value)}
                  placeholder="e.g. 120000"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
            </div>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Media & Skills */}
          <div className="flex flex-col gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Media & Skills
            </p>
            <FormField label="Company Logo URL" optional>
              <input
                type="url"
                value={form.companyLogo}
                onChange={(e) => update("companyLogo", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </FormField>
            <FormField label="Required Skills" optional>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
              {form.skills && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, i) => (
                      <span
                        key={i}
                        className="badge-purple px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                </div>
              )}
            </FormField>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Description */}
          <div className="flex flex-col gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Job Description
            </p>
            <FormField label="Full Description" required>
              <textarea
                required
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={8}
                placeholder={`Describe the role, responsibilities, and requirements...\n\nExample:\n• Build and maintain React applications\n• Collaborate with cross-functional teams\n• 3+ years of experience required`}
                className="glass-input w-full px-4 py-3 text-sm resize-none"
              />
            </FormField>
          </div>

          {/* Featured toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Featured Listing
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Featured jobs appear at the top and get more visibility
              </p>
            </div>
            <button
              type="button"
              onClick={() => update("featured", !form.featured)}
              className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
              style={{
                background: form.featured
                  ? "var(--purple)"
                  : "var(--glass-border)",
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                style={{
                  left: form.featured ? "calc(100% - 1.375rem)" : "0.125rem",
                }}
              />
            </button>
          </div>

          {error && (
            <p
              className="text-sm px-4 py-3 rounded-lg"
              style={{
                background: "var(--error-bg)",
                color: "var(--error-text)",
                border: "1px solid var(--error-border)",
              }}
            >
              ⚠ {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary flex-1 px-4 py-3 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-70"
            >
              {loading ? "Posting…" : "Post Job →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Job Seeker Form ──────────────────────────────────────────────────────────

interface JobSeekerFormProps {
  onBack: () => void;
  onSuccess: () => void;
  submitJobSeekerProfile: (payload: JobSeekerPayload) => Promise<any>;
}

function JobSeekerForm({
  onBack,
  onSuccess,
  submitJobSeekerProfile,
}: JobSeekerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobSeekerForm>({
    name: "",
    email: "",
    phone: "",
    category: "TECH",
    type: "REMOTE",
    expectedSalary: "",
    location: "",
    skills: "",
    experience: "",
    portfolio: "",
    resume: "",
    availability: "",
  });

  const update = (field: keyof JobSeekerForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitJobSeekerProfile({
        ...form,
        phone: form.phone || undefined,
        expectedSalary: form.expectedSalary
          ? parseInt(form.expectedSalary)
          : undefined,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolio: form.portfolio || undefined,
        resume: form.resume || undefined,
        availability: form.availability || undefined,
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-8"
      style={{ animation: "fade-up 0.35s ease both" }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        ← Back to Jobs
      </button>

      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Create Job Seeker Profile
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Tell employers about yourself and what you're looking for
        </p>
      </div>

      <div className="glass p-8 flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Personal Info */}
          <div className="flex flex-col gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Personal Information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="John Doe"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
              <FormField label="Email" required>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="john@example.com"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
              <FormField label="Phone" optional>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
            </div>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Job Preferences */}
          <div className="flex flex-col gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Job Preferences
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Desired Category">
                <select
                  value={form.category}
                  onChange={(e) =>
                    update("category", e.target.value as JobCategory)
                  }
                  className="glass-input px-3 py-2.5 text-sm"
                >
                  {CATEGORIES.filter((c) => c.value !== "ALL").map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Preferred Job Type">
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value as JobType)}
                  className="glass-input px-3 py-2.5 text-sm"
                >
                  {JOB_TYPES.filter((t) => t.value !== "ALL").map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Preferred Location">
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Remote, NYC"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Expected Annual Salary ($)" optional>
                <input
                  type="number"
                  value={form.expectedSalary}
                  onChange={(e) => update("expectedSalary", e.target.value)}
                  placeholder="e.g. 100000"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
              <FormField label="Availability">
                <input
                  type="text"
                  value={form.availability}
                  onChange={(e) => update("availability", e.target.value)}
                  placeholder="e.g. Immediate, 2 weeks notice"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
            </div>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Skills */}
          <div className="flex flex-col gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Skills & Expertise
            </p>
            <FormField label="Your Skills">
              <input
                type="text"
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="e.g. React, Python, Project Management (comma-separated)"
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
              {form.skills && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, i) => (
                      <span
                        key={i}
                        className="badge-purple px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                </div>
              )}
            </FormField>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Links */}
          <div className="flex flex-col gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Links & Documents
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Portfolio URL" optional>
                <input
                  type="url"
                  value={form.portfolio}
                  onChange={(e) => update("portfolio", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
              <FormField label="Resume URL" optional>
                <input
                  type="url"
                  value={form.resume}
                  onChange={(e) => update("resume", e.target.value)}
                  placeholder="https://drive.google.com/yourresume"
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </FormField>
            </div>
          </div>

          <hr style={{ borderColor: "var(--divider)" }} />

          {/* Experience */}
          <div className="flex flex-col gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Experience & Background
            </p>
            <FormField label="Experience Summary" required>
              <textarea
                required
                value={form.experience}
                onChange={(e) => update("experience", e.target.value)}
                rows={7}
                placeholder={`Tell employers about yourself...\n\nExample:\n• 5 years of experience in full-stack development\n• Led a team of 4 engineers at XYZ Corp\n• Passionate about building scalable products`}
                className="glass-input w-full px-4 py-3 text-sm resize-none"
              />
            </FormField>
          </div>

          {error && (
            <p
              className="text-sm px-4 py-3 rounded-lg"
              style={{
                background: "var(--error-bg)",
                color: "var(--error-text)",
                border: "1px solid var(--error-border)",
              }}
            >
              ⚠ {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary flex-1 px-4 py-3 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-70"
            >
              {loading ? "Submitting…" : "Submit Profile →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Applied Jobs View ────────────────────────────────────────────────────────

interface AppliedJobsViewProps {
  onBack: () => void;
  applications: JobApplication[];
  loading: boolean;
}

function AppliedJobsView({
  onBack,
  applications,
  loading,
}: AppliedJobsViewProps) {
  const formatSalary = useFormatSalary();
  return (
    <div
      className="max-w-3xl mx-auto px-4 py-8"
      style={{ animation: "fade-up 0.35s ease both" }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        ← Back to Jobs
      </button>

      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          My Applications
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {applications.length} job{applications.length !== 1 ? "s" : ""}{" "}
          applied to
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p
            className="font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            No applications yet
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Start applying to jobs to see them here
          </p>
          <button
            onClick={onBack}
            className="btn-primary mt-6 px-6 py-2.5 text-sm font-semibold rounded-lg"
          >
            Browse Jobs →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => {
            const job: Job = app.job;
            const salary = formatSalary(job.salaryMin, job.salaryMax);
            return (
              <div key={app.id} className="glass p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <CompanyAvatar logo={job.companyLogo} company={job.company} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {job.title}
                      </h3>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{
                          background: "var(--success-bg)",
                          color: "var(--success-text)",
                        }}
                      >
                        ✓ {app.status}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {job.company}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`${TYPE_COLORS[job.type as JobType]} px-2.5 py-0.5 rounded-full text-xs font-semibold`}
                  >
                    {job.type}
                  </span>
                  <span className="badge-neutral px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {job.category.replace("_", " ")}
                  </span>
                  {salary && (
                    <span className="badge-neutral px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {salary}
                    </span>
                  )}
                  <span className="badge-neutral px-2.5 py-0.5 rounded-full text-xs font-medium ml-auto">
                    Applied {timeAgo(app.createdAt)}
                  </span>
                </div>

                {app.coverNote && (
                  <div
                    className="text-xs px-3 py-2 rounded-lg italic"
                    style={{
                      background: "var(--glass-bg-subtle)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    "{app.coverNote}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div className="glass p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      </div>
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

function CompanyAvatar({ logo, company }: { logo?: string; company: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={company}
        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
        style={{
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg-strong)",
        }}
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
      style={{
        background: "var(--badge-purple-bg)",
        color: "var(--badge-purple-text)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {company.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────

interface ApplyModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
  applyToJob: (jobId: string, coverNote?: string) => Promise<JobApplication>;
}

function ApplyModal({ job, onClose, onSuccess, applyToJob }: ApplyModalProps) {
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    try {
      await applyToJob(job.id, coverNote);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--modal-backdrop)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-modal w-full max-w-lg p-8 flex flex-col gap-6"
        style={{ animation: "modal-in 0.25s ease" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CompanyAvatar logo={job.companyLogo} company={job.company} />
            <div>
              <h2
                className="text-lg font-semibold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {job.title}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {job.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Cover Note{" "}
            <span style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <textarea
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            rows={5}
            placeholder="Tell the company why you're a great fit…"
            className="glass-input w-full px-4 py-3 text-sm resize-none"
          />
        </div>

        {error && (
          <p
            className="text-sm px-4 py-3 rounded-lg"
            style={{
              background: "var(--error-bg)",
              color: "var(--error-text)",
              border: "1px solid var(--error-border)",
            }}
          >
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 px-4 py-3 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={loading}
            className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-70"
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Job Detail Panel ─────────────────────────────────────────────────────────

interface JobDetailPanelProps {
  job: Job;
  onClose: () => void;
  onApply: () => void;
  hasApplied: boolean;
  isLoggedIn: boolean;
}

function JobDetailPanel({
  job,
  onClose,
  onApply,
  hasApplied,
  isLoggedIn,
}: JobDetailPanelProps) {
  const formatSalary = useFormatSalary();
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div
      className="glass flex flex-col h-full overflow-hidden"
      style={{ animation: "slide-in 0.3s ease" }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--divider)" }}
      >
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Job Details
        </span>
        <button
          onClick={onClose}
          className="text-xl leading-none hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <CompanyAvatar logo={job.companyLogo} company={job.company} />
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-bold leading-tight mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {job.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {job.company}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`${TYPE_COLORS[job.type]} px-3 py-1 rounded-full text-xs font-semibold`}
          >
            {job.type}
          </span>
          <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
            {CATEGORY_ICONS[job.category]} {job.category.replace("_", " ")}
          </span>
          {job.location && (
            <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
              📍 {job.location}
            </span>
          )}
          {salary && (
            <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
              💵 {salary}
            </span>
          )}
          <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
            🕐 {timeAgo(job.createdAt)}
          </span>
        </div>

        {job.skills.length > 0 && (
          <div className="flex flex-col gap-2">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Skills Required
            </p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span
                  key={s}
                  className="badge-purple px-3 py-1 rounded-full text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr style={{ borderColor: "var(--divider)" }} />

        <div className="flex flex-col gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            About this Role
          </p>
          <div
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: "var(--text-secondary)" }}
          >
            {job.description}
          </div>
        </div>
      </div>

      <div
        className="flex-shrink-0 p-6 flex flex-col gap-2"
        style={{ borderTop: "1px solid var(--divider)" }}
      >
        {!isLoggedIn ? (
          <Link
            href="/login"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-lg"
          >
            Sign in to Apply
          </Link>
        ) : hasApplied ? (
          <div
            className="w-full py-3 px-6 text-sm font-semibold rounded-lg text-center"
            style={{
              background: "var(--success-bg)",
              color: "var(--success-text)",
              border: "1px solid var(--success-border)",
            }}
          >
            ✓ Application Submitted
          </div>
        ) : (
          <button
            onClick={onApply}
            className="btn-primary w-full py-3 px-6 text-sm font-semibold rounded-lg"
          >
            Apply Now →
          </button>
        )}
        <ShareButton
          href={`/jobs/${job.id}`}
          title={`${job.title} at ${job.company}`}
          className="w-full justify-center !min-h-0 py-2.5"
        />
      </div>
    </div>
  );
}

function EmptyDetailPanel() {
  return (
    <div
      className="glass flex flex-col items-center justify-center h-full p-12 text-center"
      style={{ minHeight: "400px" }}
    >
      <div className="text-6xl mb-4">👈</div>
      <p
        className="font-semibold text-lg mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Select a job to view details
      </p>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Click on any job listing to see more information
      </p>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  hasApplied: boolean;
  onClick: () => void;
}

function JobCard({ job, isSelected, hasApplied, onClick }: JobCardProps) {
  const formatSalary = useFormatSalary();
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const router = useRouter();

  return (
    <div
      className="glass w-full text-left p-5 flex flex-col gap-3 transition-all hover:scale-[1.01]"
      style={{
        background: "var(--glass-bg)",
      }}
    >
      <div className="flex items-start gap-3">
        <CompanyAvatar logo={job.companyLogo} company={job.company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-sm leading-snug line-clamp-2"
              style={{ color: "var(--text-primary)" }}
            >
              {job.featured && (
                <span
                  className="inline-block mr-1 text-xs px-1.5 py-0.5 rounded font-bold badge-scarlet"
                  style={{ fontSize: "0.65rem" }}
                >
                  ★ FEATURED
                </span>
              )}{" "}
              {job.title}
            </h3>
            <span
              className="text-xs flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              {timeAgo(job.createdAt)}
            </span>
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {job.company}
            {job.location ? ` · ${job.location}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`${TYPE_COLORS[job.type]} px-2.5 py-0.5 rounded-full text-xs font-semibold`}
        >
          {job.type}
        </span>
        <span className="badge-neutral px-2.5 py-0.5 rounded-full text-xs font-medium">
          {job.category.replace("_", " ")}
        </span>
        {salary && (
          <span className="badge-neutral px-2.5 py-0.5 rounded-full text-xs font-medium">
            {salary}
          </span>
        )}
        {hasApplied && (
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: "var(--success-bg)",
              color: "var(--success-text)",
            }}
          >
            ✓ Applied
          </span>
        )}
      </div>

      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="badge-purple px-2 py-0.5 rounded-full text-xs"
              style={{ fontSize: "0.7rem" }}
            >
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      )}
      <Link
        href={`/jobs/${job.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-xs font-semibold text-center py-2 rounded-lg transition-colors"
        style={{ color: "var(--accent-primary)", background: "var(--glass-bg-subtle)", border: "1px solid var(--glass-border)" }}
      >
        View Details →
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { data: session } = useSession();

  const [view, setView] = useState<PageView>("jobs");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<JobCategory | "ALL">("ALL");
  const [type, setType] = useState<JobType | "ALL">("ALL");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // ── useJobs hook — single source of truth ──
  const {
    jobs,
    applications,
    appliedIds,
    jobsLoading,
    appliedLoading,
    postJob,
    applyToJob,
    submitJobSeekerProfile,
    refreshJobs,
    categories,
    categoriesLoading,
  } = useJobs({ category, type, featured: featuredOnly });

  const filtered = jobs.filter((j) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.skills.some((s) => s.toLowerCase().includes(q)) ||
      j.location?.toLowerCase().includes(q)
    );
  });

  // Clear selected job if it's no longer in filtered list
  useEffect(() => {
    if (successId) setTimeout(() => setSuccessId(null), 4000);
  }, [successId]);

  function handleApplySuccess() {
    setSuccessId("applied");
  }

  function handlePostJobSuccess() {
    setView("jobs");
    refreshJobs();
    setSuccessId("job-posted");
    setTimeout(() => setSuccessId(null), 4000);
  }

  function handleJobSeekerSuccess() {
    setView("jobs");
    setSuccessId("profile-submitted");
    setTimeout(() => setSuccessId(null), 4000);
  }

  return (
    <>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.4s ease both; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="min-h-screen">
        {/* ── POST JOB VIEW ── */}
        {view === "post-job" && (
          <PostJobForm
            onBack={() => setView("jobs")}
            onSuccess={handlePostJobSuccess}
            postJob={postJob}
            categories={categories}
            categoriesLoading={categoriesLoading}
          />
        )}

        {/* ── JOB SEEKER VIEW ── */}
        {view === "job-seeker" && (
          <JobSeekerForm
            onBack={() => setView("jobs")}
            onSuccess={handleJobSeekerSuccess}
            submitJobSeekerProfile={submitJobSeekerProfile}
          />
        )}

        {/* ── APPLIED JOBS VIEW ── */}
        {view === "applied" && (
          <AppliedJobsView
            onBack={() => setView("jobs")}
            applications={applications}
            loading={appliedLoading}
          />
        )}

        {/* ── JOBS VIEW ── */}
        {view === "jobs" && (
          <>
            {/* Header */}
            <div className="px-4 pt-8 pb-6 max-w-6xl mx-auto">
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Find Your Dream Job
                  </h1>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Looking for a job, remote opportunities, or on-site
                    employment? Gracy Global gives you the platform to post a
                    job, find qualified workers, or apply for available
                    opportunities with ease. Whether you are hiring, searching,
                    or ready to work, this space connects professionals,
                    businesses, and job seekers to real opportunities for growth
                    and success.
                  </p>
                </div>

                {session?.user && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setView("post-job")}
                      className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="text-lg leading-none">+</span>
                      Post a Job
                    </button>
                    <button
                      onClick={() => setView("job-seeker")}
                      className="btn-secondary px-5 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="text-lg leading-none">💼</span>
                      Need a Job?
                    </button>
                    <button
                      onClick={() => setView("applied")}
                      className="btn-secondary px-5 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="text-lg leading-none">📋</span>
                      My Applications
                      {applications.length > 0 && (
                        <span
                          className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: "var(--purple)",
                            color: "white",
                            fontSize: "0.65rem",
                          }}
                        >
                          {applications.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Search + Filters */}
              <div className="glass p-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs, companies, skills…"
                  className="glass-input flex-1 px-4 py-2.5 text-sm"
                  style={{ minWidth: 0 }}
                />
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as JobCategory | "ALL")
                  }
                  className="glass-input px-3 py-2.5 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as JobType | "ALL")}
                  className="glass-input px-3 py-2.5 text-sm"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setFeaturedOnly((v) => !v)}
                  className={featuredOnly ? "btn-primary" : "btn-secondary"}
                  style={{
                    padding: "0.625rem 1rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  ★ Featured
                </button>
              </div>

              {!jobsLoading && (
                <p
                  className="text-xs mt-3 px-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
                  {search && ` for "${search}"`}
                </p>
              )}
            </div>

            {/* Success toast */}
            {successId && (
              <div
                className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
                style={{
                  background: "var(--success-bg)",
                  color: "var(--success-text)",
                  border: "1px solid var(--success-border)",
                  animation: "modal-in 0.3s ease",
                }}
              >
                {successId === "job-posted" && "✓ Job posted successfully!"}
                {successId === "profile-submitted" &&
                  "✓ Profile submitted successfully!"}
                {successId !== "job-posted" &&
                  successId !== "profile-submitted" &&
                  "✓ Application submitted successfully!"}
              </div>
            )}

            {/* Jobs Grid */}
            <section className="px-4 pb-16 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {jobsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <JobCardSkeleton key={i} />
                    ))
                  ) : filtered.length === 0 ? (
                    <div className="col-span-full glass p-12 text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                        No jobs found
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Try adjusting your filters or search terms
                      </p>
                    </div>
                  ) : (
                    filtered.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSelected={false}
                        hasApplied={appliedIds.has(job.id)}
                        onClick={() => {}}
                      />
                    ))
                  )}
              </div>
            </section>
          </>
        )}
      </div>

    </>
  );
}
