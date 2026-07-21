"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useCurrency } from "@/hooks/useCurrency";
import ShareButton from "@/components/shared/ShareButton";
import ProfileUpload from "@/components/shared/ProfileUpload";
import { Eye, X, Download, Menu } from "lucide-react";

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

type PageView =
  | "jobs"
  | "post-job"
  | "job-seeker"
  | "applied"
  | "resume-builder";

// Shape returned by /api/jobs/resume (kept in sync with the route handler).
export interface GeneratedResume {
  photoUrl?: string;
  name?: string;
  title: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    links: string[];
  };
  summary: string;
  experience: {
    role: string;
    company: string;
    period: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
    details?: string;
  }[];
  skills: string[];
  certifications: string[];
  languages: string[];
}

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

// ─── Hub Navigation Tabs ──────────────────────────────────────────────────────

const HUB_TABS: { view: PageView; label: string; icon: string; auth?: boolean }[] =
  [
    { view: "jobs", label: "Browse Jobs", icon: "🔎" },
    { view: "post-job", label: "Post a Job", icon: "➕", auth: true },
    { view: "job-seeker", label: "Job Seeker Profile", icon: "💼", auth: true },
    {
      view: "resume-builder",
      label: "AI Resume Builder",
      icon: "✨",
      auth: true,
    },
    { view: "applied", label: "My Applications", icon: "📋", auth: true },
  ];

