"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Star,
  Loader2,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import ShareButton from "@/components/shared/ShareButton";

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  category: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  skills: string[];
  featured: boolean;
  createdAt: string;
  expiresAt?: string;
  posterId?: string;
}

const TYPE_COLORS: Record<string, string> = {
  REMOTE: "badge-blue",
  HYBRID: "badge-purple",
  CONTRACT: "badge-scarlet",
  FREELANCE: "badge-neutral",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function CompanyAvatar({ logo, company }: { logo?: string; company: string }) {
  if (logo)
    return (
      <img
        src={logo}
        alt={company}
        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
        style={{ border: "1px solid var(--glass-border)" }}
      />
    );
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold"
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

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { convert } = useCurrency();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.job) setJob(data.job);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Check if already applied
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/jobs/applied")
      .then((r) => r.json())
      .then((data) => {
        const ids = (data.applications || []).map((a: any) => a.jobId);
        if (ids.includes(id)) setApplied(true);
      });
  }, [session, id]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    setApplyError("");
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply");
      setApplied(true);
      setShowApplyForm(false);
    } catch (e: any) {
      setApplyError(e.message);
    } finally {
      setApplying(false);
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `${convert(min)} – ${convert(max)}`;
    if (min) return `From ${convert(min)}`;
    return `Up to ${convert(max!)}`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--purple)" }} />
      </div>
    );

  if (notFound || !job)
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Job not found
        </h1>
        <Link href="/jobs" className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-lg mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium mb-8 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      {/* Header card */}
      <div
        className="glass p-6 rounded-2xl mb-6"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-start gap-4 mb-4">
          <CompanyAvatar logo={job.companyLogo} company={job.company} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h1
                className="text-2xl font-extrabold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {job.featured && (
                  <span className="inline-block mr-2 text-xs px-2 py-0.5 rounded font-bold badge-scarlet align-middle">
                    ★ FEATURED
                  </span>
                )}
                {job.title}
              </h1>
              <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                {timeAgo(job.createdAt)}
              </span>
            </div>
            <p className="text-sm mt-1 font-medium" style={{ color: "var(--text-secondary)" }}>
              {job.company}
            </p>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className={`${TYPE_COLORS[job.type] ?? "badge-neutral"} px-3 py-1 rounded-full text-xs font-semibold`}>
            <Briefcase size={11} className="inline mr-1" />{job.type}
          </span>
          <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
            {job.category.replace(/_/g, " ")}
          </span>
          {job.location && (
            <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
              <MapPin size={11} className="inline mr-1" />{job.location}
            </span>
          )}
          {salary && (
            <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
              💵 {salary}
            </span>
          )}
          <span className="badge-neutral px-3 py-1 rounded-full text-xs font-semibold">
            <Clock size={11} className="inline mr-1" />{timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
              Skills Required
            </p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="badge-purple px-3 py-1 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          {!session?.user ? (
            <Link
              href="/login"
              className="btn-primary flex-1 text-center py-3 px-6 text-sm font-semibold rounded-xl"
            >
              Sign in to Apply
            </Link>
          ) : applied ? (
            <div
              className="flex-1 py-3 px-6 text-sm font-semibold rounded-xl text-center"
              style={{ background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid var(--success-border)" }}
            >
              ✓ Application Submitted
            </div>
          ) : (
            <button
              onClick={() => setShowApplyForm((v) => !v)}
              className="btn-primary flex-1 py-3 px-6 text-sm font-semibold rounded-xl"
            >
              {showApplyForm ? "Cancel" : "Apply Now →"}
            </button>
          )}
          <ShareButton
            href={`/jobs/${job.id}`}
            title={`${job.title} at ${job.company}`}
            className="!min-h-0 py-3 px-4"
          />
        </div>

        {/* Apply form */}
        {showApplyForm && !applied && (
          <form onSubmit={handleApply} className="mt-4 flex flex-col gap-3">
            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={4}
              placeholder="Cover note (optional) — tell them why you're a great fit…"
              className="glass-input w-full px-4 py-3 text-sm resize-none"
            />
            {applyError && (
              <p className="text-sm px-4 py-2 rounded-lg" style={{ background: "var(--error-bg)", color: "var(--error-text)" }}>
                {applyError}
              </p>
            )}
            <button
              type="submit"
              disabled={applying}
              className="btn-primary py-3 text-sm font-semibold rounded-xl disabled:opacity-70"
            >
              {applying ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        )}
      </div>

      {/* Description */}
      <div
        className="glass p-6 rounded-2xl"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
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
  );
}
