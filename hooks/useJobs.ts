import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

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

// ─── Fetcher ─────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ─── Build jobs query key ─────────────────────────────────────────────────────

function buildJobsKey(filters: JobFilters): string {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "ALL")
    params.set("category", filters.category);
  if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
  if (filters.featured) params.set("featured", "true");
  const qs = params.toString();
  return `/api/jobs${qs ? `?${qs}` : ""}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useJobs(filters: JobFilters = {}) {
  const { data: session } = useSession();
  const jobsKey = buildJobsKey(filters);

  // ── Fetch all jobs (filtered) ──
  const {
    data: jobsData,
    error: jobsError,
    isLoading: jobsLoading,
    mutate: mutateJobs,
  } = useSWR<{ jobs: Job[] }>(jobsKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30s cache
  });

  // ── Fetch applied jobs (only if logged in) ──
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
      dedupingInterval: 60000, // 1min cache
    },
  );

  // ── Fetch job categories ──
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR<{ categories: JobCategory_Model[] }>(
    "/api/jobs/job-categories",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5min cache — categories rarely change
    },
  );

  // ── Derived applied IDs set ──
  const appliedIds = new Set(
    (appliedData?.applications || []).map((app) => app.jobId),
  );

  // ── Post a job ──
  const postJob = useCallback(
    async (payload: JobPostPayload): Promise<Job> => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post job");
      await mutateJobs(); // refresh jobs list
      return data.job;
    },
    [mutateJobs],
  );

  // ── Apply to a job ──
  const applyToJob = useCallback(
    async (jobId: string, coverNote?: string): Promise<JobApplication> => {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply");
      await mutateApplied(); // refresh applied list
      return data.application;
    },
    [mutateApplied],
  );

  // ── Submit job seeker profile ──
  const submitJobSeekerProfile = useCallback(
    async (payload: JobSeekerPayload) => {
      const res = await fetch("/api/job-seekers", {
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

  // ── Delete a job (admin) ──
  const deleteJob = useCallback(
    async (jobId: string) => {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete job");
      await mutateJobs();
    },
    [mutateJobs],
  );

  // ── Update a job (admin) ──
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

  // ── Refresh helpers ──
  const refreshJobs = useCallback(() => mutateJobs(), [mutateJobs]);
  const refreshApplied = useCallback(() => mutateApplied(), [mutateApplied]);

  return {
    // Data
    jobs: jobsData?.jobs || [],
    applications: appliedData?.applications || [],
    categories: categoriesData?.categories || [],
    appliedIds,

    // Loading states
    jobsLoading,
    appliedLoading,
    categoriesLoading,

    // Errors
    jobsError,
    appliedError,
    categoriesError,

    // Actions
    postJob,
    applyToJob,
    submitJobSeekerProfile,
    deleteJob,
    updateJob,

    // Refresh
    refreshJobs,
    refreshApplied,
  };
}