function HubTabs({
  current,
  onNavigate,
  applicationsCount,
  vertical,
}: {
  current: PageView;
  onNavigate: (view: PageView) => void;
  applicationsCount: number;
  vertical?: boolean;
}) {
  return (
    <div
      className={`glass p-1.5 flex gap-1 ${vertical ? "flex-col" : "overflow-x-auto"}`}
      style={{ scrollbarWidth: "none" }}
    >
      {HUB_TABS.map((tab) => {
        const active = tab.view === current;
        return (
          <button
            key={tab.view}
            onClick={() => onNavigate(tab.view)}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0"
            style={
              active
                ? { background: "var(--accent-primary)", color: "#fff" }
                : { color: "var(--text-secondary)", background: "transparent" }
            }
            onMouseEnter={(e) => {
              if (!active)
                e.currentTarget.style.background = "var(--glass-bg-subtle)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
            {tab.view === "applied" && applicationsCount > 0 && (
              <span
                className="ml-0.5 px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: active ? "rgba(255,255,255,0.25)" : "var(--purple)",
                  color: "#fff",
                  fontSize: "0.65rem",
                }}
              >
                {applicationsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── AI Resume Builder ────────────────────────────────────────────────────────

// Loads jsPDF from a CDN at runtime so no build-time dependency is required.
// To use a bundled dependency instead, run `npm install jspdf` and replace the
// body of this function with: return (await import("jspdf")).jsPDF;
function loadJsPDF(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.jspdf?.jsPDF) return resolve(w.jspdf.jsPDF);
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js";
    script.async = true;
    script.onload = () => {
      if (w.jspdf?.jsPDF) resolve(w.jspdf.jsPDF);
      else reject(new Error("PDF library failed to initialise"));
    };
    script.onerror = () => reject(new Error("Could not load the PDF library"));
    document.body.appendChild(script);
  });
}

async function downloadResumePdf(resume: GeneratedResume, template: ResumeTemplate = "classic") {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Template accent colors (RGB)
  const accentColors: Record<string, [number, number, number]> = {
    classic: [120, 90, 220],
    modern: [37, 99, 235],
    minimal: [55, 65, 81],
    bold: [220, 38, 38],
  };
  const [aR, aG, aB] = accentColors[template] || accentColors.classic;

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionHeader = (label: string) => {
    ensure(34);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(label.toUpperCase(), margin, y);
    y += 5;
    doc.setDrawColor(aR, aG, aB);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + 34, y);
    doc.setLineWidth(1);
    y += 15;
  };

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text(resume.name || "", margin, y);
  y += 22;

  // Title
  if (resume.title) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(aR, aG, aB);
    doc.text(resume.title, margin, y);
    y += 15;
  }

  // Contact line
  const contactParts = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    ...(resume.contact?.links || []),
  ].filter(Boolean) as string[];
  if (contactParts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(110, 110, 110);
    const lines = doc.splitTextToSize(contactParts.join("   |   "), contentW);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 4;
  }

  doc.setDrawColor(210, 210, 210);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  // Summary
  if (resume.summary) {
    sectionHeader("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(resume.summary, contentW);
    ensure(lines.length * 13);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 6;
  }

  // Experience
  if (resume.experience?.length) {
    sectionHeader("Experience");
    resume.experience.forEach((exp) => {
      ensure(46);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 30);
      const roleCompany = [exp.role, exp.company].filter(Boolean).join(" — ");
      doc.text(roleCompany, margin, y);
      if (exp.period) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(exp.period, pageW - margin, y, { align: "right" });
      }
      y += 13;
      if (exp.location) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(130, 130, 130);
        doc.text(exp.location, margin, y);
        y += 12;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      (exp.bullets || []).forEach((b) => {
        const bl = doc.splitTextToSize("•  " + b, contentW - 10);
        ensure(bl.length * 13);
        doc.text(bl, margin + 8, y);
        y += bl.length * 13 + 1;
      });
      y += 8;
    });
  }

  // Education
  if (resume.education?.length) {
    sectionHeader("Education");
    resume.education.forEach((ed) => {
      ensure(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 30);
      doc.text(
        [ed.degree, ed.institution].filter(Boolean).join(" — "),
        margin,
        y,
      );
      if (ed.period) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(ed.period, pageW - margin, y, { align: "right" });
      }
      y += 13;
      if (ed.details) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(90, 90, 90);
        const dl = doc.splitTextToSize(ed.details, contentW);
        ensure(dl.length * 12);
        doc.text(dl, margin, y);
        y += dl.length * 12 + 1;
      }
      y += 8;
    });
  }

  // Skills
  if (resume.skills?.length) {
    sectionHeader("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const sl = doc.splitTextToSize(resume.skills.join("   •   "), contentW);
    ensure(sl.length * 13);
    doc.text(sl, margin, y);
    y += sl.length * 13 + 6;
  }

  // Certifications
  if (resume.certifications?.length) {
    sectionHeader("Certifications");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    resume.certifications.forEach((c) => {
      const cl = doc.splitTextToSize("•  " + c, contentW - 10);
      ensure(cl.length * 13);
      doc.text(cl, margin + 8, y);
      y += cl.length * 13 + 1;
    });
    y += 6;
  }

  // Languages
  if (resume.languages?.length) {
    sectionHeader("Languages");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    const ll = doc.splitTextToSize(resume.languages.join("   •   "), contentW);
    ensure(ll.length * 13);
    doc.text(ll, margin, y);
    y += ll.length * 13 + 4;
  }

  const safe = (resume.name || "resume")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  doc.save(`${safe || "resume"}-resume.pdf`);
}

type ResumeTemplate = "classic" | "modern" | "minimal" | "bold";

const RESUME_TEMPLATES: { id: ResumeTemplate; label: string; desc: string; accent: string; icon: string }[] = [
  { id: "classic", label: "Classic", desc: "Traditional and professional", accent: "#7b5ade", icon: "📄" },
  { id: "modern", label: "Modern", desc: "Clean with bold accents", accent: "#2563eb", icon: "✨" },
  { id: "minimal", label: "Minimal", desc: "Simple and elegant", accent: "#374151", icon: "◻️" },
  { id: "bold", label: "Bold", desc: "Strong visual impact", accent: "#dc2626", icon: "🔥" },
];

interface ResumeForm {
  template: ResumeTemplate;
  photoUrl: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  yearsExperience: string;
  summary: string;
  workExperience: string;
  education: string;
  skills: string;
  certifications: string;
  languages: string;
  links: string;
}

const EMPTY_RESUME_FORM: ResumeForm = {
  template: "classic",
  photoUrl: "",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  targetRole: "",
  yearsExperience: "",
  summary: "",
  workExperience: "",
  education: "",
  skills: "",
  certifications: "",
  languages: "",
  links: "",
};

function ResumeBuilder({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<ResumeForm>(EMPTY_RESUME_FORM);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [step, setStep] = useState(0);
  const [builderMode, setBuilderMode] = useState<"select" | "ai" | "manual">("select");
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const update = (field: keyof ResumeForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const STEPS = [
    { label: "Personal Info", icon: "👤" },
    { label: "Experience", icon: "💼" },
    { label: "Skills & Extras", icon: "🎯" },
    { label: "Review", icon: "✨" },
  ];

  // Per-step validation
  function canProceed(): boolean {
    if (step === 0) return !!(form.fullName.trim() && form.targetRole.trim());
    if (step === 1) return !!form.workExperience.trim();
    return true;
  }

  function goNext() {
    if (!canProceed()) return;
    setSlideDir("left");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setSlideDir("right");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate resume");
      const generated = data.resume as GeneratedResume;
      generated.photoUrl = form.photoUrl;
      setResume(generated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!resume) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadResumePdf(resume, form.template);
    } catch (e: any) {
      setError(e.message || "Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const mapFormToResume = (): GeneratedResume => ({
    name: form.fullName,
    title: form.targetRole,
    photoUrl: form.photoUrl,
    contact: { email: form.email, phone: form.phone, location: form.location, links: form.links ? form.links.split(",").map(s=>s.trim()).filter(Boolean) : [] },
    summary: form.summary,
    experience: form.workExperience ? [{ role: "Experience", company: form.yearsExperience ? `${form.yearsExperience} Years` : "", period: "", bullets: form.workExperience.split("\n").filter(s=>s.trim()) }] : [],
    education: form.education ? [{ degree: "Education", institution: "", period: "", details: form.education }] : [],
    skills: form.skills ? form.skills.split(",").map(s=>s.trim()).filter(Boolean) : [],
    certifications: form.certifications ? form.certifications.split(",").map(s=>s.trim()).filter(Boolean) : [],
    languages: form.languages ? form.languages.split(",").map(s=>s.trim()).filter(Boolean) : [],
  });

  // Summary helper for review step
  const selectedTemplate = RESUME_TEMPLATES.find((t) => t.id === form.template);
  const reviewSections = [
    { label: "Template", value: selectedTemplate ? `${selectedTemplate.icon} ${selectedTemplate.label}` : form.template },
    { label: "Photo", value: form.photoUrl ? "Uploaded" : "None" },
    { label: "Full Name", value: form.fullName },
    { label: "Target Role", value: form.targetRole },
    { label: "Email", value: form.email },
    { label: "Phone", value: form.phone },
    { label: "Location", value: form.location },
    { label: "Years of Experience", value: form.yearsExperience },
    { label: "Summary", value: form.summary },
    { label: "Work Experience", value: form.workExperience },
    { label: "Education", value: form.education },
    { label: "Skills", value: form.skills },
    { label: "Certifications", value: form.certifications },
    { label: "Languages", value: form.languages },
    { label: "Links", value: form.links },
  ];

  if (builderMode === "select") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8" style={{ animation: "fade-up 0.35s ease both" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to Jobs
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span>📄</span> Create Your Resume
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Choose how you want to build your resume.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setBuilderMode("ai")}
            className="glass p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-[var(--purple)] transition-all text-left"
          >
            <span className="text-3xl">✨</span>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>Build with AI</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Let AI write your professional summary and polish your experience points.</p>
            </div>
          </button>
          <button
            onClick={() => setBuilderMode("manual")}
            className="glass p-6 rounded-2xl flex flex-col items-start gap-4 hover:border-[var(--blue)] transition-all text-left"
          >
            <span className="text-3xl">✍️</span>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>Choose a Template</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Write it yourself with a live preview of your chosen template.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto px-4 py-8 ${builderMode === "manual" ? "max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" : "max-w-3xl"}`}
      style={{ animation: "fade-up 0.35s ease both" }}
    >
      <div className="flex flex-col">
      <style>{`
        @keyframes rb-slide-left {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes rb-slide-right {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .rb-slide-left  { animation: rb-slide-left  0.3s ease both; }
        .rb-slide-right { animation: rb-slide-right 0.3s ease both; }
      `}</style>

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        ← Back to Jobs
      </button>



      {!resume ? (
        <>
          {/* ── Stepper ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 flex-1"
                  style={{ cursor: i <= step ? "pointer" : "default" }}
                  onClick={() => {
                    if (i < step) {
                      setSlideDir(i < step ? "right" : "left");
                      setStep(i);
                    }
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300"
                    style={{
                      background:
                        i <= step
                          ? "linear-gradient(135deg, var(--purple), var(--blue))"
                          : "var(--glass-bg)",
                      color: i <= step ? "#fff" : "var(--text-muted)",
                      border:
                        i <= step
                          ? "none"
                          : "2px solid var(--divider)",
                      boxShadow:
                        i === step
                          ? "0 0 0 4px color-mix(in srgb, var(--purple) 25%, transparent)"
                          : "none",
                    }}
                  >
                    {i < step ? "✓" : s.icon}
                  </div>
                  <span
                    className="text-[11px] font-semibold text-center leading-tight hidden sm:block"
                    style={{
                      color: i <= step ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "var(--divider)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                  background: "linear-gradient(90deg, var(--purple), var(--blue))",
                }}
              />
            </div>
          </div>

          {/* ── Step Content ── */}
          <div className="glass p-8">
            <div
              key={step}
              className={slideDir === "left" ? "rb-slide-left" : "rb-slide-right"}
            >
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <div className="flex flex-col gap-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Step 1 — Personal Information
                  </p>

                  {/* Template Selector */}
                  {builderMode === "manual" && (
                  <div>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Choose a template
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {RESUME_TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => update("template", t.id)}
                          className="relative rounded-xl p-4 text-left transition-all duration-200 group"
                          style={{
                            background: form.template === t.id
                              ? `color-mix(in srgb, ${t.accent} 12%, transparent)`
                              : "var(--glass-bg)",
                            border: form.template === t.id
                              ? `2px solid ${t.accent}`
                              : "2px solid var(--divider)",
                            boxShadow: form.template === t.id
                              ? `0 0 0 3px color-mix(in srgb, ${t.accent} 15%, transparent)`
                              : "none",
                          }}
                        >
                          {form.template === t.id && (
                            <span
                              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                              style={{ background: t.accent }}
                            >
                              ✓
                            </span>
                          )}
                          <span className="text-xl mb-1.5 block">{t.icon}</span>
                          <span
                            className="text-sm font-semibold block"
                            style={{ color: form.template === t.id ? t.accent : "var(--text-primary)" }}
                          >
                            {t.label}
                          </span>
                          <span
                            className="text-[11px] block mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {t.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                  <div className="mb-4">
                    <ProfileUpload
                      folder="resumes"
                      currentImage={form.photoUrl}
                      onUploadComplete={(url) => update("photoUrl", url)}
                      onRemove={() => update("photoUrl", "")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Full Name" required>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        placeholder="John Doe"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                    <FormField label="Target Role" required>
                      <input
                        type="text"
                        value={form.targetRole}
                        onChange={(e) => update("targetRole", e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Email" optional>
                      <input
                        type="email"
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
                        placeholder="+237 6 00 00 00 00"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                    <FormField label="Location" optional>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="e.g. Yaoundé, Cameroon"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* Step 1: Experience & Background */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Step 2 — Experience & Background
                  </p>
                  <FormField label="Years of Experience" optional>
                    <input
                      type="text"
                      value={form.yearsExperience}
                      onChange={(e) => update("yearsExperience", e.target.value)}
                      placeholder="e.g. 5"
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    />
                  </FormField>
                  <FormField label="Professional Summary" optional>
                    <textarea
                      value={form.summary}
                      onChange={(e) => update("summary", e.target.value)}
                      rows={3}
                      placeholder="A rough summary of who you are — the AI will polish it."
                      className="glass-input w-full px-4 py-3 text-sm resize-none"
                    />
                  </FormField>
                  <FormField label="Work Experience" required>
                    <textarea
                      value={form.workExperience}
                      onChange={(e) => update("workExperience", e.target.value)}
                      rows={7}
                      placeholder={`List roles, companies, dates and what you did — rough notes are fine.\n\nExample:\nFrontend Developer, Acme Corp (2021 - Present)\n- Built the customer dashboard in React\n- Led migration to TypeScript\n\nJunior Developer, StartupXYZ (2019 - 2021)\n- Maintained the marketing site`}
                      className="glass-input w-full px-4 py-3 text-sm resize-none"
                    />
                  </FormField>
                  <FormField label="Education" optional>
                    <textarea
                      value={form.education}
                      onChange={(e) => update("education", e.target.value)}
                      rows={3}
                      placeholder={`e.g. B.Sc. Computer Science, University of Yaoundé I (2015 - 2019)`}
                      className="glass-input w-full px-4 py-3 text-sm resize-none"
                    />
                  </FormField>
                </div>
              )}

              {/* Step 2: Skills & Extras */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Step 3 — Skills & Extras
                  </p>
                  <FormField label="Skills" optional>
                    <input
                      type="text"
                      value={form.skills}
                      onChange={(e) => update("skills", e.target.value)}
                      placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    />
                  </FormField>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Certifications" optional>
                      <input
                        type="text"
                        value={form.certifications}
                        onChange={(e) => update("certifications", e.target.value)}
                        placeholder="e.g. AWS Certified, PMP"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                    <FormField label="Languages" optional>
                      <input
                        type="text"
                        value={form.languages}
                        onChange={(e) => update("languages", e.target.value)}
                        placeholder="e.g. English, French"
                        className="glass-input w-full px-4 py-2.5 text-sm"
                      />
                    </FormField>
                  </div>
                  <FormField label="Links (portfolio, LinkedIn, GitHub)" optional>
                    <input
                      type="text"
                      value={form.links}
                      onChange={(e) => update("links", e.target.value)}
                      placeholder="e.g. github.com/you, linkedin.com/in/you"
                      className="glass-input w-full px-4 py-2.5 text-sm"
                    />
                  </FormField>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Step 4 — Review Your Details
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Everything look good? Hit <strong>Generate</strong> to build your AI-powered resume.
                    You can go back to any step to make edits.
                  </p>
                  <div
                    className="rounded-xl p-5 flex flex-col gap-3"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--divider)",
                    }}
                  >
                    {reviewSections
                      .filter((r) => r.value?.trim())
                      .map((r) => (
                        <div key={r.label} className="flex flex-col gap-0.5">
                          <span
                            className="text-[11px] font-semibold uppercase tracking-wider"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {r.label}
                          </span>
                          <span
                            className="text-sm whitespace-pre-line"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {r.value}
                          </span>
                        </div>
                      ))}
                    {reviewSections.every((r) => !r.value?.trim()) && (
                      <p
                        className="text-sm italic"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No details filled in yet. Go back to add your information.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-sm px-4 py-3 rounded-lg mt-5"
                style={{
                  background: "var(--error-bg)",
                  color: "var(--error-text)",
                  border: "1px solid var(--error-border)",
                }}
              >
                ⚠ {error}
              </p>
            )}

            {/* ── Navigation Buttons ── */}
            <div className="flex gap-3 pt-6 mt-2" style={{ borderTop: "1px solid var(--divider)" }}>
              {step === 0 ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="btn-secondary flex-1 px-4 py-3 text-sm font-medium"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goBack}
                  className="btn-secondary flex-1 px-4 py-3 text-sm font-medium"
                >
                  ← Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              ) : builderMode === "manual" ? (
                <button
                  type="button"
                  onClick={async () => {
                    const tempResume = mapFormToResume();
                    setResume(tempResume);
                    setDownloading(true);
                    try {
                      await downloadResumePdf(tempResume, form.template);
                    } catch (e: any) {
                      setError(e.message || "Could not generate the PDF.");
                    } finally {
                      setDownloading(false);
                    }
                  }}
                  disabled={downloading || !canProceed()}
                  className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-70"
                >
                  {downloading ? "Preparing…" : "Download PDF ↓"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={loading || !canProceed()}
                  className="btn-primary flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-70"
                >
                  {loading ? "Generating…" : "Generate Resume ✨"}
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Action bar */}
          <div className="glass p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              ✓ Your resume is ready. Review it below, then download.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setResume(null); setStep(0); }}
                className="btn-secondary px-4 py-2.5 text-sm font-semibold rounded-lg"
              >
                Edit details
              </button>
              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                className="btn-secondary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
              >
                {loading ? "Regenerating…" : "Regenerate"}
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-70"
              >
                {downloading ? "Preparing…" : "Download PDF ↓"}
              </button>
            </div>
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

          {/* Resume preview */}
          <ResumePreview resume={resume} template={form.template} />
        </div>
      )}
      </div>

      {builderMode === "manual" && !resume && (
        <div className="sticky top-8 hidden lg:block overflow-y-auto overflow-x-hidden max-h-[calc(100vh-4rem)] pb-12 w-full">
          <A4ScaleWrapper>
            <ResumePreview resume={mapFormToResume()} template={form.template} />
          </A4ScaleWrapper>
        </div>
      )}

      {/* Mobile Preview FAB */}
      {builderMode === "manual" && !showMobilePreview && (
        <button
          onClick={() => setShowMobilePreview(true)}
          className="fixed bottom-6 right-6 lg:hidden bg-[var(--purple)] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 z-40 hover:scale-105 transition-transform"
        >
          <Eye size={24} />
        </button>
      )}

      {/* Mobile Preview Modal */}
      {showMobilePreview && builderMode === "manual" && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 lg:hidden overflow-hidden">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setShowMobilePreview(false)} className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"><X size={24} /></button>
            <button
              onClick={async () => {
                const temp = mapFormToResume();
                setDownloading(true);
                try { await downloadResumePdf(temp, form.template); }
                catch(e) {}
                setDownloading(false);
              }}
              className="bg-[var(--purple)] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
            >
              {downloading ? "Wait..." : <><Download size={18} /> Download PDF</>}
            </button>
          </div>
          
          {/* Preview Container - Scaled to fit screen width */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pb-20">
            <A4ScaleWrapper>
              <ResumePreview resume={mapFormToResume()} template={form.template} />
            </A4ScaleWrapper>
          </div>
        </div>
      )}
    </div>
  );
}

function A4ScaleWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const width = entries[0].contentRect.width;
        setScale(width / 794);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden rounded-xl shadow-2xl bg-white" style={{ height: 794 * 1.41428 * scale }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: "794px", height: "1123px", transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

function ResumeSectionTitle({ children, template }: { children: React.ReactNode; template?: ResumeTemplate }) {
  const accent = RESUME_TEMPLATES.find((t) => t.id === template)?.accent || "#7b5ade";
  
  if (template === "modern") {
    return (
      <div className="mb-3">
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ color: "#fff", background: accent }}
        >
          {children}
        </span>
      </div>
    );
  }
  
  if (template === "minimal") {
    return (
      <div className="mb-3 pb-1" style={{ borderBottom: `1px solid #e5e7eb` }}>
        <span
          className="text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{ color: "#555" }}
        >
          {children}
        </span>
      </div>
    );
  }
  
  if (template === "bold") {
    return (
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-1 h-5 rounded-full"
          style={{ background: accent }}
        />
        <span
          className="text-sm font-black uppercase tracking-wider"
          style={{ color: "#111" }}
        >
          {children}
        </span>
      </div>
    );
  }
  
  // classic (default)
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: "#111" }}
      >
        {children}
      </span>
      <span className="h-px flex-1" style={{ background: "#e5e7eb" }} />
    </div>
  );
}

function ResumePreview({ resume, template = "classic" }: { resume: GeneratedResume; template?: ResumeTemplate }) {
  const contactParts = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    ...(resume.contact?.links || []),
  ].filter(Boolean) as string[];
  const accent = RESUME_TEMPLATES.find((t) => t.id === template)?.accent || "#7b5ade";

  // Template-specific header styles
  const headerStyles: Record<ResumeTemplate, React.CSSProperties> = {
    classic: {},
    modern: {},
    minimal: {},
    bold: {
      borderLeft: `4px solid ${accent}`,
      paddingLeft: "1rem",
    },
  };

  const nameColor: Record<ResumeTemplate, string> = {
    classic: "#111",
    modern: "#111",
    minimal: "#111",
    bold: "#111",
  };

  const titleColor: Record<ResumeTemplate, string> = {
    classic: accent,
    modern: accent,
    minimal: "#555",
    bold: accent,
  };

  const contactColor: Record<ResumeTemplate, string> = {
    classic: "#555",
    modern: "#555",
    minimal: "#555",
    bold: "#555",
  };

  const renderPhoto = (size = "w-24 h-24") => (
    resume.photoUrl && (
      <img
        src={resume.photoUrl}
        alt="Profile"
        className={`${size} rounded-full object-cover border-4`}
        style={{ borderColor: accent }}
      />
    )
  );

  const renderContact = () => {
    if (contactParts.length === 0) return null;
    if (template === "modern") {
      return (
        <div className="flex flex-col gap-1.5 mt-2">
          {contactParts.map((part, i) => (
            <span key={i} className="text-xs" style={{ color: contactColor[template] }}>
              {part}
            </span>
          ))}
        </div>
      );
    }
    return (
      <p className="text-xs mt-2" style={{ color: contactColor[template] }}>
        {contactParts.join("  ·  ")}
      </p>
    );
  };

  const renderHeader = () => (
    <div style={headerStyles[template]} className="flex items-center gap-6">
      {renderPhoto()}
      <div>
        <h2
          className={`font-bold ${template === "bold" ? "text-3xl" : "text-2xl"}`}
          style={{ color: nameColor[template] }}
        >
          {resume.name}
        </h2>
        {resume.title && (
          <p
            className={`font-semibold mt-0.5 ${template === "bold" ? "text-base" : "text-sm"}`}
            style={{ color: titleColor[template] }}
          >
            {resume.title}
          </p>
        )}
        {renderContact()}
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      {resume.summary && (
        <div>
          <ResumeSectionTitle template={template}>Summary</ResumeSectionTitle>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "#333" }}
          >
            {resume.summary}
          </p>
        </div>
      )}

      {resume.experience?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Experience</ResumeSectionTitle>
          <div className="flex flex-col gap-4">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#111" }}
                  >
                    {[exp.role, exp.company].filter(Boolean).join(" — ")}
                  </p>
                  {exp.period && (
                    <span
                      className="text-xs flex-shrink-0"
                      style={{ color: "#555" }}
                    >
                      {exp.period}
                    </span>
                  )}
                </div>
                {exp.location && (
                  <p
                    className="text-xs italic mt-0.5"
                    style={{ color: "#555" }}
                  >
                    {exp.location}
                  </p>
                )}
                {exp.bullets?.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {exp.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="text-[13px] leading-relaxed flex gap-2"
                        style={{ color: "#333" }}
                      >
                        <span style={{ color: accent }}>•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.education?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Education</ResumeSectionTitle>
          <div className="flex flex-col gap-3">
            {resume.education.map((ed, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#111" }}
                  >
                    {[ed.degree, ed.institution].filter(Boolean).join(" — ")}
                  </p>
                  {ed.period && (
                    <span
                      className="text-xs flex-shrink-0"
                      style={{ color: "#555" }}
                    >
                      {ed.period}
                    </span>
                  )}
                </div>
                {ed.details && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#555" }}
                  >
                    {ed.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderSidebar = () => (
    <>
      {resume.skills?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Skills</ResumeSectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: `color-mix(in srgb, ${accent} 15%, transparent)`,
                  color: accent,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {resume.certifications?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Certifications</ResumeSectionTitle>
          <ul className="flex flex-col gap-1">
            {resume.certifications.map((c, i) => (
              <li
                key={i}
                className="text-[13px] flex gap-2"
                style={{ color: "#333" }}
              >
                <span style={{ color: accent }}>•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resume.languages?.length > 0 && (
        <div>
          <ResumeSectionTitle template={template}>Languages</ResumeSectionTitle>
          <p className="text-[13px]" style={{ color: "#333" }}>
            {resume.languages.join("  ·  ")}
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white p-12 relative w-full h-full flex flex-col gap-6 text-[13px]" style={{ color: "#333", overflow: "hidden" }}>
      {template === "modern" ? (
        <div className="grid grid-cols-[1fr_2fr] gap-8 h-full">
          <div className="border-r pr-6 flex flex-col gap-6" style={{ borderColor: "#e5e7eb" }}>
            {renderPhoto("w-32 h-32 mx-auto")}
            {renderContact()}
            {renderSidebar()}
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-bold text-3xl" style={{ color: nameColor.modern }}>{resume.name}</h2>
              {resume.title && (
                <p className="font-semibold mt-1 text-base" style={{ color: titleColor.modern }}>{resume.title}</p>
              )}
            </div>
            {renderContent()}
          </div>
        </div>
      ) : (
        <>
          {renderHeader()}
          {renderContent()}
          {renderSidebar()}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [view, setView] = useState<PageView>("jobs");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<JobCategory | "ALL">("ALL");
  const [type, setType] = useState<JobType | "ALL">("ALL");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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

  // Gated tabs redirect to login when the visitor isn't signed in.
  function goTo(target: PageView) {
    const tab = HUB_TABS.find((t) => t.view === target);
    if (tab?.auth && !session?.user) {
      router.push("/login");
      return;
    }
    setView(target);
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

        {/* ── RESUME BUILDER VIEW ── */}
        {view === "resume-builder" && (
          <ResumeBuilder onBack={() => setView("jobs")} />
        )}

        {/* ── JOBS VIEW ── */}
        {view === "jobs" && (
          <>
            {/* Header */}
            <div className="px-4 pt-8 pb-6 max-w-6xl mx-auto">
              <div className="mb-6">
                <h1
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Find Your Dream Job
                </h1>
                <p
                  className="text-sm max-w-2xl"
                  style={{ color: "var(--text-muted)" }}
                >
                  Post a job, discover qualified talent, or apply to
                  opportunities — all in one place. Whether you&apos;re hiring,
                  searching, or ready to work, Gracy Global connects
                  professionals, businesses, and job seekers to real
                  opportunities.
                </p>
              </div>

              {/* Mobile Top Bar (Search + Menu Toggle) */}
              <div className="sm:hidden flex gap-2 mb-4">
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="btn-secondary flex items-center justify-center p-2"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs…"
                  className="glass-input flex-1 px-4 py-2 text-sm"
                />
              </div>

              {/* Mobile Sidebar Overlay */}
              {showMobileSidebar && (
                <div className="fixed inset-0 z-[100] sm:hidden flex">
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowMobileSidebar(false)}
                  />
                  <div
                    className="relative w-4/5 max-w-sm h-full flex flex-col gap-6 p-6 overflow-y-auto"
                    style={{ backgroundColor: "var(--bg-default)" }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Menu</h2>
                      <button
                        onClick={() => setShowMobileSidebar(false)}
                        className="btn-secondary p-2 rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Navigation
                      </h3>
                      <HubTabs
                        current={view}
                        onNavigate={(v) => {
                          goTo(v);
                          setShowMobileSidebar(false);
                        }}
                        applicationsCount={applications.length}
                        vertical={true}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Filters
                      </h3>
                      <div className="flex flex-col gap-3">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as JobCategory | "ALL")}
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
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Hub navigation */}
              <div className="hidden sm:block mb-6">
                <HubTabs
                  current={view}
                  onNavigate={goTo}
                  applicationsCount={applications.length}
                />
              </div>

              {/* Desktop Search + Filters */}
              <div className="hidden sm:flex glass p-4 flex-col sm:flex-row gap-3">
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
